import React, { useRef, useEffect } from 'react';
import { VStack, Box, Text, Spinner, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);

/**
 * Chat messages list component with animations
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.isTyping - Whether AI is typing
 */
const ChatMessages = ({ messages, isTyping, userDisplayName, isAnonymous }) => {
  const { t } = useTranslation('common');
  const containerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    // Initial jump to bottom without animation
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping]);

  return (
    <VStack
      ref={containerRef}
      flex={1}
      overflowY="auto"
      spacing={4}
      p={6}
      pb={6}
      align="stretch"
      className="hm-chat-messages"
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
      {/* Welcome Message - shown when no messages yet */}
      {messages.length === 0 && !isTyping && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          alignSelf="flex-start"
          mt={4}
        >
          <Box className="hm-chat-bubble hm-chat-bubble-ai">
            <VStack spacing={3} align="start">
              <Text fontSize="md" whiteSpace="pre-wrap">
                {t('chat.welcome.greeting', 'Hi there � I\'m here to listen and support you. This is a safe, anonymous space where you can share whatever\'s on your mind. How are you feeling today?')}
              </Text>

              <Box w="full" pt={0}>
                <Text fontSize="sm" fontWeight="600" color="var(--hm-color-text-primary)" mb={2}>
                  {t('chat.welcome.youCanTitle', 'You can:')}
                </Text>
                <VStack align="start" spacing={1.5}>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('chat.welcome.feature1', '💬 Type in Hindi, English, or Hinglish')}
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('chat.welcome.feature2', '🎙️ Speak in your language (click the mic)')}
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('chat.welcome.feature3', '🔊 Hear responses in your chosen voice')}
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </Box>
        </MotionBox>
      )}

      <AnimatePresence>
        {messages.map((message, index) => (
          <MotionBox
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            alignSelf={message.role === "user" ? "flex-end" : "flex-start"}
          >
            <Box
              className={
                message.role === "user"
                  ? "hm-chat-bubble hm-chat-bubble-user"
                  : "hm-chat-bubble hm-chat-bubble-ai"
              }
            >
              {message.role === "user" && isAnonymous && userDisplayName ? (
                <Text fontSize="xs" fontWeight="600" color="var(--hm-color-text-secondary)" mb={1} textAlign="right">{userDisplayName}</Text>
              ) : null}
              <Text fontSize="md" whiteSpace="pre-wrap">
                {message.content}
              </Text>
              <Text
                fontSize="xs"
                mt={1}
                opacity={0.7}
                textAlign={message.role === "user" ? "right" : "left"}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Box>
          </MotionBox>
        ))}
      </AnimatePresence>

      {/* Typing Indicator */}
      {isTyping && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          alignSelf="flex-start"
        >
          <Box className="hm-chat-bubble hm-chat-bubble-ai">
            <HStack spacing={2}>
              <Spinner size="sm" color="var(--hm-color-brand)" />
              <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                {t('chat.typing', 'Thinking... give us a moment 💭')}
              </Text>
            </HStack>
          </Box>
        </MotionBox>
      )}

    </VStack>
  );
};

export default ChatMessages;

