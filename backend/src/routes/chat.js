import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';

const router = express.Router();

async function translate(text, target = 'en') {
  if (!process.env.GOOGLE_API_KEY) return text;
  const res = await axios.post('https://translation.googleapis.com/language/translate/v2', {
    q: text,
    target,
    key: process.env.GOOGLE_API_KEY,
  });
  return res.data.data.translations[0].translatedText;
}

async function callOpenAI(prompt) {
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a warm, empathetic listener. Respond gently and concisely.' },
      { role: 'user', content: prompt },
    ],
  };
  const res = await axios.post('https://api.openai.com/v1/chat/completions', body, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  return res.data.choices[0].message.content;
}

router.post('/', async (req, res) => {
  try {
    const { sessionId, message, lang } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const sid = sessionId || uuidv4();
    let session = await Session.findOne({ sessionId: sid });
    if (!session) {
      session = new Session({ sessionId: sid, language: lang || 'en' });
    }

    const inputEn = await translate(message, 'en');
    const aiResponse = await callOpenAI(inputEn);
    const reply = lang && lang !== 'en' ? await translate(aiResponse, lang) : aiResponse;

    session.messages.push({ role: 'user', text: message });
    session.messages.push({ role: 'ai', text: reply });
    await session.save();

    res.json({ sessionId: sid, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
