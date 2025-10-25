import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Custom hook for managing chat session and messages
 * @param {Function} onError - Error callback
 * @returns {Object} Chat state and methods
 */
export const useChat = (onError) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);

  /**
   * Initialize chat session
   */
  const initializeSession = useCallback(async () => {
    try {
      const response = await axios.post(`${API_URL}/api/chat/session`);
      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);

      // Add welcome message
      setMessages([
        {
          id: Date.now(),
          text: response.data.welcomeMessage || "Hello! I'm here to listen. How are you feeling today?",
          sender: "ai",
          timestamp: new Date().toISOString(),
        },
      ]);

      // Set initial quick replies if provided
      if (response.data.quickReplies) {
        setQuickReplies(response.data.quickReplies);
      }
    } catch (error) {

      if (onError) {
        onError({
          title: "Connection Error",
          description: "Failed to start chat session. Please refresh the page.",
        });
      }
    }
  }, [onError]);

  /**
   * Send a message to the AI
   * @param {string} messageText - The message to send
   * @param {string} language - Language code
   */
  const sendMessage = useCallback(async (messageText, language = 'en-US') => {
    if (!messageText.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    setQuickReplies([]);

    try {
      const response = await axios.post(`${API_URL}/api/chat/message`, {
        sessionId,
        message: messageText,
        language,
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: "ai",
        timestamp: new Date().toISOString(),
        sentiment: response.data.sentiment,
        audioUrl: response.data.audioUrl,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.data.quickReplies) {
        setQuickReplies(response.data.quickReplies);
      }

      return aiMessage;
    } catch (error) {

      if (onError) {
        onError({
          title: "Message Failed",
          description: "Could not send message. Please try again.",
        });
      }
      return null;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [sessionId, onError]);

  /**
   * Clear all messages and reset session
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setQuickReplies([]);
    setSessionId(null);
  }, []);

  /**
   * Handle quick reply selection
   * @param {string} reply - The quick reply text
   * @param {string} language - Language code
   */
  const handleQuickReply = useCallback((reply, language) => {
    return sendMessage(reply, language);
  }, [sendMessage]);

  return {
    sessionId,
    messages,
    isLoading,
    isTyping,
    quickReplies,
    initializeSession,
    sendMessage,
    clearMessages,
    handleQuickReply,
  };
};

