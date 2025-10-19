# HearMe Flow Diagrams

This document contains visual flow diagrams for major features in the HearMe application.

## Table of Contents
1. [User Registration Flow](#user-registration-flow)
2. [User Login Flow](#user-login-flow)
3. [Password Reset Flow](#password-reset-flow)
4. [Chat Session Flow](#chat-session-flow)
5. [Voice Input Flow](#voice-input-flow)
6. [Voice Cloning Flow](#voice-cloning-flow)
7. [Profile Update Flow](#profile-update-flow)

## User Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Register.jsx
    participant API as Backend API
    participant DB as MongoDB
    participant E as Email Service

    U->>R: Fill registration form
    U->>R: Click "Register"
    R->>R: Validate form data
    R->>API: POST /api/users/register
    API->>API: Validate input
    API->>DB: Check if username/email exists
    alt User exists
        DB-->>API: User found
        API-->>R: 400 Error (User exists)
        R-->>U: Show error message
    else User doesn't exist
        DB-->>API: No user found
        API->>API: Hash password (PBKDF2)
        API->>DB: Create new user
        DB-->>API: User created
        API->>API: Generate JWT token
        API-->>R: 201 Success + token + user
        R->>R: Store token in localStorage
        R->>R: Update auth state
        R-->>U: Redirect to /profile
    end
```

## User Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login.jsx
    participant API as Backend API
    participant DB as MongoDB
    participant PW as passwordUtils

    U->>L: Enter username/email + password
    U->>L: Click "Login"
    L->>API: POST /api/users/login
    API->>DB: Find user by username/email
    alt User not found
        DB-->>API: null
        API-->>L: 401 Error (Invalid credentials)
        L-->>U: Show error toast
    else User found
        DB-->>API: User document
        API->>PW: verifyPassword(password, hash, salt)
        PW->>PW: Try multiple hash formats
        alt Password invalid
            PW-->>API: false
            API-->>L: 401 Error (Invalid credentials)
            L-->>U: Show error toast
        else Password valid
            PW-->>API: true
            API->>API: Generate JWT token
            API-->>L: 200 Success + token + user
            L->>L: Store token in localStorage
            L->>L: Update auth state
            L-->>U: Redirect to /chat
        end
    end
```

## Password Reset Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FP as ForgotPassword.jsx
    participant API as Backend API
    participant DB as MongoDB
    participant E as Email Service
    participant RP as ResetPassword.jsx

    Note over U,RP: Step 1: Request Reset
    U->>FP: Enter username/email
    U->>FP: Click "Send Reset Link"
    FP->>API: POST /api/users/forgot-password
    API->>DB: Find user
    alt User not found
        DB-->>API: null
        API-->>FP: 404 Error
        FP-->>U: Show error
    else User found
        DB-->>API: User document
        API->>API: Generate reset token
        API->>API: Hash token (SHA-256)
        API->>DB: Save hashed token + expiry (1 hour)
        DB-->>API: Updated
        API->>E: Send email with reset link
        E-->>U: Email with link
        API-->>FP: 200 Success
        FP-->>U: Show success message
    end

    Note over U,RP: Step 2: Reset Password
    U->>U: Click link in email
    U->>RP: Opens /reset-password?token=...
    U->>RP: Enter new password
    U->>RP: Click "Reset Password"
    RP->>API: POST /api/users/reset-password
    API->>API: Hash provided token
    API->>DB: Find user with matching token
    alt Token invalid/expired
        DB-->>API: null
        API-->>RP: 400 Error
        RP-->>U: Show error
    else Token valid
        DB-->>API: User document
        API->>API: Hash new password
        API->>DB: Update password, clear token
        DB-->>API: Updated
        API-->>RP: 200 Success
        RP-->>U: Show success, redirect to login
    end
```

## Chat Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat.jsx
    participant CH as useChat hook
    participant API as Backend API
    participant AI as OpenAI GPT-4
    participant TTS as ElevenLabs TTS

    Note over U,TTS: Session Initialization
    U->>C: Opens /chat page
    C->>CH: initializeSession()
    CH->>API: POST /api/ai-chat/session/start
    API->>API: Create session ID
    API->>AI: Send system prompt
    AI-->>API: Welcome message
    API-->>CH: sessionId + welcome message
    CH->>C: Update state
    C-->>U: Display welcome message

    Note over U,TTS: Send Message
    U->>C: Type message
    U->>C: Click send / press Enter
    C->>CH: sendMessage(text)
    CH->>CH: Add user message to state
    CH->>API: POST /api/ai-chat/message
    API->>AI: Send message + context
    AI->>AI: Generate response
    AI-->>API: AI response + metadata
    API->>API: Detect crisis keywords
    API-->>CH: AI message + quickReplies + crisis flag
    CH->>C: Update messages state
    C-->>U: Display AI response

    Note over U,TTS: Voice Output (if enabled)
    C->>C: Check if voice enabled
    alt Voice enabled
        C->>TTS: POST /api/tts/eleven
        TTS-->>C: Audio blob
        C->>C: Play audio
        C-->>U: Hear AI response
    end

    alt Crisis detected
        C-->>U: Show crisis resources toast
    end
```

## Voice Input Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CI as ChatInput.jsx
    participant SR as useSpeechRecognition
    participant B as Browser API
    participant C as Chat.jsx

    U->>CI: Click microphone button
    CI->>SR: toggleListening()
    SR->>B: recognition.start()
    B->>B: Request microphone permission
    alt Permission denied
        B-->>SR: Error
        SR-->>CI: onError callback
        CI-->>U: Show error toast
    else Permission granted
        B-->>SR: Started
        SR->>CI: Update isListening = true
        CI-->>U: Show "Listening..." indicator
        
        U->>U: Speak into microphone
        B->>B: Process audio
        B->>SR: onresult event
        SR->>SR: Extract transcript
        SR->>CI: onResult(transcript)
        CI->>C: Update inputMessage
        C-->>U: Display transcript in input
        SR->>CI: Update isListening = false
        CI-->>U: Hide "Listening..." indicator
    end
```

## Voice Cloning Flow

```mermaid
sequenceDiagram
    participant U as User
    participant VM as VoiceMate.jsx
    participant VR as useVoiceRecording
    participant B as Browser API
    participant API as Backend API
    participant EL as ElevenLabs API
    participant DB as MongoDB

    Note over U,DB: Recording Phase
    U->>VM: Click "Start Recording"
    VM->>VR: startRecording()
    VR->>B: getUserMedia({audio: true})
    B->>B: Request microphone permission
    alt Permission denied
        B-->>VR: Error
        VR-->>VM: onError callback
        VM-->>U: Show error toast
    else Permission granted
        B-->>VR: MediaStream
        VR->>VR: Create MediaRecorder
        VR->>VR: Start recording + timer
        VR-->>VM: isRecording = true
        VM-->>U: Show recording UI + waveform
        
        U->>U: Speak for 30+ seconds
        U->>VM: Click "Stop Recording"
        VM->>VR: stopRecording()
        VR->>VR: Stop MediaRecorder
        VR->>VR: Create audio blob
        VR-->>VM: audioBlob + audioUrl
        VM-->>U: Show preview player
    end

    Note over U,DB: Upload & Processing Phase
    U->>VM: Enter voice name
    U->>VM: Click "Create Voice"
    VM->>VM: Validate (name + audio)
    VM->>API: POST /api/voicetwin/upload (FormData)
    API->>API: Validate file (size, format)
    API->>EL: POST /v1/voices/add
    EL->>EL: Process audio
    EL->>EL: Train voice model
    alt Processing failed
        EL-->>API: Error
        API-->>VM: 500 Error
        VM-->>U: Show error toast
    else Processing successful
        EL-->>API: voiceId
        API->>DB: Save VoiceTwin document
        DB-->>API: Saved
        API-->>VM: 200 Success + voiceId
        VM->>VM: Store voiceId in localStorage
        VM-->>U: Show success message + pricing
    end
```

## Profile Update Flow

```mermaid
sequenceDiagram
    participant U as User
    participant P as Profile.jsx
    participant API as Backend API
    participant DB as MongoDB
    participant Auth as auth middleware

    Note over U,Auth: Load Profile
    U->>P: Opens /profile page
    P->>P: Get token from localStorage
    P->>API: GET /api/users/me
    API->>Auth: Verify JWT token
    alt Token invalid/expired
        Auth-->>API: 401 Unauthorized
        API-->>P: 401 Error
        P->>P: Clear token
        P-->>U: Redirect to /login
    else Token valid
        Auth-->>API: req.user = decoded
        API->>DB: Find user by ID
        DB-->>API: User document
        API-->>P: 200 Success + user data
        P-->>U: Display profile (read-only)
    end

    Note over U,Auth: Edit Profile
    U->>P: Click "Edit"
    P-->>U: Show editable form
    U->>P: Modify name/phone/language
    U->>P: Click "Update"
    P->>P: Validate form
    P->>API: PATCH /api/users/me
    API->>Auth: Verify JWT token
    Auth-->>API: req.user = decoded
    API->>API: Validate input
    API->>DB: Update user document
    alt Update failed
        DB-->>API: Error
        API-->>P: 500 Error
        P-->>U: Show error toast
    else Update successful
        DB-->>API: Updated user
        API-->>P: 200 Success + updated user
        P->>P: Update local state
        P-->>U: Show success toast + read-only view
    end
```

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "Chat Page"
        Chat[Chat.jsx<br/>Main Orchestrator]
        ChatHeader[ChatHeader.jsx]
        ChatMessages[ChatMessages.jsx]
        ChatInput[ChatInput.jsx]
        QuickReplies[QuickReplies.jsx]
        LangSelector[LanguageSelector.jsx]
        VoiceControls[VoiceControls.jsx]
    end

    subgraph "Custom Hooks"
        useChat[useChat.js]
        useSR[useSpeechRecognition.js]
        useSS[useSpeechSynthesis.js]
        useAuth[useAuth.js]
    end

    subgraph "Backend API"
        API[Express Server]
        Routes[Routes Layer]
        Services[Services Layer]
        Models[Models Layer]
    end

    subgraph "External Services"
        OpenAI[OpenAI GPT-4]
        ElevenLabs[ElevenLabs TTS]
    end

    Chat --> ChatHeader
    Chat --> ChatMessages
    Chat --> ChatInput
    Chat --> QuickReplies
    ChatHeader --> LangSelector
    ChatHeader --> VoiceControls

    Chat --> useChat
    Chat --> useSR
    Chat --> useSS
    Chat --> useAuth

    useChat --> API
    useSR --> Browser[Browser Speech API]
    useSS --> API

    API --> Routes
    Routes --> Services
    Services --> Models
    Services --> OpenAI
    Services --> ElevenLabs

    Models --> MongoDB[(MongoDB)]
```

## State Management Flow

```mermaid
graph LR
    subgraph "Component State"
        LocalState[Local State<br/>useState]
    end

    subgraph "Custom Hooks"
        HookState[Hook State<br/>Shared Logic]
    end

    subgraph "Persistent Storage"
        LS[localStorage<br/>hm-token<br/>hm-language<br/>hm-theme]
    end

    subgraph "Backend"
        DB[(MongoDB<br/>Source of Truth)]
    end

    LocalState <--> HookState
    HookState <--> LS
    HookState <--> DB
    LocalState --> UI[UI Rendering]
```

