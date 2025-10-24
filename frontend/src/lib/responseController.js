// HearMe Emotional & Multilingual AI Response Controller
// Builds a TTS-ready payload (without making network calls)
// Input:
// {
//   user_input: string,
//   system_reply: string,
//   theme: 'light' | 'dark' | 'emotional',
//   preferred_voice_id: string
// }
// Output:
// {
//   language: 'en' | 'hi' | 'mixed',
//   emotion: 'happy' | 'sad' | 'calm' | 'energetic' | 'angry' | 'empathetic',
//   voice_params: { style: string, stability: number, similarity_boost: number },
//   tts_request: { text: string, model_id: 'eleven_multilingual_v2', voice_id: string },
//   logs?: { detected_language: string, detected_emotion: string, theme_bias_applied: string, audio_duration_estimate: number }
// }

// Heuristic language detection utilities
const DEVANAGARI_RE = /[\u0900-\u097F]/g; // Hindi script
const ASCII_LETTERS_RE = /[A-Za-z]/g;       // English letters

const COMMON_HINGLISH_WORDS = [
  'hai','nahi','haan','kyu','kyun','kya','kaise','theek','thik','bilkul',
  'mujhe','tum','aap','main','hoon','mera','meri','mere','kar','karo','krdo',
  'acha','accha','bahut','thoda','mat','jana','sun','sunna'
];

function containsRomanizedHindi(text = '') {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  let hits = 0;
  for (const w of COMMON_HINGLISH_WORDS) {
    if (lower.includes(` ${w} `) || lower.startsWith(w + ' ') || lower.endsWith(' ' + w) || lower === w) {
      hits += 1;
      if (hits >= 2) return true;
    }
  }
  return false;
}

function detectLanguageForText(text = '') {
  if (!text || !text.trim()) return 'en'; // default
  const devMatches = text.match(DEVANAGARI_RE)?.length || 0;
  const asciiMatches = text.match(ASCII_LETTERS_RE)?.length || 0;
  const romanHi = containsRomanizedHindi(text);

  if (devMatches > 0 && asciiMatches > 0) return 'mixed';
  if (devMatches > 0) return 'hi';
  if (romanHi) return 'mixed';
  return 'en';
}

function resolveConversationLanguage(userInput = '', systemReply = '') {
  const userLang = detectLanguageForText(userInput);
  const replyLang = detectLanguageForText(systemReply);

  if (userLang === 'mixed' || replyLang === 'mixed') return { lang: 'mixed', userLang, replyLang, translationNeeded: false };
  if (userLang !== replyLang) return { lang: userLang, userLang, replyLang, translationNeeded: true };
  return { lang: userLang, userLang, replyLang, translationNeeded: false };
}

// Emotion detection (heuristic)
const EMOTION_KEYWORDS = {
  happy: ['happy','glad','great','good','joy','joyful','grateful','relieved','content','smile','excited','hopeful','cheerful'],
  sad: ['sad','down','depressed','lonely','upset','cry','crying','hurt','empty','miserable','grief','heartbroken'],
  energetic: ['energetic','pumped','motivated','let\'s go','can\'t wait','ready','hyped','charged'],
  angry: ['angry','mad','furious','pissed','hate','rage','fuming','annoyed','irritated','frustrated'],
  empathetic: ['pain','struggle','it hurts','sorry to hear','i\'m here','i am here','support you','with you','you\'re not alone','not alone'],
  calm: ['calm','peaceful','breathe','breathing','grounded','okay','it\'s okay','it is okay','soothe','relax']
};

function scoreEmotion(text = '') {
  const t = String(text).toLowerCase();
  const scores = {
    happy: 0, sad: 0, calm: 0, energetic: 0, angry: 0, empathetic: 0
  };
  for (const [emo, words] of Object.entries(EMOTION_KEYWORDS)) {
    for (const w of words) {
      const occurrences = t.split(w).length - 1;
      if (occurrences > 0) scores[emo] += occurrences;
    }
  }

  // Punctuation hints
  if (t.includes('!')) scores.energetic += 0.5;
  if (t.includes('...')) scores.sad += 0.5;

  // Choose max or default to empathetic
  const top = Object.entries(scores).sort((a,b) => b[1]-a[1])[0];
  return (top && top[1] > 0) ? top[0] : 'empathetic';
}

function detectDominantEmotion(userInput = '', systemReply = '') {
  // Analyze combined context
  const combined = `${userInput}\n${systemReply}`;
  let emotion = scoreEmotion(combined);

  // Anxiety heuristic -> bias to calm
  const anxiousHints = /(anxious|anxiety|worried|worry|panic|overwhelmed|stressed|tense)/i;
  if (anxiousHints.test(combined)) emotion = 'calm';

  return emotion;
}

// Map emotion to ElevenLabs params
function mapEmotionToVoiceParams(emotion) {
  switch (emotion) {
    case 'happy': return { style: 'excited', stability: 0.3, similarity_boost: 0.85 };
    case 'sad': return { style: 'empathetic', stability: 0.25, similarity_boost: 0.9 };
    case 'calm': return { style: 'narrative', stability: 0.4, similarity_boost: 0.8 };
    case 'energetic': return { style: 'friendly', stability: 0.2, similarity_boost: 0.85 };
    case 'angry': return { style: 'serious', stability: 0.15, similarity_boost: 0.9 };
    case 'empathetic':
    default:
      return { style: 'empathetic', stability: 0.25, similarity_boost: 0.9 };
  }
}


// Naive text translation placeholder (no-op)
// In production, supply a translator function that returns a Promise<string>.
async function defaultTranslate(text, _targetLang) {
  // TODO: integrate server-side translation via AI if needed.
  return text;
}

function estimateAudioDurationSeconds(text = '') {
  const words = String(text).trim().split(/\s+/).filter(Boolean).length;
  const wordsPerSecond = 160 / 60; // ~160 WPM
  return Number((words / wordsPerSecond).toFixed(1));
}

/**
 * Build TTS payload according to the spec
 * @param {Object} opts
 * @param {string} opts.user_input
 * @param {string} opts.system_reply
 * @param {'light'|'dark'|'emotional'} opts.theme
 * @param {string} opts.preferred_voice_id
 * @param {(text:string, targetLang:'en'|'hi')=>Promise<string>} [opts.translate]
 */
export async function buildTtsPayload(opts = {}) {
  const {
    user_input = '',
    system_reply = '',
    preferred_voice_id = 'browser',
    translate = defaultTranslate,
  } = opts;

  // Language detection and potential translation
  const langInfo = resolveConversationLanguage(user_input, system_reply);
  let finalText = system_reply;
  let themeBias = 'none';

  if (langInfo.translationNeeded && langInfo.lang !== 'mixed') {
    try {
      finalText = await translate(system_reply, langInfo.lang);
    } catch {
      finalText = system_reply; // fallback
    }
  }

  // Emotion detection (text-only; no theme modulation)
  const detectedEmotion = detectDominantEmotion(user_input, system_reply);
  const biasedEmotion = detectedEmotion; // no theme bias
  // themeBias remains 'none'

  // Map to ElevenLabs voice params
  const voiceParams = mapEmotionToVoiceParams(biasedEmotion);

  const payload = {
    language: langInfo.lang,
    emotion: biasedEmotion,
    voice_params: voiceParams,
    tts_request: {
      text: finalText,
      model_id: 'eleven_multilingual_v2',
      voice_id: preferred_voice_id,
    },
    logs: {
      detected_language: `${langInfo.userLang}/${langInfo.replyLang} -> ${langInfo.lang}${langInfo.translationNeeded ? ' (translated)' : ''}`,
      detected_emotion: detectedEmotion,
      theme_bias_applied: themeBias,
      audio_duration_estimate: estimateAudioDurationSeconds(finalText),
    }
  };

  return payload;
}

/**
 * Helper: Build body for backend /api/tts/eleven that supports ElevenLabs voice_settings
 * Returns { text, voiceId, voiceSettings }
 */
export function buildBackendTtsRequest(payload) {
  const { tts_request, voice_params } = payload || {};
  if (!tts_request) throw new Error('tts_request missing');
  const stability = Math.max(0, Math.min(1, Number(voice_params?.stability ?? 0.3)));
  const similarity = Math.max(0, Math.min(1, Number(voice_params?.similarity_boost ?? 0.85)));
  return {
    text: tts_request.text,
    voiceId: tts_request.voice_id,
    voiceSettings: {
      stability,
      similarity_boost: similarity,
      // Note: ElevenLabs voice_settings may not accept string styles directly; omitted here.
    }
  };
}

export default {
  buildTtsPayload,
  buildBackendTtsRequest,
};

