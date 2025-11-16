# Voice Clone Cleanup Implementation

## Overview

Automatic cleanup system for voice clones to manage ElevenLabs API quota and database storage.

---

## Features

### 1. **Manual Voice Deletion**
When users delete a voice clone from the UI, it's now deleted from:
- ✅ **MongoDB database** (VoiceTwin collection)
- ✅ **ElevenLabs API** (voice clone removed from account)

### 2. **Automatic Cleanup for Anonymous Users**
When anonymous users' sessions expire:
- ✅ All their voice clones are automatically deleted
- ✅ Runs every hour via scheduled job
- ✅ Deletes from both database and ElevenLabs

### 3. **Automatic Cleanup for Cancelled Subscriptions**
When users cancel their subscription:
- ✅ After **24 hours**, all their voice clones are deleted
- ✅ Runs every hour via scheduled job
- ✅ Deletes from both database and ElevenLabs

---

## Implementation Details

### Files Created

1. **`backend/src/services/voiceCleanup.js`** (188 lines)
   - Core cleanup service
   - Functions:
     - `deleteVoiceFromElevenLabs(voiceId)` - Delete from ElevenLabs API
     - `deleteVoiceClone(voiceTwinId, userId)` - Delete from DB + ElevenLabs
     - `cleanupAnonymousUserVoices()` - Cleanup expired anonymous users
     - `cleanupCancelledSubscriptionVoices()` - Cleanup cancelled subscriptions
     - `runVoiceCleanup()` - Run all cleanup tasks

2. **`backend/src/jobs/scheduler.js`** (36 lines)
   - Scheduled job runner
   - Runs voice cleanup every hour
   - Starts automatically when server starts

3. **`backend/scripts/cleanup_voices.js`** (67 lines)
   - Manual cleanup script
   - Can be run on-demand: `node backend/scripts/cleanup_voices.js`
   - Shows detailed cleanup summary

### Files Modified

1. **`backend/src/routes/voicetwin.js`**
   - Updated `DELETE /api/voicetwin/:id` endpoint
   - Now uses `deleteVoiceClone()` service
   - Deletes from both database and ElevenLabs

2. **`backend/src/server.js`**
   - Added scheduler import
   - Calls `startScheduledJobs()` on server startup
   - Cleanup runs automatically every hour

---

## How It Works

### Cleanup Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Scheduled Job (Every Hour)            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │     runVoiceCleanup()                 │
        └───────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ Anonymous Users     │   │ Cancelled Subs      │
    │ (expired)           │   │ (>24h ago)          │
    └─────────────────────┘   └─────────────────────┘
                │                       │
                ▼                       ▼
    ┌─────────────────────┐   ┌─────────────────────┐
    │ Find voice clones   │   │ Find voice clones   │
    └─────────────────────┘   └─────────────────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                ┌───────────────────────┐
                │ For each voice:       │
                │ 1. Delete from        │
                │    ElevenLabs API     │
                │ 2. Delete from        │
                │    MongoDB            │
                └───────────────────────┘
```

### Anonymous User Cleanup

1. **Trigger**: Scheduled job runs every hour
2. **Query**: Find users where `is_anonymous: true` AND `anon_expires_at < now`
3. **Action**: Delete all voice clones for these users
4. **Result**: Voice clones removed from ElevenLabs + MongoDB

### Cancelled Subscription Cleanup

1. **Trigger**: Scheduled job runs every hour
2. **Query**: Find subscriptions where `status: 'cancelled'` AND `cancelledAt < 24 hours ago`
3. **Action**: Delete all voice clones for these users
4. **Result**: Voice clones removed from ElevenLabs + MongoDB
5. **Grace Period**: 24 hours allows users to reactivate without losing voices

---

## API Endpoints

### DELETE /api/voicetwin/:id

**Before:**
- Only deleted from MongoDB

**After:**
- Deletes from MongoDB
- Deletes from ElevenLabs API
- Returns `deletedFromElevenLabs: true/false`

**Example Response:**
```json
{
  "success": true,
  "deletedFromElevenLabs": true
}
```

---

## Manual Cleanup

### Run Cleanup Script

```bash
node backend/scripts/cleanup_voices.js
```

**Output:**
```
🧹 Voice Cleanup Script
==================================================

Connecting to MongoDB: mongodb://localhost:27017/voicelap
✅ Connected to MongoDB

🧹 Running scheduled voice cleanup...
🧹 Starting cleanup of anonymous user voices...
Found 5 expired anonymous users
Found 12 voice clones to delete
✅ Deleted voice abc123 from ElevenLabs
✅ Deleted voice abc123 from database
...
✅ Cleanup complete: 12 voices deleted (12 from ElevenLabs)

🧹 Starting cleanup of cancelled subscription voices...
Found 3 users with cancelled subscriptions (>24h ago)
Found 8 voice clones to delete
✅ Cleanup complete: 8 voices deleted (8 from ElevenLabs)

✅ Voice cleanup complete: 20 total voices deleted (20 from ElevenLabs)

==================================================
📊 Cleanup Summary:
==================================================
Anonymous users: 12 voices deleted
Cancelled subscriptions: 8 voices deleted
Total: 20 voices deleted from database
Total: 20 voices deleted from ElevenLabs
==================================================
✅ Disconnected from MongoDB
```

---

## Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `ELEVENLABS_API_KEY` - For ElevenLabs API access
- `MONGO_URI` - For database connection

### Cleanup Schedule

Default: **Every 1 hour**

To change, edit `backend/src/jobs/scheduler.js`:
```javascript
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
```

---

## Error Handling

### ElevenLabs API Errors

- **404 (Voice not found)**: Treated as success (already deleted)
- **Other errors**: Logged but don't stop cleanup process
- **Missing API key**: Skips ElevenLabs deletion, only deletes from database

### Database Errors

- Logged to console
- Cleanup continues for remaining voices
- Returns error count in summary

---

## Testing

### Test Manual Deletion

1. Create a voice clone as a user
2. Delete it from the UI
3. Check logs: Should see "Deleted voice X from ElevenLabs"
4. Verify voice is gone from ElevenLabs dashboard

### Test Anonymous User Cleanup

1. Create anonymous user with voice clone
2. Set `anon_expires_at` to past date
3. Run: `node backend/scripts/cleanup_voices.js`
4. Verify voice is deleted

### Test Cancelled Subscription Cleanup

1. Create user with subscription and voice clone
2. Cancel subscription
3. Set `cancelledAt` to >24 hours ago
4. Run: `node backend/scripts/cleanup_voices.js`
5. Verify voice is deleted

---

## Benefits

✅ **Cost Savings**: Reduces ElevenLabs API quota usage  
✅ **Storage Savings**: Reduces MongoDB storage  
✅ **Privacy**: Removes data for expired users  
✅ **Automatic**: No manual intervention needed  
✅ **Grace Period**: 24-hour window for cancelled subscriptions  
✅ **Reliable**: Runs every hour automatically  

---

## Monitoring

### Logs to Watch

```
🧹 Running scheduled voice cleanup...
✅ Deleted voice abc123 from ElevenLabs
✅ Deleted voice abc123 from database
✅ Voice cleanup complete: X total voices deleted
```

### Metrics

- Number of voices deleted per run
- Number deleted from ElevenLabs vs database only
- Errors encountered

---

## Future Enhancements

- [ ] Email notification when voices are deleted
- [ ] Admin dashboard to view cleanup history
- [ ] Configurable grace period per plan
- [ ] Backup voices before deletion
- [ ] Restore deleted voices within grace period

---

**Implementation Date**: 2025-11-16  
**Status**: ✅ Complete and Active

