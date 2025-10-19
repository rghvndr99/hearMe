import React from 'react';
import { Flex, VStack, HStack, Box, Text } from '@chakra-ui/react';
import { BsRobot } from 'react-icons/bs';
import LanguageSelector from './LanguageSelector';
import VoiceControls from './VoiceControls';
import { useTranslation } from 'react-i18next';

/**
 * Chat header component with branding, language selector, and voice controls
 * @param {Object} props
 * @param {Object} props.selectedLanguage - Currently selected language
 * @param {Function} props.onLanguageChange - Language change callback
 * @param {boolean} props.voiceEnabled - Whether voice is enabled
 * @param {Function} props.onVoiceToggle - Voice toggle callback
 */
const ChatHeader = ({
  selectedLanguage,
  onLanguageChange,
  voiceEnabled,
  onVoiceToggle,
}) => {
  const { t } = useTranslation('common');

  return (
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
          {t('chat.header.anonConf', 'Anonymous & Confidential')}
        </Text>
      </VStack>

      {/* Right: Controls */}
      <HStack spacing={2}>
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

