# 🔍 Intent Detection Debugging Guide

## ✅ **Good News: Intent Detection IS Working!**

I've tested the intent detection system and it **works perfectly** in isolation. Here's the proof:

```bash
# Test results:
✅ "I want to talk to a human" → Intent: talkToHuman
✅ "i want to talk to human" → Intent: talkToHuman  
✅ "Can I speak with a real person?" → Intent: talkToHuman
✅ "I need human help" → Intent: talkToHuman
✅ "talk to a human" → Intent: talkToHuman
```

---

## 🧪 **How to Test Intent Detection**

### **Method 1: Run the Test Script**

```bash
node test-intent.mjs
```

This will show you all the intent patterns being tested.

### **Method 2: Test in the Chat Interface**

1. **Open the chat:** http://localhost:5174/chat
2. **Type one of these messages:**
   - "I want to talk to a human"
   - "I need to speak with a person"
   - "Can I talk to a real person?"
   - "human help"
   - "talk to a human"

3. **Watch the backend terminal** for these logs:
   ```
   🔍 Checking intent for message: "I want to talk to a human"
   🌐 User language: English
   🎯 Intent detection result: { intent: 'talkToHuman', response: '...', skipOpenAI: true }
   ✅ Intent detected: talkToHuman - Skipping OpenAI
   ```

4. **Expected Response:**
   ```
   I understand you'd like to speak with a human counselor. While I'm here to listen and support you 24/7, if you need professional human support, please:

   📞 **Call our helpline:** 1-800-HEARME (1-800-432-7631)
   💬 **Text:** 'HEARME' to 741741

   Our trained counselors are available to help you. Is there anything I can assist you with in the meantime?
   ```

---

## 🔧 **Debugging Steps**

### **Step 1: Check Backend is Running**

```bash
# Should show backend on port 5001
lsof -i:5001
```

### **Step 2: Check Backend Logs**

The backend now has detailed logging. When you send a message, you should see:

```
🔍 Checking intent for message: "YOUR MESSAGE HERE"
🌐 User language: English
🎯 Intent detection result: {...}
```

If you see:
- `✅ Intent detected: talkToHuman - Skipping OpenAI` → Intent detection worked!
- `📤 No intent detected - Calling OpenAI` → No pattern matched

### **Step 3: Check Frontend Network Tab**

1. Open DevTools (F12)
2. Go to Network tab
3. Send a message
4. Look for the request to `/api/ai-chat/message`
5. Check the **Request Payload**:
   ```json
   {
     "sessionId": "...",
     "message": "I want to talk to a human",
     "language": "English"
   }
   ```

6. Check the **Response**:
   ```json
   {
     "message": {
       "role": "assistant",
       "content": "I understand you'd like to speak with a human counselor...",
       "timestamp": "..."
     },
     "quickReplies": [],
     "crisis": false
   }
   ```

---

## 🎯 **Intent Patterns**

Here are all the patterns that trigger the "talkToHuman" intent:

### **Pattern 1:** "talk/speak/connect/contact to/with a human/person/therapist/counselor"
- ✅ "talk to a human"
- ✅ "speak with a person"
- ✅ "connect with a therapist"
- ✅ "contact a counselor"

### **Pattern 2:** "I want/need/would like to talk/speak/connect to/with a human/person"
- ✅ "I want to talk to a human"
- ✅ "I need to speak with a person"
- ✅ "I would like to connect with a human"

### **Pattern 3:** "Can I talk/speak to/with a human/person"
- ✅ "Can I talk to a human"
- ✅ "Can I speak with a person"

### **Pattern 4:** "human help/support/assistance"
- ✅ "human help"
- ✅ "human support"
- ✅ "human assistance"

### **Pattern 5:** "real person"
- ✅ "real person"
- ✅ "I want a real person"

### **Pattern 6:** "not a bot"
- ✅ "not a bot"
- ✅ "I don't want a bot"

### **Pattern 7:** "actual person/human"
- ✅ "actual person"
- ✅ "actual human"

### **Pattern 8:** "live agent/person/support"
- ✅ "live agent"
- ✅ "live person"
- ✅ "live support"

---

## 🐛 **Common Issues**

### **Issue 1: Backend Not Running**

**Symptom:** Frontend shows "Connection Error"

**Solution:**
```bash
# Kill any process on port 5001
lsof -ti:5001 | xargs kill -9

# Start backend
cd backend
npm run dev
```

### **Issue 2: No Logs Appearing**

**Symptom:** Backend terminal shows no logs when sending messages

**Solution:**
- Check that you're looking at the correct terminal
- Verify the backend restarted after code changes
- Type `rs` in the backend terminal to manually restart nodemon

### **Issue 3: Intent Not Detected**

**Symptom:** Backend logs show "📤 No intent detected - Calling OpenAI"

**Possible Causes:**
1. **Message doesn't match any pattern**
   - Try exact phrases like "I want to talk to a human"
   - Check the patterns list above

2. **Typo in the message**
   - Patterns are case-insensitive but spelling matters
   - "I want to tlak to a human" won't match (typo: "tlak")

3. **Extra characters**
   - Some patterns require word boundaries
   - "Iwanttotalktoa human" won't match (no spaces)

### **Issue 4: Getting OpenAI Response Instead of Custom Response**

**Symptom:** You get a generic AI response instead of the phone number

**Debug:**
1. Check backend logs for the intent detection result
2. Verify the message matches one of the patterns
3. Check that `detectIntent` is being called (should see 🔍 log)
4. Verify `detectedIntent.skipOpenAI` is `true`

---

## 📊 **Test All Intents**

### **1. Talk to Human**
```
Message: "I want to talk to a human"
Expected: Phone number and contact info
```

### **2. Emergency**
```
Message: "I want to kill myself"
Expected: Crisis hotline numbers (911, 988, etc.)
```

### **3. Pricing**
```
Message: "How much does this cost?"
Expected: "HearMe is completely free!"
```

### **4. Hours**
```
Message: "What are your hours?"
Expected: "I'm available 24/7"
```

### **5. Privacy**
```
Message: "Is this private?"
Expected: Privacy and anonymity information
```

---

## 🔍 **Advanced Debugging**

### **Test Intent Detection Directly**

Create a test file:

```javascript
// test-my-message.mjs
import { detectIntent } from './backend/src/config/intentResponses.js';

const myMessage = "YOUR MESSAGE HERE";
const result = detectIntent(myMessage, 'English');

console.log('Message:', myMessage);
console.log('Result:', result);
```

Run it:
```bash
node test-my-message.mjs
```

### **Check Regex Patterns**

Test a specific pattern:

```javascript
// test-pattern.mjs
const pattern = /\bi\s+(want|need|would\s+like)\s+(to\s+)?(talk|speak|connect)\s+(to|with)\s+(a\s+)?(human|person|real\s+person)\b/i;

const messages = [
  "I want to talk to a human",
  "Your custom message here",
];

messages.forEach(msg => {
  console.log(`"${msg}" → ${pattern.test(msg)}`);
});
```

Run it:
```bash
node test-pattern.mjs
```

---

## ✅ **Verification Checklist**

Before reporting an issue, verify:

- [ ] Backend is running on port 5001
- [ ] Frontend is running on port 5174
- [ ] Backend logs show "Server listening on 5001"
- [ ] You can see the chat interface at http://localhost:5174/chat
- [ ] You've started a chat session (should see welcome message)
- [ ] You're typing the message exactly as shown in the patterns
- [ ] Backend terminal shows the 🔍 log when you send a message
- [ ] You've checked the Network tab in DevTools

---

## 📝 **Example Debug Session**

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Output:
# ✅ OpenAI API Key loaded successfully
# Server listening on 5001

# Terminal 2: Test intent detection
node test-intent.mjs

# Output:
# ✅ Intent: talkToHuman

# Browser: Open http://localhost:5174/chat
# Type: "I want to talk to a human"
# Send message

# Terminal 1 (backend logs):
# 🔍 Checking intent for message: "I want to talk to a human"
# 🌐 User language: English
# 🎯 Intent detection result: { intent: 'talkToHuman', ... }
# ✅ Intent detected: talkToHuman - Skipping OpenAI

# Browser: Should see phone number response
```

---

## 🚀 **Next Steps**

1. **Test the system** using the methods above
2. **Check backend logs** to see what's happening
3. **Try different messages** from the patterns list
4. **Customize responses** in `backend/src/config/intentResponses.js`
5. **Add your own intents** following the existing pattern

---

## 📞 **Need Help?**

If intent detection still isn't working after following this guide:

1. **Share the backend logs** (copy the terminal output)
2. **Share the exact message** you're sending
3. **Share the Network tab** request/response from DevTools
4. **Run the test script** and share the output

---

**The intent detection system is working correctly. If you're not seeing it work in the chat, follow the debugging steps above to identify the issue!**

