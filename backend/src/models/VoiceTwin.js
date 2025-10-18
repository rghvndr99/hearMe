import mongoose from 'mongoose';

const VoiceTwinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    provider: { type: String, required: true, default: 'elevenlabs' },
    voiceId: { type: String, required: true, trim: true },
    sourceType: { type: String, enum: ['upload', 'record'], required: true },
    durationSec: { type: Number, required: false },
  },
  { timestamps: true }
);

VoiceTwinSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('VoiceTwin', VoiceTwinSchema);

