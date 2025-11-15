import express from 'express';
import auth from '../middleware/auth.js';
import Subscription from '../models/Subscription.js';
import VoiceTwin from '../models/VoiceTwin.js';
import ChatSession from '../models/ChatSession.js';
import { getPlanConfig, FEATURE_FLAGS } from '../config/memberships.js';

const router = express.Router();

function toPublic(sub) {
  return sub
    ? {
        id: sub._id,
        plan: sub.plan,
        billing: sub.billing,
        price: sub.price,
        method: sub.method,
        status: sub.status,
        upiId: sub.upiId || null,
        activatedAt: sub.activatedAt,
        cancelledAt: sub.cancelledAt || null,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      }
    : null;
}

function getWindowStartForPlan(cfg) {
  const now = new Date();
  const period = cfg?.features?.chatMinutes?.period;
  if (period === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(0);
}

async function computeChatUsage(userId, plan) {
  const cfg = getPlanConfig(plan);
  const limit = cfg?.features?.chatMinutes?.limit ?? -1;
  const period = cfg?.features?.chatMinutes?.period || 'unlimited';
  const windowStart = getWindowStartForPlan(cfg);
  const now = new Date();

  if (!userId) return { used: 0, limit, period };

  const sessions = await ChatSession.find({
    userId,
    $or: [
      { startedAt: { $gte: windowStart } },
      { lastActivity: { $gte: windowStart } },
      { status: 'open' },
    ],
  }).select('startedAt endedAt lastActivity status engagedSeconds');

  let usedMs = 0;
  for (const s of sessions) {
    if (typeof s.engagedSeconds === 'number' && s.engagedSeconds > 0) {
      usedMs += s.engagedSeconds * 1000;
      continue;
    }
    const start = s.startedAt > windowStart ? s.startedAt : windowStart;
    const end = s.endedAt ? s.endedAt : now;
    if (end <= windowStart) continue;
    if (end > start) usedMs += (end - start);
  }

  const used = Math.floor(usedMs / 60000); // minutes
  return { used, limit, period };
}


async function computeUsage(userId, plan) {
  const cfg = getPlanConfig(plan);

  // Voices created
  const voicesCreated = await VoiceTwin.countDocuments({ userId });

  // Chat minutes used in the current window (week/month/unlimited)
  const chat = await computeChatUsage(userId, plan);

  // In-person sessions (human care) - count bookings in current month
  const Booking = (await import('../models/Booking.js')).default;
  const User = (await import('../models/User.js')).default;

  const user = await User.findById(userId).select('trial_human_calls_remaining current_plan_id').lean();
  const trialRemaining = user?.trial_human_calls_remaining ?? 3;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const bookingsThisMonth = await Booking.countDocuments({
    user_id: String(userId),
    createdAt: { $gte: monthStart },
    status: { $in: ['pending', 'confirmed', 'completed'] }
  });

  // Get plan-based limit from voicelap_pricing_v2.json structure
  // For now, use hardcoded values matching the pricing JSON
  let planSessionsLimit = 0;
  if (plan === 'care') planSessionsLimit = 10;
  else if (plan === 'companion') planSessionsLimit = 15;
  else if (plan === 'family') planSessionsLimit = 20;

  return {
    voiceTwins: {
      used: voicesCreated,
      limit: cfg.features.voiceTwins.limit,
    },
    chatMinutes: {
      used: chat.used,
      limit: chat.limit,
      period: chat.period,
    },
    inPersonSessions: {
      used: bookingsThisMonth,
      limit: planSessionsLimit,
      trialRemaining: trialRemaining,
      period: 'month',
    },
  };
}

// POST /api/subscriptions  (create/activate a membership after successful payment)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { plan, billing, price, method, upiId, metadata } = req.body || {};
    if (!plan || !billing || typeof price !== 'number' || !method) {
      return res.status(400).json({ error: 'plan, billing, price and method are required' });
    }

    // End any existing active subscription
    await Subscription.updateMany(
      { userId, status: 'active' },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    const sub = await Subscription.create({
      userId,
      plan,
      billing,
      price,
      method,
      upiId: upiId || null,
      status: 'active',
      metadata: metadata || {},
      activatedAt: new Date(),
    });

    const usage = await computeUsage(userId, plan);
    const config = getPlanConfig(plan);

    res.status(201).json({ subscription: toPublic(sub), config, usage, flags: FEATURE_FLAGS });
  } catch (err) {
    console.error('Create subscription error:', err);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// GET /api/subscriptions/me  (get current membership + usage)
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sub = await Subscription.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });

    const plan = sub?.plan || 'free';
    const config = getPlanConfig(plan);
    const usage = await computeUsage(userId, plan);

    res.json({ subscription: toPublic(sub), config, usage, flags: FEATURE_FLAGS });
  } catch (err) {
    console.error('Get my subscription error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// PATCH /api/subscriptions/cancel  (cancel active membership)
router.patch('/cancel', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sub = await Subscription.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
    if (!sub) return res.status(404).json({ error: 'No active membership' });

    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    await sub.save({ validateBeforeSave: false });

    res.json({ subscription: toPublic(sub), message: 'Membership cancelled' });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ error: 'Failed to cancel membership' });
  }
});

export default router;

