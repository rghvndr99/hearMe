import { useState, useEffect } from "react";
import { Box, Flex, useToast } from "@chakra-ui/react";
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
import { LANGUAGES } from "../constants/languages";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Main Chat page component - refactored and modular
 * Language is managed by the main Header component via i18n
 */
const Chat = () => {
  const { t, i18n } = useTranslation('common');
  const toast = useToast();

  // Get current language from i18n (synced with Header)
  const currentLanguage = LANGUAGES.find(lang => lang.code === (localStorage.getItem('hm-language') || 'en-US')) || LANGUAGES[0];

  // Chat state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoiceId, setSelectedVoiceId] = useState('browser');

  // Speech recognition hook
  const {
    isListening,
    toggleListening,
  } = useSpeechRecognition(
    currentLanguage.code,
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
    currentLanguage.code,
    voiceEnabled,
    selectedVoiceId
  );

  /**
   * Load user's voice preference from backend
   */
  useEffect(() => {
    const loadVoicePreference = async () => {
      const token = localStorage.getItem('hm-token');
      if (!token) {
        // Not logged in - use browser default
        setSelectedVoiceId('browser');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const voiceId = response.data?.user?.selectedVoiceId || 'browser';
        setSelectedVoiceId(voiceId);
      } catch (error) {
        console.error('Error loading voice preference:', error);
        // Fallback to browser default
        setSelectedVoiceId('browser');
      }
    };

    loadVoicePreference();
  }, []);

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
  }, []);

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
        language: currentLanguage.name,
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
   * Toggle voice output
   */
  const toggleVoice = () => {
    if (voiceEnabled && isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  /**
   * Handle voice change - save to backend
   */
  const handleVoiceChange = async (voiceId) => {
    setSelectedVoiceId(voiceId);

    const token = localStorage.getItem('hm-token');
    if (!token) {
      // Not logged in - just update local state
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/api/users/voice-preference`,
        { selectedVoiceId: voiceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Voice preference saved:', voiceId);
    } catch (error) {
      console.error('Error saving voice preference:', error);
      // Still update local state even if save fails
    }
  };

  return (
    <Box
      h="100vh"
      bg="var(--hm-color-bg)"
      position="relative"
      overflow="hidden"
    >
      {/* Fixed Header - Language managed by main Header component */}
      <ChatHeader
        voiceEnabled={voiceEnabled}
        onVoiceToggle={toggleVoice}
        selectedVoiceId={selectedVoiceId}
        onVoiceChange={handleVoiceChange}
      />

      {/* Main Chat Container */}
      <Flex
        direction="column"
        h="calc(100vh - 80px)"
        position="relative"
        zIndex={1}
        mt="80px"
        pt="80px"
      >
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

        {/* Input with bottom spacing */}
        <Box pb={4}>
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
        </Box>
      </Flex>
    </Box>
  );
};

export default Chat;

