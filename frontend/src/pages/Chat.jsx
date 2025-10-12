import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiAlertCircle, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiGlobe, FiChevronDown } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
import axios from "axios";

const MotionBox = motion(Box);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Supported languages with their codes and voice settings
const LANGUAGES = [
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

// Detect user's browser language and find matching language
const detectUserLanguage = () => {
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

const Chat = () => {
  // Initialize language from localStorage or auto-detect
  const getInitialLanguage = () => {
    const savedLang = localStorage.getItem('hm-language');
    if (savedLang) {
      const found = LANGUAGES.find(lang => lang.code === savedLang);
      if (found) return found;
    }
    // Auto-detect if no saved preference
    return detectUserLanguage();
  };

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage());
  const [availableVoices, setAvailableVoices] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    startChatSession();
    initializeVoice();

    // Show language detection notification on first visit
    const hasSeenLanguageNotification = localStorage.getItem('hm-language-notification');
    if (!hasSeenLanguageNotification) {
      toast({
        title: `Language Auto-Detected: ${selectedLanguage.flag} ${selectedLanguage.name}`,
        description: "You can change it anytime using the language selector.",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      localStorage.setItem('hm-language-notification', 'true');
    }
  }, []);

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hm-language', selectedLanguage.code);
  }, [selectedLanguage]);

  // Initialize speech recognition and synthesis
  const initializeVoice = () => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = selectedLanguage.code;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast({
            title: "Voice Input Error",
            description: "Could not recognize speech. Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        setAvailableVoices(voices);
      };

      loadVoices();

      // Chrome loads voices asynchronously
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  };

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage.code;
    }
  }, [selectedLanguage]);

  // Start voice recording
  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice input.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Stop voice recording
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Speak text using text-to-speech
  const speakText = (text) => {
    if (synthRef.current && voiceEnabled) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = selectedLanguage.code;

      // Get the best voice for the selected language
      const voices = availableVoices.length > 0 ? availableVoices : synthRef.current.getVoices();

      // Try to find a voice that matches the selected language
      const languageVoices = voices.filter(voice =>
        voice.lang.startsWith(selectedLanguage.code.split('-')[0])
      );

      // Prefer high-quality voices
      const preferredVoice = languageVoices.find(voice =>
        voice.name.includes('Google') ||
        voice.name.includes('Natural') ||
        voice.name.includes('Enhanced') ||
        voice.name.includes('Premium')
      ) || languageVoices.find(voice =>
        voice.lang === selectedLanguage.code
      ) || languageVoices[0] || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle voice output
  const toggleVoice = () => {
    if (voiceEnabled && isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const startChatSession = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/ai-chat/session/start`);
      setSessionId(response.data.sessionId);
      setMessages([response.data.message]);
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast({
        title: "Connection Error",
        description: "Failed to start chat session. Please refresh the page.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        language: selectedLanguage.name, // Send language name (e.g., "Spanish", "French")
      });

      const { message: aiMessage, quickReplies: newQuickReplies, crisis } = response.data;

      setMessages((prev) => [...prev, aiMessage]);
      setQuickReplies(newQuickReplies || []);

      // Speak AI response if voice is enabled
      if (voiceEnabled && aiMessage.content) {
        speakText(aiMessage.content);
      }

      if (crisis) {
        toast({
          title: "Support Resources Available",
          description: "If you're in crisis, please reach out: National Suicide Prevention Lifeline: 988",
          status: "warning",
          duration: 10000,
          isClosable: true,
          icon: <FiAlertCircle />,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
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
        h="calc(100vh - 80px)" // Subtract header height
        position="relative"
        zIndex={1}
        mt="80px"
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={6}
          mt="80px"
          borderBottom="1px solid var(--hm-border-glass)"
          className="hm-glass-card"
        >
          {/* Left: Logo and Title */}
          <VStack spacing={1} align="flex-start">
            <HStack spacing={2}>
              <Box
                as={BsRobot}
                fontSize="24px"
                color="var(--hm-color-brand)"
              />
              <Text fontSize="xl" fontWeight="700" color="var(--hm-color-text-primary)">
                HearMe Support
              </Text>
            </HStack>
            <Text fontSize="sm" color="var(--hm-color-text-secondary)">
              Anonymous & Confidential
            </Text>
          </VStack>

          {/* Right: Language Selector */}
          <Menu>
            <Tooltip label="Select your language" placement="bottom">
              <MenuButton
                as={Button}
                rightIcon={<FiChevronDown />}
                leftIcon={<FiGlobe />}
                variant="ghost"
                size="sm"
                color="var(--hm-color-text-primary)"
                _hover={{ bg: "var(--hm-hover-bg)" }}
                _active={{ bg: "var(--hm-hover-bg)" }}
              >
                <HStack spacing={2}>
                  <Text>{selectedLanguage.flag}</Text>
                  <Text display={{ base: "none", md: "block" }}>
                    {selectedLanguage.name.split(' ')[0]}
                  </Text>
                </HStack>
              </MenuButton>
            </Tooltip>
            <MenuList
              bg="var(--hm-bg-glass-strong)"
              backdropFilter="blur(20px)"
              border="1px solid var(--hm-border-glass)"
              maxH="400px"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--hm-border-glass)',
                  borderRadius: '10px',
                },
              }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                  bg={selectedLanguage.code === lang.code ? "var(--hm-hover-bg)" : "transparent"}
                  _hover={{ bg: "var(--hm-hover-bg)" }}
                  color="var(--hm-color-text-primary)"
                >
                  <HStack spacing={3} w="full">
                    <Text fontSize="lg">{lang.flag}</Text>
                    <Text flex="1">{lang.name}</Text>
                    {selectedLanguage.code === lang.code && (
                      <Badge colorScheme="green" variant="subtle">
                        Active
                      </Badge>
                    )}
                  </HStack>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        {/* Messages Area */}
        <Flex
          direction="column"
          flex="1"
          overflowY="auto"
          px={4}
          py={6}
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--hm-border-glass)',
              borderRadius: '10px',
            },
          }}
        >
          <VStack spacing={4} maxW="900px" mx="auto" w="full" align="stretch">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
                  maxW="75%"
                >
                  <Box
                    className="hm-glass-card"
                    px={5}
                    py={3}
                    borderRadius="2xl"
                    bg={
                      msg.role === "user"
                        ? "var(--hm-bg-glass-strong)"
                        : "var(--hm-bg-glass)"
                    }
                    borderLeft={
                      msg.role === "assistant"
                        ? "3px solid var(--hm-color-brand)"
                        : "none"
                    }
                    position="relative"
                  >
                    {/* Speaking indicator for AI messages */}
                    {msg.role === "assistant" && isSpeaking && index === messages.length - 1 && (
                      <HStack
                        position="absolute"
                        top={2}
                        right={2}
                        spacing={1}
                        bg="var(--hm-color-brand)"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        <FiVolume2 size={12} color="white" />
                        <Text fontSize="xs" color="white">Speaking</Text>
                      </HStack>
                    )}

                    <Text
                      fontSize="md"
                      color="var(--hm-color-text-primary)"
                      lineHeight="1.6"
                      whiteSpace="pre-wrap"
                    >
                      {msg.content}
                    </Text>
                    <HStack justify="space-between" mt={2}>
                      <Text
                        fontSize="xs"
                        color="var(--hm-color-text-secondary)"
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {/* Replay button for AI messages */}
                      {msg.role === "assistant" && voiceEnabled && (
                        <IconButton
                          icon={<FiVolume2 />}
                          size="xs"
                          variant="ghost"
                          color="var(--hm-color-text-secondary)"
                          _hover={{ color: "var(--hm-color-brand)" }}
                          onClick={() => speakText(msg.content)}
                          aria-label="Replay message"
                        />
                      )}
                    </HStack>
                  </Box>
                </MotionBox>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                alignSelf="flex-start"
                maxW="75%"
              >
                <Box
                  className="hm-glass-card"
                  px={5}
                  py={3}
                  borderRadius="2xl"
                  borderLeft="3px solid var(--hm-color-brand)"
                >
                  <HStack spacing={2}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="var(--hm-color-brand)"
                      animation="pulse 1.4s ease-in-out infinite"
                    />
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="var(--hm-color-brand)"
                      animation="pulse 1.4s ease-in-out 0.2s infinite"
                    />
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="var(--hm-color-brand)"
                      animation="pulse 1.4s ease-in-out 0.4s infinite"
                    />
                  </HStack>
                </Box>
              </MotionBox>
            )}

            <div ref={messagesEndRef} />
          </VStack>
        </Flex>

        {/* Quick Replies */}
        {quickReplies.length > 0 && !isTyping && (
          <Flex px={4} pb={2} justify="center">
            <HStack spacing={2} flexWrap="wrap" maxW="900px" justify="center">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  borderRadius="full"
                  px={4}
                  _hover={{
                    bg: "var(--hm-hover-bg)",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </HStack>
          </Flex>
        )}

        {/* Input Area */}
        <Box
          px={4}
          py={4}
          borderTop="1px solid var(--hm-border-glass)"
          className="hm-glass-card"
        >
          <VStack spacing={2} maxW="900px" mx="auto">
            {/* Language Indicator */}
            <HStack
              spacing={2}
              fontSize="xs"
              color="var(--hm-color-text-secondary)"
              alignSelf="flex-start"
            >
              <Text>{selectedLanguage.flag}</Text>
              <Text>Speaking in {selectedLanguage.name}</Text>
            </HStack>

            <HStack spacing={2} w="full">
              {/* Voice Output Toggle */}
              <Tooltip label={voiceEnabled ? "Mute AI voice" : "Enable AI voice"} placement="top">
                <IconButton
                  icon={voiceEnabled ? <FiVolume2 /> : <FiVolumeX />}
                  onClick={toggleVoice}
                  variant="ghost"
                  color={voiceEnabled ? "var(--hm-color-brand)" : "var(--hm-color-text-secondary)"}
                  _hover={{ bg: "var(--hm-hover-bg)" }}
                  size="lg"
                  aria-label={voiceEnabled ? "Mute voice" : "Enable voice"}
                />
              </Tooltip>

              {/* Voice Input Button */}
              <Tooltip
                label={isListening ? "Listening... Click to stop" : "Click to speak"}
                placement="top"
              >
                <IconButton
                  icon={isListening ? <FiMicOff /> : <FiMic />}
                  onClick={isListening ? stopListening : startListening}
                  variant="ghost"
                  color={isListening ? "red.500" : "var(--hm-color-text-primary)"}
                  bg={isListening ? "red.50" : "transparent"}
                  _hover={{ bg: isListening ? "red.100" : "var(--hm-hover-bg)" }}
                  size="lg"
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                  animation={isListening ? "pulse 1.5s ease-in-out infinite" : "none"}
                />
              </Tooltip>

              {/* Text Input */}
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type or speak your message..."}
                className="hm-input"
                _focus={{ borderColor: "var(--hm-color-brand)" }}
                borderRadius="full"
                size="lg"
                fontSize="md"
                disabled={isLoading || !sessionId || isListening}
                bg="var(--hm-bg-glass)"
              />

              {/* Send Button */}
              <IconButton
                icon={isLoading ? <Spinner size="sm" /> : <FiSend />}
                onClick={() => sendMessage()}
                isDisabled={!inputMessage.trim() || isLoading || !sessionId || isListening}
                bgGradient="var(--hm-gradient-cta)"
                _hover={{
                  bgGradient: "var(--hm-gradient-cta-hover)",
                  transform: "scale(1.05)",
                }}
                _active={{ transform: "scale(0.95)" }}
                color="white"
                borderRadius="full"
                size="lg"
                aria-label="Send message"
                transition="all 0.2s"
              />
            </HStack>

            {/* Voice Status Indicator */}
            {(isListening || isSpeaking) && (
              <HStack spacing={2} fontSize="sm" color="var(--hm-color-text-secondary)">
                {isListening && (
                  <HStack spacing={1}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="red.500"
                      animation="pulse 1s ease-in-out infinite"
                    />
                    <Text>Listening...</Text>
                  </HStack>
                )}
                {isSpeaking && (
                  <HStack spacing={1}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg="var(--hm-color-brand)"
                      animation="pulse 1s ease-in-out infinite"
                    />
                    <Text>AI is speaking...</Text>
                  </HStack>
                )}
              </HStack>
            )}
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Chat;