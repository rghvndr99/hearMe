# Voice Features - Interactive Chat

## Overview
The HearMe chat now includes full voice interaction capabilities, allowing users to speak their messages and hear AI responses read aloud. This creates a more natural, accessible, and engaging conversation experience.

---

## Features

### 🎤 Voice Input (Speech-to-Text)
**Talk to the AI instead of typing**

- Click the microphone button to start recording
- Speak your message naturally
- Click again to stop recording
- Your speech is automatically converted to text
- Text appears in the input field
- Press Send or Enter to submit

**Visual Feedback:**
- Microphone button turns red when listening
- Pulsing animation indicates active recording
- "Listening..." status shown below input
- Input field shows "Listening..." placeholder

### 🔊 Voice Output (Text-to-Speech)
**Hear AI responses read aloud**

- AI responses are automatically spoken when received
- Natural-sounding voice synthesis
- Adjustable speech rate (0.9x for better comprehension)
- Automatic voice selection (prefers Google/Natural voices)

**Controls:**
- Speaker icon to toggle voice on/off
- Mute icon when voice is disabled
- "AI is speaking..." indicator when active
- Replay button on each AI message

### 🎛️ Voice Controls

**1. Voice Output Toggle**
- Location: Left side of input area
- Icon: 🔊 (enabled) / 🔇 (muted)
- Function: Enable/disable AI voice responses
- Tooltip: Shows current state

**2. Microphone Button**
- Location: Next to speaker icon
- Icon: 🎤 (ready) / 🎤❌ (listening)
- Function: Start/stop voice recording
- Animation: Pulses when listening
- Color: Red when active

**3. Message Replay**
- Location: On each AI message
- Icon: Small speaker icon
- Function: Replay that specific message
- Only visible when voice is enabled

---

## How to Use

### Voice Input (Speaking)

1. **Start Recording:**
   - Click the microphone button
   - Button turns red and pulses
   - "Listening..." appears below

2. **Speak Your Message:**
   - Speak clearly and naturally
   - No need to shout or speak slowly
   - Pause briefly when finished

3. **Stop Recording:**
   - Click the microphone button again
   - OR wait for automatic stop after silence
   - Your speech appears as text

4. **Send Message:**
   - Review the transcribed text
   - Edit if needed
   - Click Send or press Enter

### Voice Output (Listening)

1. **Enable Voice:**
   - Voice is enabled by default
   - Speaker icon shows 🔊
   - AI responses will be spoken automatically

2. **Hear AI Response:**
   - Send a message
   - AI responds with text
   - Voice automatically reads the response
   - "AI is speaking..." indicator shows

3. **Control Playback:**
   - Click speaker icon to mute/unmute
   - Voice stops immediately when muted
   - Replay any message using its replay button

4. **Replay Messages:**
   - Hover over any AI message
   - Click the small speaker icon
   - Message is read aloud again

---

## Technical Implementation

### Browser APIs Used

**1. Web Speech API - Speech Recognition**
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';
```

**2. Web Speech API - Speech Synthesis**
```javascript
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9;
utterance.pitch = 1.0;
utterance.volume = 1.0;
synth.speak(utterance);
```

### State Management

```javascript
const [isListening, setIsListening] = useState(false);    // Mic active
const [isSpeaking, setIsSpeaking] = useState(false);      // AI speaking
const [voiceEnabled, setVoiceEnabled] = useState(true);   // Voice on/off
const recognitionRef = useRef(null);                      // Speech recognition
const synthRef = useRef(null);                            // Speech synthesis
```

### Key Functions

**initializeVoice()**
- Sets up speech recognition and synthesis
- Configures event handlers
- Runs on component mount

**startListening()**
- Starts speech recognition
- Sets isListening to true
- Shows visual feedback

**stopListening()**
- Stops speech recognition
- Sets isListening to false
- Transcribes final result

**speakText(text)**
- Creates speech utterance
- Selects best available voice
- Speaks the text
- Updates isSpeaking state

**stopSpeaking()**
- Cancels current speech
- Sets isSpeaking to false

**toggleVoice()**
- Enables/disables voice output
- Stops current speech if muting

---

## Browser Compatibility

### Supported Browsers

✅ **Chrome/Edge (Desktop & Mobile)**
- Full support for speech recognition
- Full support for speech synthesis
- Best voice quality

✅ **Safari (Desktop & Mobile)**
- Full support for speech recognition
- Full support for speech synthesis
- Good voice quality

⚠️ **Firefox**
- Limited speech recognition support
- Full speech synthesis support
- May require user permission

❌ **Older Browsers**
- Graceful fallback to text-only
- Error messages shown
- No crashes or broken functionality

### Feature Detection

The app automatically detects browser capabilities:

```javascript
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  // Enable voice input
} else {
  // Show "Voice not supported" message
}

if ('speechSynthesis' in window) {
  // Enable voice output
}
```

---

## Accessibility Features

### For Users with Disabilities

**Visual Impairment:**
- Voice output allows hearing responses
- No need to read screen
- Audio feedback for all actions

**Motor Impairment:**
- Voice input eliminates typing
- Large, easy-to-click buttons
- Keyboard shortcuts supported

**Cognitive Accessibility:**
- Natural conversation flow
- Slower speech rate for comprehension
- Visual and audio feedback

### ARIA Labels

All voice controls include proper ARIA labels:
- `aria-label="Start voice input"`
- `aria-label="Mute voice"`
- `aria-label="Replay message"`

---

## User Experience

### Visual Indicators

**Listening State:**
- Red pulsing microphone button
- "Listening..." text below input
- Disabled text input field
- Red dot indicator

**Speaking State:**
- "AI is speaking..." text
- Pulsing brand-colored dot
- "Speaking" badge on message
- Active speaker icon

**Voice Enabled/Disabled:**
- Speaker icon (enabled)
- Muted speaker icon (disabled)
- Color change on toggle
- Tooltip shows state

### Animations

**Microphone Pulse:**
```css
animation: pulse 1.5s ease-in-out infinite
```

**Status Indicators:**
```css
animation: pulse 1s ease-in-out infinite
```

**Button Hover:**
```css
transform: scale(1.05)
transition: all 0.2s
```

---

## Error Handling

### Speech Recognition Errors

**No Speech Detected:**
- Silent failure (no error shown)
- User can try again
- Microphone resets

**Recognition Error:**
- Toast notification shown
- "Could not recognize speech"
- Microphone resets
- User can retry

**Browser Not Supported:**
- Toast notification shown
- "Voice not supported"
- Graceful fallback to text

### Speech Synthesis Errors

**Synthesis Fails:**
- Silent failure
- Text still visible
- User can use replay button

**No Voices Available:**
- Uses default system voice
- Still functional

---

## Performance Considerations

### Optimization

**Lazy Initialization:**
- Voice features only initialized when needed
- No performance impact on page load

**Singleton Pattern:**
- Single speech recognition instance
- Single speech synthesis instance
- Efficient resource usage

**Automatic Cleanup:**
- Speech stopped on component unmount
- Recognition stopped when not needed
- No memory leaks

### Resource Usage

**Speech Recognition:**
- Minimal CPU usage
- No network calls (on-device)
- Battery-friendly

**Speech Synthesis:**
- Minimal CPU usage
- On-device processing
- No API costs

---

## Privacy & Security

### Data Privacy

**Speech Recognition:**
- Processed on-device (Chrome/Safari)
- No data sent to external servers
- No recording stored
- Immediate transcription

**Speech Synthesis:**
- Processed on-device
- No data sent to external servers
- No audio stored

### User Control

- Voice features can be disabled
- No automatic recording
- User must click to start
- Clear visual feedback

---

## Future Enhancements

### Planned Features
- [ ] Multi-language support
- [ ] Voice selection (male/female, accents)
- [ ] Adjustable speech rate
- [ ] Continuous conversation mode
- [ ] Voice activity detection
- [ ] Noise cancellation
- [ ] Offline support
- [ ] Voice commands ("send", "clear", etc.)

### Advanced Features
- [ ] Emotion detection from voice
- [ ] Voice biometrics (optional)
- [ ] Custom wake words
- [ ] Voice-only mode (no text)
- [ ] Conversation recording (with consent)

---

## Troubleshooting

### Microphone Not Working

**Check:**
1. Browser permissions granted
2. Microphone connected
3. Microphone not used by other app
4. Browser supports speech recognition

**Solution:**
- Grant microphone permission
- Refresh the page
- Try different browser

### Voice Not Speaking

**Check:**
1. Voice toggle is enabled (🔊)
2. System volume is up
3. Browser supports speech synthesis
4. No other audio playing

**Solution:**
- Click speaker icon to enable
- Check system volume
- Try replay button on message

### Poor Recognition Quality

**Tips:**
- Speak clearly and naturally
- Reduce background noise
- Use good quality microphone
- Speak in shorter sentences

---

## Summary

The voice features make HearMe chat:
- ✅ More accessible
- ✅ More natural
- ✅ More engaging
- ✅ Hands-free capable
- ✅ Better for users with disabilities
- ✅ More like real conversation

**Perfect for mental health support where natural conversation is key!** 🎤🔊

