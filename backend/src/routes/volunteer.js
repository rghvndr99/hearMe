import express from 'express';
import VolunteerApplication from '../models/VolunteerApplication.js';

const router = express.Router();

router.post('/apply', async (req, res) => {
  try {
    const { name, email, phone, location, availability, skills, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are required' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

    const application = new VolunteerApplication({ name, email, phone, location, availability, skills, message, ip });
    await application.save();

    return res.status(201).json({ ok: true, id: application._id });
  } catch (err) {
    console.error('Failed to save volunteer application:', err);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;

