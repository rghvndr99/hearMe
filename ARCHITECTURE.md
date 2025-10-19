# HearMe Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Flow](#data-flow)
6. [Component Structure](#component-structure)
7. [API Endpoints](#api-endpoints)
8. [Authentication Flow](#authentication-flow)
9. [Deployment](#deployment)

## Overview

HearMe is a fullstack mental health support platform built with:
- **Frontend**: React 18 + Vite + Chakra UI + Tailwind CSS v4
- **Backend**: Node.js + Express + MongoDB
- **Real-time**: Socket.IO for live chat
- **AI**: OpenAI GPT-4 for conversational support
- **TTS**: ElevenLabs for multilingual text-to-speech
- **Voice**: ElevenLabs Voice Cloning for personalized AI voices

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Tablet     │      │
│  │   (React)    │  │  (Responsive)│  │ (Responsive) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js API Server                   │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │   │
│  │  │ Routes │  │ Ctrl   │  │Service │  │Middleware│   │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   MongoDB    │  │  Redis Cache │  │  File Storage│      │
│  │  (Primary DB)│  │  (Sessions)  │  │   (Audio)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   OpenAI     │  │  ElevenLabs  │  │    Resend    │      │
│  │   (GPT-4)    │  │    (TTS)     │  │   (Email)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Directory Structure (Modularized)

```
frontend/src/
├── components/           # Reusable UI components
│   ├── chat/            # Chat-specific components
│   │   ├── ChatHeader.jsx
│   │   ├── ChatMessages.jsx
│   │   ├── ChatInput.jsx
│   │   ├── LanguageSelector.jsx
│   │   ├── VoiceControls.jsx
│   │   └── QuickReplies.jsx
│   ├── voicemate/       # VoiceMate components
│   │   ├── AnonymousView.jsx
│   │   ├── AuthenticatedView.jsx
│   │   ├── RecordingSection.jsx
│   │   ├── WaveformVisualizer.jsx
│   │   └── PricingCards.jsx
│   ├── Header.jsx       # Global header
│   ├── Footer.jsx       # Global footer
│   └── ChatBubble.jsx   # Floating chat widget
├── pages/               # Page components (route handlers)
│   ├── Chat.jsx         # AI chat page (refactored, ~300 lines)
│   ├── VoiceMate.jsx    # Voice cloning page
│   ├── Profile.jsx      # User profile
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication state
│   ├── useChat.js       # Chat session management
│   ├── useSpeechRecognition.js  # Voice input
│   ├── useSpeechSynthesis.js    # Text-to-speech
│   ├── useVoiceRecording.js     # Audio recording
│   └── useVoiceTwin.js          # Voice cloning API
├── constants/           # App constants
│   └── languages.js     # Supported languages config
├── utils/               # Utility functions
│   ├── apiClient.js     # Axios instance
│   ├── validation.js    # Form validation
│   └── formatters.js    # Data formatters
├── locales/             # i18n translations
│   ├── en/
│   │   └── common.json
│   └── hi/
│       └── common.json
├── styles/              # CSS files
│   ├── styles.css       # Global styles
│   └── components.css   # Component-specific styles (NEW)
├── i18n.js              # i18n configuration
└── main.jsx             # App entry point
```

### Component Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Reusability**: Components are generic and configurable via props
3. **Composition**: Complex UIs built from smaller components
4. **Separation of Concerns**: Logic in hooks, presentation in components
5. **Theme Support**: All styles use CSS variables for theme compatibility

### Custom Hooks

#### useAuth
Manages authentication state across the app.
```javascript
const { user, token, loading, isAuthenticated, login, logout } = useAuth();
```

#### useChat
Handles chat session and message management.
```javascript
const {
  sessionId,
  messages,
  isLoading,
  isTyping,
  quickReplies,
  sendMessage,
  handleQuickReply
} = useChat(onError);
```

#### useSpeechRecognition
Manages voice input (speech-to-text).
```javascript
const {
  isListening,
  startListening,
  stopListening,
  toggleListening
} = useSpeechRecognition(language, onResult, onError);
```

#### useSpeechSynthesis
Manages voice output (text-to-speech).
```javascript
const {
  isSpeaking,
  speak,
  stopSpeaking,
  ttsEngine,
  changeTtsEngine
} = useSpeechSynthesis(language, enabled);
```

### CSS Architecture

#### Theme Variables (styles.css)
```css
:root[data-theme="light"] {
  --hm-color-bg: #f7fafc;
  --hm-color-text-primary: #1a202c;
  --hm-color-brand: #3182ce;
  /* ... */
}

:root[data-theme="dark"] {
  --hm-color-bg: #1a202c;
  --hm-color-text-primary: #f7fafc;
  --hm-color-brand: #63b3ed;
  /* ... */
}
```

#### Component Classes (components.css)
All inline styles have been extracted to reusable CSS classes:
- `.hm-page-container` - Page wrapper
- `.hm-card` - Card component
- `.hm-button-primary` - Primary CTA button
- `.hm-chat-bubble-user` - User message bubble
- `.hm-chat-bubble-ai` - AI message bubble
- And 30+ more...

## Backend Architecture

### Directory Structure (Modularized)

```
backend/src/
├── routes/              # API route definitions
│   ├── users.js         # User auth routes (refactored, ~80 lines)
│   ├── aiChat.js        # AI chat routes
│   ├── voicetwin.js     # Voice cloning routes
│   ├── tts.js           # Text-to-speech routes
│   └── ...
├── controllers/         # Request/response handlers (NEW)
│   ├── userController.js
│   ├── aiChatController.js
│   └── voicetwinController.js
├── services/            # Business logic (NEW)
│   ├── userService.js
│   ├── aiChatService.js
│   ├── voicetwinService.js
│   ├── openaiService.js
│   └── email.js
├── middleware/          # Express middleware
│   └── auth.js          # JWT authentication
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Session.js
│   ├── VoiceTwin.js
│   └── ...
├── utils/               # Utility functions (NEW)
│   └── passwordUtils.js # Password hashing/verification
├── config/              # Configuration
│   └── intentResponses.js
├── templates/           # Email templates
│   └── resetPasswordEmail.js
└── server.js            # App entry point
```

### Layered Architecture

```
┌─────────────────────────────────────────┐
│           Routes Layer                   │
│  (HTTP endpoints, request validation)   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Controllers Layer                 │
│  (Request/response handling, errors)    │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Services Layer                   │
│  (Business logic, external APIs)        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Models Layer                    │
│  (Database schemas, validation)         │
└─────────────────────────────────────────┘
```

## Data Flow

### Chat Message Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  ChatInput.jsx  │ ← Component captures input
└─────────────────┘
    │
    ▼
┌─────────────────┐
│   useChat.js    │ ← Hook manages state
└─────────────────┘
    │
    ▼
POST /api/ai-chat/message
    │
    ▼
┌─────────────────┐
│ aiChat.js route │ ← Route receives request
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ openaiService   │ ← Service calls OpenAI
└─────────────────┘
    │
    ▼
OpenAI GPT-4 API
    │
    ▼
AI Response
    │
    ▼
┌─────────────────┐
│ ChatMessages    │ ← Component displays response
└─────────────────┘
    │
    ▼
┌─────────────────┐
│useSpeechSynthesis│ ← Hook speaks response (if enabled)
└─────────────────┘
```

### Authentication Flow

See [Authentication Flow](#authentication-flow) section below.

## Component Structure

### Chat Page Component Tree

```
Chat.jsx (Main orchestrator)
├── ChatHeader.jsx
│   ├── LanguageSelector.jsx
│   └── VoiceControls.jsx
├── ChatMessages.jsx
│   └── (Message bubbles with animations)
├── QuickReplies.jsx
│   └── (Quick reply buttons)
└── ChatInput.jsx
    ├── Input field
    ├── Voice input button
    └── Send button
```

### Hooks Used by Chat

- `useChat()` - Session and message management
- `useSpeechRecognition()` - Voice input
- `useSpeechSynthesis()` - Voice output
- `useTranslation()` - i18n support
- `useToast()` - Notifications

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me` - Update user profile
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token
- `POST /api/users/change-password` - Change password (authenticated)
- `POST /api/users/change-email` - Change email (authenticated)

### AI Chat
- `POST /api/ai-chat/session/start` - Start new chat session
- `POST /api/ai-chat/message` - Send message to AI

### Text-to-Speech
- `POST /api/tts/eleven` - Generate speech with ElevenLabs
- `POST /api/tts/synthesize` - Generate speech (generic endpoint)

### Voice Cloning
- `POST /api/voicetwin/upload` - Upload audio for voice cloning
- `GET /api/voicetwin/mine` - Get user's saved voices

## Authentication Flow

```
┌──────────┐
│  User    │
└──────────┘
     │
     │ 1. Enter credentials
     ▼
┌──────────────────┐
│  Login.jsx       │
└──────────────────┘
     │
     │ 2. POST /api/users/login
     ▼
┌──────────────────┐
│  users.js route  │
└──────────────────┘
     │
     │ 3. Verify password
     ▼
┌──────────────────┐
│ passwordUtils.js │
└──────────────────┘
     │
     │ 4. Generate JWT
     ▼
┌──────────────────┐
│  JWT Token       │
└──────────────────┘
     │
     │ 5. Return token + user
     ▼
┌──────────────────┐
│  Login.jsx       │
└──────────────────┘
     │
     │ 6. Store in localStorage
     ▼
┌──────────────────┐
│  localStorage    │
│  'hm-token'      │
└──────────────────┘
     │
     │ 7. Subsequent requests
     ▼
┌──────────────────┐
│  Authorization:  │
│  Bearer <token>  │
└──────────────────┘
     │
     │ 8. Verify token
     ▼
┌──────────────────┐
│  auth.js         │
│  middleware      │
└──────────────────┘
```

## Deployment

### Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5001
VITE_BACKEND_URL=http://localhost:5001
```

#### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hearme
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
RESEND_API_KEY=re_...
```

### Production Build

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend
cd backend
npm start
# Runs on port 5001
```

### Recommended Stack
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare
- **Monitoring**: Sentry

