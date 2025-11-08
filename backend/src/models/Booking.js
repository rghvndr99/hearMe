import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    booking_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    nickname: { type: String },
    plan_id: { type: String },
    mode: { type: String, enum: ['voice_scheduled','text_scheduled','voice_priority','text_priority','scheduled','on-call'], default: 'scheduled' },
    slot_iso: { type: Date, required: true, index: true },
    status: { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending', index: true },
    notes: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

BookingSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model('Booking', BookingSchema);

