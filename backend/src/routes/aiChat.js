import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import Subscription from '../models/Subscription.js';
import ChatSession from '../models/ChatSession.js';
import { getPlanConfig, FEATURE_FLAGS } from '../config/memberships.js';
import {
  analyzeSentiment,
  generateResponse,
  generateQuickReplies,
  generateSummary,
  detectIntent,
} from '../services/openaiService.js';
import { buildTalkToHumanResponse, CONTACT_INFO } from '../config/intentResponses.js';


const router = express.Router();

// In-memory storage for conversations (in production, use database)
const conversations = new Map();



// Anonymous per-session engaged time limit (default 5 minutes)
const ANON_SESSION_LIMIT_MS = parseInt(process.env.ANON_SESSION_LIMIT_MS || '300000', 10);

// --- Helpers for plan/usage enforcement ---
function getUserIdFromReq(req) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return payload?.sub || payload?.id || null;
  } catch (e) {
    return null;
  }
}

async function getActivePlan(userId) {
  if (!userId) return 'free';
  const sub = await Subscription.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
  return sub?.plan || 'free';
}

function getWindowStartForPlan(cfg) {
  const now = new Date();
  const period = cfg?.features?.chatMinutes?.period;
  if (period === 'week') {
    return { windowStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), periodLabel: 'week' };
  }
  if (period === 'month') {
    return { windowStart: new Date(now.getFullYear(), now.getMonth(), 1), periodLabel: 'month' };
  }
  return { windowStart: new Date(0), periodLabel: 'unlimited' };
}

async function computeUsedChatMinutes(userId, plan) {
  const cfg = getPlanConfig(plan);
  const limit = cfg?.features?.chatMinutes?.limit ?? -1;
  const period = cfg?.features?.chatMinutes?.period || 'unlimited';
  const { windowStart } = getWindowStartForPlan(cfg);
  const now = new Date();

  if (!userId) return { usedMinutes: 0, limit, period };

  const sessions = await ChatSession.find({
    userId,
    $or: [
      { startedAt: { $gte: windowStart } },
      { lastActivity: { $gte: windowStart } },
      { status: 'open' },
    ],
  }).select('startedAt endedAt lastActivity status engagedSeconds');

  let usedMs = 0;
  for (const s of sessions) {
    if (typeof s.engagedSeconds === 'number' && s.engagedSeconds > 0) {
      usedMs += s.engagedSeconds * 1000;
      continue;
    }
    const start = s.startedAt > windowStart ? s.startedAt : windowStart;
    const end = s.endedAt ? s.endedAt : now;
    if (end <= windowStart) continue;
    if (end > start) usedMs += (end - start);
  }
  const usedMinutes = Math.floor(usedMs / 60000);
  return { usedMinutes, limit, period };
}

/**
 * Welcome messages in different languages
 */
const WELCOME_MESSAGES = {
  en: `Hi there 👋 I'm here to listen and support you. This is a safe, anonymous space where you can share whatever's on your mind. How are you feeling today?

You can:
💬 Type in Hindi, English, or Hinglish
🎙️ Speak in your language (click the mic)
🔊 Hear responses in your chosen voice
👤 Talk to a real human counselor (paid) — Type "I want to talk to a human"`,

  hi: `नमस्ते 👋 मैं आपकी बात सुनने और समर्थन करने के लिए यहाँ हूँ। यह एक सुरक्षित, गुमनाम जगह है जहाँ आप अपने मन की बात साझा कर सकते हैं। आप कैसा महसूस कर रहे हैं?

आप कर सकते हैं:
💬 हिंदी, अंग्रेजी, या हिंग्लिश में टाइप करें
🎙️ अपनी भाषा में बोलें (माइक पर क्लिक करें)
🔊 अपनी पसंद की आवाज़ में जवाब सुनें
👤 असली इंसान परामर्शदाता से बात करें (सशुल्क) — टाइप करें "मुझे किसी इंसान से बात करनी है"`
};

/**
 * Start a new chat session (links to user if authenticated)
 */
router.post('/session/start', async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const sessionId = uuidv4();
    const userId = getUserIdFromReq(req);

    const conversation = {
      sessionId,
      userId: userId || null,
      messages: [],
      startedAt: new Date(),
      lastActivity: new Date(),
      engagedMs: 0, // accumulate active processing time this session (anonymous or authed)
      mood: 'neutral',
      language, // Store user's language preference
    };

    conversations.set(sessionId, conversation);

    // Persist an open ChatSession row if user is authenticated
    if (userId) {
      try {
        await ChatSession.create({
          userId,
          sessionId,
          startedAt: conversation.startedAt,
          lastActivity: conversation.lastActivity,
          status: 'open',
        });
      } catch (e) {
        // ignore persistence errors to avoid blocking chat
      }
    }

    // Get welcome message in user's language
    const welcomeContent = WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en;
    const welcomeMessage = {
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date(),
    };

    conversation.messages.push(welcomeMessage);

    res.json({
      sessionId,
      message: welcomeMessage,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

/**
 * Send a message and get AI response
 */
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, language } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    const conversation = conversations.get(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Start processing timer for engaged time measurement
    const processStart = Date.now();
    // High-resolution timing for Server-Timing breakdown
    const reqStartHr = process.hrtime.bigint();
    const hrNow = () => process.hrtime.bigint();
    const toMs = (startHr) => Number(hrNow() - startHr) / 1_000_000;
    const timings = {};

    // Identify user if authenticated
    const userId = conversation.userId || getUserIdFromReq(req);

    // Anonymous per-session engaged time limit enforcement
    if (!userId) {
      conversation.engagedMs = conversation.engagedMs || 0;
      if (conversation.engagedMs >= ANON_SESSION_LIMIT_MS) {
        return res.status(403).json({
          error: 'Anonymous chat limit reached',
          usage: { usedMs: conversation.engagedMs, limitMs: ANON_SESSION_LIMIT_MS },
          message: 'You have reached the 5-minute anonymous chat limit. Please sign in to continue.',
        });
      }
    } else {
        // Plan-based chat minutes enforcement (authenticated)
        if (FEATURE_FLAGS?.enforce?.chatLimits !== false) {
          const enfStart = hrNow();
          const plan = await getActivePlan(userId);
          const { usedMinutes, limit, period } = await computeUsedChatMinutes(userId, plan);
          timings.db_enforce_ms = Number(hrNow() - enfStart) / 1_000_000;
          if (typeof limit === 'number' && limit >= 0 && usedMinutes >= limit) {
            return res.status(403).json({
              error: 'Chat limit reached',
              usage: { usedMinutes, limit, period },
              plan,
              message: `You have used ${usedMinutes}/${limit} minutes this ${period}. Please upgrade your membership to continue.`,
            });
          }
        }
      }

    // Store language preference from client (UI) if provided
    if (language) {
      conversation.language = language;
    }

    // Add user message to conversation
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Auto-detect language from the message content (Hindi vs English/Hinglish)
    try {
      const txt = String(message || '').replace(/[\n\r]+/g, ' ');
      const lower = txt.toLowerCase();

      // 1) Script-based: Devanagari ratio
      const chars = txt.replace(/\s+/g, '');
      const devMatches = chars.match(/[\u0900-\u097F]/g);
      const devRatio = devMatches ? (devMatches.length / Math.max(1, chars.length)) : 0;

      // 2) Hinglish heuristic: common Hindi words written in Latin
      const tokens = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
      const hinglishLexicon = new Set([
        'hai','haan','nahi','nahin','kyu','kyon','kya','tum','aap','mai','main','me','mera','meri','mere',
        'bahut','bohot','bura','accha','acha','theek','thik','thikhai','thikha','lag','raha','rahe','rhi','rhe',
        'aaj','kal','koi','kuch','mat','kripya','madad','samasya','dard','dukh','dukhi','khush','par','lekin',
        'kyunki','agar','mujhe','mujhko','mujhse','please','bhai','behen','dil','mann','zindagi','tension','dimaag'
      ]);
      let hinglishHits = 0;
      for (const w of tokens) { if (hinglishLexicon.has(w)) hinglishHits++; }
      const hinglishRatio = tokens.length ? (hinglishHits / tokens.length) : 0;

      if (devRatio >= 0.2 || hinglishRatio >= 0.2 && hinglishHits >= 2) {
        conversation.language = 'Hindi';
      } else if (!conversation.language) {
        conversation.language = 'English';
      }
    } catch {}

    // Get user's language preference (detected or stored)
    const userLanguage = conversation.language || 'English';

    // 🧠 STEP 1: Check for intent detection BEFORE calling OpenAI
    console.log(`🔍 Checking intent for message: "${message}"`);
    console.log(`🌐 User language: ${userLanguage}`);
    const intentStart = hrNow();
    const detectedIntent = detectIntent(message, userLanguage);
    timings.intent_detect_ms = Number(hrNow() - intentStart) / 1_000_000;
    console.log(`🎯 Intent detection result:`, detectedIntent);

    let aiResponseContent;
    let sentiment;
    let quickReplies = [];
    let intentDetected = false;

    if (detectedIntent && detectedIntent.skipOpenAI) {
      // Intent detected! Use custom response instead of OpenAI
      console.log(`✅ Intent detected: ${detectedIntent.intent} - Skipping OpenAI`);

      intentDetected = true;

      // Build contextual response for specific intents
      if (detectedIntent.intent === 'talkToHuman') {
        const planForHuman = await getActivePlan(userId);
        const phrase = (CONTACT_INFO && CONTACT_INFO.supportTriggerPhrase) ? CONTACT_INFO.supportTriggerPhrase : 'HearMe: Need support';
        aiResponseContent = buildTalkToHumanResponse(userLanguage, {
          isPaid: planForHuman && planForHuman !== 'free',
          supportTriggerPhrase: phrase,
        });
      } else {
        aiResponseContent = detectedIntent.response;
      }

      // For intent-based responses, create a basic sentiment
      sentiment = {
        mood: detectedIntent.intent === 'emergency' ? 'crisis' : 'neutral',
        crisis: detectedIntent.intent === 'emergency',
        confidence: 1.0,
      };

      // No quick replies for intent-based responses
      quickReplies = [];

    } else {
      // No intent detected, proceed with normal OpenAI flow
      console.log('📤 No intent detected - Calling OpenAI');

      // Prepare conversation history for OpenAI (last 10 messages)
      const prepHistStart = hrNow();
      const recentMessages = conversation.messages
        .slice(-10)
        .map((msg) => ({ role: msg.role, content: msg.content }));
      timings.prep_history_ms = Number(hrNow() - prepHistStart) / 1_000_000;

      // Run OpenAI calls in parallel to reduce latency, with per-call timing
      const sentStart = hrNow();
      const sentimentP = analyzeSentiment(message)
        .then((res) => { timings.openai_sentiment_ms = Number(hrNow() - sentStart) / 1_000_000; return res; })
        .catch((err) => { timings.openai_sentiment_ms = Number(hrNow() - sentStart) / 1_000_000; throw err; });

      const respStart = hrNow();
      const responseP = generateResponse(recentMessages, userLanguage)
        .then((res) => { timings.openai_response_ms = Number(hrNow() - respStart) / 1_000_000; return res; })
        .catch((err) => { timings.openai_response_ms = Number(hrNow() - respStart) / 1_000_000; throw err; });

      const qrStart = hrNow();
      const repliesP = generateQuickReplies(recentMessages, userLanguage)
        .then((res) => { timings.openai_quickreplies_ms = Number(hrNow() - qrStart) / 1_000_000; return res; })
        .catch((err) => { timings.openai_quickreplies_ms = Number(hrNow() - qrStart) / 1_000_000; throw err; });

      const [sentimentRes, aiResp, replies] = await Promise.all([
        sentimentP,
        responseP,
        repliesP,
      ]);

      sentiment = sentimentRes || { mood: 'neutral', crisis: false, confidence: 0.5 };
      conversation.mood = sentiment.mood;
      aiResponseContent = aiResp;
      quickReplies = replies;
    }

    // Compute engaged time for this turn and update metadata
    const processEnd = Date.now();
    const deltaMs = Math.max(0, processEnd - processStart);

    conversation.engagedMs = (conversation.engagedMs || 0) + deltaMs;
    conversation.lastActivity = new Date();

    // Persist last activity + engagedSeconds for this session if linked to a user
    if (userId) {
      try {
        const dbuStart = hrNow();
        await ChatSession.updateOne(
          { userId, sessionId, status: 'open' },
          {
            $set: { lastActivity: conversation.lastActivity },
            $inc: { engagedSeconds: Math.floor(deltaMs / 1000) }
          }
        );
        timings.db_update_ms = Number(hrNow() - dbuStart) / 1_000_000;
      } catch (e) {
        // ignore persistence errors
      }
    }

    // Create AI message
    const aiMessage = {
      role: 'assistant',
      content: aiResponseContent,
      timestamp: new Date(),
      sentiment,
      intentDetected: intentDetected ? detectedIntent.intent : null,
    };
    conversation.messages.push(aiMessage);

    // Include flags + usage + mic gating so the client doesn't need extra GETs
    let usage = null;
    let micAllowed = (FEATURE_FLAGS?.enforce?.micGating === false);
    if (userId) {
      try {
        const planNow = await getActivePlan(userId);
        const { usedMinutes, limit, period } = await computeUsedChatMinutes(userId, planNow);
        usage = { chatMinutes: { used: usedMinutes, limit, period } };
        const cfgNow = getPlanConfig(planNow);
        micAllowed = (FEATURE_FLAGS?.enforce?.micGating === false) || !!(cfgNow?.features?.micEnabled?.enabled);
      } catch (e) {
        // non-fatal
      }
    }

    // Build Server-Timing header
    const totalMs = Number(hrNow() - reqStartHr) / 1_000_000;
    timings.total_ms = totalMs;
    const openaiMax = Math.max(
      timings.openai_response_ms || 0,
      timings.openai_sentiment_ms || 0,
      timings.openai_quickreplies_ms || 0
    );
    timings.openai_max_ms = openaiMax;
    timings.overhead_ms = Math.max(0, totalMs - openaiMax);

    const serverTimingParts = [];
    if (timings.intent_detect_ms != null) serverTimingParts.push(`intent;dur=${timings.intent_detect_ms.toFixed(1)}`);
    if (timings.prep_history_ms != null) serverTimingParts.push(`prep_hist;dur=${timings.prep_history_ms.toFixed(1)}`);
    if (timings.openai_sentiment_ms != null) serverTimingParts.push(`openai_sent;dur=${timings.openai_sentiment_ms.toFixed(1)}`);
    if (timings.openai_response_ms != null) serverTimingParts.push(`openai_resp;dur=${timings.openai_response_ms.toFixed(1)}`);
    if (timings.openai_quickreplies_ms != null) serverTimingParts.push(`openai_replies;dur=${timings.openai_quickreplies_ms.toFixed(1)}`);
    if (timings.db_enforce_ms != null) serverTimingParts.push(`db_enforce;dur=${timings.db_enforce_ms.toFixed(1)}`);
    if (timings.db_update_ms != null) serverTimingParts.push(`db_update;dur=${timings.db_update_ms.toFixed(1)}`);
    serverTimingParts.push(`overhead;dur=${timings.overhead_ms.toFixed(1)}`);
    serverTimingParts.push(`total;dur=${totalMs.toFixed(1)}`);
    try { res.setHeader('Server-Timing', serverTimingParts.join(', ')); } catch {}
    try { console.log(`[ServerTiming] /api/ai-chat/message ${sessionId} ->`, serverTimingParts.join(', ')); } catch {}

    res.json({
      message: aiMessage,
      sentiment,
      quickReplies,
      crisis: sentiment.crisis,
      intentDetected: intentDetected ? detectedIntent.intent : null,
      sessionEngagedMs: conversation.engagedMs,
      flags: FEATURE_FLAGS,
      usage,
      micAllowed,
      language: userLanguage,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * Get conversation history
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = conversations.get(sessionId);

    if (!conversation) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      sessionId: conversation.sessionId,
      messages: conversation.messages,
      mood: conversation.mood,
      startedAt: conversation.startedAt,
      lastActivity: conversation.lastActivity,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * End a chat session and get summary
 */
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const conversation = conversations.get(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Generate conversation summary
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const summary = await generateSummary(conversationHistory);

    const sessionData = {
      sessionId: conversation.sessionId,
      duration: new Date() - conversation.startedAt,
      messageCount: conversation.messages.length,
      summary,
      finalMood: conversation.mood,
    };

    // Persist session end if linked to a user
    try {
      const userId = conversation.userId || getUserIdFromReq(req);
      if (userId) {
        const end = new Date();
        const open = await ChatSession.findOne({ userId, sessionId, status: 'open' });
        if (open) {
          open.endedAt = end;
          open.lastActivity = end;
          open.durationSeconds = Math.max(0, Math.floor((end - open.startedAt) / 1000));
          open.status = 'closed';
          await open.save({ validateBeforeSave: false });
        }
      }
    } catch (e) {
      // ignore persistence errors
    }

    // Clean up in-memory
    conversations.delete(sessionId);

    res.json(sessionData);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

/**
 * Get quick reply suggestions
 */
router.post('/quick-replies', async (req, res) => {
  try {
    const { sessionId, language } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const conversation = conversations.get(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const recentMessages = conversation.messages
      .slice(-4)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Use provided language or default to English
    const userLanguage = language || 'English';
    const quickReplies = await generateQuickReplies(recentMessages, userLanguage);

    res.json({ quickReplies });
  } catch (error) {
    console.error('Error generating quick replies:', error);
    res.status(500).json({ error: 'Failed to generate quick replies' });
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: conversations.size,
    timestamp: new Date(),
  });
});

export default router;

