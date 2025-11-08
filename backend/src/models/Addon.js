import mongoose from 'mongoose';

const AddonSchema = new mongoose.Schema(
  {
    addon_id: { type: String, required: true, unique: true, index: true },
    display_name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    description: { type: String },
    consumable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AddonSchema.index({ addon_id: 1 }, { unique: true });

export default mongoose.model('Addon', AddonSchema);

