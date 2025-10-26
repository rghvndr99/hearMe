import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, required: true, index: true },
    startedAt: { type: Date, required: true },
    lastActivity: { type: Date, required: true },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 }, // wall-clock session length (end-start)
    engagedSeconds: { type: Number, default: 0 }, // accumulated active processing time
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  },
  { timestamps: true }
);

ChatSessionSchema.index({ userId: 1, startedAt: -1 });
ChatSessionSchema.index({ userId: 1, lastActivity: -1 });

export default mongoose.model('ChatSession', ChatSessionSchema);

