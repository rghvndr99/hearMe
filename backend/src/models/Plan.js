import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    plan_id: { type: String, required: true, unique: true, index: true },
    display_name: { type: String, required: true },
    short_name: { type: String },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    billing_cycle_days: { type: Number, default: 30 },
    anonymous_allowed: { type: Boolean, default: true },
    description: { type: String },
    features: { type: mongoose.Schema.Types.Mixed, default: {} },
    ui: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PlanSchema.index({ plan_id: 1 }, { unique: true });

export default mongoose.model('Plan', PlanSchema);

