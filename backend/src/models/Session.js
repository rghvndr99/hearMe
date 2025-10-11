import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  createdAt: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now },
  messages: [MessageSchema],
});

export default mongoose.model('Session', SessionSchema);
