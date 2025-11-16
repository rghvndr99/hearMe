import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['free', 'creator', 'care', 'companion', 'family'], required: true },
    billing: { type: String, enum: ['monthly', 'annual'], required: true },
    price: { type: Number, required: true, min: 0 },
    method: { type: String, required: true, default: 'upi' },
    status: { type: String, enum: ['active', 'pending', 'pending_verification', 'failed', 'cancelled'], default: 'active', index: true },
    upiId: { type: String },
    transactionId: { type: String, index: true }, // UPI transaction ID for verification
    transactionProof: { type: String }, // Optional: screenshot URL or additional proof
    verifiedAt: { type: Date }, // When admin verified the payment
    verifiedBy: { type: String }, // Admin user ID who verified
    activatedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Subscription', SubscriptionSchema);

