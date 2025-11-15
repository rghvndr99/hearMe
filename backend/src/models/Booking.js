import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    booking_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    nickname: { type: String },
    plan_id: { type: String },
    mode: { type: String, enum: ['voice_scheduled','text_scheduled','voice_priority','text_priority','scheduled','on-call'], default: 'scheduled' },
    slot_iso: { type: Date, required: true, index: true },
    duration_minutes: { type: Number, default: 30 }, // Session duration
    status: { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending', index: true },
    notes: { type: String },

    // Google Calendar integration
    google_event_id: { type: String, index: true }, // Google Calendar event ID for updates/deletes
    google_meet_link: { type: String }, // Generated Google Meet link
    google_calendar_link: { type: String }, // Link to view event in Google Calendar

    // User's Google OAuth tokens (encrypted or reference to user's token)
    user_google_access_token: { type: String }, // Store encrypted or use refresh token

    // Cancellation/modification tracking
    cancelled_at: { type: Date },
    cancelled_by: { type: String }, // user_id who cancelled
    cancellation_reason: { type: String },
    rescheduled_from: { type: Date }, // Original slot if rescheduled

    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

BookingSchema.index({ user_id: 1, createdAt: -1 });
BookingSchema.index({ slot_iso: 1, status: 1 });
BookingSchema.index({ google_event_id: 1 });

export default mongoose.model('Booking', BookingSchema);

