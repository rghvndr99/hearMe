import express from 'express';
import jwt from 'jsonwebtoken';
import Story from '../models/Story.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/stories - list stories (newest first)
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find({}).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ stories });
  } catch (err) {
    console.error('GET /stories error', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST /api/stories - create story (auth optional)
router.post('/', async (req, res) => {
  try {
    const { text, name, occupation, location } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    let userId = null;
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = payload?.sub || payload?.id || null;
      } catch (e) {
        // ignore invalid token for anonymous post
      }
    }

    const story = await Story.create({
      text: String(text).trim(),
      name: name && String(name).trim() ? String(name).trim() : 'Anonymous',
      occupation: occupation ? String(occupation).trim() : '',
      location: location ? String(location).trim() : '',
      user: userId || undefined,
    });

    res.status(201).json({ story });
  } catch (err) {
    console.error('POST /stories error', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// DELETE /api/stories/:id - delete own story
router.delete('/:id', auth, async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ error: 'Not found' });

    if (!story.user || story.user.toString() !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Story.deleteOne({ _id: storyId });
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /stories/:id error', err);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;

