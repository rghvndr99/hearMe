# Streaming WebRTC voice pipeline — local smoke test (no commits)

This is a local-only test plan for the low-latency voice pipeline:
Browser mic (WebRTC) → server WebRTC bridge → OpenAI streaming tokens → ElevenLabs streaming TTS → ffmpeg decode → wrtc RTCAudioSource → browser playback.

Important: Do NOT commit these changes. Review before committing anything.

## 0) Prerequisites
- ffmpeg installed and on PATH
- Node 18+ recommended (for built-in fetch)
- API keys
  - OPENAI_API_KEY
  - ELEVEN_API_KEY (or ELEVENLABS_API_KEY)
  - ELEVEN_VOICE_ID (optional)

## 1) Prepare environment
- Copy .env.example → .env and fill values. Ensure your existing app boots normally.
- Add (if missing) to .env:
  - OPENAI_MODEL=gpt-4o-mini
  - ELEVEN_API_KEY=sk-...
  - ELEVEN_VOICE_ID=21m00Tcm4TlvDq8ikWAM

## 2) Install backend deps (local)
- From repo root:
  - npm install
  - In addition, install native deps required by this feature:
    - npm i -D wrtc node-fetch

Note: wrtc builds native bindings. If it fails, ensure Python and build tools are available.

## 3) Wire the route locally (temporary, do not commit)
Open backend/src/server.js and mount the router after other routes:

```js
// temporary local-only: mount streaming WebRTC route
import webrtcRouter from '../../backend/controllers/chatController.js';
app.use('/webrtc', webrtcRouter);
```

If import complains (CommonJS interop), use createRequire:

```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const webrtcRouter = require('../../backend/controllers/chatController.js');
app.use('/webrtc', webrtcRouter);
```

Restart the backend server.

## 4) Start servers
- Backend: npm run start (or node backend/src/server.js)
- Frontend: npm run dev (ensure CORS/front origin is allowed in .env)

## 5) In the browser
- Open the app in the browser (e.g., http://localhost:5173)
- Open DevTools Console and run:

```js
import { createPeer } from '/src/webrtc/peerClient.js';
const p = await createPeer({ offerUrl: '/webrtc/offer', text: 'Tell me a quick, calming breathing exercise.' });
// Attach audio to the page (optional)
document.body.appendChild(p.remoteAudioEl);
```

You should hear synthesized speech streaming in within a couple of seconds.

## 6) Verify logs
- Backend console should show latency checkpoints:
  - [stream-voice] offer-received
  - [stream-voice] openai-first-token
  - [stream-voice] eleven-first-chunk
  - [stream-voice] first-audio-pushed

## 7) Cleanup
- When done:
  - p.pc.close();
  - p.localStream.getTracks().forEach(t => t.stop());

## Notes / TODO
- Authentication, rate limits, per-session quotas, and production SFU should be added before any real deployment.
- Resource limits in place: MAX_TOKENS (default 500), MAX_TTS_CHUNKS (default 50). Set via env if needed.
- ElevenLabs streaming endpoint returns compressed audio (e.g., MP3). ffmpeg decodes to s16le 48k mono and feeds wrtc.

