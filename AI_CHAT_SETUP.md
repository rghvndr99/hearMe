# AI-Powered Anonymous Chat Setup Guide

## Overview
The VoiceLap chat system provides anonymous, AI-powered mental health support using OpenAI's GPT-4 model. Users can have empathetic, mood-aware conversations without any registration or personal information.

---

## Features

### 🤖 AI-Powered Support
- **OpenAI GPT-4o-mini Integration**: Fast, cost-effective, empathetic responses
- **Mental Health Focused**: Trained with compassionate system prompts
- **Crisis Detection**: Automatically detects crisis situations and provides resources
- **Mood Analysis**: Real-time sentiment analysis of user messages

### 💬 Chat Experience
- **Anonymous**: No login, no registration, no personal data collected
- **Session-Based**: Each conversation gets a unique session ID
- **Real-Time**: Instant AI responses with typing indicators
- **Quick Replies**: AI-generated contextual quick reply suggestions
- **Message History**: Full conversation history within session

### 🎨 UI Features
- **Theme Integration**: Adapts to all 5 app themes
- **Smooth Animations**: Framer Motion animations for messages
- **Mood Badges**: Visual indicators of current emotional state
- **Responsive Design**: Works on all devices
- **Accessibility**: ARIA labels, keyboard navigation

---

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)
6. **Important**: Save it securely - you won't see it again!

### 2. Configure Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   PORT=5001
   FRONTEND_ORIGIN=http://localhost:5174
   ```

4. Install dependencies (if not already done):
   ```bash
   npm install
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   Server running on port 5001
   ```

### 3. Configure Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Create `.env` file (if not exists):
   ```bash
   cp .env.example .env
   ```

3. Verify `.env` contains:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

   You should see:
   ```
   Local: http://localhost:5174/
   ```

### 4. Test the Chat

1. Open browser to `http://localhost:5174/chat`
2. You should see a welcome message from the AI
3. Type a message and press Enter or click Send
4. AI should respond within 2-3 seconds

---

## API Endpoints

### Start Chat Session
```http
POST /api/ai-chat/session/start
```

**Response:**
```json
{
  "sessionId": "uuid-v4",
  "message": {
    "role": "assistant",
    "content": "Welcome message...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Send Message
```http
POST /api/ai-chat/message
Content-Type: application/json

{
  "sessionId": "uuid-v4",
  "message": "I'm feeling anxious today"
}
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "AI response...",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "sentiment": {
      "mood": "anxious",
      "intensity": "medium",
      "crisis": false
    }
  },
  "sentiment": {
    "mood": "anxious",
    "intensity": "medium",
    "crisis": false
  },
  "quickReplies": ["Tell me more", "I understand", "Thank you"],
  "crisis": false
}
```

### Get Session History
```http
GET /api/ai-chat/session/:sessionId
```

### End Session
```http
POST /api/ai-chat/session/end
Content-Type: application/json

{
  "sessionId": "uuid-v4"
}
```

**Response:**
```json
{
  "sessionId": "uuid-v4",
  "duration": 300000,
  "messageCount": 12,
  "summary": "Conversation summary...",
  "finalMood": "calm"
}
```

---

## How It Works

### 1. Session Initialization
- User visits `/chat` page
- Frontend calls `/api/ai-chat/session/start`
- Backend creates unique session ID
- AI generates warm welcome message
- Session stored in memory (Map)

### 2. Message Flow
```
User types message
  ↓
Frontend sends to /api/ai-chat/message
  ↓
Backend analyzes sentiment
  ↓
Backend sends to OpenAI with conversation history
  ↓
OpenAI generates empathetic response
  ↓
Backend returns response + sentiment + quick replies
  ↓
Frontend displays message with animations
```

### 3. Sentiment Analysis
- Each user message is analyzed for mood
- Moods: happy, sad, anxious, angry, neutral, mixed
- Intensity: low, medium, high
- Crisis detection: true/false

### 4. Crisis Handling
If crisis detected:
- AI provides empathetic response
- Includes crisis resources in message
- Frontend shows toast notification
- Resources provided:
  - National Suicide Prevention Lifeline: 988
  - Crisis Text Line: 741741
  - IASP website

---

## AI Configuration

### System Prompt
The AI is configured with a comprehensive system prompt that:
- Emphasizes empathy and compassion
- Provides guidelines for mental health support
- Instructs on crisis detection and response
- Maintains appropriate boundaries (no diagnosis)
- Matches user's emotional tone

### Model Settings
```javascript
{
  model: 'gpt-4o-mini',
  temperature: 0.7,        // Balanced creativity
  max_tokens: 200,         // Concise responses
  presence_penalty: 0.6,   // Encourage topic diversity
  frequency_penalty: 0.3   // Reduce repetition
}
```

### Conversation History
- Last 10 messages sent to OpenAI
- Maintains context for coherent conversation
- Reduces token usage
- Improves response relevance

---

## Cost Estimation

### OpenAI Pricing (GPT-4o-mini)
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

### Average Conversation
- 10 messages (user + AI)
- ~2,000 tokens total
- **Cost: ~$0.001 per conversation**

### Monthly Estimates
- 1,000 conversations: ~$1
- 10,000 conversations: ~$10
- 100,000 conversations: ~$100

**Very affordable for mental health support!**

---

## Security & Privacy

### Anonymous by Design
- No user accounts required
- No personal data collected
- No conversation data stored permanently
- Session IDs are random UUIDs

### Data Handling
- Conversations stored in memory only
- Deleted when session ends
- No database persistence (MVP)
- No logs of conversation content

### Production Recommendations
1. Add database for conversation archiving (encrypted)
2. Implement session expiration (24 hours)
3. Add rate limiting per IP
4. Use HTTPS only
5. Add content moderation
6. Implement data retention policies

---

## Troubleshooting

### "Failed to start chat session"
- Check backend is running on port 5001
- Verify `VITE_API_URL` in frontend/.env
- Check browser console for CORS errors

### "Failed to send message"
- Verify OpenAI API key is correct
- Check OpenAI account has credits
- Look at backend logs for errors
- Test API key with curl:
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```

### AI responses are slow
- Normal: 2-3 seconds
- Check internet connection
- Verify OpenAI API status
- Consider upgrading to GPT-3.5-turbo for faster responses

### Crisis detection not working
- Sentiment analysis uses separate API call
- Check OpenAI API logs
- Verify JSON response format
- Test with explicit crisis keywords

---

## Future Enhancements

### Planned Features
- [ ] Conversation persistence (database)
- [ ] Export conversation transcript
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Therapist handoff option
- [ ] Mood tracking over time
- [ ] Personalized coping strategies
- [ ] Integration with crisis hotlines

### Advanced AI Features
- [ ] Fine-tuned model for mental health
- [ ] Multi-turn context awareness
- [ ] Emotion detection from text patterns
- [ ] Proactive check-ins
- [ ] Resource recommendations based on conversation

---

## Support

### Getting Help
- Check backend logs: `npm run dev` output
- Check frontend console: Browser DevTools
- Test API endpoints with Postman/curl
- Review OpenAI API documentation

### Common Issues
1. **CORS errors**: Check FRONTEND_ORIGIN in backend/.env
2. **API key errors**: Verify key format (starts with sk-)
3. **Port conflicts**: Change PORT in .env files
4. **Missing dependencies**: Run `npm install` in both directories

---

## Summary

You now have a fully functional, AI-powered anonymous mental health chat system! 🎉

**Key Points:**
- ✅ OpenAI GPT-4o-mini integration
- ✅ Anonymous, session-based conversations
- ✅ Real-time sentiment analysis
- ✅ Crisis detection and resources
- ✅ Beautiful, theme-aware UI
- ✅ Cost-effective (~$0.001 per conversation)

**Next Steps:**
1. Add your OpenAI API key to backend/.env
2. Start both servers
3. Visit http://localhost:5174/chat
4. Start chatting!

For questions or issues, refer to the troubleshooting section above.

