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
import { FiHeadphones, FiChevronDown, FiStar } from 'react-icons/fi';
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

  // Fetch user's saved voices or public voices for anonymous users
  useEffect(() => {
    let active = true;
    const browserDefaultVoice = {
      id: 'browser',
      name: t('chat.voice.deviceVoice', 'Device Voice (Free)'),
      provider: 'browser'
    };

    (async () => {
      setLoading(true);
      setVoices([browserDefaultVoice]); // Clear previous voices immediately

      try {
        // Determine which endpoint to use
        const endpoint = token
          ? `${API_URL}/api/voicetwin/mine`  // Authenticated: get user's voices
          : `${API_URL}/api/voicetwin/public`;  // Anonymous: get public voices

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const res = await fetch(endpoint, { headers });

        if (!active) return;

        if (res.ok) {
          const data = await res.json();
          const fetchedVoices = Array.isArray(data?.voices) ? data.voices : [];


          // Add browser default as first option
          setVoices([
            browserDefaultVoice,
            ...fetchedVoices,
          ]);
        } else {

          setVoices([browserDefaultVoice]);
        }
      } catch (e) {

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
    <Menu placement="bottom-end" strategy="fixed">
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
        minH="48px"
      >
        <HStack spacing={2}>
          <Text display={{ base: 'none', md: 'block' }}>
            {selectedVoice?.name || t('chat.voice.deviceVoice', 'Device Voice (Free)')}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList
        maxH="400px"
        overflowY="auto"
        bg="var(--hm-bg-glass-strong)"
        borderColor="var(--hm-border-glass)"
        borderWidth="1px"
        backdropFilter="blur(20px)"
        boxShadow="0 8px 24px rgba(0, 0, 0, 0.3)"
        zIndex={10000}
      >
        {voices.map((voice) => {
          const voiceId = voice.voiceId || voice.id;
          const isSelected = voiceId === selectedVoiceId;
          const isCloned = voice.category === 'cloned';
          const isPremade = voice.category === 'premade' || voice.category === 'professional';

          return (
            <MenuItem
              key={voiceId}
              onClick={() => onVoiceChange(voiceId)}
              color={isSelected ? 'white' : 'var(--hm-color-text-primary)'}
              fontWeight={isSelected ? '700' : '500'}
              bg={isSelected ? 'var(--hm-color-brand)' : 'transparent'}
              _hover={{
                bg: isSelected ? 'var(--hm-color-brand)' : 'var(--hm-bg-glass)',
                color: isSelected ? 'white' : 'var(--hm-color-brand)'
              }}
              minH="48px"
            >
              <HStack spacing={3} justify="space-between" w="full">
                <HStack spacing={2}>
                  {isCloned && (
                    <FiStar
                      size={14}
                      style={{
                        color: 'var(--hm-color-brand)',
                        fill: 'var(--hm-color-brand)'
                      }}
                    />
                  )}
                  <Text>{voice.name}</Text>
                </HStack>
                {voice.provider === 'elevenlabs' && (
                  <Text
                    fontSize="xs"
                    color={isCloned ? 'var(--hm-color-brand)' : 'var(--hm-color-text-secondary)'}
                    fontWeight={isCloned ? '600' : '400'}
                  >
                    {isCloned ? 'Custom Voice' : isPremade ? 'Default' : 'ElevenLabs'}
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

