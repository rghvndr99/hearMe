#!/usr/bin/env node

/**
 * MongoDB Migration Script - Local to Atlas
 * 
 * Migrates all data from local MongoDB to MongoDB Atlas
 * 
 * Usage:
 *   node backend/scripts/migrate_to_atlas.js
 * 
 * Prerequisites:
 *   1. Update MONGO_ATLAS_URI in this script or pass as environment variable
 *   2. Ensure MongoDB Atlas cluster is accessible
 *   3. Backup your local database first!
 * 
 * What it does:
 *   - Connects to both local and Atlas MongoDB
 *   - Copies all collections and documents
 *   - Preserves indexes
 *   - Shows progress and summary
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration
const LOCAL_MONGO_URI = process.env.LOCAL_MONGO_URI || 'mongodb://localhost:27017/voicelap';
const ATLAS_MONGO_URI = process.env.MONGO_ATLAS_URI || process.env.MONGO_URI;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function migrateDatabase() {
  let localClient, atlasClient;

  try {
    log('\n' + '='.repeat(60), 'bright');
    log('MongoDB Migration: Local → Atlas', 'bright');
    log('='.repeat(60), 'bright');
    log('');

    // Validate Atlas URI
    if (!ATLAS_MONGO_URI || ATLAS_MONGO_URI === LOCAL_MONGO_URI) {
      log('❌ Error: MONGO_ATLAS_URI not configured or same as local URI', 'red');
      log('Please set MONGO_ATLAS_URI environment variable', 'yellow');
      log('Example: export MONGO_ATLAS_URI="mongodb+srv://user:pass@cluster.mongodb.net/voicelap"', 'yellow');
      process.exit(1);
    }

    log(`Source (Local):  ${LOCAL_MONGO_URI}`, 'blue');
    log(`Target (Atlas):  ${ATLAS_MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`, 'blue');
    log('');

    // Confirm migration
    log('⚠️  WARNING: This will copy all data to Atlas', 'yellow');
    log('⚠️  Existing data in Atlas will NOT be deleted', 'yellow');
    log('⚠️  Duplicate documents may be created if data already exists', 'yellow');
    log('');
    log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 5000));
    log('');

    // Connect to local MongoDB
    log('📡 Connecting to local MongoDB...', 'blue');
    localClient = await MongoClient.connect(LOCAL_MONGO_URI);
    const localDb = localClient.db();
    log('✅ Connected to local MongoDB', 'green');

    // Connect to Atlas MongoDB
    log('📡 Connecting to MongoDB Atlas...', 'blue');
    atlasClient = await MongoClient.connect(ATLAS_MONGO_URI);
    const atlasDb = atlasClient.db();
    log('✅ Connected to MongoDB Atlas', 'green');
    log('');

    // Get all collections from local database
    const collections = await localDb.listCollections().toArray();
    log(`Found ${collections.length} collections to migrate`, 'bright');
    log('');

    const summary = {
      collections: 0,
      documents: 0,
      indexes: 0,
      errors: 0,
    };

    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      // Skip system collections
      if (collectionName.startsWith('system.')) {
        log(`⏭️  Skipping system collection: ${collectionName}`, 'yellow');
        continue;
      }

      try {
        log(`📦 Migrating collection: ${collectionName}`, 'bright');

        const localCollection = localDb.collection(collectionName);
        const atlasCollection = atlasDb.collection(collectionName);

        // Get all documents
        const documents = await localCollection.find({}).toArray();
        log(`   Found ${documents.length} documents`, 'blue');

        if (documents.length > 0) {
          // Insert documents in batches of 1000
          const batchSize = 1000;
          for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            try {
              await atlasCollection.insertMany(batch, { ordered: false });
            } catch (err) {
              // Ignore duplicate key errors (documents already exist)
              if (err.code !== 11000) {
                throw err;
              }
              log(`   ⚠️  Some documents already exist (skipped duplicates)`, 'yellow');
            }
          }
          summary.documents += documents.length;
        }

        // Copy indexes
        const indexes = await localCollection.indexes();
        log(`   Found ${indexes.length} indexes`, 'blue');

        for (const index of indexes) {
          // Skip the default _id index
          if (index.name === '_id_') continue;

          try {
            const indexSpec = { ...index.key };
            const indexOptions = { ...index };
            delete indexOptions.key;
            delete indexOptions.v;
            delete indexOptions.ns;

            await atlasCollection.createIndex(indexSpec, indexOptions);
            summary.indexes++;
          } catch (err) {
            // Ignore if index already exists
            if (err.code !== 85 && err.code !== 86) {
              log(`   ⚠️  Failed to create index ${index.name}: ${err.message}`, 'yellow');
            }
          }
        }

        summary.collections++;
        log(`   ✅ Migrated ${collectionName}`, 'green');
        log('');

      } catch (err) {
        summary.errors++;
        log(`   ❌ Error migrating ${collectionName}: ${err.message}`, 'red');
        log('');
      }
    }

    // Summary
    log('='.repeat(60), 'bright');
    log('📊 Migration Summary', 'bright');
    log('='.repeat(60), 'bright');
    log(`Collections migrated: ${summary.collections}`, 'green');
    log(`Documents migrated:   ${summary.documents}`, 'green');
    log(`Indexes created:      ${summary.indexes}`, 'green');
    log(`Errors:               ${summary.errors}`, summary.errors > 0 ? 'red' : 'green');
    log('='.repeat(60), 'bright');
    log('');

    if (summary.errors === 0) {
      log('✅ Migration completed successfully!', 'green');
    } else {
      log('⚠️  Migration completed with some errors', 'yellow');
    }

  } catch (err) {
    log(`\n❌ Migration failed: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
  } finally {
    // Close connections
    if (localClient) {
      await localClient.close();
      log('Disconnected from local MongoDB', 'blue');
    }
    if (atlasClient) {
      await atlasClient.close();
      log('Disconnected from MongoDB Atlas', 'blue');
    }
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    log('\n✅ Done!', 'green');
    process.exit(0);
  })
  .catch((err) => {
    log(`\n❌ Fatal error: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
  });


