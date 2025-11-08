import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

SettingSchema.index({ key: 1 }, { unique: true });

export default mongoose.model('Setting', SettingSchema);

