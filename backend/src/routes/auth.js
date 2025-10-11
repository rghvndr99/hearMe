import express from 'express';
import Volunteer from '../models/Volunteer.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, languages } = req.body;
  const vol = new Volunteer({ name, email, languages });
  await vol.save();
  res.json({ volunteer: vol });
});

router.post('/login', async (req, res) => {
  const { id } = req.body;
  const vol = await Volunteer.findById(id);
  if (!vol) return res.status(404).json({ error: 'Not found' });
  const token = jwt.sign({ id: vol._id, role: 'volunteer' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token });
});

export default router;
