import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import VoiceTwin from '../models/VoiceTwin.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB in-memory

// POST /api/voicetwin/upload
// Accepts multipart/form-data with field name "audio" (Blob/File)
// Proxies upload to ElevenLabs Voice Creation API and returns the created voice id
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Missing audio file' });
    }

    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  // Basic mime-type allowlist
  const allowed = new Set([
    'audio/webm','audio/wav','audio/x-wav','audio/mpeg','audio/mp3','audio/ogg','audio/opus','audio/aac','audio/m4a','audio/x-m4a'
  ]);
  if (!allowed.has(req.file.mimetype)) {
    return res.status(400).json({ error: 'Unsupported audio type', mime: req.file.mimetype });
  }

    const contentType = req.file.mimetype || 'audio/webm';
    const filename = req.file.originalname || `sample-${Date.now()}.webm`;
    const voiceName = (req.body?.name && String(req.body.name).slice(0, 64)) || `VoiceTwin ${new Date().toISOString().slice(0,10)}`;
    const sourceType = (req.body?.sourceType === 'upload' || req.body?.sourceType === 'record') ? req.body.sourceType : 'upload';

    // Construct form-data using undici globals (Node>=18)
    const form = new FormData();
    form.append('name', voiceName);

    const blob = new Blob([req.file.buffer], { type: contentType });
    form.append('files', blob, filename);

    const resp = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: form,
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!resp.ok) {
      return res.status(resp.status).json({ error: 'ElevenLabs error', details: data });
    }

    // Typical response contains { voice_id, voice: { ... } }
    const voiceId = data.voice_id || data.voiceId || data?.voice?.voice_id;

    // Persist in DB
    const doc = await VoiceTwin.create({
      userId,
      name: voiceName,
      provider: 'elevenlabs',
      voiceId,
      sourceType,
    });

    return res.json({ success: true, voiceId, provider: 'elevenlabs', voice: {
      id: doc._id,
      name: doc.name,
      createdAt: doc.createdAt,
    }});
  } catch (err) {
    console.error('VoiceTwin upload error:', err);
    return res.status(500).json({ error: 'Upload failed', details: err?.message || String(err) });
  }
});

// GET /api/voicetwin/mine - list voices of current user
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const items = await VoiceTwin.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({ voices: items.map(v => ({
      id: v._id,
      name: v.name,
      provider: v.provider,
      voiceId: v.voiceId,
      sourceType: v.sourceType,
      createdAt: v.createdAt,
    })) });
  } catch (err) {
    console.error('VoiceTwin list error:', err);
    return res.status(500).json({ error: 'Failed to list voices' });
  }
});

// PATCH /api/voicetwin/:id - rename voice (own resource)
router.patch('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.params.id;
    const name = (req.body?.name && String(req.body.name).trim().slice(0, 120)) || '';
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const doc = await VoiceTwin.findOneAndUpdate({ _id: id, userId }, { name }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true, voice: { id: doc._id, name: doc.name } });
  } catch (err) {
    console.error('VoiceTwin rename error:', err);
    return res.status(500).json({ error: 'Failed to rename voice' });
  }
});

// DELETE /api/voicetwin/:id - delete voice (own resource)
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = req.params.id;
    const doc = await VoiceTwin.findOneAndDelete({ _id: id, userId });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('VoiceTwin delete error:', err);
    return res.status(500).json({ error: 'Failed to delete voice' });
  }
});

export default router;

