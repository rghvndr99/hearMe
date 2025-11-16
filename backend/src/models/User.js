import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: false, unique: true, sparse: true, index: true },

    // Identity (optional for anonymous users)
    username: { type: String, required: false, unique: true, sparse: true, trim: true, minlength: 3 },
    name: { type: String, required: false, trim: true },
    email: { type: String, required: false, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: false, trim: true },
    is_anonymous: { type: Boolean, default: false },
    nickname: { type: String },
    anon_expires_at: { type: Date },

    language: { type: String, required: false, default: 'en-US' },
    selectedVoiceId: { type: String, required: false, default: 'browser' },

    // Auth (optional for anonymous users)
    passwordHash: { type: String, required: false },
    passwordSalt: { type: String, required: false },
    passwordResetTokenHash: { type: String, required: false },
    passwordResetTokenExpires: { type: Date, required: false },

    // Admin role
    isAdmin: { type: Boolean, default: false, index: true },

    // Pricing/membership
    current_plan_id: { type: String, default: 'free' },

    // Wallet minutes and transactions
    wallet: {
      balance_minutes: { type: Number, default: 0 },
      transactions: [
        new mongoose.Schema(
          {
            txn_id: { type: String, index: true },
            type: { type: String, enum: ['credit','debit','adjustment'], required: true },
            minutes: { type: Number, required: true },
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
            source: { type: String }, // wallet_topup | consumption | booking | refund
            pack_id: { type: String },
            note: { type: String },
            at: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
    },

    trial_human_calls_remaining: { type: Number, default: 3 },

    // Temporary contact info for callbacks (TTL)
    contact_temp: {
      phone_last4: { type: String },
      contact_token: { type: String },
      expires_at: { type: Date },
    },

    voices: { type: [mongoose.Schema.Types.Mixed], default: [] },
    settings: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// TTL index for contact_temp.expires_at (expires exactly at the given time)
UserSchema.index({ 'contact_temp.expires_at': 1 }, { expireAfterSeconds: 0 });

// TTL index for anonymous users auto-expiry (expires exactly at anon_expires_at)
UserSchema.index({ anon_expires_at: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { is_anonymous: true } });

UserSchema.index({ username: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', UserSchema);

