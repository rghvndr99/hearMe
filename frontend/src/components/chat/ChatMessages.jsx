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
const ChatMessages = ({ messages, isTyping }) => {
  const { t } = useTranslation('common');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <VStack
      flex={1}
      overflowY="auto"
      spacing={4}
      p={6}
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
          maxW="600px"
          mx="auto"
          mt={8}
        >
          <Box
            className="hm-glass-card"
            p={6}
            borderRadius="2xl"
            border="1px solid var(--hm-border-glass)"
            textAlign="center"
          >
            <VStack spacing={4} align="start">
              <Text fontSize="lg" fontWeight="600" color="var(--hm-color-text-primary)">
                {t('chat.welcome.greeting', 'Namaste 🙏 Welcome to your safe space.')}
              </Text>
              <Text fontSize="md" color="var(--hm-color-text-secondary)">
                {t('chat.welcome.intro', 'I\'m here to listen — no judgment, no pressure, just support.')}
              </Text>

              <Box w="full" textAlign="left">
                <Text fontSize="sm" fontWeight="600" color="var(--hm-color-text-primary)" mb={2}>
                  {t('chat.welcome.youCanTitle', 'You can:')}
                </Text>
                <VStack align="start" spacing={1}>
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

              <Text fontSize="sm" color="var(--hm-color-text-tertiary)" fontStyle="italic">
                {t('chat.welcome.validation', 'Whatever you\'re feeling — stress, sadness, confusion, loneliness — it\'s okay. You\'re not alone.')}
              </Text>

              <Text fontSize="md" fontWeight="600" color="var(--hm-color-brand)" mt={2}>
                {t('chat.welcome.question', 'Kya baat karni hai aaj? What\'s on your mind today?')}
              </Text>
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
            maxW="75%"
          >
            <Box
              className={
                message.role === "user"
                  ? "hm-chat-bubble hm-chat-bubble-user"
                  : "hm-chat-bubble hm-chat-bubble-ai"
              }
            >
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
          maxW="75%"
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

      <div ref={messagesEndRef} />
    </VStack>
  );
};

export default ChatMessages;

