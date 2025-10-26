import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['free', 'care', 'companion'], required: true },
    billing: { type: String, enum: ['monthly', 'annual'], required: true },
    price: { type: Number, required: true, min: 0 },
    method: { type: String, required: true, default: 'upi' },
    status: { type: String, enum: ['active', 'pending', 'failed', 'cancelled'], default: 'active', index: true },
    upiId: { type: String },
    activatedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Subscription', SubscriptionSchema);

