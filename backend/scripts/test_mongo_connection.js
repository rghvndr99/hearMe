#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Tests if the MongoDB connection string is valid
 */

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://voiceLapUserWriteAccess:mBaDVtP3leC0r0ET@cluster0.tq7gv.mongodb.net/voicelap?retryWrites=true&w=majority';

console.log('\n🔍 Testing MongoDB Connection...\n');
console.log('Connection String:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
console.log('');

async function testConnection() {
  try {
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB!\n');
    
    // Get database info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📦 Collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('\nCollections found:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    } else {
      console.log('   (No collections yet - database is empty)');
    }
    
    console.log('\n✅ Connection is valid and working!\n');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', err.message);
    
    if (err.message.includes('bad auth')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Username or password is incorrect');
      console.error('   - User does not exist in MongoDB Atlas');
      console.error('   - User does not have access to this database');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
      console.error('\n💡 Possible issues:');
      console.error('   - Cluster hostname is incorrect');
      console.error('   - Network connectivity issues');
      console.error('   - IP address not whitelisted in Atlas Network Access');
    } else if (err.message.includes('timed out')) {
      console.error('\n💡 Possible issues:');
      console.error('   - IP address not whitelisted in Atlas Network Access');
      console.error('   - Firewall blocking connection');
      console.error('   - Cluster is not accessible');
    }
    
    console.error('\n');
    process.exit(1);
  }
}

testConnection();

