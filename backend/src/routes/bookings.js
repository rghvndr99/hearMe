import express from 'express';
import auth from '../middleware/auth.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Subscription from '../models/Subscription.js';
import { getPlanConfig } from '../config/memberships.js';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../services/googleCalendar.js';

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

// Helper: Generate unique booking ID
function generateBookingId() {
  return `bk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Check if user has access to book sessions
async function checkBookingAccess(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get subscription and plan
  const subscription = await Subscription.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
  const plan = subscription?.plan || 'free';
  const config = getPlanConfig(plan);

  // Check plan-based access
  const planLimit = config?.features?.human_care?.sessions_per_month || 0;

  // Count bookings this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const bookingsThisMonth = await Booking.countDocuments({
    user_id: String(userId),
    createdAt: { $gte: monthStart },
    status: { $in: ['pending', 'confirmed', 'completed'] }
  });

  // Check if user has plan-based access
  if (planLimit > 0 && bookingsThisMonth < planLimit) {
    return { allowed: true, usingTrial: false, remaining: planLimit - bookingsThisMonth };
  }

  // Check trial access
  const trialRemaining = user.trial_human_calls_remaining || 0;
  if (trialRemaining > 0) {
    return { allowed: true, usingTrial: true, remaining: trialRemaining };
  }

  return { allowed: false, usingTrial: false, remaining: 0 };
}

// Helper: Validate booking time constraints
function validateBookingTime(slotTime, currentBooking = null) {
  const now = new Date();
  const slot = new Date(slotTime);

  // Check if slot is in the past
  if (slot <= now) {
    throw new Error('Cannot book a slot in the past');
  }

  // Check minimum lead time (30 minutes)
  const minLeadTime = 30 * 60 * 1000; // 30 minutes in ms
  if (slot.getTime() - now.getTime() < minLeadTime) {
    throw new Error('Booking must be at least 30 minutes in advance');
  }

  // Check if within allowed hours (8 AM - 8 PM IST)
  const hour = slot.getHours();
  if (hour < 8 || hour >= 20) {
    throw new Error('Bookings are only available between 8 AM and 8 PM IST');
  }

  // For cancellation/reschedule: check 24-hour policy
  if (currentBooking) {
    const bookingTime = new Date(currentBooking.slot_iso);
    const timeUntilBooking = bookingTime.getTime() - now.getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (timeUntilBooking < oneDayInMs) {
      throw new Error('Cannot modify booking less than 24 hours before scheduled time');
    }
  }

  return true;
}

// POST /api/bookings/create - Create new booking with Google Meet
router.post('/bookings/create', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { slotTime, durationMinutes = 30, mode = 'voice_scheduled', notes } = req.body;

    if (!slotTime) {
      return res.status(400).json({ error: 'Slot time is required' });
    }

    // Validate booking time
    validateBookingTime(slotTime);

    // Check access
    const access = await checkBookingAccess(userId);
    if (!access.allowed) {
      return res.status(402).json({ error: 'No available sessions. Please upgrade your plan.' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate user has email or phone for contact
    if (!user.email && !user.phone) {
      return res.status(400).json({
        error: 'Please add your email or phone number in your profile to receive booking confirmation.'
      });
    }

    // Create Google Calendar event with Meet using service account
    // This creates the event on VoiceLap's calendar (rghvndr99@gmail.com) and invites the user
    let googleEvent;
    try {
      googleEvent = await createCalendarEvent({
        startTime: new Date(slotTime),
        durationMinutes,
        summary: `VoiceLap Session - ${user.name || user.username}`,
        description: notes || 'Your scheduled session with a VoiceLap listener.',
        attendeeEmail: user.email, // User will receive invite
        attendeePhone: user.phone,
      });
    } catch (err) {
      console.error('Google Calendar event creation error:', err);
      return res.status(500).json({
        error: 'Failed to create Google Meet. Please try again.',
        details: err.message
      });
    }

    // Create booking in database
    const booking = await Booking.create({
      booking_id: generateBookingId(),
      user_id: String(userId),
      nickname: user.nickname || user.name,
      plan_id: user.current_plan_id,
      mode,
      slot_iso: new Date(slotTime),
      duration_minutes: durationMinutes,
      status: 'confirmed',
      notes,
      google_event_id: googleEvent.eventId,
      google_meet_link: googleEvent.meetLink,
      google_calendar_link: googleEvent.calendarLink,
    });

    // Decrement trial if using trial
    if (access.usingTrial) {
      await User.findByIdAndUpdate(userId, { $inc: { trial_human_calls_remaining: -1 } });
    }

    res.json({
      success: true,
      booking: {
        id: booking.booking_id,
        slotTime: booking.slot_iso,
        duration: booking.duration_minutes,
        status: booking.status,
        meetLink: booking.google_meet_link,
        calendarLink: booking.google_calendar_link,
      }
    });
  } catch (err) {
    console.error('POST /api/bookings/create error:', err);
    res.status(500).json({ error: err.message || 'Failed to create booking' });
  }
});

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

// PATCH /api/bookings/:id/reschedule - Reschedule a booking
router.patch('/bookings/:id/reschedule', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { id } = req.params;
    const { newSlotTime } = req.body;

    if (!newSlotTime) {
      return res.status(400).json({ error: 'New slot time is required' });
    }

    // Find booking
    const booking = await Booking.findOne({ booking_id: id, user_id: String(userId) });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot reschedule cancelled or completed booking' });
    }

    // Validate 24-hour policy
    try {
      validateBookingTime(newSlotTime, booking);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Update Google Calendar event
    try {
      await updateCalendarEvent({
        eventId: booking.google_event_id,
        newStartTime: new Date(newSlotTime),
        durationMinutes: booking.duration_minutes,
      });
    } catch (err) {
      console.error('Google Calendar update error:', err);
      return res.status(500).json({ error: 'Failed to update Google Calendar event' });
    }

    // Update booking
    booking.rescheduled_from = booking.slot_iso;
    booking.slot_iso = new Date(newSlotTime);
    await booking.save();

    res.json({
      success: true,
      booking: {
        id: booking.booking_id,
        slotTime: booking.slot_iso,
        previousSlotTime: booking.rescheduled_from,
        meetLink: booking.google_meet_link,
      }
    });
  } catch (err) {
    console.error('PATCH /api/bookings/:id/reschedule error:', err);
    res.status(500).json({ error: err.message || 'Failed to reschedule booking' });
  }
});

// DELETE /api/bookings/:id - Cancel a booking
router.delete('/bookings/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    // Find booking
    const booking = await Booking.findOne({ booking_id: id, user_id: String(userId) });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    // Validate 24-hour policy
    try {
      validateBookingTime(booking.slot_iso, booking);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Delete Google Calendar event
    try {
      await deleteCalendarEvent({
        eventId: booking.google_event_id,
      });
    } catch (err) {
      console.error('Google Calendar delete error:', err);
      // Continue even if Google Calendar delete fails
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelled_at = new Date();
    booking.cancelled_by = String(userId);
    booking.cancellation_reason = reason;
    await booking.save();

    // Refund trial slot if it was a trial booking
    const subscription = await Subscription.findOne({ userId, status: 'active' });
    const plan = subscription?.plan || 'free';
    const config = getPlanConfig(plan);
    const planLimit = config?.features?.human_care?.sessions_per_month || 0;

    // If user has no plan limit, it was likely a trial booking - refund it
    if (planLimit === 0) {
      await User.findByIdAndUpdate(userId, { $inc: { trial_human_calls_remaining: 1 } });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.booking_id,
        status: booking.status,
        cancelledAt: booking.cancelled_at,
      }
    });
  } catch (err) {
    console.error('DELETE /api/bookings/:id error:', err);
    res.status(500).json({ error: err.message || 'Failed to cancel booking' });
  }
});

// GET /api/bookings/my-history - Get user's booking history
router.get('/bookings/my-history', auth, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    const { filter = 'all' } = req.query; // all, upcoming, past, cancelled

    const query = { user_id: String(userId) };
    const now = new Date();

    if (filter === 'upcoming') {
      query.slot_iso = { $gte: now };
      query.status = { $in: ['pending', 'confirmed'] };
    } else if (filter === 'past') {
      query.$or = [
        { slot_iso: { $lt: now } },
        { status: 'completed' }
      ];
    } else if (filter === 'cancelled') {
      query.status = 'cancelled';
    }

    const bookings = await Booking.find(query)
      .sort({ slot_iso: -1 })
      .limit(50)
      .lean();

    // Format response
    const formatted = bookings.map(b => ({
      id: b.booking_id,
      slotTime: b.slot_iso,
      duration: b.duration_minutes,
      mode: b.mode,
      status: b.status,
      meetLink: b.google_meet_link,
      calendarLink: b.google_calendar_link,
      notes: b.notes,
      createdAt: b.createdAt,
      cancelledAt: b.cancelled_at,
      cancellationReason: b.cancellation_reason,
      rescheduledFrom: b.rescheduled_from,
      canModify: b.status !== 'cancelled' && b.status !== 'completed' && new Date(b.slot_iso).getTime() - now.getTime() > 24 * 60 * 60 * 1000,
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    console.error('GET /api/bookings/my-history error:', err);
    res.status(500).json({ error: 'Failed to fetch booking history' });
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

