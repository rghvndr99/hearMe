# VoiceLap - Complete Features Documentation

## 📋 Table of Contents

1. [Application Overview](#application-overview)
2. [Core Features](#core-features)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Models](#database-models)
6. [API Endpoints](#api-endpoints)
7. [File Structure](#file-structure)

---

## 🎯 Application Overview

**VoiceLap** is a mental health support platform that provides:
- AI-powered chat and voice conversations
- Human volunteer support
- Voice cloning and personalization
- Multi-language support (English, Hindi, Hinglish)
- Subscription-based premium features
- Google Meet session booking

**Tech Stack:**
- **Frontend:** React, Chakra UI, Vite, i18next
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **APIs:** OpenAI, ElevenLabs, Google Calendar, Deepgram
- **Authentication:** JWT

---

## ✨ Core Features

### 1. **AI Chat System** 🤖
- **Text Chat:** Unlimited text conversations with AI
- **Voice Chat:** Voice-to-voice conversations with AI
- **Multi-language:** English, Hindi, Hinglish support
- **Intent Detection:** Recognizes crisis, support needs, pricing questions
- **Sentiment Analysis:** Tracks emotional state
- **Context Awareness:** Maintains conversation history

**Files:**
- Frontend: `frontend/src/pages/Chat.jsx`
- Backend: `backend/src/routes/aiChat.js`
- Service: `backend/src/services/openaiService.js`

### 2. **Voice Personalization (VoiceMate)** 🎙️
- **Voice Cloning:** Create custom AI voices from audio samples
- **Voice Library:** Manage multiple custom voices
- **Voice Selection:** Choose voice for conversations
- **ElevenLabs Integration:** Professional voice synthesis

**Files:**
- Frontend: `frontend/src/pages/VoiceMate.jsx`
- Backend: `backend/src/routes/voicetwin.js`
- Model: `backend/src/models/VoiceTwin.js`

### 3. **User Authentication** 🔐
- **Registration:** Email-based signup
- **Login:** JWT-based authentication
- **Password Reset:** Email-based password recovery
- **Profile Management:** Update email, password, preferences

**Files:**
- Frontend: `frontend/src/pages/Login.jsx`, `Register.jsx`, `Profile.jsx`
- Backend: `backend/src/routes/auth.js`, `users.js`
- Model: `backend/src/models/User.js`

### 4. **Subscription System** 💳
- **Free Tier:** Limited features
- **Paid Plans:** Care, Companion plans
- **Pricing Page:** Display plans and features
- **Payment Integration:** UPI payment support

**Files:**
- Frontend: `frontend/src/pages/Pricing.jsx`, `Payment.jsx`
- Backend: `backend/src/routes/subscriptions.js`, `pricing.js`
- Models: `backend/src/models/Plan.js`, `Subscription.js`

### 5. **Google Meet Booking** 📅
- **Session Scheduling:** Book 30-minute voice sessions
- **Calendar Integration:** Google Calendar API
- **Email Invites:** Automatic meeting invites
- **Booking Management:** View, reschedule, cancel bookings

**Files:**
- Frontend: `frontend/src/pages/Profile.jsx`, `components/BookingModal.jsx`
- Backend: `backend/src/routes/bookings.js`
- Service: `backend/src/services/googleCalendar.js`
- Model: `backend/src/models/Booking.js`

### 6. **Volunteer System** 🤝
- **Volunteer Applications:** Apply to become a listener
- **Human Support:** Connect users with volunteers
- **Socket.IO Matching:** Real-time volunteer-user pairing

**Files:**
- Frontend: `frontend/src/pages/Volunteer.jsx`
- Backend: `backend/src/routes/volunteer.js`
- Models: `backend/src/models/Volunteer.js`, `VolunteerApplication.js`

### 7. **Stories & Testimonials** 📖
- **User Stories:** Share recovery experiences
- **Community Support:** Inspire others

**Files:**
- Frontend: `frontend/src/pages/Stories.jsx`
- Backend: `backend/src/routes/stories.js`
- Model: `backend/src/models/Story.js`

### 8. **Multi-language Support** 🌍
- **Languages:** English, Hindi, Hinglish
- **i18next Integration:** Dynamic translations
- **Theme Support:** Dark, Light, Ocean, Forest, Sunset

**Files:**
- Frontend: `frontend/src/i18n.js`, `locales/en/common.json`, `locales/hi/common.json`
- Styles: `frontend/src/styles.css`

### 9. **Responsive Design** 📱
- **Mobile-First:** Optimized for all screen sizes
- **Chakra UI:** Consistent component library
- **Custom Themes:** CSS variables for theming

**Files:**
- Styles: `frontend/src/styles.css`, `styles/components.css`
- Theme: `frontend/src/theme.js`

### 10. **Real-time Communication** ⚡
- **Socket.IO:** Real-time messaging
- **Typing Indicators:** Show when someone is typing
- **Queue System:** Manage volunteer requests

**Files:**
- Backend: `backend/src/server.js` (Socket.IO setup)

---

## 🏗️ Frontend Architecture

### Pages (19 pages)

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| Home | `/` | Landing page | ✅ Active |
| Chat | `/chat` | AI conversation | ✅ Active |
| VoiceMate | `/voicemate` | Voice cloning | ✅ Active |
| Profile | `/profile` | User settings | ✅ Active |
| Pricing | `/pricing` | Subscription plans | ✅ Active |
| Payment | `/payment` | Payment processing | ✅ Active |
| Login | `/login` | User login | ✅ Active |
| Register | `/register` | User signup | ✅ Active |
| ForgotPassword | `/forgot-password` | Password recovery | ✅ Active |
| ResetPassword | `/reset-password` | Set new password | ✅ Active |
| ChangePassword | `/change-password` | Update password | ✅ Active |
| ChangeEmail | `/change-email` | Update email | ✅ Active |
| Stories | `/stories` | User testimonials | ✅ Active |
| Volunteer | `/volunteer` | Volunteer signup | ✅ Active |
| About | `/about` | About VoiceLap | ✅ Active |
| Contact | `/contact` | Contact form | ✅ Active |
| Resources | `/resources` | Mental health resources | ✅ Active |
| Privacy | `/privacy` | Privacy policy | ✅ Active |

### Components (20+ components)

**Layout Components:**
- `Header.jsx` - Navigation bar with auth, theme toggle, language selector
- `Footer.jsx` - Footer with links and branding
- `ChatBubble.jsx` - Floating chat button

**Chat Components:**
- `chat/ChatHeader.jsx` - Chat page header
- `chat/ChatInput.jsx` - Message input with voice recording
- `chat/ChatMessages.jsx` - Message display area
- `chat/VoiceControls.jsx` - Voice recording controls
- `chat/VoiceSelector.jsx` - Voice selection dropdown
- `chat/LanguageSelector.jsx` - Language switcher
- `chat/QuickReplies.jsx` - Quick response buttons

**Booking Components:**
- `BookingModal.jsx` - Google Meet booking form
- `BookingCard.jsx` - Display booking details with actions

**VoiceMate Components:**
- `voicemate/DeleteConfirmationModal.jsx` - Confirm voice deletion

**Home Components:**
- `home/EmotionCarousel.jsx` - Emotion-based carousel
- `home/FeatureImageTiles.jsx` - Feature showcase
- `home/FeatureTiles.jsx` - Feature grid

**Utility Components:**
- `ThemeToggle.jsx` - Theme switcher

### Hooks (6 custom hooks)

- `useAuth.js` - Authentication state management
- `useChat.js` - Chat functionality
- `useSpeechRecognition.js` - Voice input
- `useSpeechSynthesis.js` - Voice output
- `useVoiceRecording.js` - Audio recording

---

## 🔧 Backend Architecture

### Routes (15 API routes)

| Route | Endpoint | Purpose | Auth Required |
|-------|----------|---------|---------------|
| `auth.js` | `/api/auth/*` | Login, register, password reset | No |
| `users.js` | `/api/users/*` | Profile, email change | Yes |
| `aiChat.js` | `/api/ai-chat/*` | AI conversations | Optional |
| `chat.js` | `/api/chat/*` | Legacy chat endpoint | No |
| `tts.js` | `/api/tts/*` | Text-to-speech | Optional |
| `voicetwin.js` | `/api/voicetwin/*` | Voice cloning | Yes |
| `bookings.js` | `/api/bookings/*` | Google Meet bookings | Yes |
| `subscriptions.js` | `/api/subscriptions/*` | Subscription management | Yes |
| `pricing.js` | `/api/pricing` | Get pricing plans | No |
| `volunteer.js` | `/api/volunteer/*` | Volunteer applications | Optional |
| `stories.js` | `/api/stories/*` | User stories | Optional |
| `sentiment.js` | `/api/sentiment/*` | Sentiment analysis | No |
| `listener.js` | `/api/listener/*` | Listener matching | No |
| `speakerDiarization.js` | `/api/speaker-diarization/*` | Speaker identification | No |
| `wallet.js` | `/api/wallet/*` | Wallet top-up | Yes |

### Services (5 services)

- `openaiService.js` - OpenAI API integration (chat, TTS, intent detection)
- `googleCalendar.js` - Google Calendar API (create/update/delete events)
- `email.js` - Email sending (password reset, notifications)
- `speakerDiarization.js` - Deepgram speaker identification
- `passwordUtils.js` - Password hashing utilities

### Middleware

- `auth.js` - JWT authentication middleware

---

## 🗄️ Database Models

### User Management (3 models)

1. **User** (`User.js`)
   - Fields: username, email, password, fullName, phone, role, subscription
   - Purpose: User accounts and authentication

2. **Session** (`Session.js`)
   - Fields: sessionId, userId, messages, createdAt
   - Purpose: Chat session history

3. **ChatSession** (`ChatSession.js`)
   - Fields: sessionId, userId, messages, sentiment, language
   - Purpose: Enhanced chat sessions with metadata

### Subscription & Payment (5 models)

4. **Plan** (`Plan.js`)
   - Fields: plan_id, name, price, features, billing_cycle
   - Purpose: Subscription plan definitions

5. **Subscription** (`Subscription.js`)
   - Fields: user_id, plan_id, status, start_date, end_date
   - Purpose: User subscription records

6. **Addon** (`Addon.js`)
   - Fields: addon_id, name, price, features
   - Purpose: Additional purchasable features

7. **WalletPack** (`WalletPack.js`)
   - Fields: pack_id, credits_minutes, price, currency
   - Purpose: Wallet credit packages

8. **Order** (`Order.js`)
   - Fields: order_id, user_id, amount, status, gateway
   - Purpose: Payment order tracking

### Features (4 models)

9. **VoiceTwin** (`VoiceTwin.js`)
   - Fields: userId, voiceId, name, audioUrl, status
   - Purpose: Custom voice clones

10. **Booking** (`Booking.js`)
    - Fields: userId, sessionType, scheduledAt, meetLink, status
    - Purpose: Google Meet session bookings

11. **Story** (`Story.js`)
    - Fields: title, content, author, category, published
    - Purpose: User testimonials and stories

12. **Volunteer** (`Volunteer.js`)
    - Fields: userId, name, email, availability, status
    - Purpose: Volunteer listener accounts

13. **VolunteerApplication** (`VolunteerApplication.js`)
    - Fields: name, email, phone, motivation, status
    - Purpose: Volunteer application submissions

### Configuration (2 models)

14. **Setting** (`Setting.js`)
    - Fields: key, value, category, description
    - Purpose: Global app settings

15. **UiText** (`UiText.js`)
    - Fields: key, language, text, category
    - Purpose: Dynamic UI text/translations

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)

```
POST   /api/auth/register          - Create new user account
POST   /api/auth/login             - Login with email/password
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
```

### Users (`/api/users`)

```
GET    /api/users/profile          - Get user profile (auth required)
PUT    /api/users/profile          - Update user profile (auth required)
POST   /api/users/change-email     - Change email address (auth required)
POST   /api/users/change-password  - Change password (auth required)
```

### AI Chat (`/api/ai-chat`)

```
POST   /api/ai-chat/message        - Send message to AI
POST   /api/ai-chat/voice          - Voice-to-voice conversation
GET    /api/ai-chat/history        - Get chat history (auth required)
DELETE /api/ai-chat/history/:id    - Delete chat session (auth required)
```

### Voice Twin (`/api/voicetwin`)

```
GET    /api/voicetwin/mine         - Get user's custom voices (auth required)
POST   /api/voicetwin/create       - Create new voice clone (auth required)
DELETE /api/voicetwin/:id          - Delete voice clone (auth required)
PUT    /api/voicetwin/:id/rename   - Rename voice clone (auth required)
```

### Bookings (`/api/bookings`)

```
GET    /api/bookings               - Get user's bookings (auth required)
POST   /api/bookings               - Create new booking (auth required)
PUT    /api/bookings/:id           - Update booking (auth required)
DELETE /api/bookings/:id           - Cancel booking (auth required)
```

### Subscriptions (`/api/subscriptions`)

```
GET    /api/subscriptions/current  - Get current subscription (auth required)
POST   /api/subscriptions/create   - Create subscription (auth required)
POST   /api/subscriptions/cancel   - Cancel subscription (auth required)
GET    /api/subscriptions/usage    - Get usage stats (auth required)
```

### Pricing (`/api/pricing`)

```
GET    /api/pricing                - Get all pricing plans
```

### Volunteer (`/api/volunteer`)

```
POST   /api/volunteer/apply        - Submit volunteer application
GET    /api/volunteer/applications - Get applications (admin)
PUT    /api/volunteer/:id/approve  - Approve application (admin)
```

### Stories (`/api/stories`)

```
GET    /api/stories                - Get all published stories
POST   /api/stories                - Create new story (auth required)
GET    /api/stories/:id            - Get single story
PUT    /api/stories/:id            - Update story (auth required)
DELETE /api/stories/:id            - Delete story (auth required)
```

### TTS (`/api/tts`)

```
POST   /api/tts/synthesize         - Convert text to speech
```

---

## 📂 File Structure

```
voicelap-fullstack-no-docker-v2/
├── frontend/
│   ├── public/
│   │   ├── images/              # Static images
│   │   └── favicon.svg          # App icon
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── chat/            # Chat-specific components
│   │   │   ├── home/            # Home page components
│   │   │   ├── voicemate/       # VoiceMate components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ...
│   │   ├── pages/               # Page components
│   │   │   ├── Chat.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   ├── locales/             # i18n translations
│   │   │   ├── en/
│   │   │   └── hi/
│   │   ├── styles/              # CSS files
│   │   ├── constants/           # Constants
│   │   ├── lib/                 # Utilities
│   │   ├── i18n.js              # i18n configuration
│   │   ├── theme.js             # Chakra UI theme
│   │   └── main.jsx             # App entry point
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies
│   └── vite.config.js           # Vite configuration
│
├── backend/
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── models/              # Mongoose models
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Express middleware
│   │   ├── config/              # Configuration
│   │   ├── templates/           # Email templates
│   │   ├── utils/               # Utilities
│   │   └── server.js            # Server entry point
│   ├── scripts/                 # Utility scripts
│   ├── package.json             # Dependencies
│   └── .env                     # Environment variables
│
├── voicelap_pricing_v2.json     # Pricing configuration
├── package.json                 # Root package.json
├── .env                         # Root environment variables
├── .env.example                 # Environment template
├── README.md                    # Project documentation
├── CLEANUP_RECOMMENDATIONS.md   # This cleanup guide
├── FEATURES_DOCUMENTATION.md    # This features guide
└── REBRANDING_SUMMARY.md        # Rebranding changes log
```

---

## 🔑 Environment Variables

### Backend (.env)

```bash
# Server
PORT=5001
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/voicelap

# Authentication
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# OpenAI
OPENAI_API_KEY=sk-...

# ElevenLabs
ELEVENLABS_API_KEY=sk_...

# Email (Resend)
RESEND_API_KEY=re_...

# Deepgram
DEEPGRAM_API_KEY=...

# Google Calendar
GOOGLE_CALENDAR_EMAIL=your-email@gmail.com
GOOGLE_ADMIN_ACCESS_TOKEN=ya29...
GOOGLE_ADMIN_REFRESH_TOKEN=1//...
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Running the Application

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

---

## 📊 Feature Status

| Feature | Status | Frontend | Backend | Database |
|---------|--------|----------|---------|----------|
| AI Chat | ✅ Complete | ✅ | ✅ | ✅ |
| Voice Chat | ✅ Complete | ✅ | ✅ | ✅ |
| Voice Cloning | ✅ Complete | ✅ | ✅ | ✅ |
| Authentication | ✅ Complete | ✅ | ✅ | ✅ |
| Subscriptions | ✅ Complete | ✅ | ✅ | ✅ |
| Google Meet | ✅ Complete | ✅ | ✅ | ✅ |
| Volunteer System | ✅ Complete | ✅ | ✅ | ✅ |
| Stories | ✅ Complete | ✅ | ✅ | ✅ |
| Multi-language | ✅ Complete | ✅ | ✅ | ✅ |
| Themes | ✅ Complete | ✅ | N/A | N/A |
| Wallet Top-up | ⚠️ Partial | ❌ | ✅ | ✅ |
| Sentiment Analysis | ⚠️ Partial | ❌ | ✅ | N/A |
| Speaker Diarization | ⚠️ Partial | ❌ | ✅ | N/A |

---

## 📝 Notes

- **MongoDB Collections:** Created automatically when models are first used
- **API Keys:** Required for OpenAI, ElevenLabs, Google Calendar
- **Payment:** UPI payment integration (manual verification)
- **Email:** Uses Resend API for transactional emails

---

**Last Updated:** 2025-11-15
**Version:** 2.0 (Post-Rebranding)
**Documentation by:** Augment Agent


