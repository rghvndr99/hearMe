import OpenAI from 'openai';

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
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the emotional tone of the following message. Respond with a JSON object containing: mood (happy/sad/anxious/angry/neutral/mixed), intensity (low/medium/high), and crisis (true/false if mentions self-harm/suicide).',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { mood: 'neutral', intensity: 'medium', crisis: false };
  }
}

/**
 * Generate a response based on conversation history
 */
export async function generateResponse(conversationHistory, language = 'English') {
  try {
    const client = getOpenAIClient();
    // Prepare messages with system prompt
    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(language),
      },
      ...conversationHistory,
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 250,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Generate conversation summary for analytics
 */
export async function generateSummary(conversationHistory) {
  try {
    const client = getOpenAIClient();
    const messages = [
      {
        role: 'system',
        content: 'Summarize this mental health support conversation in 2-3 sentences. Focus on the main concerns discussed and the emotional journey.',
      },
      {
        role: 'user',
        content: JSON.stringify(conversationHistory),
      },
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.5,
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Conversation summary unavailable';
  }
}

/**
 * Generate suggested quick replies based on context
 */
export async function generateQuickReplies(conversationHistory) {
  try {
    const client = getOpenAIClient();
    const messages = [
      {
        role: 'system',
        content: 'Based on this conversation, suggest 3 short (3-5 words) quick reply options the user might want to say next. Return as JSON array of strings.',
      },
      {
        role: 'user',
        content: JSON.stringify(conversationHistory.slice(-4)), // Last 4 messages
      },
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 100,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.replies || [];
  } catch (error) {
    console.error('Error generating quick replies:', error);
    return ['Tell me more', 'I understand', 'Thank you'];
  }
}

export default {
  analyzeSentiment,
  generateResponse,
  generateSummary,
  generateQuickReplies,
};

