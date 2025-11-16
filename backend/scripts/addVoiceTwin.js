import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import VoiceTwin from '../src/models/VoiceTwin.js';
import User from '../src/models/User.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/voicelap';

async function addVoiceTwinRecord() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGO_URI}`);
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Step 1: Check if there are any users, if not create one
    console.log('👤 Checking for existing users...');
    let user = await User.findOne();
    
    if (!user) {
      console.log('   No users found. Creating a sample user...');
      user = await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        language: 'en-US',
        selectedVoiceId: 'browser',
        // Simple password hash/salt for demo (password: "test123")
        passwordHash: 'dummyhash123',
        passwordSalt: 'dummysalt123',
      });
      console.log(`   ✅ Created user: ${user.name} (${user.email})`);
      console.log(`   User ID: ${user._id}\n`);
    } else {
      console.log(`   ✅ Found existing user: ${user.name} (${user.email})`);
      console.log(`   User ID: ${user._id}\n`);
    }

    // Step 2: Create a VoiceTwin record
    console.log('🎤 Creating VoiceTwin record...');
    
    const voiceTwin = await VoiceTwin.create({
      userId: user._id,
      name: 'My First Voice Twin',
      provider: 'elevenlabs',
      voiceId: 'sample_voice_id_12345',
      sourceType: 'upload',
      durationSec: 45.5,
    });

    console.log('✅ VoiceTwin record created successfully!\n');
    console.log('📋 Record Details:');
    console.log('   ID:', voiceTwin._id);
    console.log('   Name:', voiceTwin.name);
    console.log('   Provider:', voiceTwin.provider);
    console.log('   Voice ID:', voiceTwin.voiceId);
    console.log('   Source Type:', voiceTwin.sourceType);
    console.log('   Duration:', voiceTwin.durationSec, 'seconds');
    console.log('   User ID:', voiceTwin.userId);
    console.log('   Created At:', voiceTwin.createdAt);
    console.log('   Updated At:', voiceTwin.updatedAt);

    // Step 3: Verify the record was saved
    console.log('\n🔍 Verifying record in database...');
    const count = await VoiceTwin.countDocuments();
    console.log(`   Total VoiceTwin records in database: ${count}`);

    // Step 4: List all VoiceTwin records
    console.log('\n📚 All VoiceTwin records:');
    const allVoiceTwins = await VoiceTwin.find().populate('userId', 'name email');
    allVoiceTwins.forEach((vt, index) => {
      console.log(`\n   ${index + 1}. ${vt.name}`);
      console.log(`      ID: ${vt._id}`);
      console.log(`      User: ${vt.userId?.name || 'Unknown'} (${vt.userId?.email || 'N/A'})`);
      console.log(`      Provider: ${vt.provider}`);
      console.log(`      Voice ID: ${vt.voiceId}`);
      console.log(`      Source: ${vt.sourceType}`);
      console.log(`      Duration: ${vt.durationSec || 'N/A'} seconds`);
      console.log(`      Created: ${vt.createdAt}`);
    });

    console.log('\n✨ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed.');
    process.exit(0);
  }
}

// Run the script
addVoiceTwinRecord();

