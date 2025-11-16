import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/voicelap');
    console.log('Connected to MongoDB');

    const username = process.argv[2];
    
    if (!username) {
      console.error('Usage: node backend/scripts/make_admin.js <username>');
      process.exit(1);
    }

    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`User "${username}" not found`);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`User "${username}" is already an admin`);
      process.exit(0);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ User "${username}" is now an admin!`);
    console.log(`User ID: ${user._id}`);
    console.log(`Email: ${user.email || 'N/A'}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

makeAdmin();

