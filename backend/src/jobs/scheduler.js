// Scheduled Jobs Runner
// Runs periodic cleanup tasks

import { runVoiceCleanup } from '../services/voiceCleanup.js';

/**
 * Start all scheduled jobs
 */
export function startScheduledJobs() {
  console.log('🕐 Starting scheduled jobs...');

  // Run voice cleanup every hour
  const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  
  // Run immediately on startup
  runVoiceCleanup().catch(err => {
    console.error('Error in initial voice cleanup:', err);
  });

  // Then run every hour
  setInterval(() => {
    runVoiceCleanup().catch(err => {
      console.error('Error in scheduled voice cleanup:', err);
    });
  }, CLEANUP_INTERVAL_MS);

  console.log(`✅ Voice cleanup job scheduled (runs every ${CLEANUP_INTERVAL_MS / 1000 / 60} minutes)`);
}

/**
 * Stop all scheduled jobs (for graceful shutdown)
 */
export function stopScheduledJobs() {
  console.log('🛑 Stopping scheduled jobs...');
  // Note: setInterval IDs would need to be stored to clear them
  // For now, this is a placeholder for future enhancement
}

