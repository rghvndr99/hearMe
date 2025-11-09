import React from 'react';
import { Flex, Textarea, IconButton, Tooltip, HStack, Badge, Box } from '@chakra-ui/react';
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
  micDisabled = false,
  cid,
}) => {
  const { t } = useTranslation('common');

  return (
    <Flex
      direction="column"
      p={{ base: 3 }}
      className={`hm-glass-card${cid ? ` hm-cid-${cid}` : ''}`}
      gap={{ base: 2, md: 3 }}
      border="none"
      data-cid={cid}
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

      {/* Textarea with mobile overlay actions */}
      <Box position="relative">
        <Textarea
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={
            isListening
              ? t('chat.placeholderListening', 'Bol rahe hain... We\'re listening 🎙️')
              : (placeholder || t('chat.placeholder', 'Kuch bhi bolo... Type or speak, we\'re listening 💜'))
          }
          minH="150px"
          resize="vertical"
          variant="filled"
          bg="var(--hm-bg-input)"
          color="var(--hm-color-text-primary)"
          border="1px solid var(--hm-border-subtle)"
          pr="88px"
          pb="56px"
          _hover={{ borderColor: "var(--hm-color-brand)" }}
          _focus={{
            borderColor: "var(--hm-color-brand)",
            bg: "var(--hm-bg-input)",
          }}
          _placeholder={{ color: "var(--hm-color-text-tertiary)" }}
          isDisabled={disabled || isListening}
          className="hm-input"
        />

        {/* Mobile overlay actions (no extra row space) */}
        <HStack
          spacing={2}
          position="absolute"
          bottom="8px"
          right="8px"
          display="flex"
        >
          <Tooltip
            label={
              micDisabled
                ? t('chat.mic.upgradeToEnable', 'Microphone is disabled on the free plan. Upgrade to enable voice input.')
                : (isListening
                  ? t('chat.tooltips.stopListening', '✋ Stop listening (click again to speak)')
                  : t('chat.tooltips.startListening', '🎙️ Speak in Hindi, English, or Hinglish — we understand all')
                )
            }
          >
            <IconButton
              icon={isListening ? <FiMicOff /> : <FiMic />}
              onClick={onVoiceToggle}
              variant={isListening ? 'solid' : 'ghost'}
              size="md"
              color={isListening ? 'white' : 'var(--hm-color-text-muted)'}
              bg={isListening ? 'red.500' : 'transparent'}
              _hover={{
                color: isListening ? 'white' : 'var(--hm-color-brand)',
                bg: isListening ? 'red.600' : 'var(--hm-bg-glass)'
              }}
              aria-label={
                micDisabled
                  ? t('chat.mic.upgradeToEnable', 'Upgrade to enable microphone')
                  : (isListening
                    ? t('chat.aria.stopListening', 'Stop voice input')
                    : t('chat.aria.startVoice', 'Start voice input in your language')
                  )
              }
              isDisabled={disabled || micDisabled}
            />
          </Tooltip>

          <Tooltip label={t('chat.tooltips.sendMessage', 'Send (or press Enter) 💬')}>
            <IconButton
              icon={<FiSend />}
              onClick={onSend}
              size="md"
              bgGradient="var(--hm-gradient-cta)"
              color="white"
              _hover={{ opacity: 0.9 }}
              _disabled={{
                bgGradient: 'none',
                bg: 'var(--hm-bg-glass)',
                color: 'var(--hm-color-text-muted)',
                opacity: 0.5
              }}
              aria-label={t('chat.aria.send', 'Send your message to HearMe AI')}
              isDisabled={disabled || !value.trim() || isListening}
            />
          </Tooltip>
        </HStack>
      </Box>

      {/* Buttons row */}
      <HStack spacing={2} justify="flex-end" display="none">
        {/* Voice Input Button */}
        <Tooltip
          label={
            micDisabled
              ? t('chat.mic.upgradeToEnable', 'Microphone is disabled on the free plan. Upgrade to enable voice input.')
              : (isListening
                ? t('chat.tooltips.stopListening', '✋ Stop listening (click again to speak)')
                : t('chat.tooltips.startListening', '🎙️ Speak in Hindi, English, or Hinglish — we understand all')
              )
          }
        >
          <IconButton
            icon={isListening ? <FiMicOff /> : <FiMic />}
            onClick={onVoiceToggle}
            variant={isListening ? "solid" : "ghost"}
            size="lg"
            color={isListening ? 'white' : 'var(--hm-color-text-muted)'}
            bg={isListening ? 'red.500' : 'transparent'}
            _hover={{
              color: isListening ? 'white' : 'var(--hm-color-brand)',
              bg: isListening ? 'red.600' : 'var(--hm-bg-glass)'
            }}
            aria-label={
              micDisabled
                ? t('chat.mic.upgradeToEnable', 'Upgrade to enable microphone')
                : (isListening
                  ? t('chat.aria.stopListening', 'Stop voice input')
                  : t('chat.aria.startVoice', 'Start voice input in your language')
                )
            }
            isDisabled={disabled || micDisabled}
          />
        </Tooltip>

        {/* Send Button */}
        <Tooltip label={t('chat.tooltips.sendMessage', 'Send (or press Enter) 💬')}>
          <IconButton
            icon={<FiSend />}
            onClick={onSend}
            size="lg"
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            _hover={{ opacity: 0.9 }}
            _disabled={{
              bgGradient: 'none',
              bg: 'var(--hm-bg-glass)',
              color: 'var(--hm-color-text-muted)',
              opacity: 0.5
            }}
            aria-label={t('chat.aria.send', 'Send your message to HearMe AI')}
            isDisabled={disabled || !value.trim() || isListening}
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default ChatInput;

