import express from 'express';
import multer from 'multer';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import auth from '../middleware/auth.js';
import VoiceTwin from '../models/VoiceTwin.js';
import Subscription from '../models/Subscription.js';
import { getPlanConfig, FEATURE_FLAGS } from '../config/memberships.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB in-memory

// In-memory cache for voices per user session
// Key: userId, Value: { voices: [], timestamp: Date }
const voicesCache = new Map();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

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

	  // Enforce membership limit for custom voices before calling external API
	  const active = await Subscription.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
	  const plan = active?.plan || 'free';
	  const cfg = getPlanConfig(plan);
	  const limit = cfg?.features?.voiceTwins?.limit ?? 0;
	  const used = await VoiceTwin.countDocuments({ userId });
  if (FEATURE_FLAGS?.enforce?.voiceTwinLimits !== false) {
	  if (typeof limit === 'number' && used >= limit) {
	    return res.status(403).json({
	      error: 'VoiceTwin limit reached',
	      usage: { used, limit },
	      plan,
	      message: `You have used ${used} of ${limit} custom voices for your ${plan} plan.`
	    });
  }
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

    // Invalidate cache for this user since they added a new voice
    voicesCache.delete(userId);

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

// GET /api/voicetwin/mine - list user's custom voices from DB + default ElevenLabs voices
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ELEVENLABS_API_KEY not configured, returning empty voices list');
      return res.json({ voices: [] });
    }

    // Check cache first
    const cached = voicesCache.get(userId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION_MS) {
      console.log('VoiceTwin: Returning cached voices for user ' + userId + ' (' + cached.voices.length + ' voices)');
      return res.json({ voices: cached.voices, cached: true });
    }

    // Step 1: Get user's custom voices from MongoDB (SECURITY: filter by userId)
    const userCustomVoicesFromDB = await VoiceTwin.find({ userId }).lean();

    // Step 2: Fetch default voices from ElevenLabs API
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const voicesResponse = await client.voices.getAll();

    // Filter to get ONLY default/premade voices (not cloned)
    const defaultVoices = voicesResponse.voices
      .filter(voice => voice.category === 'premade' || voice.category === 'professional')
      .map(voice => ({
        id: voice.voiceId,
        name: voice.name,
        provider: 'elevenlabs',
        voiceId: voice.voiceId,
        category: voice.category,
        labels: voice.labels || {},
        previewUrl: voice.previewUrl,
      }));

    // Step 3: Transform user's custom voices from DB
    const customVoices = userCustomVoicesFromDB.map(doc => ({
      id: doc._id.toString(), // MongoDB _id for edit/delete operations
      name: doc.name,
      provider: doc.provider || 'elevenlabs',
      voiceId: doc.voiceId, // ElevenLabs voice ID for TTS operations
      category: 'cloned', // Mark as custom/cloned for highlighting in UI
      createdAt: doc.createdAt,
    }));

    // Step 4: Determine what to return based on requirements
    // If user has custom voices: show custom voices + default voices
    // If user has NO custom voices: show only default ElevenLabs voices
    const voicesToReturn = customVoices.length > 0
      ? [...customVoices, ...defaultVoices]  // Custom + defaults
      : defaultVoices;                        // Only defaults

    // Store in cache
    voicesCache.set(userId, {
      voices: voicesToReturn,
      timestamp: now,
    });

    console.log(`VoiceTwin: User ${userId} has ${customVoices.length} custom voices in DB. Returning ${voicesToReturn.length} voices (${customVoices.length} custom + ${defaultVoices.length} defaults)`);

    return res.json({ voices: voicesToReturn, cached: false });
  } catch (err) {
    console.error('VoiceTwin list error:', err);
    return res.status(500).json({ error: 'Failed to list voices', details: err?.message });
  }
});

// GET /api/voicetwin/public - list default/premade voices for anonymous users
router.get('/public', async (req, res) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ELEVENLABS_API_KEY not configured, returning empty voices list');
      return res.json({ voices: [] });
    }

    // Fetch voices from ElevenLabs API
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const voicesResponse = await client.voices.getAll();

    // Transform and filter to show ONLY default/premade voices (not cloned)
    const publicVoices = voicesResponse.voices
      .filter(voice => voice.category === 'premade' || voice.category === 'professional')
      .map(voice => ({
        id: voice.voiceId,
        name: voice.name,
        provider: 'elevenlabs',
        voiceId: voice.voiceId,
        category: voice.category,
        labels: voice.labels || {},
        previewUrl: voice.previewUrl,
      }));

    console.log(`VoiceTwin: Fetched ${publicVoices.length} public voices from ElevenLabs`);

    return res.json({ voices: publicVoices });
  } catch (err) {
    console.error('VoiceTwin public list error:', err);
    return res.status(500).json({ error: 'Failed to list public voices', details: err?.message });
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
