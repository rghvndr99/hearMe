import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/eleven', async (req, res) => {
  try {
    const { text, voiceId } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured on the server' });
    }
    if (!voice) {
      return res.status(500).json({ error: 'Voice ID is not provided (pass voiceId or set ELEVENLABS_VOICE_ID)' });
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;

    const response = await axios.post(
      url,
      {
        text: String(text),
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128'
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 20000,
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(response.data));
  } catch (err) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: err?.message || 'Failed to synthesize speech' };
    console.error('ElevenLabs TTS error:', status, data);
    // Pass through ElevenLabs error when available for easier debugging
    if (err?.response) {
      // Try to set content-type from upstream if present
      const ct = err.response.headers?.['content-type'];
      if (ct) res.set('Content-Type', ct);
      return res.status(status).send(data);
    }
    return res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

export default router;

