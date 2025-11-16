#!/usr/bin/env node

/**
 * Manual Voice Cleanup Script
 * 
 * Usage:
 *   node backend/scripts/cleanup_voices.js
 * 
 * This script manually runs the voice cleanup process to:
 * 1. Delete voices for expired anonymous users
 * 2. Delete voices for users with cancelled subscriptions (>24h ago)
 * 
 * Voices are deleted from both:
 * - ElevenLabs API
 * - MongoDB database
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { runVoiceCleanup } from '../src/services/voiceCleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  try {
    console.log('🧹 Voice Cleanup Script');
    console.log('='.repeat(50));
    console.log('');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/voicelap';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Run cleanup
    const result = await runVoiceCleanup();

    console.log('');
    console.log('='.repeat(50));
    console.log('📊 Cleanup Summary:');
    console.log('='.repeat(50));
    console.log(`Anonymous users: ${result.anonymous.deleted} voices deleted`);
    console.log(`Cancelled subscriptions: ${result.cancelled.deleted} voices deleted`);
    console.log(`Total: ${result.total.deleted} voices deleted from database`);
    console.log(`Total: ${result.total.elevenLabsDeleted} voices deleted from ElevenLabs`);
    console.log('='.repeat(50));

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main();

