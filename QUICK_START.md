# Quick Start Guide - AI Chat Setup

## 🚀 Get Started in 3 Steps

### Step 1: Add Your OpenAI API Key

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from example):
   ```bash
   cp .env.example .env
   ```

3. Open `backend/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

   **Where to get your API key:**
   - Go to https://platform.openai.com/
   - Sign in or create an account
   - Navigate to API Keys section
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

### Step 2: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5001
```

### Step 3: Start the Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

You should see:
```
Local: http://localhost:5174/
```

---

## ✅ Test the Chat

1. Open your browser to: `http://localhost:5174/chat`
2. You should see a welcome message from the AI
3. Type a message and press Enter
4. The AI will respond within 2-3 seconds

---

## 🎨 Modern Chat Features

### What You'll See:
- **Clean Interface**: Modern message bubbles with smooth animations
- **AI Responses**: Left-aligned with brand-colored border
- **Your Messages**: Right-aligned with glass effect
- **Typing Indicator**: Animated dots when AI is thinking
- **Quick Replies**: AI-suggested responses you can click
- **Theme Support**: Works with all 5 app themes

### How It Works:
- **Anonymous**: No login required
- **Session-Based**: Each visit creates a new chat session
- **AI-Powered**: Uses OpenAI GPT-4o-mini for responses
- **Mood-Aware**: AI adapts to your emotional state
- **Crisis Detection**: Provides resources if needed

---

## 💰 Cost Information

**Very affordable!**
- Average conversation: ~$0.001 (less than a penny)
- 1,000 conversations: ~$1
- 10,000 conversations: ~$10

---

## 🔧 Troubleshooting

### "Failed to start chat session"
- ✅ Check backend is running on port 5001
- ✅ Verify `VITE_API_URL=http://localhost:5001` in `frontend/.env`
- ✅ Check browser console for errors

### "Failed to send message"
- ✅ Verify OpenAI API key is correct in `backend/.env`
- ✅ Check your OpenAI account has credits
- ✅ Look at backend terminal for error messages

### Backend won't start
- ✅ Make sure you ran `npm install` in backend directory
- ✅ Check if port 5001 is already in use
- ✅ Verify `.env` file exists in backend directory

### Frontend won't start
- ✅ Make sure you ran `npm install` in frontend directory
- ✅ Check if port 5174 is already in use

---

## 📚 Documentation

For detailed information, see:
- **AI_CHAT_SETUP.md** - Complete setup guide with API details
- **CHAT_UI_FEATURES.md** - UI design and features documentation

---

## 🎉 You're All Set!

Your AI-powered mental health chat is ready to use. The chat provides:
- ✅ Empathetic, compassionate responses
- ✅ Anonymous conversations
- ✅ Crisis detection and resources
- ✅ Beautiful, modern UI
- ✅ Full theme integration

Enjoy! 💬✨

