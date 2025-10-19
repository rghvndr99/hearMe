import React, { useState, useEffect } from "react";
import { Box, Flex, useToast } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Custom hooks
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

// Components
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import QuickReplies from "../components/chat/QuickReplies";

// Constants and utilities
import { getInitialLanguage } from "../constants/languages";

const MotionBox = motion(Box);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Main Chat page component - refactored and modular
 */
const Chat = () => {
  const { t } = useTranslation('common');
  const toast = useToast();

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage());

  // Chat state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Speech recognition hook
  const {
    isListening,
    startListening,
    stopListening,
    toggleListening,
  } = useSpeechRecognition(
    selectedLanguage.code,
    (transcript) => {
      setInputMessage(transcript);
    },
    (error) => {
      toast({
        title: error.title,
        description: error.description,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  );

  // Speech synthesis hook
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis(
    selectedLanguage.code,
    voiceEnabled
  );

  /**
   * Initialize chat session
   */
  useEffect(() => {
    const startChatSession = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(`${API_URL}/api/ai-chat/session/start`);
        setSessionId(response.data.sessionId);
        setMessages([response.data.message]);
      } catch (error) {
        console.error('Error starting chat session:', error);
        toast({
          title: t('chat.toasts.connectionErrorTitle', 'Connection Error'),
          description: t('chat.toasts.connectionErrorDesc', 'Failed to start chat session. Please refresh the page.'),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    startChatSession();

    // Show language detection notification on first visit
    const hasSeenLanguageNotification = localStorage.getItem('hm-language-notification');
    if (!hasSeenLanguageNotification) {
      toast({
        title: `${selectedLanguage.flag} ${t('chat.toasts.languageDetectedTitle', 'Language detected')}`,
        description: t('chat.toasts.languageDetectedDesc', 'We detected your language. You can change it anytime.'),
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      localStorage.setItem('hm-language-notification', 'true');
    }
  }, []);

  /**
   * Save language preference
   */
  useEffect(() => {
    localStorage.setItem('hm-language', selectedLanguage.code);
  }, [selectedLanguage]);

  /**
   * Send message to AI
   */
  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || !sessionId) return;

    const userMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/ai-chat/message`, {
        sessionId,
        message: messageText,
        language: selectedLanguage.name,
      });

      const { message: aiMessage, quickReplies: newQuickReplies, crisis } = response.data;

      setMessages((prev) => [...prev, aiMessage]);
      setQuickReplies(newQuickReplies || []);

      // Speak AI response if voice is enabled
      if (voiceEnabled && aiMessage.content) {
        speak(aiMessage.content);
      }

      // Show crisis alert if detected
      if (crisis) {
        toast({
          title: t('chat.toasts.crisisTitle', 'Support Resources Available'),
          description: t('chat.toasts.crisisDesc', "If you're in crisis, please reach out: National Suicide Prevention Lifeline: 988"),
          status: "warning",
          duration: 10000,
          isClosable: true,
          icon: <FiAlertCircle />,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('chat.toasts.messageFailedTitle', 'Message Failed'),
        description: t('chat.toasts.messageFailedDesc', 'Could not send message. Please try again.'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handle key press in input
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * Handle quick reply click
   */
  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  /**
   * Handle language change
   */
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  /**
   * Toggle voice output
   */
  const toggleVoice = () => {
    if (voiceEnabled && isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <Box
      h="100vh"
      bg="var(--hm-color-bg)"
      position="relative"
      overflow="hidden"
    >
      {/* Animated Background */}
      <MotionBox
        position="absolute"
        top="-20%"
        left="-10%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-pink"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="70%"
        h="70%"
        className="hm-bg-gradient-blue"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Main Chat Container */}
      <Flex
        direction="column"
        h="calc(100vh - 80px)"
        position="relative"
        zIndex={1}
        mt="80px"
      >
        {/* Header */}
        <ChatHeader
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          voiceEnabled={voiceEnabled}
          onVoiceToggle={toggleVoice}
        />

        {/* Messages */}
        <ChatMessages messages={messages} isTyping={isTyping} />

        {/* Quick Replies */}
        {quickReplies.length > 0 && (
          <Box px={6}>
            <QuickReplies
              replies={quickReplies}
              onReplyClick={handleQuickReply}
              disabled={isLoading || isTyping}
            />
          </Box>
        )}

        {/* Input */}
        <ChatInput
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onSend={() => sendMessage()}
          onKeyPress={handleKeyPress}
          isListening={isListening}
          onVoiceToggle={toggleListening}
          disabled={isLoading}
          placeholder={t('chat.placeholder', 'Type your message...')}
        />
      </Flex>
    </Box>
  );
};

export default Chat;

