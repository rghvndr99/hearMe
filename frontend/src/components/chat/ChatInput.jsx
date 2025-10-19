import React from 'react';
import { Flex, Input, IconButton, Tooltip, HStack, Badge, Box } from '@chakra-ui/react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

/**
 * Chat input component with send and voice input buttons
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Input change callback
 * @param {Function} props.onSend - Send message callback
 * @param {Function} props.onKeyPress - Key press callback
 * @param {boolean} props.isListening - Whether voice input is active
 * @param {Function} props.onVoiceToggle - Voice input toggle callback
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.placeholder - Input placeholder
 */
const ChatInput = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  isListening,
  onVoiceToggle,
  disabled = false,
  placeholder,
}) => {
  const { t } = useTranslation('common');

  return (
    <Flex
      direction="column"
      p={6}
      borderTop="1px solid var(--hm-border-glass)"
      className="hm-glass-card"
      gap={3}
    >
      {/* Listening Indicator */}
      {isListening && (
        <HStack justify="center">
          <Badge
            colorScheme="red"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            className="hm-recording-indicator"
          >
            <HStack spacing={2}>
              <Box
                as="span"
                w={2}
                h={2}
                borderRadius="full"
                bg="red.500"
                animation="pulse 1.5s ease-in-out infinite"
              />
              <span>{t('chat.listening', 'Listening...')}</span>
            </HStack>
          </Badge>
        </HStack>
      )}

      {/* Input Row */}
      <HStack spacing={2}>
        <Input
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder || t('chat.placeholder', 'Type your message...')}
          size="lg"
          variant="filled"
          bg="var(--hm-bg-input)"
          color="var(--hm-color-text-primary)"
          border="1px solid var(--hm-border-subtle)"
          _hover={{ borderColor: "var(--hm-color-brand)" }}
          _focus={{
            borderColor: "var(--hm-color-brand)",
            bg: "var(--hm-bg-input)",
          }}
          _placeholder={{ color: "var(--hm-color-text-tertiary)" }}
          isDisabled={disabled || isListening}
          className="hm-input"
        />

        {/* Voice Input Button */}
        <Tooltip
          label={
            isListening
              ? t('chat.tooltips.stopListening', 'Stop listening')
              : t('chat.tooltips.startListening', 'Start voice input')
          }
        >
          <IconButton
            icon={isListening ? <FiMicOff /> : <FiMic />}
            onClick={onVoiceToggle}
            colorScheme={isListening ? "red" : "blue"}
            variant={isListening ? "solid" : "ghost"}
            size="lg"
            aria-label={
              isListening
                ? t('chat.aria.stopListening', 'Stop listening')
                : t('chat.aria.startListening', 'Start voice input')
            }
            isDisabled={disabled}
          />
        </Tooltip>

        {/* Send Button */}
        <Tooltip label={t('chat.tooltips.sendMessage', 'Send message')}>
          <IconButton
            icon={<FiSend />}
            onClick={onSend}
            colorScheme="blue"
            size="lg"
            aria-label={t('chat.aria.sendMessage', 'Send message')}
            isDisabled={disabled || !value.trim() || isListening}
            className="hm-button-primary"
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default ChatInput;

