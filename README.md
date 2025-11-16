# 💜 voiceLap - Mental Health Support Platform

A fullstack web application providing anonymous, peer-to-peer mental health support through AI-powered chat and volunteer listeners.

## 🌟 Features

- **Anonymous Chat**: Safe, judgment-free conversations with AI support
- **Multilingual Support**: 20+ languages with auto-detection
- **Voice Interaction**: Speech-to-text input and text-to-speech output
- **Voice Cloning**: Create personalized AI voices with ElevenLabs
- **Human Connection**: Connect with trained volunteer listeners
- **Real-time Communication**: Socket.IO powered live messaging
- **Mental Health Resources**: Curated resources and crisis hotlines
- **Responsive Design**: Beautiful, accessible UI with Chakra UI + Tailwind CSS v4
- **Theme Support**: Light, dark, and high-contrast themes
- **Secure**: JWT authentication, rate limiting, and PBKDF2 password hashing

## 📚 Documentation

- **[Architecture Documentation](ARCHITECTURE.md)** - Detailed system architecture, component structure, and design patterns
- **[Flow Diagrams](FLOW_DIAGRAMS.md)** - Visual flow diagrams for all major features
- **[Refactoring Plan](REFACTORING_PLAN.md)** - Modularization strategy and implementation plan

## 🏗️ Architecture

### Frontend (React + Vite) - **Fully Modularized**
- **Framework**: React 18 with custom hooks for reusable logic
- **UI Libraries**: Chakra UI + Tailwind CSS v4
- **Styling**: CSS variables for theme support + component-based CSS classes
- **Routing**: React Router v6 for SPA navigation
- **Build Tool**: Vite 5.4 for fast development and optimized builds
- **i18n**: react-i18next with English and Hindi translations
- **Animations**: Framer Motion for smooth transitions
- **Real-time**: Socket.IO client for live features

**Modular Structure:**
- **Components**: Broken into small, reusable pieces (e.g., `ChatHeader`, `ChatInput`, `LanguageSelector`)
- **Custom Hooks**: Business logic extracted to hooks (`useChat`, `useSpeechRecognition`, `useAuth`)
- **Constants**: Shared configuration (e.g., `languages.js`)
- **Utilities**: Helper functions for API calls, validation, formatting
- **No inline styles**: All styles use CSS classes with theme variables

### Backend (Node.js + Express) - **Layered Architecture**
- **Runtime**: Node.js with CommonJS modules
- **Framework**: Express.js with security middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with secure password hashing (PBKDF2-SHA512)
- **Real-time**: Socket.IO server
- **Security**: Helmet, CORS, rate limiting, input validation
- **AI Integration**: OpenAI GPT-4 for conversational AI
- **TTS**: ElevenLabs for multilingual text-to-speech
- **Email**: Resend for transactional emails (password reset)

**Layered Structure:**
- **Routes**: HTTP endpoint definitions (thin layer)
- **Controllers**: Request/response handling (coming soon)
- **Services**: Business logic and external API calls
- **Models**: Database schemas and validation
- **Middleware**: Authentication, error handling
- **Utils**: Password hashing, token generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (optional for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rghvndr99/voiceLap.git
   cd voiceLap
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

## 🗂️ Project Structure (Refactored & Modularized)

```
voiceLap/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API route definitions (thin layer)
│   │   ├── controllers/    # Request/response handlers (NEW)
│   │   ├── services/       # Business logic & external APIs
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Auth, error handling
│   │   ├── utils/          # Password utils, helpers (NEW)
│   │   ├── config/         # Configuration files
│   │   ├── templates/      # Email templates
│   │   └── server.js       # Main server file
│   └── package.json
├── frontend/               # React frontend (fully modularized)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── chat/       # Chat-specific components (NEW)
│   │   │   ├── voicemate/  # VoiceMate components (NEW)
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ChatBubble.jsx
│   │   ├── pages/          # Page components (route handlers)
│   │   │   ├── Chat.jsx    # Refactored to ~300 lines
│   │   │   ├── VoiceMate.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ...
│   │   ├── hooks/          # Custom React hooks (NEW)
│   │   │   ├── useAuth.js
│   │   │   ├── useChat.js
│   │   │   ├── useSpeechRecognition.js
│   │   │   ├── useSpeechSynthesis.js
│   │   │   └── useVoiceRecording.js
│   │   ├── constants/      # App constants (NEW)
│   │   │   └── languages.js
│   │   ├── utils/          # Utility functions (NEW)
│   │   ├── locales/        # i18n translations
│   │   │   ├── en/
│   │   │   └── hi/
│   │   ├── styles/         # CSS files
│   │   │   ├── styles.css      # Global styles & theme variables
│   │   │   └── components.css  # Component CSS classes (NEW)
│   │   ├── i18n.js         # i18n configuration
│   │   └── main.jsx        # App entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── ARCHITECTURE.md         # Detailed architecture docs (NEW)
├── FLOW_DIAGRAMS.md        # Visual flow diagrams (NEW)
├── REFACTORING_PLAN.md     # Modularization plan (NEW)
├── package.json            # Root workspace config
└── README.md
```

### Key Improvements in Refactored Structure

✅ **No component > 300 lines** - Large components broken into smaller, focused modules
✅ **Custom hooks** - Reusable logic extracted from components
✅ **No inline styles** - All styles use CSS classes with theme variables
✅ **Layered backend** - Clear separation: routes → controllers → services → models
✅ **Comprehensive docs** - Architecture diagrams, flow charts, and API documentation

## 🔧 Configuration

### Environment Variables

Create a `.env` at the repository root for the backend, and `frontend/.env` for the frontend:

#### Backend environment (root .env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/voicelap
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
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
- Configure in root `.env`: `ELEVENLABS_API_KEY`
- Voice IDs are managed per-user via the VoiceTwin model (users can create custom voices)
- Frontend: Chat has a voice selector dropdown to choose from user's custom voices or browser default
- Fallback: If ElevenLabs fails, the app falls back to the browser's SpeechSynthesis automatically

Quick test (backend only):
```bash
curl -X POST http://localhost:5001/api/tts/eleven \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from VoiceLap!"}' \
  --output /tmp/tts-test.mp3
```

2. **Update MONGO_URI** in backend/.env
3. **Restart the backend** to connect to database


### 📧 Email (Password Reset)

The forgot/reset password flow sends an email with a secure reset link. Email delivery is provider‑pluggable (Resend, SendGrid, SES). Easiest to start with Resend.

1) Configure environment (root .env)
```env
# Email delivery
APP_NAME=VoiceLap
EMAIL_PROVIDER=RESEND            # LOG | RESEND | SENDGRID | SES
EMAIL_FROM="VoiceLap <onboarding@resend.dev>"  # Quick test sender for Resend
RESEND_API_KEY=your_resend_api_key
```

2) Where to get RESEND_API_KEY
- Create a free account at https://resend.com/
- In the dashboard, go to “API Keys” and click “Create API Key” → copy the value into RESEND_API_KEY
- For production, verify your own domain in Resend and set EMAIL_FROM to an address on that domain (e.g., no-reply@yourdomain.com)
- For quick local tests, you can use the default Resend sender `onboarding@resend.dev` as shown above

3) Test locally
- Start backend (ensure MongoDB is running): `cd backend && npm run dev`
- Register a user (POST /api/users/register) or use an existing one
- Open http://localhost:5174/forgot-password and submit your username/email
- Check your inbox for the reset email; in non‑production the API also returns the reset URL in the response for convenience

If you prefer SendGrid or AWS SES instead, set EMAIL_PROVIDER accordingly and provide the relevant credentials (see backend/src/services/email.js).

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

## 🙏 Acknowledgments

- Mental health advocates and volunteers
- Open source community
- Crisis support organizations

---

**Remember**: This platform provides peer support, not professional therapy. Always seek professional help for serious mental health concerns.
