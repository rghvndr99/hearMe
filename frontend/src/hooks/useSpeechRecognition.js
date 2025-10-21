import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for speech recognition (voice input)
 * @param {string} language - Language code for recognition
 * @param {Function} onResult - Callback when speech is recognized
 * @param {Function} onError - Error callback
 * @returns {Object} Speech recognition state and methods
 */
export const useSpeechRecognition = (language, onResult, onError) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) {
          onResult(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (onError) {
          onError({
            titleKey: "chat.toasts.voiceInputErrorTitle",
            descriptionKey: "chat.toasts.voiceInputErrorDesc",
            title: "Couldn't catch that 🎙️",
            description: "No problem! Speak a bit louder or try typing instead. We're here either way 💜",
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onResult, onError]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current && language) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      if (onError) {
        onError({
          titleKey: "chat.toasts.voiceNotSupportedTitle",
          descriptionKey: "chat.toasts.voiceNotSupportedDesc",
          title: "Voice not available on this browser 😔",
          description: "No worries! You can still type your message. We're listening with our hearts 💜",
        });
      }
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        if (onError) {
          onError({
            titleKey: "chat.toasts.voiceInputErrorTitle",
            descriptionKey: "chat.toasts.voiceInputErrorDesc",
            title: "Couldn't catch that 🎙️",
            description: "No problem! Speak a bit louder or try typing instead. We're here either way 💜",
          });
        }
      }
    }
  }, [isSupported, isListening, onError]);

  /**
   * Stop listening for voice input
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
      setIsListening(false);
    }
  }, [isListening]);

  /**
   * Toggle listening state
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
};

