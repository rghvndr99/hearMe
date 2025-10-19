import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Custom hook for text-to-speech synthesis
 * @param {string} language - Language code for speech
 * @param {boolean} enabled - Whether TTS is enabled
 * @returns {Object} Speech synthesis state and methods
 */
export const useSpeechSynthesis = (language, enabled = true) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [ttsEngine, setTtsEngine] = useState('browser'); // 'browser' or 'elevenlabs'
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load TTS engine preference
    const savedEngine = localStorage.getItem('hm-tts-engine');
    if (savedEngine) {
      setTtsEngine(savedEngine);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Speak text using browser TTS
   * @param {string} text - Text to speak
   */
  const speakWithBrowser = useCallback((text) => {
    if (!window.speechSynthesis || !enabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a voice for the selected language
    const voice = availableVoices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language, enabled, availableVoices]);

  /**
   * Speak text using ElevenLabs TTS
   * @param {string} text - Text to speak
   */
  const speakWithElevenLabs = useCallback(async (text) => {
    if (!enabled) return;

    try {
      setIsSpeaking(true);

      const response = await axios.post(
        `${API_URL}/api/tts/synthesize`,
        { text, language },
        { responseType: 'blob' }
      );

      const audioBlob = response.data;
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowser(text);
    }
  }, [language, enabled, speakWithBrowser]);

  /**
   * Speak text using the selected TTS engine
   * @param {string} text - Text to speak
   * @param {string} audioUrl - Optional pre-generated audio URL
   */
  const speak = useCallback((text, audioUrl = null) => {
    if (!enabled) return;

    // If audio URL is provided, use it directly
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      audio.play().catch(() => setIsSpeaking(false));
      return;
    }

    // Otherwise use the selected engine
    if (ttsEngine === 'elevenlabs') {
      speakWithElevenLabs(text);
    } else {
      speakWithBrowser(text);
    }
  }, [enabled, ttsEngine, speakWithBrowser, speakWithElevenLabs]);

  /**
   * Stop any ongoing speech
   */
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  /**
   * Change TTS engine
   * @param {string} engine - 'browser' or 'elevenlabs'
   */
  const changeTtsEngine = useCallback((engine) => {
    setTtsEngine(engine);
    localStorage.setItem('hm-tts-engine', engine);
  }, []);

  return {
    isSpeaking,
    availableVoices,
    ttsEngine,
    speak,
    stopSpeaking,
    changeTtsEngine,
  };
};

