# VoiceLap Deployment Guide

Complete guide for deploying VoiceLap across different environments.

---

## 📋 Table of Contents

1. [Environment Overview](#environment-overview)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Environment Configuration](#environment-configuration)
4. [Data Migration](#data-migration)
5. [Deployment Steps](#deployment-steps)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## 🌍 Environment Overview

VoiceLap supports three environments:

| Environment | Purpose | Database | Domain |
|-------------|---------|----------|--------|
| **Development** | Local development | Local MongoDB | localhost:5173 |
| **Staging** | Pre-production testing | MongoDB Atlas | staging.voicelap.com |
| **Production** | Live application | MongoDB Atlas | voicelap.com |

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new organization (if needed)

### Step 2: Create Clusters

Create **two separate clusters** for isolation:

#### Staging Cluster
- **Name**: `voicelap-staging`
- **Tier**: M0 (Free) or M10 (Shared)
- **Region**: Choose closest to your users
- **Database**: `voicelap-staging`

#### Production Cluster
- **Name**: `voicelap-production`
- **Tier**: M10+ (Dedicated) recommended
- **Region**: Choose closest to your users
- **Database**: `voicelap`

### Step 3: Configure Network Access

1. Go to **Network Access** in Atlas
2. Click **Add IP Address**
3. Options:
   - **Development**: Add your current IP
   - **Production**: Add your server's IP or `0.0.0.0/0` (allow from anywhere - less secure)

### Step 4: Create Database Users

1. Go to **Database Access**
2. Click **Add New Database User**
3. Create users for each environment:

**Staging User:**
- Username: `voicelap-staging`
- Password: Generate strong password
- Database User Privileges: `Read and write to any database`

**Production User:**
- Username: `voicelap-prod`
- Password: Generate strong password
- Database User Privileges: `Read and write to any database`

### Step 5: Get Connection Strings

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`

**Example Staging:**
```
mongodb+srv://voicelap-staging:YOUR_PASSWORD@voicelap-staging.xxxxx.mongodb.net/voicelap-staging?retryWrites=true&w=majority
```

**Example Production:**
```
mongodb+srv://voicelap-prod:YOUR_PASSWORD@voicelap-production.xxxxx.mongodb.net/voicelap?retryWrites=true&w=majority
```

---

## ⚙️ Environment Configuration

### Development (.env.development)

Already configured for local development. Uses local MongoDB.

**No changes needed** unless you want to use Atlas for development too.

### Staging (.env.staging)

1. Copy `.env.staging` to `.env` (for local staging testing)
2. Update the following:

```bash
# Database - Use your staging cluster connection string
MONGO_URI=mongodb+srv://voicelap-staging:YOUR_PASSWORD@voicelap-staging.xxxxx.mongodb.net/voicelap-staging?retryWrites=true&w=majority

# Frontend - Your staging domain
FRONTEND_ORIGIN=https://staging.voicelap.com

# Security - Generate strong secret (32+ characters)
JWT_SECRET=$(openssl rand -base64 32)

# Update all API keys with your actual keys
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
RESEND_API_KEY=re_...
DEEPGRAM_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Production (.env.production)

1. **NEVER commit this file to git**
2. Create on your production server
3. Update all values:

```bash
# Database - Use your production cluster connection string
MONGO_URI=mongodb+srv://voicelap-prod:YOUR_PASSWORD@voicelap-production.xxxxx.mongodb.net/voicelap?retryWrites=true&w=majority

# Frontend - Your production domain
FRONTEND_ORIGIN=https://voicelap.com

# Security - Generate VERY strong secret (32+ characters)
JWT_SECRET=$(openssl rand -base64 48)

# Update all API keys
# ... (same as staging but use production keys if different)
```

---

## 🚀 Data Migration

### Migrate Local Data to Atlas

Use the migration script to copy your local database to MongoDB Atlas:

```bash
# Set your Atlas connection string
export MONGO_ATLAS_URI="mongodb+srv://username:password@cluster.mongodb.net/voicelap"

# Run migration
npm run migrate:atlas
```

**What it does:**
- ✅ Copies all collections from local MongoDB
- ✅ Copies all documents
- ✅ Preserves indexes
- ✅ Shows progress and summary
- ✅ Skips duplicates (safe to run multiple times)

**Output:**
```
============================================================
MongoDB Migration: Local → Atlas
============================================================

Source (Local):  mongodb://localhost:27017/voicelap
Target (Atlas):  mongodb+srv://***:***@cluster.mongodb.net/voicelap

⚠️  WARNING: This will copy all data to Atlas
Press Ctrl+C to cancel, or wait 5 seconds to continue...

📡 Connecting to local MongoDB...
✅ Connected to local MongoDB
📡 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas

Found 12 collections to migrate

📦 Migrating collection: users
   Found 45 documents
   Found 3 indexes
   ✅ Migrated users

... (continues for all collections)

============================================================
📊 Migration Summary
============================================================
Collections migrated: 12
Documents migrated:   1,234
Indexes created:      28
Errors:               0
============================================================

✅ Migration completed successfully!
```

---

## 📦 Deployment Steps

### 1. Development

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Run in development mode
npm run dev              # Backend
cd frontend && npm run dev  # Frontend
```

### 2. Staging

```bash
# Backend
cd backend
NODE_ENV=staging npm run start:staging

# Frontend (build for staging)
cd frontend
npm run build
# Deploy dist/ folder to your staging server
```

### 3. Production

```bash
# Backend
cd backend
NODE_ENV=production npm run start:prod

# Frontend (build for production)
cd frontend
npm run build
# Deploy dist/ folder to your production server
```

---

## 🎯 Running the Application

### Available Scripts

**Backend:**
```bash
npm run dev              # Development with nodemon
npm run start:dev        # Development (no auto-reload)
npm run start:staging    # Staging environment
npm run start:prod       # Production environment
npm run migrate:atlas    # Migrate data to Atlas
npm run cleanup:voices   # Manual voice cleanup
npm run make:admin       # Make user admin
```

**Frontend:**
```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
```

### Environment Variables

The app automatically loads the correct `.env` file based on `NODE_ENV`:

- `NODE_ENV=development` → `.env.development`
- `NODE_ENV=staging` → `.env.staging`
- `NODE_ENV=production` → `.env.production`

---

## 🔧 Troubleshooting

### Connection Issues

**Error: "MongoServerError: bad auth"**
- Check username and password in connection string
- Ensure user has correct permissions in Atlas

**Error: "MongoNetworkError: connection timed out"**
- Check Network Access whitelist in Atlas
- Verify your IP is allowed
- Check firewall settings

### Migration Issues

**Error: "Duplicate key error"**
- This is normal - script skips duplicates
- Safe to ignore

**Error: "MONGO_ATLAS_URI not configured"**
- Set environment variable: `export MONGO_ATLAS_URI="..."`
- Or update the script directly

### Environment Issues

**Error: "Missing required environment variables"**
- Check your `.env` file has all required fields
- Verify `NODE_ENV` is set correctly

---

## 📝 Checklist

### Before Going to Production

- [ ] MongoDB Atlas production cluster created
- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] All API keys updated in `.env.production`
- [ ] Network Access configured in Atlas
- [ ] Database user created with strong password
- [ ] Data migrated from local to Atlas
- [ ] Frontend built and deployed
- [ ] Backend deployed and running
- [ ] SSL/TLS certificates configured
- [ ] Domain DNS configured
- [ ] Backup strategy in place
- [ ] Monitoring set up

---

**Last Updated:** 2025-11-16  
**Version:** 1.0.0

