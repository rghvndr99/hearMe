import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    name: { type: String, required: false, default: 'Anonymous', trim: true },
    occupation: { type: String, required: false, trim: true },
    location: { type: String, required: false, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

export default mongoose.model('Story', StorySchema);

