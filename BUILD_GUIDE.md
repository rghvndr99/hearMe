# 🏗️ VoiceLap Application - Build & Deployment Guide

## 📋 Table of Contents
1. [Development Setup](#development-setup)
2. [Building for Production](#building-for-production)
3. [Deployment Options](#deployment-options)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Development Setup

### **Prerequisites:**
- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key

### **1. Install Dependencies**

```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

Or manually:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### **2. Configure Environment Variables**

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-YOUR-ACTUAL-API-KEY-HERE

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration (for development)
FRONTEND_URL=http://localhost:5174
```

### **3. Start Development Servers**

```bash
# From root directory - starts both backend and frontend
npm run start-all
```

Or start individually:
```bash
# Terminal 1 - Backend
npm run start-backend

# Terminal 2 - Frontend
npm run start-frontend
```

**Access the app:**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001

---

## 🏗️ Building for Production

### **Option 1: Build Everything (Recommended)**

```bash
# From root directory
npm run build-all
```

This will:
- Build the frontend React app
- Create optimized production files in `frontend/dist/`

### **Option 2: Build Frontend Only**

```bash
# From root directory
npm run build-frontend

# Or from frontend directory
cd frontend
npm run build
```

### **Build Output:**

After building, you'll have:
```
frontend/dist/
├── index.html          # Main HTML file
├── assets/
│   ├── index-[hash].js    # Bundled JavaScript
│   ├── index-[hash].css   # Bundled CSS
│   └── ...                # Other assets
└── ...
```

---

## 🌐 Deployment Options

### **Option 1: Deploy to Vercel (Frontend) + Render (Backend)**

#### **Frontend (Vercel):**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

3. **Configure:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

4. **Environment Variables in Vercel:**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

#### **Backend (Render):**

1. **Create `render.yaml` in root:**
```yaml
services:
  - type: web
    name: voicelap-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
```

2. **Push to GitHub**
3. **Connect to Render.com**
4. **Add Environment Variables** in Render dashboard

---

### **Option 2: Deploy to Netlify (Frontend) + Railway (Backend)**

#### **Frontend (Netlify):**

1. **Create `netlify.toml` in frontend directory:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy:**
```bash
cd frontend
npm install -g netlify-cli
netlify deploy --prod
```

#### **Backend (Railway):**

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Deploy:**
```bash
cd backend
railway login
railway init
railway up
```

3. **Add Environment Variables** in Railway dashboard

---

### **Option 3: Self-Hosted (VPS/Cloud Server)**

#### **1. Build the Application:**

```bash
# On your local machine
npm run build-all
```

#### **2. Transfer Files to Server:**

```bash
# Using SCP
scp -r backend/ user@your-server.com:/var/www/voicelap/
scp -r frontend/dist/ user@your-server.com:/var/www/voicelap/frontend/
```

#### **3. Server Setup (Ubuntu/Debian):**

```bash
# SSH into server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx

# Navigate to backend
cd /var/www/voicelap/backend
npm install --production

# Start backend with PM2
pm2 start src/server.js --name voicelap-backend
pm2 save
pm2 startup
```

#### **4. Configure Nginx:**

Create `/etc/nginx/sites-available/voicelap`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/voicelap/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/voicelap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### **5. SSL Certificate (Let's Encrypt):**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 🔐 Environment Variables

### **Backend (.env):**

```env
# Required
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE

# Optional
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### **Frontend (Vite):**

Create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
```

**Note:** Vite environment variables must start with `VITE_`

---

## 📦 Production Checklist

Before deploying to production:

- [ ] Update `CONTACT_INFO` in `backend/src/config/intentResponses.js`
- [ ] Set `NODE_ENV=production` in backend
- [ ] Add your OpenAI API key to backend environment
- [ ] Update CORS settings in `backend/src/server.js`
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure error logging (Sentry, LogRocket, etc.)
- [ ] Test all features in production environment
- [ ] Set up database backups (if using MongoDB)
- [ ] Configure rate limiting
- [ ] Review security headers (Helmet.js is already configured)

---

## 🧪 Testing Production Build Locally

### **1. Build the Frontend:**
```bash
npm run build-frontend
```

### **2. Preview Frontend:**
```bash
npm run preview
```

This will serve the production build at http://localhost:4173

### **3. Start Backend in Production Mode:**
```bash
cd backend
NODE_ENV=production npm start
```

---

## 🐛 Troubleshooting

### **Build Fails:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json
npm run install-all
```

### **Frontend Can't Connect to Backend:**

Check CORS settings in `backend/src/server.js`:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
};
app.use(cors(corsOptions));
```

### **OpenAI API Errors:**

- Verify API key is correct
- Check API key has credits
- Ensure `.env` file is in `backend/` directory
- Restart backend server after changing `.env`

---

## 📊 Performance Optimization

### **Frontend:**
- ✅ Code splitting (Vite handles automatically)
- ✅ Lazy loading routes (already implemented)
- ✅ Asset optimization (Vite handles automatically)
- ✅ CSS minification (Tailwind + Vite)

### **Backend:**
- ✅ Rate limiting (already configured)
- ✅ Helmet.js security headers (already configured)
- ✅ Intent detection (reduces OpenAI API calls)
- Consider: Redis caching for frequent requests
- Consider: CDN for static assets

---

## 🚀 Quick Commands Reference

```bash
# Development
npm run install-all          # Install all dependencies
npm run start-all            # Start both servers (dev mode)
npm run start-backend        # Start backend only (dev mode)
npm run start-frontend       # Start frontend only (dev mode)

# Production Build
npm run build-all            # Build everything
npm run build-frontend       # Build frontend only
npm run preview              # Preview production build

# Backend Production
cd backend && npm start      # Start backend (production mode)
```

---

## 📝 Notes

- **Frontend** is built with Vite (React)
- **Backend** runs on Node.js/Express
- **No build step needed for backend** - it runs directly from source
- **Frontend build** creates optimized static files in `dist/`
- **Environment variables** are different for Vite (must start with `VITE_`)

---

**Need help? Check the other documentation files:**
- `README.md` - Project overview
- `INTENT_DETECTION_GUIDE.md` - Intent detection system
- `QUICK_CUSTOMIZATION.md` - Quick customization guide

