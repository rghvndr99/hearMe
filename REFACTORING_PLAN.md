# HearMe Codebase Refactoring Plan

## Overview
Comprehensive modularization and cleanup to improve maintainability, reusability, and code quality.

## Phase 1: Frontend Modularization

### 1.1 Chat.jsx (856 lines) → Modular Structure
**Target Structure:**
```
frontend/src/
├── pages/
│   └── Chat.jsx (main orchestrator, ~150 lines)
├── components/
│   └── chat/
│       ├── ChatContainer.jsx
│       ├── ChatHeader.jsx
│       ├── ChatMessages.jsx
│       ├── ChatInput.jsx
│       ├── LanguageSelector.jsx
│       ├── VoiceControls.jsx
│       └── QuickReplies.jsx
├── hooks/
│   ├── useChat.js
│   ├── useSpeechRecognition.js
│       └── useSpeechSynthesis.js
├── utils/
│   ├── languageDetection.js
│   └── audioUtils.js
└── constants/
    └── languages.js
```

**Modules to Extract:**
- `constants/languages.js` - LANGUAGES array, detectUserLanguage()
- `hooks/useChat.js` - Session management, message handling, API calls
- `hooks/useSpeechRecognition.js` - Voice input logic
- `hooks/useSpeechSynthesis.js` - TTS logic
- `components/chat/ChatHeader.jsx` - Header with language selector, voice toggles
- `components/chat/ChatMessages.jsx` - Message list with animations
- `components/chat/ChatInput.jsx` - Input field with voice button
- `components/chat/LanguageSelector.jsx` - Language dropdown menu
- `components/chat/VoiceControls.jsx` - Voice enable/disable, mic button
- `components/chat/QuickReplies.jsx` - Quick reply buttons

### 1.2 VoiceMate.jsx (890 lines) → Modular Structure
**Target Structure:**
```
frontend/src/
├── pages/
│   └── VoiceMate.jsx (main orchestrator, ~120 lines)
├── components/
│   └── voicemate/
│       ├── AnonymousView.jsx
│       ├── AuthenticatedView.jsx
│       ├── RecordingSection.jsx
│       ├── WaveformVisualizer.jsx
│       ├── VoicePreview.jsx
│       ├── ProcessingState.jsx
│       ├── SuccessState.jsx
│       └── PricingCards.jsx
├── hooks/
│   ├── useVoiceRecording.js
│   └── useVoiceTwin.js
```

**Modules to Extract:**
- `hooks/useVoiceRecording.js` - Recording logic, media recorder
- `hooks/useVoiceTwin.js` - Voice upload, API integration
- `components/voicemate/AnonymousView.jsx` - Landing page for non-auth users
- `components/voicemate/AuthenticatedView.jsx` - Main interface for logged-in users
- `components/voicemate/RecordingSection.jsx` - Record/upload controls
- `components/voicemate/WaveformVisualizer.jsx` - Canvas-based waveform
- `components/voicemate/ProcessingState.jsx` - Processing UI
- `components/voicemate/SuccessState.jsx` - Success UI with CTA
- `components/voicemate/PricingCards.jsx` - Plan cards

### 1.3 Other Pages to Modularize
- **Volunteer.jsx** (309 lines) → Extract form components
- **Profile.jsx** (200 lines) → Extract ProfileView, ProfileEdit components
- **Home.jsx** (192 lines) → Extract Hero, Features, Trust sections

## Phase 2: CSS Refactoring

### 2.1 Create Theme-Aware CSS Classes
**New File:** `frontend/src/styles/components.css`

**Extract inline styles to classes:**
- `.hm-page-container` - Common page wrapper
- `.hm-section` - Section wrapper
- `.hm-card` - Card component
- `.hm-button-primary` - Primary CTA button
- `.hm-button-secondary` - Secondary button
- `.hm-input` - Form input
- `.hm-heading-primary` - Main headings
- `.hm-heading-secondary` - Sub headings
- `.hm-text-primary` - Primary text
- `.hm-text-secondary` - Secondary text
- `.hm-chat-bubble-user` - User message bubble
- `.hm-chat-bubble-ai` - AI message bubble
- `.hm-waveform-container` - Waveform wrapper
- `.hm-recording-indicator` - Recording state indicator

### 2.2 Theme Support
Ensure all CSS classes use CSS variables:
```css
.hm-button-primary {
  background: var(--hm-gradient-cta);
  color: var(--hm-color-text-on-brand);
  /* ... */
}
```

## Phase 3: Backend Modularization

### 3.1 users.js (392 lines) → Modular Structure
**Target Structure:**
```
backend/src/
├── routes/
│   └── users.js (route definitions only, ~80 lines)
├── controllers/
│   └── userController.js
├── services/
│   └── userService.js
└── utils/
    └── passwordUtils.js
```

**Modules to Extract:**
- `utils/passwordUtils.js` - Password hashing, verification
- `services/userService.js` - Business logic (register, login, update profile)
- `controllers/userController.js` - Request/response handling
- `routes/users.js` - Route definitions only

### 3.2 aiChat.js (271 lines) → Modular Structure
**Target Structure:**
```
backend/src/
├── routes/
│   └── aiChat.js (route definitions, ~50 lines)
├── controllers/
│   └── aiChatController.js
└── services/
    ├── aiChatService.js
    └── intentDetectionService.js
```

### 3.3 voicetwin.js (136 lines) → Modular Structure
**Target Structure:**
```
backend/src/
├── routes/
│   └── voicetwin.js (route definitions, ~40 lines)
├── controllers/
│   └── voicetwinController.js
└── services/
    └── voicetwinService.js
```

## Phase 4: Shared Utilities & Hooks

### 4.1 Create Shared Hooks
- `hooks/useAuth.js` - Authentication state management
- `hooks/useApi.js` - API call wrapper with error handling
- `hooks/useToastNotification.js` - Standardized toast notifications
- `hooks/useTheme.js` - Theme management

### 4.2 Create Shared Utils
- `utils/apiClient.js` - Axios instance with interceptors
- `utils/validation.js` - Form validation helpers
- `utils/formatters.js` - Date, text formatters

## Phase 5: Documentation

### 5.1 Update README.md
- Architecture overview
- Component structure
- Folder organization
- Development guidelines

### 5.2 Create Flow Diagrams
- User authentication flow
- Chat session flow
- VoiceTwin creation flow
- Password reset flow

### 5.3 Add Component Documentation
- JSDoc comments for all components
- Props documentation
- Usage examples

## Implementation Order

1. **Day 1: Chat.jsx Modularization**
   - Extract constants and utils
   - Create custom hooks
   - Break into components
   - Test thoroughly

2. **Day 2: VoiceMate.jsx Modularization**
   - Extract hooks
   - Create sub-components
   - Test recording/upload flow

3. **Day 3: CSS Refactoring**
   - Create component CSS classes
   - Replace inline styles
   - Verify theme support

4. **Day 4: Backend Modularization**
   - Refactor users.js
   - Refactor aiChat.js
   - Refactor voicetwin.js

5. **Day 5: Documentation & Diagrams**
   - Update README
   - Create flow diagrams
   - Add JSDoc comments

## Success Criteria

- ✅ No component > 200 lines
- ✅ No inline styles (use CSS classes)
- ✅ All business logic in services/hooks
- ✅ All routes < 100 lines
- ✅ 100% theme support maintained
- ✅ Zero breaking changes
- ✅ Comprehensive documentation
- ✅ Flow diagrams for major features

