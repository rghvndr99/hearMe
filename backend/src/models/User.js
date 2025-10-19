import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false, trim: true },
    language: { type: String, required: false, default: 'en-US' },
    selectedVoiceId: { type: String, required: false, default: 'browser' },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    passwordResetTokenHash: { type: String, required: false },
    passwordResetTokenExpires: { type: Date, required: false },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', UserSchema);

