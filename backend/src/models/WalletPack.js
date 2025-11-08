import mongoose from 'mongoose';

const WalletPackSchema = new mongoose.Schema(
  {
    pack_id: { type: String, required: true, unique: true, index: true },
    display_name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    credits_minutes: { type: Number, required: true, min: 0 },
    applies_to: { type: [String], default: [] },
    consumable: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true }
);

WalletPackSchema.index({ pack_id: 1 }, { unique: true });

export default mongoose.model('WalletPack', WalletPackSchema);

