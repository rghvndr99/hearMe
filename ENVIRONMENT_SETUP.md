# Environment Setup Guide

Quick guide to set up VoiceLap for different environments.

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
./setup-environment.sh
```

This will:
- ✅ Ask which environment you want (dev/staging/production)
- ✅ Copy the correct `.env` file
- ✅ Help you configure MongoDB Atlas (for staging/production)
- ✅ Generate a secure JWT secret
- ✅ Guide you through next steps

### Option 2: Manual Setup

1. **Choose your environment:**
   - Development: `cp .env.development .env`
   - Staging: `cp .env.staging .env`
   - Production: `cp .env.production .env`

2. **Update the `.env` file** with your actual values

3. **Start the application** (see below)

---

## 📋 Environment Files

| File | Purpose | Database |
|------|---------|----------|
| `.env.development` | Local development | Local MongoDB |
| `.env.staging` | Pre-production testing | MongoDB Atlas |
| `.env.production` | Live production | MongoDB Atlas |

---

## 🔧 Configuration Steps

### 1. Development Environment

**Uses local MongoDB - easiest to set up**

```bash
# Copy development config
cp .env.development .env

# Update API keys (optional for basic testing)
# Edit .env and add your keys

# Start development server
cd backend
npm run dev
```

**Required:**
- ✅ Local MongoDB running on `localhost:27017`

**Optional:**
- API keys (for full functionality)

---

### 2. Staging Environment

**Uses MongoDB Atlas - for testing before production**

```bash
# Copy staging config
cp .env.staging .env

# Edit .env and update:
nano .env
```

**Required updates in `.env`:**

```bash
# 1. MongoDB Atlas URI (REQUIRED)
MONGO_URI=mongodb+srv://username:password@cluster-staging.xxxxx.mongodb.net/voicelap-staging?retryWrites=true&w=majority

# 2. Frontend domain (REQUIRED)
FRONTEND_ORIGIN=https://staging.voicelap.com

# 3. JWT Secret (REQUIRED - generate with: openssl rand -base64 32)
JWT_SECRET=your-strong-random-secret-here

# 4. All API keys (REQUIRED for full functionality)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
RESEND_API_KEY=re_...
DEEPGRAM_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Start staging server:**
```bash
cd backend
npm run start:staging
```

---

### 3. Production Environment

**Uses MongoDB Atlas - for live production**

```bash
# Copy production config
cp .env.production .env

# Edit .env and update ALL values
nano .env
```

**Required updates in `.env`:**

```bash
# 1. MongoDB Atlas URI (REQUIRED - use production cluster)
MONGO_URI=mongodb+srv://username:password@cluster-production.xxxxx.mongodb.net/voicelap?retryWrites=true&w=majority

# 2. Frontend domain (REQUIRED - your production domain)
FRONTEND_ORIGIN=https://voicelap.com

# 3. JWT Secret (REQUIRED - use very strong secret: openssl rand -base64 48)
JWT_SECRET=your-very-strong-random-secret-minimum-32-characters

# 4. All API keys (REQUIRED)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=sk_...
RESEND_API_KEY=re_...
DEEPGRAM_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Start production server:**
```bash
cd backend
npm run start:prod
```

---

## 🗄️ MongoDB Atlas Setup

### Quick Steps:

1. **Create account**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create cluster**:
   - Staging: `voicelap-staging`
   - Production: `voicelap-production`

3. **Create database user**:
   - Username: `voicelap-staging` or `voicelap-prod`
   - Password: Generate strong password
   - Permissions: Read and write to any database

4. **Configure network access**:
   - Add your server's IP address
   - Or `0.0.0.0/0` for testing (less secure)

5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the URI
   - Replace `<username>`, `<password>`, and `<database>`

**Example:**
```
mongodb+srv://voicelap-staging:MyStr0ngP@ss@cluster-staging.abc123.mongodb.net/voicelap-staging?retryWrites=true&w=majority
```

---

## 🔄 Migrating Data to Atlas

If you have data in local MongoDB and want to move it to Atlas:

```bash
# Set your Atlas connection string
export MONGO_ATLAS_URI="mongodb+srv://username:password@cluster.mongodb.net/voicelap"

# Run migration
cd backend
npm run migrate:atlas
```

**What it does:**
- Copies all collections from local MongoDB to Atlas
- Preserves indexes
- Skips duplicates (safe to run multiple times)
- Shows detailed progress

---

## 🎯 Running the Application

### Development
```bash
# Backend
cd backend
npm run dev              # Auto-reload with nodemon

# Frontend (in another terminal)
cd frontend
npm run dev
```

### Staging
```bash
# Backend
cd backend
npm run start:staging

# Frontend
cd frontend
npm run build
# Deploy dist/ to staging server
```

### Production
```bash
# Backend
cd backend
npm run start:prod

# Frontend
cd frontend
npm run build
# Deploy dist/ to production server
```

---

## ✅ Verification Checklist

### Before Starting:

- [ ] `.env` file created
- [ ] MongoDB connection configured
- [ ] JWT_SECRET set (strong random string)
- [ ] API keys added
- [ ] Frontend origin set correctly

### For Staging/Production:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string tested
- [ ] Data migrated (if needed)

---

## 🐛 Troubleshooting

### "MongoServerError: bad auth"
- Check username and password in MONGO_URI
- Verify user exists in Atlas Database Access

### "MongoNetworkError: connection timed out"
- Check Network Access whitelist in Atlas
- Verify your IP is allowed
- Check firewall settings

### "Missing required environment variables"
- Ensure all required fields in `.env` are filled
- Check `NODE_ENV` matches your environment

### "Cannot connect to MongoDB"
- Development: Ensure local MongoDB is running
- Staging/Production: Check Atlas connection string

---

## 📚 Additional Resources

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Voice Cleanup Documentation](./VOICE_CLEANUP_IMPLEMENTATION.md)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

---

**Last Updated:** 2025-11-16

