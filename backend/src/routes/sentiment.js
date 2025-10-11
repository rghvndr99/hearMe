import express from 'express';
import axios from 'axios';
const router = express.Router();

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });
  try {
    if (!process.env.HUGGINGFACE_KEY) return res.json({ label: 'neutral' });
    const resp = await axios.post(
      'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_KEY}` } }
    );
    const label = resp.data[0][0].label;
    const out = label.includes('1') || label.includes('2') ? 'negative' : label.includes('3') ? 'neutral' : 'positive';
    res.json({ label: out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Sentiment service failed' });
  }
});

export default router;
