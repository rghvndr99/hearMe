# 💜 hearMe - Mental Health Support Platform

A fullstack web application providing anonymous, peer-to-peer mental health support through AI-powered chat and volunteer listeners.

## 🌟 Features

- **Anonymous Chat**: Safe, judgment-free conversations with AI support
- **Human Connection**: Connect with trained volunteer listeners
- **Real-time Communication**: Socket.IO powered live messaging
- **Mental Health Resources**: Curated resources and crisis hotlines
- **Responsive Design**: Beautiful, accessible UI with Tailwind CSS
- **Secure**: JWT authentication and rate limiting

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for SPA navigation
- **Build Tool**: Vite for fast development
- **Real-time**: Socket.IO client for live features

### Backend (Node.js + Express)
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js with security middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Real-time**: Socket.IO server
- **Security**: Helmet, CORS, rate limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (optional for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rghvndr99/hearMe.git
   cd hearMe
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run start-all
   ```

4. **Access the application**
   - Frontend: http://localhost:5174/
   - Backend API: http://localhost:5001/

## 📝 Available Scripts

### Root Level Commands
```bash
# Install dependencies for both frontend and backend
npm run install-all

# Start both applications concurrently
npm run start-all

# Start only backend (development mode)
npm run start-backend

# Start only frontend (development mode)
npm run start-frontend
```

### Backend Commands
```bash
cd backend

# Start in development mode with nodemon
npm run dev

# Start in production mode
npm start
```

### Frontend Commands
```bash
cd frontend

# Start Vite development server
npm run dev

# Build for production
npm run build
```

## 🗂️ Project Structure

```
hearMe/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Custom middleware
│   │   └── server.js       # Main server file
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── styles.css      # Global styles
│   │   └── main.jsx        # App entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json            # Root workspace config
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` at the repository root for the backend, and `frontend/.env` for the frontend:

#### Backend environment (root .env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/hearme
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=your-elevenlabs-voice-id
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_ORIGIN=http://localhost:5174
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

#### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:5001
```

### Database Setup (Optional)

The application works without MongoDB for basic functionality. For full features:

1. **Install MongoDB locally** or use MongoDB Atlas

### 🔊 Text-to-Speech (ElevenLabs)

- Backend endpoint: `POST /api/tts/eleven` (returns `audio/mpeg`)
- Configure in root `.env`: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
- Frontend: Chat has a TTS engine selector (ElevenLabs vs Browser) next to the mic button
- Fallback: If ElevenLabs fails, the app falls back to the browser's SpeechSynthesis automatically

Quick test (backend only):
```bash
curl -X POST http://localhost:5001/api/tts/eleven \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from HearMe!"}' \
  --output /tmp/tts-test.mp3
```

2. **Update MONGO_URI** in backend/.env
3. **Restart the backend** to connect to database

## 🛠️ Development

### Adding New Features

1. **Backend API Routes**: Add to `backend/src/routes/`
2. **Frontend Pages**: Add to `frontend/src/pages/`
3. **Components**: Add to `frontend/src/components/`
4. **Database Models**: Add to `backend/src/models/`

### Code Style

- **ES6 Modules**: Both frontend and backend use modern import/export
- **Async/Await**: Preferred over promises
- **Functional Components**: React hooks over class components
- **Tailwind CSS**: Utility-first styling approach

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Sanitized user inputs

## 🌐 API Endpoints

### Chat Routes (`/api/chat`)
- `POST /` - Send message to AI

### Listener Routes (`/api/listener`)
- `POST /register` - Register as volunteer
- `POST /login` - Volunteer login
- `GET /dashboard` - Volunteer dashboard

### Auth Routes (`/api/auth`)
- `GET /ping` - Health check

### Additional Endpoints

#### AI Chat (`/api/ai-chat`)
- `POST /session/start` — Start an anonymous chat session
- `POST /message` — Send a message and get an AI reply (accepts `{ sessionId, message, language }`)
- `POST /quick-replies` — Get quick reply suggestions for the current session
- `GET /session/:sessionId` — Get conversation history
- `POST /session/end` — End session and get summary

#### Text-to-Speech (`/api/tts`)
- `POST /eleven` — ElevenLabs TTS, returns `audio/mpeg` (body: `{ text, voiceId? }`)

#### Volunteer (`/api/volunteer`)
- `POST /apply` — Save volunteer application to MongoDB


## 🔌 Socket.IO Events

### Client Events
- `identify` - User/volunteer identification
- `typing` - Typing indicators
- `request_listener` - Request human support

### Server Events
- `queue_status` - Queue length updates
- `listener_assigned` - Volunteer assignment
- `listener_message` - Messages from volunteers

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy backend/ folder
```

### Full Stack (Docker)
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Crisis Resources

**If you're in crisis, please contact:**
- **Emergency Services**: 911 (US) or your local emergency number
- **National Suicide Prevention Lifeline**: 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357

## 👥 Team

- **Developer**: Raghvendra Dixit (@rghvndr99)
- **Organization**: Condé Nast

## 🙏 Acknowledgments

- Mental health advocates and volunteers
- Open source community
- Crisis support organizations

---

**Remember**: This platform provides peer support, not professional therapy. Always seek professional help for serious mental health concerns.
