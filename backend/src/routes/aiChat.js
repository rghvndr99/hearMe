import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  analyzeSentiment,
  generateResponse,
  generateQuickReplies,
  generateSummary,
  detectIntent,
} from '../services/openaiService.js';

const router = express.Router();

// In-memory storage for conversations (in production, use database)
const conversations = new Map();

/**
 * Welcome messages in different languages
 */
const WELCOME_MESSAGES = {
  en: `Hi there 👋 I'm here to listen and support you. This is a safe, anonymous space where you can share whatever's on your mind. How are you feeling today?

You can:
💬 Type in Hindi, English, or Hinglish
🎙️ Speak in your language (click the mic)
🔊 Hear responses in your chosen voice
👤 Talk to a real human counselor (paid) — Type "I want to talk to a human" or call +91 8105568665`,

  hi: `नमस्ते 👋 मैं आपकी बात सुनने और समर्थन करने के लिए यहाँ हूँ। यह एक सुरक्षित, गुमनाम जगह है जहाँ आप अपने मन की बात साझा कर सकते हैं। आप कैसा महसूस कर रहे हैं?

आप कर सकते हैं:
💬 हिंदी, अंग्रेजी, या हिंग्लिश में टाइप करें
🎙️ अपनी भाषा में बोलें (माइक पर क्लिक करें)
🔊 अपनी पसंद की आवाज़ में जवाब सुनें
👤 असली इंसान परामर्शदाता से बात करें (सशुल्क) — टाइप करें "मुझे किसी इंसान से बात करनी है" या +91 8105568665 पर कॉल करें`
};

/**
 * Start a new anonymous chat session
 */
router.post('/session/start', async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const sessionId = uuidv4();
    const conversation = {
      sessionId,
      messages: [],
      startedAt: new Date(),
      lastActivity: new Date(),
      mood: 'neutral',
      language, // Store user's language preference
    };

    conversations.set(sessionId, conversation);

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

    // Store language preference
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

    // Get user's language preference
    const userLanguage = conversation.language || 'English';

    // 🧠 STEP 1: Check for intent detection BEFORE calling OpenAI
    console.log(`🔍 Checking intent for message: "${message}"`);
    console.log(`🌐 User language: ${userLanguage}`);
    const detectedIntent = detectIntent(message, userLanguage);
    console.log(`🎯 Intent detection result:`, detectedIntent);

    let aiResponseContent;
    let sentiment;
    let quickReplies = [];
    let intentDetected = false;

    if (detectedIntent && detectedIntent.skipOpenAI) {
      // Intent detected! Use custom response instead of OpenAI
      console.log(`✅ Intent detected: ${detectedIntent.intent} - Skipping OpenAI`);

      aiResponseContent = detectedIntent.response;
      intentDetected = true;

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

      // Analyze sentiment
      sentiment = await analyzeSentiment(message);
      conversation.mood = sentiment.mood;

      // Prepare conversation history for OpenAI (last 10 messages)
      const recentMessages = conversation.messages
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Generate AI response in the user's language
      aiResponseContent = await generateResponse(recentMessages, userLanguage);

      // Generate quick replies for next interaction in the user's language
      quickReplies = await generateQuickReplies(recentMessages, userLanguage);
    }

    // Update conversation metadata
    conversation.lastActivity = new Date();

    // Create AI message
    const aiMessage = {
      role: 'assistant',
      content: aiResponseContent,
      timestamp: new Date(),
      sentiment,
      intentDetected: intentDetected ? detectedIntent.intent : null,
    };
    conversation.messages.push(aiMessage);

    res.json({
      message: aiMessage,
      sentiment,
      quickReplies,
      crisis: sentiment.crisis,
      intentDetected: intentDetected ? detectedIntent.intent : null,
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

    // Clean up (in production, archive to database)
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

