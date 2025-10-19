import React from 'react';
import { Flex, VStack, HStack, Box, Text } from '@chakra-ui/react';
import { BsRobot } from 'react-icons/bs';
import LanguageSelector from './LanguageSelector';
import VoiceControls from './VoiceControls';
import VoiceSelector from './VoiceSelector';
import { useTranslation } from 'react-i18next';

/**
 * Chat header component with branding, language selector, voice selector, and voice controls
 * @param {Object} props
 * @param {Object} props.selectedLanguage - Currently selected language
 * @param {Function} props.onLanguageChange - Language change callback
 * @param {boolean} props.voiceEnabled - Whether voice is enabled
 * @param {Function} props.onVoiceToggle - Voice toggle callback
 * @param {string} props.selectedVoiceId - Currently selected voice ID for TTS
 * @param {Function} props.onVoiceChange - Voice change callback
 */
const ChatHeader = ({
  selectedLanguage,
  onLanguageChange,
  voiceEnabled,
  onVoiceToggle,
  selectedVoiceId,
  onVoiceChange,
}) => {
  const { t } = useTranslation('common');

  return (
    <Flex
      align="center"
      justify="space-between"
      px={6}
      py={4}
      position="fixed"
      top="70px"
      left={0}
      right={0}
      zIndex={999}
      borderBottom="1px solid var(--hm-border-glass)"
      className="hm-glass-card"
      backdropFilter="blur(10px)"
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
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          tooltip={t('chat.tooltips.languageSelect', 'Select language')}
        />
      </HStack>
    </Flex>
  );
};

export default ChatHeader;

