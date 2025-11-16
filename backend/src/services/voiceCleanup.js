// Voice Clone Cleanup Service
// Handles deletion of voice clones from ElevenLabs and database

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import VoiceTwin from '../models/VoiceTwin.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

/**
 * Delete a voice from ElevenLabs API
 * @param {string} voiceId - ElevenLabs voice ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteVoiceFromElevenLabs(voiceId) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      console.warn('ELEVENLABS_API_KEY not configured, skipping ElevenLabs deletion');
      return false;
    }

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    await client.voices.delete(voiceId);
    console.log(`✅ Deleted voice ${voiceId} from ElevenLabs`);
    return true;
  } catch (err) {
    // If voice doesn't exist in ElevenLabs (404), consider it success
    if (err?.statusCode === 404 || err?.status === 404) {
      console.log(`Voice ${voiceId} not found in ElevenLabs (already deleted)`);
      return true;
    }
    console.error(`Failed to delete voice ${voiceId} from ElevenLabs:`, err.message);
    return false;
  }
}

/**
 * Delete voice clone from both database and ElevenLabs
 * @param {string} voiceTwinId - MongoDB VoiceTwin document ID
 * @param {string} userId - User ID (for security check)
 * @returns {Promise<{success: boolean, deletedFromElevenLabs: boolean}>}
 */
export async function deleteVoiceClone(voiceTwinId, userId = null) {
  try {
    // Find the voice twin
    const query = userId ? { _id: voiceTwinId, userId } : { _id: voiceTwinId };
    const voiceTwin = await VoiceTwin.findOne(query);

    if (!voiceTwin) {
      return { success: false, error: 'Voice not found' };
    }

    // Delete from ElevenLabs first
    const deletedFromElevenLabs = await deleteVoiceFromElevenLabs(voiceTwin.voiceId);

    // Delete from database
    await VoiceTwin.deleteOne({ _id: voiceTwinId });
    console.log(`✅ Deleted voice ${voiceTwinId} from database`);

    return { success: true, deletedFromElevenLabs };
  } catch (err) {
    console.error('Error deleting voice clone:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Clean up voices for anonymous users whose sessions have expired
 * Called by scheduled job
 */
export async function cleanupAnonymousUserVoices() {
  try {
    console.log('🧹 Starting cleanup of anonymous user voices...');

    // Find all anonymous users whose expiry has passed
    const expiredAnonUsers = await User.find({
      is_anonymous: true,
      anon_expires_at: { $lt: new Date() }
    }).select('_id').lean();

    if (expiredAnonUsers.length === 0) {
      console.log('No expired anonymous users found');
      return { deleted: 0 };
    }

    const userIds = expiredAnonUsers.map(u => u._id);
    console.log(`Found ${userIds.length} expired anonymous users`);

    // Find all voice clones for these users
    const voiceClones = await VoiceTwin.find({ userId: { $in: userIds } }).lean();
    console.log(`Found ${voiceClones.length} voice clones to delete`);

    let deletedCount = 0;
    let elevenLabsDeletedCount = 0;

    // Delete each voice clone
    for (const voice of voiceClones) {
      const result = await deleteVoiceClone(voice._id);
      if (result.success) {
        deletedCount++;
        if (result.deletedFromElevenLabs) {
          elevenLabsDeletedCount++;
        }
      }
    }

    console.log(`✅ Cleanup complete: ${deletedCount} voices deleted (${elevenLabsDeletedCount} from ElevenLabs)`);
    return { deleted: deletedCount, elevenLabsDeleted: elevenLabsDeletedCount };
  } catch (err) {
    console.error('Error in cleanupAnonymousUserVoices:', err);
    return { deleted: 0, error: err.message };
  }
}

/**
 * Clean up voices for users with cancelled subscriptions (24 hours after cancellation)
 * Called by scheduled job
 */
export async function cleanupCancelledSubscriptionVoices() {
  try {
    console.log('🧹 Starting cleanup of cancelled subscription voices...');

    // Find subscriptions cancelled more than 24 hours ago
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const cancelledSubs = await Subscription.find({
      status: 'cancelled',
      cancelledAt: { $lt: cutoffTime }
    }).select('userId').lean();

    if (cancelledSubs.length === 0) {
      console.log('No cancelled subscriptions older than 24 hours found');
      return { deleted: 0 };
    }

    const userIds = cancelledSubs.map(s => s.userId);
    console.log(`Found ${userIds.length} users with cancelled subscriptions (>24h ago)`);

    // Find all voice clones for these users
    const voiceClones = await VoiceTwin.find({ userId: { $in: userIds } }).lean();
    console.log(`Found ${voiceClones.length} voice clones to delete`);

    let deletedCount = 0;
    let elevenLabsDeletedCount = 0;

    // Delete each voice clone
    for (const voice of voiceClones) {
      const result = await deleteVoiceClone(voice._id);
      if (result.success) {
        deletedCount++;
        if (result.deletedFromElevenLabs) {
          elevenLabsDeletedCount++;
        }
      }
    }

    console.log(`✅ Cleanup complete: ${deletedCount} voices deleted (${elevenLabsDeletedCount} from ElevenLabs)`);
    return { deleted: deletedCount, elevenLabsDeleted: elevenLabsDeletedCount };
  } catch (err) {
    console.error('Error in cleanupCancelledSubscriptionVoices:', err);
    return { deleted: 0, error: err.message };
  }
}

/**
 * Run all cleanup tasks
 * Called by scheduled job (e.g., every hour)
 */
export async function runVoiceCleanup() {
  console.log('🧹 Running scheduled voice cleanup...');

  const anonResult = await cleanupAnonymousUserVoices();
  const cancelledResult = await cleanupCancelledSubscriptionVoices();

  const totalDeleted = anonResult.deleted + cancelledResult.deleted;
  const totalElevenLabsDeleted = (anonResult.elevenLabsDeleted || 0) + (cancelledResult.elevenLabsDeleted || 0);

  console.log(`✅ Voice cleanup complete: ${totalDeleted} total voices deleted (${totalElevenLabsDeleted} from ElevenLabs)`);

  return {
    anonymous: anonResult,
    cancelled: cancelledResult,
    total: { deleted: totalDeleted, elevenLabsDeleted: totalElevenLabsDeleted }
  };
}
