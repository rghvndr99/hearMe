import express from 'express';
import axios from 'axios';

const router = express.Router();


// Default expressive settings for more human-like speech
const DEFAULT_VOICE_SETTINGS = {
  stability: 0.35,           // lower stability increases natural variation
  similarity_boost: 0.7,     // keep close to reference voice
  style: 0.6,                // add emotional/expressive style
  use_speaker_boost: true,   // richer timbre
};

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

    // Build voice settings (merge defaults with provided)
    let voice_settings = { ...DEFAULT_VOICE_SETTINGS };
    if (voiceSettings && typeof voiceSettings === 'object') {
      const toNum = (v, def) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : def;
      };
      const stability = Math.max(0, Math.min(1, toNum(voiceSettings.stability, DEFAULT_VOICE_SETTINGS.stability)));
      const similarity_boost = Math.max(0, Math.min(1, toNum(voiceSettings.similarity_boost, DEFAULT_VOICE_SETTINGS.similarity_boost)));
      const style = Math.max(0, Math.min(1, toNum(voiceSettings.style, DEFAULT_VOICE_SETTINGS.style)));
      const use_speaker_boost = typeof voiceSettings.use_speaker_boost === 'boolean'
        ? voiceSettings.use_speaker_boost
        : DEFAULT_VOICE_SETTINGS.use_speaker_boost;
      voice_settings = { stability, similarity_boost, style, use_speaker_boost };
    }

    const response = await axios.post(
      url,
      {
        text: String(text),
        model_id: modelId || 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        voice_settings,
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

