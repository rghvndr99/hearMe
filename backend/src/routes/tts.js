import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/eleven', async (req, res) => {
  try {
    const { text, voiceId, voiceSettings, modelId } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    if (!voiceId || !String(voiceId).trim()) {
      return res.status(400).json({ error: 'voiceId is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY is not configured on the server' });
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    // Sanitize voice settings (optional)
    let voice_settings = undefined;
    if (voiceSettings && typeof voiceSettings === 'object') {
      const stability = Math.max(0, Math.min(1, Number(voiceSettings.stability ?? 0)));
      const similarity_boost = Math.max(0, Math.min(1, Number(voiceSettings.similarity_boost ?? 0)));
      voice_settings = { stability, similarity_boost };
    }

    const response = await axios.post(
      url,
      {
        text: String(text),
        model_id: modelId || 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        ...(voice_settings ? { voice_settings } : {}),
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

