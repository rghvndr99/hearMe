/**
 * Intent Detection Configuration
 * 
 * Customize your phone numbers, contact information, and custom responses here.
 * These responses will be used INSTEAD of calling OpenAI when specific intents are detected.
 */

// ========================================
// CONTACT INFORMATION
// ========================================
// 👇 CUSTOMIZE YOUR CONTACT DETAILS HERE
export const CONTACT_INFO = {
  // Main helpline phone number
  helplinePhone: '+91 8105568665',
  helplinePhoneNumeric: '+918105568665',
  
  // Crisis text line
  crisisTextNumber: '741741',
  crisisTextKeyword: 'HEARME',
  
  // Emergency services
  emergencyNumber: '911',
  suicidePreventionLine: '988',
  
  // Human counselor availability
  phoneHours: 'Mon-Fri 9am-9pm, Sat-Sun 10am-6pm (EST)',
  textHours: '24/7',
  crisisHours: '24/7',
  
  // Website and email (optional)
  website: 'https://hearme.com',
  email: 'rghvndr99@gmail.com',
};

// ========================================
// INTENT PATTERNS
// ========================================
// Add or modify patterns to detect different user intents
export const INTENT_PATTERNS = {
  
  // Intent: User wants to talk to a human
  talkToHuman: {
    patterns: [
      /\b(talk|speak|connect|contact)\s+(to|with)?\s*(a\s+)?(human|person|real\s+person|therapist|counselor|someone)\b/i,
      /\bi\s+(want|need|would\s+like)\s+(to\s+)?(talk|speak|connect)\s+(to|with)\s+(a\s+)?(human|person|real\s+person)\b/i,
      /\bcan\s+i\s+(talk|speak)\s+(to|with)\s+(a\s+)?(human|person|real\s+person)\b/i,
      /\bhuman\s+(help|support|assistance)\b/i,
      /\breal\s+person\b/i,
      /\bnot\s+(a\s+)?bot\b/i,
      /\bactual\s+(person|human)\b/i,
      /\blive\s+(agent|person|support)\b/i,
    ],
    // 👇 CUSTOMIZE YOUR RESPONSE HERE
    getResponse: (lang) => {
      const { helplinePhone, helplinePhoneNumeric, crisisTextKeyword, crisisTextNumber } = CONTACT_INFO;
      
      const responses = {
        'English': `I understand you'd like to speak with a human counselor. While I'm here to listen and support you 24/7, if you need professional human support, please:

📞 **Call our helpline:** ${helplinePhone} (${helplinePhoneNumeric})
💬 **Text:** '${crisisTextKeyword}' to ${crisisTextNumber}

Our trained counselors are available to help you. Is there anything I can assist you with in the meantime?`,

        'Spanish': `Entiendo que te gustaría hablar con un consejero humano. Aunque estoy aquí para escucharte y apoyarte 24/7, si necesitas apoyo humano profesional:

📞 **Llama a nuestra línea de ayuda:** ${helplinePhone} (${helplinePhoneNumeric})
💬 **Envía un mensaje de texto:** '${crisisTextKeyword}' al ${crisisTextNumber}

Nuestros consejeros capacitados están disponibles para ayudarte. ¿Hay algo en lo que pueda ayudarte mientras tanto?`,

        'French': `Je comprends que vous aimeriez parler à un conseiller humain. Bien que je sois là pour vous écouter et vous soutenir 24h/24 et 7j/7, si vous avez besoin d'un soutien humain professionnel:

📞 **Appelez notre ligne d'assistance:** ${helplinePhone} (${helplinePhoneNumeric})
💬 **Envoyez un SMS:** '${crisisTextKeyword}' au ${crisisTextNumber}

Nos conseillers formés sont disponibles pour vous aider. Y a-t-il quelque chose que je puisse faire pour vous en attendant?`,
      };
      
      const baseLang = lang.split('(')[0].trim();
      return responses[baseLang] || responses['English'];
    }
  },

  // Intent: Emergency/Crisis situation
  emergency: {
    patterns: [
      /\b(suicide|kill\s+myself|end\s+my\s+life|want\s+to\s+die|don't\s+want\s+to\s+live)\b/i,
      /\b(hurt\s+myself|self\s+harm|cutting|self\s+injury)\b/i,
      /\b(emergency|crisis|urgent\s+help|immediate\s+help)\b/i,
      /\bcan't\s+go\s+on\b/i,
      /\bno\s+reason\s+to\s+live\b/i,
    ],
    // 👇 CUSTOMIZE YOUR EMERGENCY RESPONSE HERE
    getResponse: (lang) => {
      const { emergencyNumber, suicidePreventionLine, crisisTextNumber } = CONTACT_INFO;
      
      const responses = {
        'English': `🚨 **I'm really concerned about you.** 

If you're in immediate danger, please:

🆘 **Call emergency services:** ${emergencyNumber}
📞 **National Suicide Prevention Lifeline:** ${suicidePreventionLine}
💬 **Crisis Text Line:** Text 'HELLO' to ${crisisTextNumber}

**You don't have to go through this alone** - help is available 24/7. These are trained professionals who care and want to help.

Would you like to talk about what you're feeling? I'm here to listen.`,

        'Spanish': `🚨 **Estoy realmente preocupado por ti.**

Si estás en peligro inmediato, por favor:

🆘 **Llama a servicios de emergencia:** ${emergencyNumber}
📞 **Línea Nacional de Prevención del Suicidio:** ${suicidePreventionLine}
💬 **Línea de Crisis por Texto:** Envía 'HELLO' al ${crisisTextNumber}

**No tienes que pasar por esto solo** - hay ayuda disponible 24/7. Estos son profesionales capacitados que se preocupan y quieren ayudar.

¿Te gustaría hablar sobre lo que sientes? Estoy aquí para escucharte.`,
      };
      
      const baseLang = lang.split('(')[0].trim();
      return responses[baseLang] || responses['English'];
    }
  },

  // Intent: Asking about pricing/cost
  pricing: {
    patterns: [
      /\b(how\s+much|cost|price|pricing|fee|charge|payment|afford)\b/i,
      /\b(is\s+it\s+free|free\s+service)\b/i,
      /\bdo\s+i\s+have\s+to\s+pay\b/i,
      /\bhow\s+much\s+does\s+it\s+cost\b/i,
    ],
    // 👇 CUSTOMIZE YOUR PRICING RESPONSE HERE
    getResponse: (lang) => {
      const responses = {
        'English': `HearMe is completely **free** to use! 🎉

✅ AI support available 24/7 at no cost
✅ No credit card required
✅ No hidden fees
✅ Completely anonymous

We believe mental health support should be accessible to everyone. If you need additional professional services, our human counselors offer sliding scale fees based on your ability to pay.

How can I support you today?`,

        'Spanish': `¡HearMe es completamente **gratuito**! 🎉

✅ Soporte de IA disponible 24/7 sin costo
✅ No se requiere tarjeta de crédito
✅ Sin tarifas ocultas
✅ Completamente anónimo

Creemos que el apoyo de salud mental debe ser accesible para todos. Si necesita servicios profesionales adicionales, nuestros consejeros humanos ofrecen tarifas escalonadas según su capacidad de pago.

¿Cómo puedo apoyarte hoy?`,
      };
      
      const baseLang = lang.split('(')[0].trim();
      return responses[baseLang] || responses['English'];
    }
  },

  // Intent: Asking about hours/availability
  hours: {
    patterns: [
      /\b(hours|open|available|when\s+can\s+i|what\s+time)\b/i,
      /\bare\s+you\s+(open|available)\b/i,
      /\b(24\/7|twenty\s+four\s+seven|all\s+day)\b/i,
    ],
    // 👇 CUSTOMIZE YOUR HOURS RESPONSE HERE
    getResponse: (lang) => {
      const { phoneHours, textHours, crisisHours } = CONTACT_INFO;
      
      const responses = {
        'English': `I'm available **24/7** - anytime, day or night! 🌙☀️

You can chat with me whenever you need support. Our human counselors are also available:

📞 **Phone:** ${phoneHours}
💬 **Text:** ${textHours}
🆘 **Crisis Line:** ${crisisHours}

How can I help you right now?`,

        'Spanish': `¡Estoy disponible **24/7** - en cualquier momento, día o noche! 🌙☀️

Puedes chatear conmigo cuando necesites apoyo. Nuestros consejeros humanos también están disponibles:

📞 **Teléfono:** ${phoneHours}
💬 **Texto:** ${textHours}
🆘 **Línea de Crisis:** ${crisisHours}

¿Cómo puedo ayudarte ahora mismo?`,
      };
      
      const baseLang = lang.split('(')[0].trim();
      return responses[baseLang] || responses['English'];
    }
  },

  // Intent: Asking about privacy/confidentiality
  privacy: {
    patterns: [
      /\b(private|privacy|confidential|anonymous|secret)\b/i,
      /\bwill\s+anyone\s+know\b/i,
      /\bis\s+this\s+(safe|secure)\b/i,
      /\bcan\s+you\s+keep\s+a\s+secret\b/i,
    ],
    // 👇 CUSTOMIZE YOUR PRIVACY RESPONSE HERE
    getResponse: (lang) => {
      const responses = {
        'English': `Your privacy is our top priority! 🔒

✅ **Completely anonymous** - No registration required
✅ **No personal data collected** - We don't ask for your name, email, or phone
✅ **Encrypted conversations** - Your messages are secure
✅ **No tracking** - We don't track or store your identity

You can share freely and safely. Everything you tell me stays between us.

What would you like to talk about?`,

        'Spanish': `¡Tu privacidad es nuestra máxima prioridad! 🔒

✅ **Completamente anónimo** - No se requiere registro
✅ **No se recopilan datos personales** - No pedimos tu nombre, correo electrónico o teléfono
✅ **Conversaciones encriptadas** - Tus mensajes son seguros
✅ **Sin seguimiento** - No rastreamos ni almacenamos tu identidad

Puedes compartir libremente y de forma segura. Todo lo que me digas queda entre nosotros.

¿De qué te gustaría hablar?`,
      };
      
      const baseLang = lang.split('(')[0].trim();
      return responses[baseLang] || responses['English'];
    }
  },

  // 👇 ADD YOUR OWN CUSTOM INTENTS HERE
  // Example:
  // customIntent: {
  //   patterns: [
  //     /your regex pattern here/i,
  //   ],
  //   getResponse: (lang) => {
  //     return "Your custom response here";
  //   }
  // },
};

// ========================================
// HELPER FUNCTION
// ========================================
/**
 * Detect intent from user message
 * @param {string} message - User's message
 * @param {string} language - User's language preference
 * @returns {object|null} - { intent: string, response: string, skipOpenAI: boolean } or null
 */
export function detectIntent(message, language = 'English') {
  for (const [intentName, intentConfig] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of intentConfig.patterns) {
      if (pattern.test(message)) {
        return {
          intent: intentName,
          response: intentConfig.getResponse(language),
          skipOpenAI: true,
        };
      }
    }
  }
  return null; // No intent detected
}

