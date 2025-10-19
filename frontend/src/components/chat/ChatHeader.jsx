import React from 'react';
import { Box, Flex, VStack, HStack, Text } from '@chakra-ui/react';
import { BsRobot } from 'react-icons/bs';
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
 */
const ChatHeader = ({
  voiceEnabled,
  onVoiceToggle,
  selectedVoiceId,
  onVoiceChange,
}) => {
  const { t } = useTranslation('common');

  return (
    <Box
      position="fixed"
      top="70px"
      left={0}
      right={0}
      zIndex={998}
      borderBottom="1px solid var(--hm-border-glass)"
      className="hm-glass-card"
      backdropFilter="blur(10px)"
    >
      <Flex
        align="center"
        justify="space-between"
        px={6}
        py={4}
        maxW="1200px"
        mx="auto"
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
              {t('chat.header.title', 'HearMe Support')}
            </Text>
          </HStack>
          <Text fontSize="sm" color="var(--hm-color-text-secondary)">
            {t('chat.header.anonConf', 'Anonymous & Confidential')}
          </Text>
        </VStack>

        {/* Right: Controls */}
        <HStack spacing={2}>
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
    </Box>
  );
};

export default ChatHeader;

