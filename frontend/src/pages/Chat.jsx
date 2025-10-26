import { useState, useEffect } from "react";
import { Box, Flex, useToast, Text, HStack, Progress, Button } from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";


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
const ANON_LIMIT_MS = 5 * 60 * 1000; // 5 minutes per anonymous session

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
  const [micDisabled, setMicDisabled] = useState(true);
  const [chatUsage, setChatUsage] = useState(null);
  const [anonUsedMs, setAnonUsedMs] = useState(0);
  const [nearLimitNotified, setNearLimitNotified] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [flags, setFlags] = useState(null);


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
        title: error.titleKey ? t(error.titleKey, error.title) : error.title,
        description: error.descriptionKey ? t(error.descriptionKey, error.description) : error.description,
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
        // Fallback to browser default
        setSelectedVoiceId('browser');
      }
    };

    loadVoicePreference();
  }, []);

  /**
   * Load subscription/config and usage (for mic gating and usage bar)
   */
  useEffect(() => {
    const loadSubscription = async () => {
      const token = localStorage.getItem('hm-token');
      setIsAuthed(!!token);
      if (!token) {
        // Promo: mic gating disabled for anonymous users as well
        setMicDisabled(false);
        setChatUsage(null);
        setFlags(null);
        return;
      }
      try {
        const resp = await axios.get(`${API_URL}/api/subscriptions/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cfg = resp.data?.config;
        const usage = resp.data?.usage?.chatMinutes;
        const flagsResp = resp.data?.flags;
        setFlags(flagsResp || null);
        const micAllowed = (flagsResp?.enforce?.micGating === false) || (cfg?.features?.micEnabled?.enabled);
        setMicDisabled(!micAllowed);
        setChatUsage(usage || null);
      } catch (e) {
        // ignore
      }
    };
    loadSubscription();
  }, []);

  // Format milliseconds to M:SS
  const formatMs = (ms) => {
    const totalSec = Math.floor((ms || 0) / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Warn when nearing plan limit (80%) for authenticated users (disabled during promo when chat limits off)
  useEffect(() => {
    if (flags?.enforce?.chatLimits === false) return;
    if (chatUsage && typeof chatUsage.limit === 'number' && chatUsage.limit >= 0) {
      const ratio = chatUsage.limit ? (chatUsage.used / chatUsage.limit) : 0;
      if (ratio >= 0.8 && !nearLimitNotified) {
        toast({
          title: t('chat.toasts.nearLimitTitle', 'Almost out of time'),
          description: t('chat.toasts.nearPlanLimitDesc', 'You are nearing your chat minutes limit. Upgrade for more.'),
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        setNearLimitNotified(true);
      }
    }
  }, [chatUsage, flags]);

  /**
   * Initialize chat session
   */
  useEffect(() => {
    const startChatSession = async () => {
      try {
        setIsLoading(true);
        // Get UI language preference
        const uiLang = i18n.language || 'en';
        const token = localStorage.getItem('hm-token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.post(
          `${API_URL}/api/ai-chat/session/start`,
          { language: uiLang },
          { headers }
        );
        const sid = response.data.sessionId;
        setSessionId(sid);
        setMessages([response.data.message]);
        if (!token) {
          try { localStorage.setItem(`hm-anon-usedMs-${sid}`, '0'); } catch {}
          setAnonUsedMs(0);
          // Promo: mic gating disabled for anonymous users
          setMicDisabled(false);
        }
      } catch (error) {

        toast({
          title: t('chat.toasts.connectionErrorTitle', 'Oops! Connection issue 😔'),
          description: t('chat.toasts.connectionErrorDesc', 'We couldn\'t connect. Please refresh the page. Your privacy is still protected.'),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    startChatSession();
  }, [i18n.language]);

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
      // Attach auth header if available
      const token = localStorage.getItem('hm-token');

      // Anonymous session gating via localStorage (client-side UX)
      if (!token) {
        try {
          const usedMsStr = localStorage.getItem(`hm-anon-usedMs-${sessionId}`) || '0';
          const usedMs = parseInt(usedMsStr, 10) || 0;
          if (usedMs >= ANON_LIMIT_MS) {
            toast({
              title: t('chat.toasts.limitReachedTitle', 'Limit reached'),
              description: t('chat.toasts.anonLimitReached', 'You\'ve used 5 minutes of anonymous chat. Sign in to continue.'),
              status: 'info',
              duration: 5000,
              isClosable: true,
            });
            return;
          }
        } catch {}
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${API_URL}/api/ai-chat/message`,
        { sessionId, message: messageText, language: currentLanguage.name },
        { headers }
      );

      const { message: aiMessage, quickReplies: newQuickReplies, crisis, sessionEngagedMs, flags: flagsResp, usage, micAllowed } = response.data;

      setMessages((prev) => [...prev, aiMessage]);
      setQuickReplies(newQuickReplies || []);

      // Use server-provided flags/usage/mic gating to avoid extra GET
      if (token) {
        if (flagsResp) setFlags(flagsResp);
        if (typeof micAllowed === 'boolean') setMicDisabled(!micAllowed);
        if (usage?.chatMinutes) setChatUsage(usage.chatMinutes);
      }

      // Update anonymous usage from server-accurate engaged time
      if (!token && typeof sessionEngagedMs === 'number') {
        try {
          localStorage.setItem(`hm-anon-usedMs-${sessionId}`, String(sessionEngagedMs));
          setAnonUsedMs(sessionEngagedMs);
          if (sessionEngagedMs >= ANON_LIMIT_MS * 0.8 && sessionEngagedMs < ANON_LIMIT_MS) {
            toast({
              title: t('chat.toasts.nearLimitTitle', 'Almost out of time'),
              description: t('chat.toasts.nearLimitDesc', 'You\'re nearing the 5-minute anonymous chat limit. Sign in to keep going.'),
              status: 'warning',
              duration: 4000,
              isClosable: true,
            });
          }
        } catch {}
      }

      // Speak AI response if voice is enabled
      if (voiceEnabled && aiMessage.content) {
        speak(aiMessage.content);
      }

      // Show crisis alert if detected
      if (crisis) {
        toast({
          title: t('chat.toasts.crisisTitle', 'You\'re Not Alone — Help Is Available 💜'),
          description: t('chat.toasts.crisisDesc', 'If you\'re in crisis, please reach out immediately:\n\n🇮🇳 India:\n• AASRA: 9820466726\n• Vandrevala Foundation: 1860 2662 345\n• iCall: 9152987821\n\n🌍 International:\n• Suicide Prevention Lifeline: 988\n\nYou matter. Your life matters. Please reach out.'),
          status: "warning",
          duration: 15000,
          isClosable: true,
          icon: <FiAlertCircle />,
        });
      }
    } catch (error) {
      // Handle plan/anon limit reached gracefully
      const resp = error?.response;
      if (resp && resp.status === 403) {
        const msg = resp.data?.message || t('chat.toasts.limitReachedDesc', 'Your chat limit has been reached. Upgrade or sign in to continue.');
        toast({
          title: t('chat.toasts.limitReachedTitle', 'Limit reached'),
          description: msg,
          status: 'info',
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          title: t('chat.toasts.messageFailedTitle', 'Message didn\'t go through 😔'),
          description: t('chat.toasts.messageFailedDesc', 'No worries! Try sending again. Your message is safe with us.'),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
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

    } catch (error) {

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
        micDisabled={micDisabled}
      />

      {/* Main Chat Container */}
      <Flex
        direction="column"
        h="calc(100vh - 80px)"
        position="relative"
        zIndex={1}
        mt="80px"
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
        {/* Usage indicator */}
        {isAuthed ? (
          chatUsage ? (
            (flags?.enforce?.chatLimits === false) ? (
              <Box px={6} pb={2}>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">{t('chat.promo.unmetered', 'Promo: chat minutes not enforced yet')}</Text>
              </Box>
            ) : (
              (typeof chatUsage.limit === 'number' && chatUsage.limit >= 0) ? (
                <Box px={6} pb={2}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                      {t('profile.usage.chatMinutes', 'Chat minutes')} — {chatUsage.used}/{chatUsage.limit} {chatUsage.period === 'week' ? t('profile.usage.thisWeek', 'this week') : t('profile.usage.thisMonth', 'this month')}
                    </Text>
                    <Button as={RouterLink} to="/pricing" size="xs" variant="outline" color="var(--hm-color-text-primary)" borderColor="var(--hm-border-subtle)" _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}>
                      {t('chat.usage.upgradePrompt', 'Upgrade for more')}
                    </Button>
                  </HStack>
                  <Progress
                    value={Math.min(100, Math.round((chatUsage.used / Math.max(1, chatUsage.limit)) * 100))}
                    size="sm"
                    colorScheme={(chatUsage.limit && (chatUsage.used / chatUsage.limit) >= 0.8) ? 'orange' : 'purple'}
                    borderRadius="md"
                  />
                </Box>
              ) : (
                <Box px={6} pb={2}>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">{t('chat.usage.unlimited', 'Unlimited chat')}</Text>
                </Box>
              )
            )
          ) : null
        ) : (
          <Box px={6} pb={2}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" color="var(--hm-color-text-secondary)">{`${formatMs(anonUsedMs)} / 5:00 ${t('chat.usage.used', 'used')}`}</Text>
              <HStack>
                <Button as={RouterLink} to="/login" size="xs" variant="outline" color="var(--hm-color-text-primary)" borderColor="var(--hm-border-subtle)" _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}>{t('auth.signIn', 'Sign in')}</Button>
                <Button as={RouterLink} to="/pricing" size="xs" variant="outline" color="var(--hm-color-text-primary)" borderColor="var(--hm-border-subtle)" _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}>{t('chat.usage.upgradePrompt', 'See plans')}</Button>
              </HStack>
            </HStack>
            <Progress
              value={Math.min(100, Math.round(((anonUsedMs || 0) / ANON_LIMIT_MS) * 100))}
              size="sm"
              colorScheme={(anonUsedMs / ANON_LIMIT_MS) >= 0.8 ? 'orange' : 'purple'}
              borderRadius="md"
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
            micDisabled={micDisabled}
          />
        </Box>
      </Flex>
    </Box>
  );
};

export default Chat;

