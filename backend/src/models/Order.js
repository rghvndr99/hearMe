import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String, required: true, index: true },
    pack_id: { type: String },
    plan_id: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created','paid','failed','refunded'], default: 'created', index: true },
    gateway: { type: String, default: 'razorpay' },
    gateway_payload: { type: mongoose.Schema.Types.Mixed },
    metadata: { type: mongoose.Schema.Types.Mixed },
    txn_id: { type: String, index: true },
  },
  { timestamps: true }
);

OrderSchema.index({ txn_id: 1 }, { unique: false });

export default mongoose.model('Order', OrderSchema);

