import { useState, useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { FiHeadphones, FiChevronDown } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Voice selector dropdown component for choosing TTS voice
 * @param {Object} props
 * @param {string} props.selectedVoiceId - Currently selected voice ID
 * @param {Function} props.onVoiceChange - Callback when voice changes
 * @param {string} props.tooltip - Tooltip text
 */
const VoiceSelector = ({ selectedVoiceId, onVoiceChange, tooltip }) => {
  const { t } = useTranslation('common');
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null;

  // Fetch user's saved voices
  useEffect(() => {
    let active = true;
    const browserDefaultVoice = {
      id: 'browser',
      name: t('chat.voice.browserDefault', 'Browser Default'),
      provider: 'browser'
    };

    if (!token) {
      // Not logged in - only show browser default
      setVoices([browserDefaultVoice]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/voicetwin/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          const userVoices = Array.isArray(data?.voices) ? data.voices : [];
          console.log('VoiceSelector: Loaded voices:', userVoices);
          // Add browser default as first option
          setVoices([
            browserDefaultVoice,
            ...userVoices,
          ]);
        } else {
          console.warn('VoiceSelector: Failed to fetch voices, status:', res.status);
          setVoices([browserDefaultVoice]);
        }
      } catch (e) {
        console.error('Failed to load voices:', e);
        setVoices([browserDefaultVoice]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [token, t]);

  const selectedVoice = voices.find(v => (v.voiceId || v.id) === selectedVoiceId) || voices[0];

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        leftIcon={loading ? <Spinner size="xs" /> : <FiHeadphones />}
        rightIcon={<FiChevronDown />}
        title={tooltip}
        color="var(--hm-color-text-muted)"
        _hover={{ color: 'var(--hm-color-brand)' }}
        isDisabled={loading}
      >
        <HStack spacing={2}>
          <Text display={{ base: 'none', md: 'block' }}>
            {selectedVoice?.name || t('chat.voice.browserDefault', 'Browser Default')}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList
        maxH="400px"
        overflowY="auto"
        bg="var(--hm-bg-glass)"
        borderColor="var(--hm-border-glass)"
        backdropFilter="blur(10px)"
        zIndex={9999}
        position="absolute"
      >
        {voices.map((voice) => {
          const voiceId = voice.voiceId || voice.id;
          const isSelected = voiceId === selectedVoiceId;
          return (
            <MenuItem
              key={voiceId}
              onClick={() => onVoiceChange(voiceId)}
              color={isSelected ? 'var(--hm-color-brand)' : 'var(--hm-color-text-primary)'}
              fontWeight={isSelected ? '700' : '500'}
              bg={isSelected ? 'var(--hm-bg-glass)' : 'transparent'}
              _hover={{ bg: 'var(--hm-bg-glass)', color: 'var(--hm-color-brand)' }}
            >
              <HStack spacing={3} justify="space-between" w="full">
                <Text>{voice.name}</Text>
                {voice.provider === 'elevenlabs' && (
                  <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                    ElevenLabs
                  </Text>
                )}
              </HStack>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};

export default VoiceSelector;

