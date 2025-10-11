import express from 'express';
import jwt from 'jsonwebtoken';
import Volunteer from '../models/Volunteer.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// register volunteer
router.post('/register', async (req, res) => {
  const { name, email, languages } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const vol = new Volunteer({ name, email, languages });
  await vol.save();
  res.json({ ok: true, volunteer: vol });
});

// login -> returns JWT
router.post('/login', async (req, res) => {
  const { id } = req.body;
  const vol = await Volunteer.findById(id);
  if (!vol) return res.status(404).json({ error: 'Not found' });
  const token = jwt.sign({ id: vol._id, role: 'volunteer' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token, volunteer: vol });
});

// protected dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  const count = await Volunteer.countDocuments();
  res.json({ volunteers: count });
});

export default router;
