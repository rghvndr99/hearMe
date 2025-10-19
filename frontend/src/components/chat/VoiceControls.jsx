import React from 'react';
import { IconButton, Tooltip, HStack } from '@chakra-ui/react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

/**
 * Voice controls component for enabling/disabling TTS
 * @param {Object} props
 * @param {boolean} props.voiceEnabled - Whether voice is enabled
 * @param {Function} props.onToggle - Callback to toggle voice
 * @param {string} props.tooltipOn - Tooltip when voice is on
 * @param {string} props.tooltipOff - Tooltip when voice is off
 * @param {string} props.ariaLabelMute - Aria label for mute
 * @param {string} props.ariaLabelEnable - Aria label for enable
 */
const VoiceControls = ({
  voiceEnabled,
  onToggle,
  tooltipOn,
  tooltipOff,
  ariaLabelMute,
  ariaLabelEnable,
}) => {
  return (
    <Tooltip label={voiceEnabled ? tooltipOn : tooltipOff}>
      <IconButton
        icon={voiceEnabled ? <FiVolume2 /> : <FiVolumeX />}
        onClick={onToggle}
        variant="ghost"
        size="sm"
        color={voiceEnabled ? 'var(--hm-color-brand)' : 'var(--hm-color-text-muted)'}
        _hover={{ color: 'var(--hm-color-brand)' }}
        aria-label={voiceEnabled ? ariaLabelMute : ariaLabelEnable}
      />
    </Tooltip>
  );
};

export default VoiceControls;

