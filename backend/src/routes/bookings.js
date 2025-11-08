import express from 'express';
import auth from '../middleware/auth.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

const router = express.Router();

function toDate(d) {
  const x = new Date(d);
  if (isNaN(x.getTime())) return null;
  return x;
}

function userSelectorFromJwt(userJwt) {
  const user_id = userJwt?.user_id;
  const mongoId = userJwt?.id || userJwt?.sub;
  if (user_id) return { user_id };
  if (mongoId) return { _id: mongoId };
  return null;
}

// POST /api/book-care
router.post('/book-care', auth, async (req, res) => {
  try {
    const userJwt = req.user;
    const userSel = userSelectorFromJwt(userJwt);
    if (!userSel) return res.status(401).json({ error: 'Unauthenticated' });

    const { slot_iso, mode = 'scheduled', note } = req.body || {};
    const slot = toDate(slot_iso);
    if (!slot) return res.status(400).json({ error: 'slot_iso invalid' });

    const user = await User.findOne(userSel);
    if (!user) return res.status(404).json({ error: 'user not found' });
    const plan = await Plan.findOne({ plan_id: user.current_plan_id }).lean();
    const features = plan?.features || {};

    let allowed = false;
    let usingTrial = false;

    if (features?.human_care?.available) {
      allowed = true;
    } else if ((user.trial_human_calls_remaining || 0) > 0) {
      allowed = true;
      usingTrial = true;
    }

    if (!allowed) return res.status(402).json({ error: 'Human care not available on your plan' });

    const booking_id = 'bk_' + Date.now();

    const booking = await Booking.create({
      booking_id,
      user_id: user.user_id || String(user._id || ''),
      nickname: user.nickname || undefined,
      plan_id: user.current_plan_id,
      mode,
      slot_iso: slot,
      status: 'pending',
      notes: note || undefined,
    });

    if (usingTrial) {
      await User.updateOne(userSel, { $inc: { trial_human_calls_remaining: -1 } });
    }

    res.json({ booking_id: booking.booking_id, status: booking.status });
  } catch (err) {
    console.error('POST /api/book-care error', err);
    res.status(500).json({ error: 'failed to create booking' });
  }
});

// GET /api/bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const userJwt = req.user;
    const userSel = userSelectorFromJwt(userJwt);
    if (!userSel) return res.status(401).json({ error: 'Unauthenticated' });

    const user = await User.findOne(userSel, { user_id: 1 }).lean();
    const uid = user?.user_id || String(user?._id || '');
    const list = await Booking.find({ user_id: uid }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(list);
  } catch (err) {
    console.error('GET /api/bookings error', err);
    res.status(500).json({ error: 'failed to list bookings' });
  }
});

export default router;

