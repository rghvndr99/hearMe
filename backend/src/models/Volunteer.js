import mongoose from 'mongoose';
const VolunteerSchema = new mongoose.Schema({
  name: String,
  email: String,
  languages: [String],
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model('Volunteer', VolunteerSchema);