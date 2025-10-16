import mongoose from 'mongoose';

const VolunteerApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    availability: { type: String, trim: true },
    skills: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    ip: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.models.VolunteerApplication ||
  mongoose.model('VolunteerApplication', VolunteerApplicationSchema);

