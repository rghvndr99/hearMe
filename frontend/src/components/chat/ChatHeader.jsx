import React, { useState } from 'react';
import { Box, Flex, VStack, HStack, Text, IconButton, Collapse } from '@chakra-ui/react';
import { BsRobot, BsInfoCircle } from 'react-icons/bs';
import VoiceControls from './VoiceControls';
import VoiceSelector from './VoiceSelector';
import { useTranslation } from 'react-i18next';

/**
 * Chat header component with voice controls
 * Language is managed by the main Header component
 * @param {Object} props
 * @param {boolean} props.voiceEnabled - Whether voice is enabled
 * @param {Function} props.onVoiceToggle - Voice toggle callback
 * @param {string} props.selectedVoiceId - Currently selected voice ID for TTS
 * @param {Function} props.onVoiceChange - Voice change callback
 * @param {string} [props.subtitle] - Optional subtitle (e.g., anonymous display name)
 */
const ChatHeader = ({
  voiceEnabled,
  onVoiceToggle,
  selectedVoiceId,
  onVoiceChange,
  micDisabled = false,
  subtitle = '',
}) => {
  const { t } = useTranslation('common');
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Box
      position="fixed"
      top={["60px", "70px"]}
      left={0}
      right={0}
      zIndex={998}
      borderBottom="1px solid var(--hm-border-glass)"
      className="hm-glass-card"
      backdropFilter="blur(10px)"
      w={["100%", "100%", "76%"]}
      mx="auto"
      p={4}
    >
      <Flex
        align="center"
        justify="space-between"
        flexDirection={["column", "column", "row"]}
        gap={[2, 2, 0]}
      >
        {/* Left: Logo and Title */}
        <VStack spacing={1} align={["center", "center", "flex-start"]} w={["full", "full", "auto"]}>
          <HStack spacing={2}>
            <Box
              as={BsRobot}
              fontSize={["20px", "24px"]}
              color="var(--hm-color-brand)"
            />
            <Text fontSize={["md", "lg", "xl"]} fontWeight="700" color="var(--hm-color-text-primary)">
              {t('chat.header.title', 'Safe Space for You 💜')}
            </Text>
          </HStack>
          {subtitle ? (
            <Text fontSize={["xs", "sm"]} color="var(--hm-color-text-secondary)" textAlign={["center", "center", "left"]}>
              {subtitle}
            </Text>
          ) : null}
          <Text fontSize={["xs", "sm"]} color="var(--hm-color-text-secondary)" textAlign={["center", "center", "left"]}>
            {t('chat.header.anonConf', '100% Anonymous. 100% Confidential. 100% Judgment-Free.')}
          </Text>
        </VStack>

        {/* Right: Controls */}
        <HStack spacing={2} w={["full", "full", "auto"]} justify={["center", "center", "flex-end"]}>
          <IconButton
            icon={<BsInfoCircle />}
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Show info"
            color="var(--hm-color-text-secondary)"
            _hover={{ color: 'var(--hm-color-brand)' }}
          />
          <VoiceSelector
            selectedVoiceId={selectedVoiceId}
            onVoiceChange={onVoiceChange}
            tooltip={t('chat.tooltips.voiceSelect', 'Select voice for responses')}
          />
          <VoiceControls
            voiceEnabled={voiceEnabled}
            onToggle={onVoiceToggle}
            tooltipOn={t('chat.tooltips.muteVoice', 'Mute voice responses')}
            tooltipOff={t('chat.tooltips.enableVoice', 'Enable voice responses')}
            ariaLabelMute={t('chat.aria.muteVoice', 'Mute voice')}
            ariaLabelEnable={t('chat.aria.enableVoice', 'Enable voice')}
          />
        </HStack>
      </Flex>

      {/* Collapsible Info Section */}
      <Collapse in={showInfo} animateOpacity>
        <Box
          px={[3, 4, 6]}
          pb={4}
          borderTop="1px solid var(--hm-border-glass)"
          pt={3}
        >
          <VStack align="start" spacing={2}>
            <Text fontSize="sm" fontWeight="600" color="var(--hm-color-text-primary)">
              {t('chat.welcome.youCanTitle', 'You can:')}
            </Text>
            <VStack align="start" spacing={1} pl={2}>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('chat.welcome.feature1', '💬 Type in Hindi, English, or Hinglish')}
              </Text>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {micDisabled
                  ? t('chat.mic.disabledFree', '3a4 Microphone is disabled on the free plan. Upgrade to enable voice input.')
                  : t('chat.welcome.feature2', '🎙️ Speak in your language (click the mic)')}
              </Text>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('chat.welcome.feature3', '🔊 Hear responses in your chosen voice')}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ChatHeader;

