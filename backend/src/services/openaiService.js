import OpenAI from 'openai';
import { detectIntent as detectIntentFromConfig } from '../config/intentResponses.js';

// Initialize OpenAI client lazily to ensure env vars are loaded
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Re-export detectIntent from config for easy access
export { detectIntentFromConfig as detectIntent };

// Helper to robustly parse JSON that may be wrapped in markdown fences
function parseJsonLoose(input) {
  if (!input) return null;
  let s = String(input).trim();
  // Strip triple-backtick fences (with optional language tag)
  if (s.startsWith('```')) {
    s = s.replace(/^```[a-zA-Z]*\s*/m, '').replace(/```\s*$/m, '').trim();
  }
  // First attempt direct parse
  try { return JSON.parse(s); } catch {}
  // Try extracting array
  let start = s.indexOf('['), end = s.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    const sub = s.slice(start, end + 1);
    try { return JSON.parse(sub); } catch {}
  }
  // Try extracting object
  start = s.indexOf('{'); end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    const sub = s.slice(start, end + 1);
    try { return JSON.parse(sub); } catch {}
  }
  return null;
}

// System prompt for mental health support
const getSystemPrompt = (language = 'English') => {
  return `You are a compassionate, empathetic mental health support companion for the HearMe platform. Your role is to provide emotional support to anonymous users who are sharing their feelings and struggles.

IMPORTANT: Respond in ${language}. The user is speaking in ${language}, so you must respond in the same language.

Guidelines:
1. Be warm, empathetic, and non-judgmental
2. Validate their feelings and experiences
3. Ask open-ended questions to help them explore their emotions
4. Provide gentle encouragement and hope
5. Never diagnose or provide medical advice
6. If someone is in crisis, gently suggest professional resources
7. Match the user's emotional tone - if they're sad, be gentle; if they're anxious, be calming
8. Keep responses concise (2-4 sentences) to maintain conversation flow
9. Use "I" statements to show empathy (e.g., "I hear that you're feeling...")
10. Avoid clichés and toxic positivity
11. ALWAYS respond in ${language}, matching the user's language

Crisis indicators to watch for:
- Mentions of self-harm or suicide
- Extreme hopelessness
- Immediate danger

If crisis detected, respond with empathy and provide appropriate crisis resources for their region.

Remember: You're here to listen, support, and guide - not to fix or solve. Always respond in ${language}.`;
};

/**
 * Analyze the sentiment and mood of a message
 */
export async function analyzeSentiment(message) {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a sentiment analyzer for mental health support. Analyze the mood and detect crisis situations. Respond ONLY with a JSON object containing: mood (string: happy/sad/anxious/angry/neutral/crisis), crisis (boolean), confidence (number 0-1). Do not include any extra text, markdown, or backticks.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const result = parseJsonLoose(response.choices[0].message.content);
    if (result && typeof result === 'object') return result;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { mood: 'neutral', crisis: false, confidence: 0.5 };
  }
}

/**
 * Generate AI response based on conversation history
 */
export async function generateResponse(conversationHistory, language = 'English') {
  const client = getOpenAIClient();

  const messages = [
    {
      role: 'system',
      content: getSystemPrompt(language),
    },
    ...conversationHistory,
  ];

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Generate quick reply suggestions in the specified language
 * @param {Array} conversationHistory - Recent conversation messages
 * @param {string} language - Language for the quick replies (e.g., "English", "Hindi", "Spanish")
 */
export async function generateQuickReplies(conversationHistory, language = 'English') {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            `Based on the conversation, suggest 3 short (3-5 words) quick reply options the user might want to say next. IMPORTANT: Generate the replies in ${language}. Respond ONLY with a JSON array of strings. No markdown and no backticks.`,
        },
        ...conversationHistory.slice(-4),
      ],
      temperature: 0.8,
      max_tokens: 60,
    });

    const replies = parseJsonLoose(response.choices[0].message.content);
    return Array.isArray(replies) ? replies.slice(0, 3) : [];
  } catch (error) {
    console.error('Error generating quick replies:', error);
    return [];
  }
}

/**
 * Generate a summary of the conversation
 */
export async function generateSummary(conversationHistory) {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Summarize this mental health support conversation in 2-3 sentences. Focus on the main concerns and emotional themes.',
        },
        ...conversationHistory,
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary.';
  }
}

