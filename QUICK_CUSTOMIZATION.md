# 🚀 Quick Customization Guide

## Change Your Phone Number & Contact Info

### **File to Edit:**
```
backend/src/config/intentResponses.js
```

### **What to Change:**

```javascript
export const CONTACT_INFO = {
  // 👇 CHANGE THESE VALUES
  helplinePhone: '1-800-YOUR-NUMBER',           // Your vanity number
  helplinePhoneNumeric: '1-800-968-7686',       // Numeric version
  
  crisisTextNumber: '741741',                    // Text line number
  crisisTextKeyword: 'HEARME',                   // Keyword to text
  
  emergencyNumber: '911',                        // Emergency services
  suicidePreventionLine: '988',                  // Crisis hotline
  
  phoneHours: 'Mon-Fri 9am-9pm, Sat-Sun 10am-6pm (EST)',
  textHours: '24/7',
  crisisHours: '24/7',
  
  website: 'https://yourdomain.com',
  email: 'support@yourdomain.com',
};
```

### **That's It!**

All responses will automatically use your new contact information across all 20+ languages!

---

## Test It

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `/chat`
4. Type: **"I want to talk to a human"**
5. You should see your phone number in the response!

---

## Add Custom Intents

### **Example: Insurance Questions**

Add this to `INTENT_PATTERNS` in `intentResponses.js`:

```javascript
insurance: {
  patterns: [
    /\b(insurance|coverage|accept\s+insurance)\b/i,
  ],
  getResponse: (lang) => {
    return "Yes! We accept most major insurance. Call 1-800-YOUR-NUMBER to verify coverage.";
  }
},
```

Now when users ask "Do you accept insurance?", they get an instant response!

---

## See Full Documentation

Read `INTENT_DETECTION_GUIDE.md` for complete details.

