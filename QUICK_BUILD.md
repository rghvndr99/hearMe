# ⚡ Quick Build Guide

## 🚀 Development (Local)

```bash
# 1. Install dependencies
npm run install-all

# 2. Configure backend/.env
cp backend/.env.example backend/.env
# Edit backend/.env and add your OPENAI_API_KEY

# 3. Start both servers
npm run start-all

# Access:
# Frontend: http://localhost:5174
# Backend:  http://localhost:5001
```

---

## 🏗️ Production Build

```bash
# Build frontend for production
npm run build-frontend

# Output: frontend/dist/
```

---

## 🌐 Deploy

### **Vercel (Frontend):**
```bash
cd frontend
vercel
```

### **Render (Backend):**
1. Push to GitHub
2. Connect to Render.com
3. Add `OPENAI_API_KEY` environment variable

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run install-all` | Install all dependencies |
| `npm run start-all` | Start dev servers (both) |
| `npm run start-backend` | Start backend only |
| `npm run start-frontend` | Start frontend only |
| `npm run build-all` | Build for production |
| `npm run build-frontend` | Build frontend only |
| `npm run preview` | Preview production build |

---

## 🔐 Environment Variables

**backend/.env:**
```env
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
PORT=5001
NODE_ENV=production
```

**frontend/.env.production:**
```env
VITE_API_URL=https://your-backend-url.com
```

---

**See `BUILD_GUIDE.md` for complete details!**

