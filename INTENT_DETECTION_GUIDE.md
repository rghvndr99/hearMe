# 🧠 Intent Detection System - Complete Guide

## Overview

Your VoiceLap application now has an **intelligent intent detection system** that intercepts user messages BEFORE sending them to OpenAI. This allows you to provide instant, custom responses for specific user intents like "I want to talk to a human" without consuming OpenAI API credits.

---

## 🎯 How It Works

### **Flow Diagram:**

```
User sends message
       ↓
🧠 Intent Detection (FIRST)
       ↓
   ┌───────────────┐
   │ Intent Found? │
   └───────┬───────┘
           │
    ┌──────┴──────┐
    │             │
   YES           NO
    │             │
    ↓             ↓
Custom        OpenAI API
Response      (GPT-4o-mini)
    │             │
    └──────┬──────┘
           ↓
    Send to User
```

### **Key Benefits:**

✅ **Instant Responses** - No API latency for common questions  
✅ **Cost Savings** - Reduce OpenAI API calls  
✅ **Consistent Answers** - Same response every time for FAQs  
✅ **Custom Contact Info** - Your phone numbers, not generic advice  
✅ **Crisis Management** - Immediate emergency resources  

---

## 📁 File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── intentResponses.js    ← 👈 CUSTOMIZE YOUR RESPONSES HERE
│   ├── routes/
│   │   └── aiChat.js              ← Intent detection integrated
│   └── services/
│       └── openaiService.js       ← Exports detectIntent function
```

---

## 🛠️ How to Customize

### **Step 1: Edit Contact Information**

Open `backend/src/config/intentResponses.js` and update the `CONTACT_INFO` object:

```javascript
export const CONTACT_INFO = {
  // 👇 CHANGE THESE TO YOUR ACTUAL CONTACT DETAILS
  helplinePhone: '1-800-YOUR-NUMBER',
  helplinePhoneNumeric: '1-800-968-7686',
  
  crisisTextNumber: '741741',
  crisisTextKeyword: 'VOICELAP',
  
  emergencyNumber: '911',
  suicidePreventionLine: '988',
  
  phoneHours: 'Mon-Fri 9am-9pm, Sat-Sun 10am-6pm (EST)',
  textHours: '24/7',
  crisisHours: '24/7',
  
  website: 'https://yourdomain.com',
  email: 'support@yourdomain.com',
};
```

### **Step 2: Customize Responses**

Each intent has a `getResponse` function. Edit the responses:

```javascript
talkToHuman: {
  patterns: [
    /\b(talk|speak)\s+(to|with)\s+(a\s+)?human\b/i,
    // Add more patterns...
  ],
  getResponse: (lang) => {
    const { helplinePhone, helplinePhoneNumeric } = CONTACT_INFO;
    
    const responses = {
      'English': `I understand you'd like to speak with a human counselor.

📞 **Call:** ${helplinePhone} (${helplinePhoneNumeric})
💬 **Text:** 'VOICELAP' to 741741

Our trained counselors are available to help you.`,
      
      'Spanish': `Entiendo que te gustaría hablar con un consejero humano.

📞 **Llama:** ${helplinePhone} (${helplinePhoneNumeric})
💬 **Texto:** 'VOICELAP' al 741741`,
      
      // Add more languages...
    };
    
    const baseLang = lang.split('(')[0].trim();
    return responses[baseLang] || responses['English'];
  }
},
```

### **Step 3: Add New Intents**

Add your own custom intents at the bottom of `INTENT_PATTERNS`:

```javascript
// Example: Detect when user asks about insurance
insurance: {
  patterns: [
    /\b(insurance|coverage|covered|accept\s+insurance)\b/i,
    /\bdo\s+you\s+take\s+insurance\b/i,
  ],
  getResponse: (lang) => {
    return "Yes! We accept most major insurance plans including Blue Cross, Aetna, and UnitedHealthcare. Call us at 1-800-YOUR-NUMBER to verify your coverage.";
  }
},

// Example: Detect when user asks about appointments
appointment: {
  patterns: [
    /\b(appointment|schedule|book|make\s+an\s+appointment)\b/i,
  ],
  getResponse: (lang) => {
    return "To schedule an appointment, please visit https://yourdomain.com/book or call 1-800-YOUR-NUMBER. We have same-day appointments available!";
  }
},
```

---

## 🎨 Built-in Intents

### **1. Talk to Human**
**Triggers:** "I want to talk to a human", "real person", "not a bot"  
**Response:** Provides your helpline phone number and text line

### **2. Emergency/Crisis**
**Triggers:** "suicide", "kill myself", "self harm", "emergency"  
**Response:** Immediate crisis resources (911, 988, Crisis Text Line)

### **3. Pricing**
**Triggers:** "how much", "cost", "price", "is it free"  
**Response:** Explains that VoiceLap is free

### **4. Hours**
**Triggers:** "hours", "open", "available", "24/7"  
**Response:** Shows availability hours

### **5. Privacy**
**Triggers:** "private", "confidential", "anonymous", "secure"  
**Response:** Explains privacy and anonymity features

---

## 🧪 Testing

### **Test in Chat:**

1. Start your backend: `cd backend && npm start`
2. Start your frontend: `cd frontend && npm run dev`
3. Go to `/chat`
4. Try these messages:

```
✅ "I want to talk to a human"
✅ "How much does this cost?"
✅ "What are your hours?"
✅ "Is this private?"
✅ "I'm thinking about suicide" (crisis detection)
```

### **Check Backend Logs:**

You'll see console logs indicating intent detection:

```
✅ Intent detected: talkToHuman - Skipping OpenAI
📤 No intent detected - Calling OpenAI
```

---

## 🔍 How Intent Detection Works

### **Pattern Matching:**

Each intent has an array of regex patterns:

```javascript
patterns: [
  /\b(talk|speak|connect)\s+(to|with)?\s*(a\s+)?(human|person)\b/i,
  //  ↑ Word boundary
  //     ↑ Alternatives (talk OR speak OR connect)
  //                    ↑ Optional "to" or "with"
  //                                  ↑ Optional "a"
  //                                       ↑ human OR person
  //                                                        ↑ Case insensitive
],
```

### **Detection Process:**

1. User sends: "I want to talk to a human"
2. System checks each intent's patterns
3. Pattern matches: `/\b(talk)\s+(to)\s+(a\s+)?(human)\b/i`
4. Returns custom response immediately
5. **OpenAI is NOT called** (saves API credits!)

---

## 💰 Cost Savings Example

### **Without Intent Detection:**
- User: "How much does this cost?"
- System: Calls OpenAI API ($0.0001 per request)
- OpenAI: Generates response (2-3 seconds)
- Total: API cost + latency

### **With Intent Detection:**
- User: "How much does this cost?"
- System: Detects "pricing" intent
- Returns: Pre-defined response (instant!)
- Total: $0.00 + 0ms latency

**If 100 users ask about pricing per day:**
- Without: 100 API calls = $0.01/day = $3.65/year
- With: 0 API calls = $0.00/year
- **Plus instant responses!**

---

## 🌍 Multi-Language Support

Intent detection works in all 20+ languages:

```javascript
getResponse: (lang) => {
  const responses = {
    'English': "Your English response here",
    'Spanish': "Tu respuesta en español aquí",
    'French': "Votre réponse en français ici",
    'German': "Ihre Antwort auf Deutsch hier",
    'Portuguese': "Sua resposta em português aqui",
    'Chinese': "您的中文回复在这里",
    'Japanese': "ここにあなたの日本語の応答",
    'Korean': "여기에 한국어 응답",
    'Hindi': "यहाँ आपकी हिंदी प्रतिक्रिया",
    'Arabic': "ردك العربي هنا",
  };
  
  const baseLang = lang.split('(')[0].trim();
  return responses[baseLang] || responses['English'];
}
```

---

## 🚨 Crisis Detection

The `emergency` intent has special handling:

```javascript
emergency: {
  patterns: [
    /\b(suicide|kill\s+myself|end\s+my\s+life)\b/i,
    /\b(hurt\s+myself|self\s+harm|cutting)\b/i,
    /\b(emergency|crisis|urgent\s+help)\b/i,
  ],
  getResponse: (lang) => {
    return `🚨 **I'm really concerned about you.**

If you're in immediate danger:
🆘 Call 911
📞 National Suicide Prevention: 988
💬 Crisis Text Line: Text 'HELLO' to 741741

You don't have to go through this alone.`;
  }
},
```

**This response is sent IMMEDIATELY** - no waiting for OpenAI.

---

## 📊 Backend Integration

### **In `aiChat.js` Route:**

```javascript
// 🧠 STEP 1: Check for intent BEFORE calling OpenAI
const detectedIntent = detectIntent(message, userLanguage);

if (detectedIntent && detectedIntent.skipOpenAI) {
  // Intent detected! Use custom response
  console.log(`✅ Intent detected: ${detectedIntent.intent}`);
  aiResponseContent = detectedIntent.response;
  
} else {
  // No intent detected, proceed with OpenAI
  console.log('📤 No intent detected - Calling OpenAI');
  aiResponseContent = await generateResponse(recentMessages, userLanguage);
}
```

---

## 🎯 Best Practices

### **1. Keep Patterns Specific**
❌ Bad: `/\bhuman\b/i` (too broad, matches "human rights")  
✅ Good: `/\btalk\s+to\s+(a\s+)?human\b/i` (specific phrase)

### **2. Test Your Patterns**
Use [regex101.com](https://regex101.com/) to test patterns:
- Flavor: JavaScript
- Test strings: "I want to talk to a human", "Can I speak with a person?"

### **3. Order Matters**
Put more specific intents first:
```javascript
// ✅ Good order
emergency: { ... },      // Most specific
talkToHuman: { ... },    // Specific
hours: { ... },          // Less specific
```

### **4. Provide Fallback**
Always include English as fallback:
```javascript
return responses[baseLang] || responses['English'];
```

---

## 🔧 Troubleshooting

### **Intent Not Detecting:**

1. **Check pattern syntax:**
   ```javascript
   // ❌ Wrong
   patterns: [
     "talk to human"  // String, not regex!
   ]
   
   // ✅ Correct
   patterns: [
     /\btalk\s+to\s+human\b/i
   ]
   ```

2. **Check console logs:**
   ```bash
   cd backend
   npm start
   # Look for: "✅ Intent detected" or "📤 No intent detected"
   ```

3. **Test pattern in isolation:**
   ```javascript
   const pattern = /\btalk\s+to\s+human\b/i;
   console.log(pattern.test("I want to talk to a human")); // Should be true
   ```

### **Wrong Response Language:**

Check that language parameter is being passed correctly:
```javascript
// In aiChat.js
const userLanguage = conversation.language || 'English';
const detectedIntent = detectIntent(message, userLanguage);
```

---

## 📝 Summary

✅ **Intent detection intercepts messages BEFORE OpenAI**  
✅ **Customize responses in `backend/src/config/intentResponses.js`**  
✅ **Add your own intents easily**  
✅ **Saves API costs and reduces latency**  
✅ **Works in 20+ languages**  
✅ **Crisis detection provides immediate help**  

**Your VoiceLap app now intelligently handles common questions without calling OpenAI, while still using AI for complex emotional support!** 🎉

---

## 🚀 Next Steps

1. **Update contact info** in `intentResponses.js`
2. **Test all intents** in the chat interface
3. **Add custom intents** for your specific needs
4. **Monitor backend logs** to see which intents are being triggered
5. **Refine patterns** based on user behavior

**Questions? Check the code comments in `backend/src/config/intentResponses.js`!**

