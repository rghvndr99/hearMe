import mongoose from 'mongoose';

const UiTextSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UiTextSchema.index({ key: 1 }, { unique: true });

export default mongoose.model('UiText', UiTextSchema);

