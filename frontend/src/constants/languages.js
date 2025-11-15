/**
 * Supported languages configuration for the chat interface
 * Each language includes code, display name, flag emoji, and voice settings
 */
export const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', voiceName: 'en-US' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', voiceName: 'en-GB' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸', voiceName: 'es-ES' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽', voiceName: 'es-MX' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷', voiceName: 'fr-FR' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', voiceName: 'de-DE' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹', voiceName: 'it-IT' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷', voiceName: 'pt-BR' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹', voiceName: 'pt-PT' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺', voiceName: 'ru-RU' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', voiceName: 'ja-JP' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', voiceName: 'ko-KR' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', voiceName: 'zh-CN' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', voiceName: 'zh-TW' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', voiceName: 'hi-IN' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', voiceName: 'ar-SA' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱', voiceName: 'nl-NL' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱', voiceName: 'pl-PL' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷', voiceName: 'tr-TR' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪', voiceName: 'sv-SE' },
];

/**
 * Detect user's browser language and find matching language from supported list
 * @returns {Object} Matched language object or default (English US)
 */
export const detectUserLanguage = () => {
  // Get browser language (e.g., 'en-US', 'es-ES', 'fr-FR')
  const browserLang = navigator.language || navigator.userLanguage || 'en-US';

  // Try exact match first
  let matchedLang = LANGUAGES.find(lang => lang.code === browserLang);

  // If no exact match, try matching just the language part (e.g., 'en' from 'en-US')
  if (!matchedLang) {
    const langPrefix = browserLang.split('-')[0];
    matchedLang = LANGUAGES.find(lang => lang.code.startsWith(langPrefix));
  }

  // Default to English (US) if no match found
  return matchedLang || LANGUAGES[0];
};

/**
 * Get initial language from localStorage or auto-detect
 * @returns {Object} Language object
 */
export const getInitialLanguage = () => {
  const savedLang = localStorage.getItem('vl-language');
  if (savedLang) {
    const found = LANGUAGES.find(lang => lang.code === savedLang);
    if (found) return found;
  }
  // Auto-detect if no saved preference
  return detectUserLanguage();
};

