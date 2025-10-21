import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  useToast,
  Spinner,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Badge,
  Progress,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMic, FiUpload, FiCheck, FiX, FiUsers, FiEdit2, FiTrash2, FiPlay, FiPause, FiStar, FiClock, FiFolder } from 'react-icons/fi';

export default function VoiceMate() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  // Auth state
  const token = typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null;
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!token);

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);

  // Single voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [voiceName, setVoiceName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');

  // Multi-speaker diarization state
  const [diarizationFile, setDiarizationFile] = useState(null);
  const [diarizationProcessing, setDiarizationProcessing] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState(new Set());
  const [speakerNames, setSpeakerNames] = useState({});
  const [speakerAudioUrls, setSpeakerAudioUrls] = useState({});
  const diarizationFileInputRef = useRef(null);

  // Saved voices
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  // Voice management state
  const [editingVoiceId, setEditingVoiceId] = useState(null);
  const [deletingVoiceId, setDeletingVoiceId] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const audioPlayerRef = useRef(null);
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [voiceToDelete, setVoiceToDelete] = useState(null);

  const API_URL = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5001', []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(speakerAudioUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [speakerAudioUrls]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data?.user || data);
        }
      } catch (e) {
        // ignore
      } finally {
        if (active) setLoadingUser(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [API_URL, token]);

  // Load my saved voices when authenticated
  useEffect(() => {
    let active = true;

    // Clear voices when token changes (user logout/login)
    if (!token) {
      setVoices([]);
      return;
    }

    (async () => {
      setLoadingVoices(true);
      setVoices([]); // Clear previous user's voices immediately

      try {
        const res = await fetch(`${API_URL}/api/voicetwin/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          const allVoices = Array.isArray(data?.voices) ? data.voices : [];
          // Filter to show only user's custom voices (category === 'cloned')
          // Default ElevenLabs voices should not appear in "My Voices" section
          const userCustomVoices = allVoices.filter(v => v.category === 'cloned');
          console.log(`VoiceMate: Loaded ${userCustomVoices.length} custom voices (filtered from ${allVoices.length} total)`);
          setVoices(userCustomVoices);
        }
      } catch (e) {
        console.error('Failed to load voices:', e);
      } finally {
        if (active) setLoadingVoices(false);
      }
    })();
    return () => { active = false; };
  }, [API_URL, token, success]);

  // Recording helpers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      timerRef.current = setTimeout(stopRecording, 30000);
    } catch (e) {
      toast({ title: t('voicemate.micDenied', 'Microphone permission denied'), status: 'error' });
    }
  };

  const stopRecording = () => {
    try {
      if (timerRef.current) clearTimeout(timerRef.current);
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== 'inactive') mr.stop();
    } finally {
      setIsRecording(false);
    }
  };

  // Build a temporary preview URL for uploaded files
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl('');
    }
  }, [selectedFile]);

  // Upload single voice (unified handler)
  const uploadSingleVoice = async () => {
    if (!voiceName || !voiceName.trim()) {
      toast({ title: t('voicemate.nameLabel', 'Name your voice'), description: t('voicemate.nameRequired', 'Please enter a name for your voice before saving.'), status: 'warning' });
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setProcessing(true);
      setSuccess(false);

      let blob;
      let sourceType;

      if (audioUrl) {
        blob = await (await fetch(audioUrl)).blob();
        sourceType = 'record';
      } else if (selectedFile) {
        blob = selectedFile;
        sourceType = 'upload';
      } else {
        toast({ title: t('voicemate.noAudio', 'Please record or select an audio file first.'), status: 'warning' });
        return;
      }

      const form = new FormData();
      form.append('audio', blob, selectedFile?.name || 'sample.webm');
      form.append('name', voiceName.trim());
      form.append('sourceType', sourceType);

      const resp = await fetch(`${API_URL}/api/voicetwin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Upload failed');

      toast({ title: t('voicemate.ready', 'Your VoiceTwin is ready!'), status: 'success' });
      setSuccess(true);
      setAudioUrl('');
      setSelectedFile(null);
      setVoiceName('');
    } catch (e) {
      toast({ title: t('voicemate.uploadError', 'Could not create VoiceTwin'), description: String(e?.message || e), status: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  // Load audio file with authentication and create blob URL
  const loadSpeakerAudio = async (speakerId, path) => {
    try {
      const resp = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) {
        throw new Error(`Failed to load audio: ${resp.status}`);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setSpeakerAudioUrls(prev => ({ ...prev, [speakerId]: url }));
    } catch (e) {
      console.error('Failed to load speaker audio:', e);
      toast({
        title: 'Audio Load Error',
        description: `Failed to load audio for ${speakerId}`,
        status: 'error',
        duration: 3000
      });
    }
  };

  // Handle multi-speaker file upload and analysis
  const analyzeSpeakers = async () => {
    if (!diarizationFile) {
      toast({ title: t('voicemate.noFile', 'Please select a file'), status: 'warning' });
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setDiarizationProcessing(true);
      setSpeakers([]);
      setSelectedSpeakers(new Set());
      setSpeakerNames({});
      setSpeakerAudioUrls({});

      const form = new FormData();
      form.append('file', diarizationFile);
      form.append('saveResponse', 'true');

      const resp = await fetch(`${API_URL}/api/speaker-diarization/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Analysis failed');

      if (data.success && data.outputFiles) {
        setSpeakers(data.outputFiles);
        // Auto-select all speakers
        setSelectedSpeakers(new Set(data.outputFiles.map(s => s.speaker)));
        // Initialize speaker names
        const names = {};
        data.outputFiles.forEach((s, idx) => {
          names[s.speaker] = `Speaker ${idx + 1}`;
        });
        setSpeakerNames(names);

        // Load audio files for preview
        data.outputFiles.forEach(speaker => {
          loadSpeakerAudio(speaker.speaker, speaker.path);
        });

        toast({ title: t('voicemate.speakersFound', `Found ${data.speakerCount} speakers!`), status: 'success' });
      }
    } catch (e) {
      toast({ title: t('voicemate.analysisError', 'Analysis failed'), description: String(e?.message || e), status: 'error' });
    } finally {
      setDiarizationProcessing(false);
    }
  };

  // Voice Management Functions

  // Rename voice
  const handleRenameVoice = async (voiceId, newName) => {
    if (!newName || !newName.trim()) {
      toast({ title: t('voicemate.nameRequired', 'Name is required'), status: 'warning' });
      return;
    }

    try {
      // Find the voice in ElevenLabs API response to get the MongoDB _id
      const voice = voices.find(v => v.voiceId === voiceId);
      if (!voice || !voice.id) {
        toast({ title: t('voicemate.voiceNotFound', 'Voice not found'), status: 'error' });
        return;
      }

      const res = await fetch(`${API_URL}/api/voicetwin/${voice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to rename voice');
      }

      // Update local state
      setVoices(voices.map(v => v.voiceId === voiceId ? { ...v, name: newName.trim() } : v));
      toast({ title: t('voicemate.renamed', 'Voice renamed successfully'), status: 'success' });
      setEditingVoiceId(null);
    } catch (e) {
      toast({ title: t('voicemate.renameError', 'Failed to rename voice'), description: String(e?.message || e), status: 'error' });
    }
  };

  // Delete voice
  const handleDeleteVoice = async () => {
    if (!voiceToDelete) return;

    try {
      setDeletingVoiceId(voiceToDelete.voiceId);

      // Find the voice in ElevenLabs API response to get the MongoDB _id
      const voice = voices.find(v => v.voiceId === voiceToDelete.voiceId);
      if (!voice || !voice.id) {
        toast({ title: t('voicemate.voiceNotFound', 'Voice not found'), status: 'error' });
        return;
      }

      const res = await fetch(`${API_URL}/api/voicetwin/${voice.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete voice');
      }

      // Update local state
      setVoices(voices.filter(v => v.voiceId !== voiceToDelete.voiceId));
      toast({ title: t('voicemate.deleted', 'Voice deleted successfully'), status: 'success' });
      onDeleteModalClose();
      setVoiceToDelete(null);
    } catch (e) {
      toast({ title: t('voicemate.deleteError', 'Failed to delete voice'), description: String(e?.message || e), status: 'error' });
    } finally {
      setDeletingVoiceId(null);
    }
  };

  // Play voice preview
  const handlePlayVoice = async (voice) => {
    try {
      // Stop currently playing audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }

      // If clicking the same voice, just stop
      if (playingVoiceId === voice.voiceId) {
        setPlayingVoiceId(null);
        return;
      }

      setPlayingVoiceId(voice.voiceId);

      // Use ElevenLabs TTS to generate preview
      const sampleText = t('voicemate.previewText', 'Hello! This is a preview of my voice.');
      const res = await fetch(`${API_URL}/api/tts/eleven`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: sampleText, voiceId: voice.voiceId }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate preview');
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (e) {
      toast({ title: t('voicemate.playError', 'Failed to play preview'), description: String(e?.message || e), status: 'error' });
      setPlayingVoiceId(null);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (voice) => {
    setVoiceToDelete(voice);
    onDeleteModalOpen();
  };

  // Process selected speakers to ElevenLabs
  const processSelectedSpeakers = async () => {
    const selected = Array.from(selectedSpeakers);
    if (selected.length === 0) {
      toast({ title: t('voicemate.noSpeakersSelected', 'Please select at least one speaker'), status: 'warning' });
      return;
    }

    try {
      setProcessing(true);
      let successCount = 0;

      for (const speakerId of selected) {
        const speaker = speakers.find(s => s.speaker === speakerId);
        if (!speaker) continue;

        // Download the speaker file
        const downloadUrl = `${API_URL}${speaker.path}`;
        const fileResp = await fetch(downloadUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!fileResp.ok) continue;

        const blob = await fileResp.blob();
        const voiceName = speakerNames[speakerId] || speakerId;

        // Upload to ElevenLabs
        const form = new FormData();
        form.append('audio', blob, `${speakerId}.wav`);
        form.append('name', voiceName);
        form.append('sourceType', 'upload');

        const uploadResp = await fetch(`${API_URL}/api/voicetwin/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });

        if (uploadResp.ok) successCount++;
      }

      toast({ title: t('voicemate.voicesCreated', `Created ${successCount} voice(s)!`), status: 'success' });
      setSuccess(true);
      setSpeakers([]);
      setSelectedSpeakers(new Set());
      setSpeakerNames({});
      setDiarizationFile(null);
    } catch (e) {
      toast({ title: t('voicemate.processError', 'Processing failed'), description: String(e?.message || e), status: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const WaveformBars = ({ active = false, width = 220, height = 32 }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width * (window.devicePixelRatio || 1);
      canvas.height = height * (window.devicePixelRatio || 1);
      const ctx = canvas.getContext('2d');
      let raf;
      let t0 = performance.now();
      const draw = (now) => {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const bars = 24;
        const barW = Math.max(2 * dpr, Math.floor(w / (bars * 1.6)));
        const gap = Math.max(2 * dpr, Math.floor(barW * 0.6));
        const color = getComputedStyle(document.documentElement).getPropertyValue('--hm-color-brand') || '#7c3aed';
        for (let i = 0; i < bars; i++) {
          const x = i * (barW + gap);
          const phase = (i / bars) * Math.PI * 2 + ((now - t0) / 600);
          const amp = active ? (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(phase))) : 0.15;
          const barH = Math.max(3 * dpr, Math.min(h - 2 * dpr, amp * h));
          const y = (h - barH) / 2;
          ctx.fillStyle = color.trim();
          const r = Math.min(barW, barH) / 3;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + barW, y, x + barW, y + r, r);
          ctx.arcTo(x + barW, y + barH, x + barW - r, y + barH, r);
          ctx.arcTo(x, y + barH, x, y + barH - r, r);
          ctx.arcTo(x, y, x + r, y, r);
          ctx.closePath();
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }, [active, width, height]);
    return (
      <Box as="canvas" ref={canvasRef} width={width} height={height} style={{ width, height }} />
    );
  };

  if (!token) {
    return (
      <Flex
        direction="column"
        align="center"
        minH="100vh"
        bg="var(--hm-color-bg)"
        color="var(--hm-color-text-primary)"
        position="relative"
        overflow="hidden"
        pt="100px"
        pb={[12, 20]}
      >
        <VStack spacing={[12, 16, 20]} zIndex={1} maxW="1200px" w="full" px={[6, 8, 12]}>

          {/* Hero Section */}
          <VStack spacing={6} textAlign="center" maxW="900px">
            <Heading
              as="h1"
              fontSize={['2xl', '3xl', '4xl', '5xl']}
              fontWeight="bold"
              color="var(--hm-color-text-primary)"
              lineHeight="1.2"
            >
              {t('voicemate.heroTitle', 'Apni Awaaz, Apne Shabdon Mein — Your Voice, Your Words, Forever')}
            </Heading>
            <Text
              fontSize={['md', 'lg', 'xl']}
              color="var(--hm-color-text-secondary)"
              maxW="800px"
              lineHeight="1.6"
            >
              {t('voicemate.heroSub', 'When you can\'t be there in person, let your voice be. Create your AI VoiceTwin in 60 seconds — send bedtime stories to your kids, comfort to your parents, or warmth to loved ones across miles. In Hindi, English, or any Indian language. Free forever.')}
            </Text>
            <Stack direction={["column", "column", "row"]} spacing={4} justify="center" w={["full", "full", "auto"]} px={[4, 6, 0]}>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                borderRadius="full"
                bgGradient="var(--hm-gradient-cta)"
                color="white"
                _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)', transform: 'translateY(-2px)' }}
                transition="all 0.3s ease"
                px={8}
                w={["full", "full", "auto"]}
              >
                {t('voicemate.ctaSignIn', 'Create My VoiceTwin — Free, 60 Seconds')}
              </Button>
              <Button
                size="lg"
                borderRadius="full"
                variant="outline"
                borderColor="var(--hm-color-brand)"
                color="var(--hm-color-brand)"
                _hover={{ bg: 'var(--hm-color-brand)', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s ease"
                px={8}
                w={["full", "full", "auto"]}
              >
                {t('voicemate.ctaDemo', 'Hear a Demo First')}
              </Button>
            </Stack>
          </VStack>

          {/* Emotional Story Section */}
          <VStack spacing={8} w="full">
            <VStack spacing={3} textAlign="center">
              <Heading
                as="h2"
                fontSize={['xl', '2xl', '3xl']}
                color="var(--hm-color-text-primary)"
              >
                {t('voicemate.emotionalTitle', 'Why VoiceTwin? Because some voices should never fade away')}
              </Heading>
              <Text
                fontSize={['sm', 'md', 'lg']}
                color="var(--hm-color-text-secondary)"
                maxW="700px"
              >
                {t('voicemate.emotionalSubtitle', 'In India, a mother\'s lullaby, a father\'s advice, a grandparent\'s story — these aren\'t just sounds. They\'re home. They\'re love. They\'re who we are.')}
              </Text>
            </VStack>

            <SimpleGrid columns={[1, 1, 3]} spacing={6} w="full">
              {/* Use Case 1: Working Parent */}
              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
                _hover={{ borderColor: 'var(--hm-color-brand)', transform: 'translateY(-4px)' }}
                transition="all 0.3s ease"
              >
                <VStack align="start" spacing={4}>
                  <Text fontSize="3xl">🌙</Text>
                  <Heading size="md" color="var(--hm-color-text-primary)">
                    {t('voicemate.useCase1Title', 'Maa ki lori, chahe aap office mein ho')}
                  </Heading>
                  <Text fontSize="xs" color="var(--hm-color-text-tertiary)" fontStyle="italic">
                    {t('voicemate.useCase1Subtitle', 'Mother\'s lullaby, even when you\'re at the office')}
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.useCase1Desc', 'Stuck in a late-night meeting? Your child still hears your voice singing their favorite lullaby. Record once, send anytime. Your warmth, your tone, your love — even when you can\'t be there.')}
                  </Text>
                </VStack>
              </Box>

              {/* Use Case 2: NRI Families */}
              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
                _hover={{ borderColor: 'var(--hm-color-brand)', transform: 'translateY(-4px)' }}
                transition="all 0.3s ease"
              >
                <VStack align="start" spacing={4}>
                  <Text fontSize="3xl">✈️</Text>
                  <Heading size="md" color="var(--hm-color-text-primary)">
                    {t('voicemate.useCase2Title', 'Ghar ki awaaz, videsh se bhi')}
                  </Heading>
                  <Text fontSize="xs" color="var(--hm-color-text-tertiary)" fontStyle="italic">
                    {t('voicemate.useCase2Subtitle', 'Voice of home, even from abroad')}
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.useCase2Desc', 'Living in the US, UK, or Canada? Your parents in India can hear your voice every day — not a robotic text-to-speech, but YOU. Wish them good morning, remind them to take medicine, or just say \'I love you\' in your own voice.')}
                  </Text>
                </VStack>
              </Box>

              {/* Use Case 3: Memory Preservation */}
              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
                _hover={{ borderColor: 'var(--hm-color-brand)', transform: 'translateY(-4px)' }}
                transition="all 0.3s ease"
              >
                <VStack align="start" spacing={4}>
                  <Text fontSize="3xl">💜</Text>
                  <Heading size="md" color="var(--hm-color-text-primary)">
                    {t('voicemate.useCase3Title', 'Preserve the voices you never want to lose')}
                  </Heading>
                  <Text fontSize="xs" color="var(--hm-color-text-tertiary)" fontStyle="italic">
                    {t('voicemate.useCase3Subtitle', 'Yaadein jo kabhi na mitein')}
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.useCase3Desc', 'Record your grandmother\'s stories. Your father\'s advice. Your mother\'s prayers. VoiceTwin preserves these precious voices forever — so future generations can hear the love that shaped your family.')}
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>

          {/* How It Works Section */}
          <VStack spacing={8} w="full" bg="var(--hm-color-bg-secondary)" p={[6, 8, 10]} borderRadius="2xl">
            <Heading
              as="h2"
              fontSize={['xl', '2xl', '3xl']}
              color="var(--hm-color-text-primary)"
              textAlign="center"
            >
              {t('voicemate.howItWorksTitle', 'Create Your VoiceTwin in 3 Simple Steps')}
            </Heading>

            <SimpleGrid columns={[1, 1, 3]} spacing={8} w="full">
              {/* Step 1 */}
              <VStack spacing={4} textAlign="center">
                <Box
                  bg="var(--hm-color-brand)"
                  color="white"
                  borderRadius="full"
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  1
                </Box>
                <Heading size="md" color="var(--hm-color-text-primary)">
                  {t('voicemate.step1Title', 'Speak for 30 seconds')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.step1Desc', 'Record directly on your phone or upload an audio file. Speak naturally in Hindi, English, Hinglish, or any Indian language. No studio needed — your bedroom, kitchen, or car works perfectly.')}
                </Text>
              </VStack>

              {/* Step 2 */}
              <VStack spacing={4} textAlign="center">
                <Box
                  bg="var(--hm-color-brand)"
                  color="white"
                  borderRadius="full"
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  2
                </Box>
                <Heading size="md" color="var(--hm-color-text-primary)">
                  {t('voicemate.step2Title', 'AI learns your voice in 60 seconds')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.step2Desc', 'Our AI (powered by ElevenLabs) analyzes your tone, pitch, emotion, and accent. It creates a digital twin that sounds exactly like you — not robotic, but warm and human.')}
                </Text>
              </VStack>

              {/* Step 3 */}
              <VStack spacing={4} textAlign="center">
                <Box
                  bg="var(--hm-color-brand)"
                  color="white"
                  borderRadius="full"
                  w="60px"
                  h="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  3
                </Box>
                <Heading size="md" color="var(--hm-color-text-primary)">
                  {t('voicemate.step3Title', 'Send voice messages that sound like YOU')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.step3Desc', 'Type any message in HearMe chat, and it speaks in YOUR voice. Send to family, friends, or use for emotional support. Your voice, your words, your connection.')}
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>

          {/* Trust & Privacy Section */}
          <VStack spacing={8} w="full">
            <Heading
              as="h2"
              fontSize={['xl', '2xl', '3xl']}
              color="var(--hm-color-text-primary)"
              textAlign="center"
            >
              {t('voicemate.trustTitle', 'Your Voice, Your Privacy — Sacred and Secure')}
            </Heading>

            <SimpleGrid columns={[1, 2, 4]} spacing={6} w="full">
              <VStack spacing={3} align="start">
                <Text fontSize="2xl">🔒</Text>
                <Heading size="sm" color="var(--hm-color-text-primary)">
                  {t('voicemate.trust1Title', 'Bank-level security')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.trust1Desc', 'Your voice sample is encrypted end-to-end. We use the same security standards as banks and hospitals. Your voice never leaves our secure servers.')}
                </Text>
              </VStack>

              <VStack spacing={3} align="start">
                <Text fontSize="2xl">🚫</Text>
                <Heading size="sm" color="var(--hm-color-text-primary)">
                  {t('voicemate.trust2Title', 'We never sell your data')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.trust2Desc', 'Your voice is yours. We don\'t sell it to advertisers, train other AI models, or share it with third parties. Ever.')}
                </Text>
              </VStack>

              <VStack spacing={3} align="start">
                <Text fontSize="2xl">✅</Text>
                <Heading size="sm" color="var(--hm-color-text-primary)">
                  {t('voicemate.trust3Title', 'Delete anytime, no questions asked')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.trust3Desc', 'You own your VoiceTwin. Rename it, delete it, or create new ones — you\'re in complete control. No hidden fees, no lock-in.')}
                </Text>
              </VStack>

              <VStack spacing={3} align="start">
                <Text fontSize="2xl">🇮🇳</Text>
                <Heading size="sm" color="var(--hm-color-text-primary)">
                  {t('voicemate.trust4Title', 'Built for India, respects Indian values')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.trust4Desc', 'We understand Indian family dynamics, privacy concerns, and cultural sensitivity. Your data is handled with the respect it deserves.')}
                </Text>
              </VStack>
            </SimpleGrid>
          </VStack>

          {/* Benefits Section */}
          <VStack spacing={8} w="full">
            <Heading
              as="h2"
              fontSize={['xl', '2xl', '3xl']}
              color="var(--hm-color-text-primary)"
              textAlign="center"
            >
              {t('voicemate.benefitsTitle', 'Why Thousands of Indians Trust VoiceTwin')}
            </Heading>

            <SimpleGrid columns={[1, 2, 3]} spacing={6} w="full">
              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={3}>
                  <Text fontSize="2xl">🎵</Text>
                  <Heading size="sm" color="var(--hm-color-text-primary)">
                    {t('voicemate.benefit1Title', 'Sounds Human, Not Robotic')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.benefit1Desc', 'Unlike Google Translate or Siri, VoiceTwin captures YOUR unique voice — your accent, your warmth, your emotion. It\'s not AI pretending to be you. It IS you.')}
                  </Text>
                </VStack>
              </Box>

              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={3}>
                  <Text fontSize="2xl">🌏</Text>
                  <Heading size="sm" color="var(--hm-color-text-primary)">
                    {t('voicemate.benefit2Title', 'Works in All Indian Languages')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.benefit2Desc', 'Hindi, English, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia — speak in any language. VoiceTwin learns YOUR voice, not a generic accent.')}
                  </Text>
                </VStack>
              </Box>

              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={3}>
                  <Text fontSize="2xl">💰</Text>
                  <Heading size="sm" color="var(--hm-color-text-primary)">
                    {t('voicemate.benefit3Title', 'Free Forever (No Hidden Costs)')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.benefit3Desc', 'Create your first VoiceTwin completely free. No credit card, no trial period, no surprise charges. If you love it, upgrade later for more features. But the core? Always free.')}
                  </Text>
                </VStack>
              </Box>

              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={3}>
                  <Text fontSize="2xl">⏱️</Text>
                  <Heading size="sm" color="var(--hm-color-text-primary)">
                    {t('voicemate.benefit4Title', '60-Second Setup')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.benefit4Desc', 'No complicated software. No studio equipment. Just open HearMe, record for 30 seconds, and your VoiceTwin is ready in 60 seconds. Easier than ordering food online.')}
                  </Text>
                </VStack>
              </Box>

              <Box
                className="hm-glass-card"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={3}>
                  <Text fontSize="2xl">💖</Text>
                  <Heading size="sm" color="var(--hm-color-text-primary)">
                    {t('voicemate.benefit5Title', 'Emotional Connection')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.benefit5Desc', 'Text messages feel cold. Voice notes take time. VoiceTwin gives you the best of both — type fast, but your loved ones hear YOUR voice. The warmth of a call, the convenience of a text.')}
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>

          {/* Social Proof Section */}
          <VStack spacing={8} w="full" bg="var(--hm-color-bg-secondary)" p={[6, 8, 10]} borderRadius="2xl">
            <Heading
              as="h2"
              fontSize={['xl', '2xl', '3xl']}
              color="var(--hm-color-text-primary)"
              textAlign="center"
            >
              {t('voicemate.socialProofTitle', 'Real Stories from Real Families')}
            </Heading>

            <SimpleGrid columns={[1, 1, 3]} spacing={6} w="full">
              <Box
                bg="var(--hm-color-bg)"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={4}>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)" fontStyle="italic" lineHeight="1.6">
                    "{t('voicemate.testimonial1Quote', 'I work night shifts as a nurse. My 5-year-old daughter now hears my voice singing her lullaby every night, even when I\'m at the hospital. She sleeps peacefully knowing Maa is always there. VoiceTwin gave me my motherhood back.')}"
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-brand)" fontWeight="bold">
                    — {t('voicemate.testimonial1Name', 'Priya S., Mumbai')}
                  </Text>
                </VStack>
              </Box>

              <Box
                bg="var(--hm-color-bg)"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={4}>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)" fontStyle="italic" lineHeight="1.6">
                    "{t('voicemate.testimonial2Quote', 'My parents in Delhi are 70+. I can\'t call them every day because of time zones. Now I send them voice messages in MY voice — \'Good morning Papa, take your medicine\' or \'Happy Diwali Maa, I love you.\' They play it on repeat. It\'s like I\'m there.')}"
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-brand)" fontWeight="bold">
                    — {t('voicemate.testimonial2Name', 'Arjun M., California')}
                  </Text>
                </VStack>
              </Box>

              <Box
                bg="var(--hm-color-bg)"
                p={6}
                borderRadius="xl"
                border="1px solid var(--hm-border-glass)"
              >
                <VStack align="start" spacing={4}>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)" fontStyle="italic" lineHeight="1.6">
                    "{t('voicemate.testimonial3Quote', 'My father passed away last year. I had one voice recording of him singing my favorite song. VoiceTwin helped me preserve it. Now my kids can hear their grandfather\'s voice. It\'s the most precious gift I could give them.')}"
                  </Text>
                  <Text fontSize="sm" color="var(--hm-color-brand)" fontWeight="bold">
                    — {t('voicemate.testimonial3Name', 'Sneha R., Bangalore')}
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </VStack>

          {/* FAQ Section */}
          <VStack spacing={8} w="full" maxW="900px">
            <Heading
              as="h2"
              fontSize={['xl', '2xl', '3xl']}
              color="var(--hm-color-text-primary)"
              textAlign="center"
            >
              {t('voicemate.faqTitle', 'Frequently Asked Questions')}
            </Heading>

            <VStack spacing={4} w="full" align="stretch">
              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq1Question', 'Is VoiceTwin really free?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq1Answer', 'Yes! Creating your first VoiceTwin is 100% free, forever. No credit card needed. If you want advanced features (multiple voices, higher quality), we offer premium plans starting at ₹99/month. But the basic VoiceTwin? Always free.')}
                </Text>
              </Box>

              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq2Question', 'How long does it take to create a VoiceTwin?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq2Answer', '60 seconds. Record for 30 seconds, AI processes for 30 seconds. That\'s it.')}
                </Text>
              </Box>

              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq3Question', 'Can I use VoiceTwin in Hindi or other Indian languages?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq3Answer', 'Absolutely! VoiceTwin works in Hindi, English, Hinglish, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, and more. Speak in your mother tongue — VoiceTwin learns YOUR voice, not a generic accent.')}
                </Text>
              </Box>

              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq4Question', 'Is my voice data safe?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq4Answer', 'Yes. We use military-grade encryption (same as banks). Your voice is stored securely, never sold to advertisers, and you can delete it anytime.')}
                </Text>
              </Box>

              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq5Question', 'Can I delete my VoiceTwin?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq5Answer', 'Yes! You own your VoiceTwin. Delete it anytime with one click. No questions asked.')}
                </Text>
              </Box>

              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq6Question', 'What if I don\'t like how it sounds?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq6Answer', 'You can re-record as many times as you want. Try different tones, speeds, or environments until it sounds perfect.')}
                </Text>
              </Box>

              <Box
                className="hm-glass-card"
                p={5}
                borderRadius="lg"
                border="1px solid var(--hm-border-glass)"
              >
                <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                  {t('voicemate.faq7Question', 'Can I create VoiceTwins for my family members?')}
                </Heading>
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                  {t('voicemate.faq7Answer', 'Yes! Record your child\'s voice, your spouse\'s voice, or your parent\'s voice (with their permission). Preserve family voices for generations.')}
                </Text>
              </Box>
            </VStack>
          </VStack>

          {/* Final CTA Section */}
          <VStack
            spacing={6}
            w="full"
            bg="var(--hm-gradient-cta-soft)"
            p={[8, 10, 12]}
            borderRadius="2xl"
            border="1px solid var(--hm-color-brand)"
            textAlign="center"
          >
            <Heading
              as="h2"
              fontSize={['xl', '2xl', '3xl']}
              color="var(--hm-color-text-primary)"
            >
              {t('voicemate.finalCtaTitle', 'Apni Awaaz Ko Amar Banao — Make Your Voice Immortal')}
            </Heading>
            <Text
              fontSize={['sm', 'md', 'lg']}
              color="var(--hm-color-text-secondary)"
              maxW="700px"
            >
              {t('voicemate.finalCtaSubtitle', 'Join thousands of Indian families preserving love, connection, and memories through VoiceTwin. Free forever. 60 seconds to create. A lifetime of warmth.')}
            </Text>
            <Stack direction={["column", "column", "row"]} spacing={4} justify="center" w={["full", "full", "auto"]} px={[4, 6, 0]}>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                borderRadius="full"
                bgGradient="var(--hm-gradient-cta)"
                color="white"
                _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)', transform: 'translateY(-2px)' }}
                transition="all 0.3s ease"
                px={8}
                w={["full", "full", "auto"]}
              >
                {t('voicemate.finalCtaPrimary', 'Create My VoiceTwin Now — Free')}
              </Button>
              <Button
                size="lg"
                borderRadius="full"
                variant="outline"
                borderColor="var(--hm-color-brand)"
                color="var(--hm-color-brand)"
                _hover={{ bg: 'var(--hm-color-brand)', color: 'white', transform: 'translateY(-2px)' }}
                transition="all 0.3s ease"
                px={8}
                w={["full", "full", "auto"]}
              >
                {t('voicemate.finalCtaSecondary', 'Hear a Demo First')}
              </Button>
            </Stack>
          </VStack>

        </VStack>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-primary)"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
    >
      <VStack spacing={8} zIndex={1} maxW="900px" w="full">
        {/* Hero Section */}
        <Box className="hm-glass-card p-8 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} bgGradient="var(--hm-gradient-cta-soft)">
          <VStack align="start" spacing={4}>
            <Heading size="lg" color="var(--hm-color-text-primary)">
              {t('voicemate.userHero', 'Hey {{name}}, Apni Awaaz Ko Amar Banao! 🎙️', { name: user?.name || t('voicemate.user', 'Friend') })}
            </Heading>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('voicemate.userHeroSubtitle', 'Create your AI VoiceTwin in 60 seconds. Send voice messages to family, even when you can\'t call. In Hindi, English, or any language you speak.')}
            </Text>
            <HStack spacing={2} align="center">
              <Icon as={FiStar} color="var(--hm-color-brand)" boxSize={4} />
              <Text fontSize="sm" color="var(--hm-color-text-muted)" fontWeight="500">
                {voices.length === 0
                  ? t('voicemate.userStatus0', 'You have 0 VoiceTwins. Let\'s create your first one!')
                  : voices.length === 1
                  ? t('voicemate.userStatus1', 'Great start! You have 1 VoiceTwin. Create more for different moods or languages!')
                  : t('voicemate.userStatusMany', 'Amazing! You have {{count}} VoiceTwins. You\'re a pro! 🌟', { count: voices.length })
                }
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Tabbed Interface */}
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <Tabs index={tabIndex} onChange={setTabIndex} variant="unstyled">
            <TabList
              mb={6}
              borderBottom="2px solid"
              borderColor="var(--hm-border-glass)"
              gap={0}
              overflowX="auto"
              overflowY="hidden"
              sx={{
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--hm-border-glass)',
                  borderRadius: '4px',
                },
              }}
            >
              <Tab
                _selected={{
                  color: 'var(--hm-color-brand)',
                  borderBottom: '3px solid',
                  borderColor: 'var(--hm-color-brand)',
                  fontWeight: '600',
                  marginBottom: '-2px'
                }}
                color="var(--hm-color-text-muted)"
                _hover={{ color: 'var(--hm-color-brand)' }}
                pb={3}
                px={[3, 4, 6]}
                fontSize={["xs", "sm", "md"]}
                fontWeight="500"
                transition="all 0.2s"
                whiteSpace="nowrap"
                flexShrink={0}
              >
                <HStack spacing={[1, 2, 2]}>
                  <Icon as={FiMic} boxSize={[4, 5, 5]} />
                  <Text>{t('voicemate.singleVoiceTitle', '🎙️ Single Voice')}</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{
                  color: 'var(--hm-color-brand)',
                  borderBottom: '3px solid',
                  borderColor: 'var(--hm-color-brand)',
                  fontWeight: '600',
                  marginBottom: '-2px'
                }}
                color="var(--hm-color-text-muted)"
                _hover={{ color: 'var(--hm-color-brand)' }}
                pb={3}
                px={[3, 4, 6]}
                fontSize={["xs", "sm", "md"]}
                fontWeight="500"
                transition="all 0.2s"
                whiteSpace="nowrap"
                flexShrink={0}
              >
                <HStack spacing={[1, 2, 2]}>
                  <Icon as={FiUsers} boxSize={[4, 5, 5]} />
                  <Text>{t('voicemate.groupConversationTitle', '👥 Group Conversation')}</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Single Voice (Record or Upload) */}
              <TabPanel p={0}>
                <VStack align="stretch" spacing={6}>

                  {/* Tab Description */}
                  <Box
                    bg="var(--hm-color-bg-secondary)"
                    p={4}
                    borderRadius="lg"
                    border="1px solid var(--hm-border-glass)"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                        {t('voicemate.singleVoiceDesc', 'Record your own voice or upload an audio file. Perfect for creating your personal VoiceTwin.')}
                      </Text>
                      <Text fontSize="xs" color="var(--hm-color-text-tertiary)" fontStyle="italic">
                        {t('voicemate.singleVoiceUseCase', 'Best for: Sending messages to family, bedtime stories for kids, voice notes to parents')}
                      </Text>
                    </VStack>
                  </Box>

                  {/* Recording Section */}
                  <Box>
                    <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                      {t('voicemate.recordingStepTitle', 'Step 1: Speak for 30 Seconds')}
                    </Heading>
                    <Text fontSize="sm" color="var(--hm-color-text-secondary)" mb={4}>
                      {t('voicemate.recordingInstructions', 'Find a quiet spot. Speak naturally in Hindi, English, Hinglish, or any language. No studio needed — your bedroom, kitchen, or car works perfectly!')}
                    </Text>

                    {/* Record Button */}
                    <Box position="relative" display="inline-block" mb={4}>
                      <Box className={isRecording ? 'animate-pulse' : ''} position="absolute" inset={0} borderRadius="full" bgGradient="var(--hm-gradient-cta)" opacity={0.6} filter="blur(16px)" />
                      <Button
                        onClick={() => { if (!isRecording) startRecording(); else stopRecording(); }}
                        size="md"
                        borderRadius="full"
                        bgGradient="var(--hm-gradient-cta)"
                        color="white"
                        _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                        leftIcon={<FiMic />}
                      >
                        {isRecording ? t('voicemate.stopRecording', '⏹️ Stop Recording') : t('voicemate.startRecording', '🎙️ Start Recording')}
                      </Button>
                    </Box>

                    {isRecording && (
                      <Box>
                        <WaveformBars active={true} width={260} height={36} />
                        <Text mt={2} fontSize="sm" color="var(--hm-color-text-muted)">
                          {t('voicemate.sampleReadText', "Hi, this is me. I'm recording this short paragraph so HearMe can learn my unique voice...")}
                        </Text>
                      </Box>
                    )}

                    {/* OR Divider */}
                    <HStack my={4} align="center">
                      <Box flex="1" h="1px" bg="var(--hm-border-glass)" />
                      <Text fontSize="sm" color="var(--hm-color-text-muted)">{t('voicemate.or', 'or')}</Text>
                      <Box flex="1" h="1px" bg="var(--hm-border-glass)" />
                    </HStack>

                    {/* Upload Button */}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      display="none"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setSelectedFile(f);
                        setAudioUrl('');
                      }}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      borderColor="var(--hm-border-glass)"
                      color="var(--hm-color-text-primary)"
                      _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}
                      leftIcon={<FiUpload />}
                    >
                      {selectedFile?.name || t('voicemate.uploadAudio', 'Upload Audio File')}
                    </Button>
                  </Box>

                  {/* Preview */}
                  {(audioUrl || filePreviewUrl) && (
                    <Box>
                      <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                        {t('voicemate.preview', 'Preview')}
                      </Heading>
                      <audio controls src={audioUrl || filePreviewUrl} style={{ width: '100%' }} />
                      <Button
                        mt={2}
                        size="sm"
                        variant="ghost"
                        color="var(--hm-color-text-muted)"
                        _hover={{ color: 'var(--hm-color-brand)' }}
                        onClick={() => { setAudioUrl(''); setSelectedFile(null); }}
                      >
                        {t('voicemate.clear', 'Clear')}
                      </Button>
                    </Box>
                  )}

                  {/* Name Input */}
                  <Box>
                    <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
                      {t('voicemate.namingStepTitle', 'Step 3: Give Your VoiceTwin a Name')}
                    </Heading>
                    <Text fontSize="sm" color="var(--hm-color-text-secondary)" mb={3}>
                      {t('voicemate.namingInstructions', 'Choose a name you\'ll remember. This is YOUR voice, make it personal!')}
                    </Text>
                    <Input
                      placeholder={t('voicemate.namingPlaceholder', 'e.g., My Voice, Papa\'s Voice, Maa Ki Awaaz')}
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      bg="transparent"
                      borderColor="var(--hm-border-glass)"
                      mb={3}
                    />
                    <Box
                      bg="var(--hm-color-bg-secondary)"
                      p={3}
                      borderRadius="md"
                      border="1px solid var(--hm-border-glass)"
                    >
                      <Text fontSize="xs" color="var(--hm-color-text-tertiary)" mb={2} fontWeight="600">
                        {t('voicemate.namingIdeasTitle', 'Name Ideas:')}
                      </Text>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="var(--hm-color-text-muted)">
                          {t('voicemate.namingIdea1', '💜 "Maa\'s Voice" (for sending to kids)')}
                        </Text>
                        <Text fontSize="xs" color="var(--hm-color-text-muted)">
                          {t('voicemate.namingIdea2', '🌍 "My NRI Voice" (for parents in India)')}
                        </Text>
                        <Text fontSize="xs" color="var(--hm-color-text-muted)">
                          {t('voicemate.namingIdea3', '🎵 "{{name}}\'s Voice" (simple and clear)', { name: user?.name || 'Your Name' })}
                        </Text>
                        <Text fontSize="xs" color="var(--hm-color-text-muted)">
                          {t('voicemate.namingIdea5', '🏠 "Ghar Ki Awaaz" (voice of home)')}
                        </Text>
                      </VStack>
                    </Box>
                  </Box>

                  {/* Create Button */}
                  <Button
                    onClick={uploadSingleVoice}
                    isDisabled={!voiceName.trim() || (!audioUrl && !selectedFile) || processing}
                    isLoading={processing}
                    loadingText={
                      processing
                        ? t('voicemate.createLoadingCreating', '✨ Creating your VoiceTwin...')
                        : undefined
                    }
                    borderRadius="full"
                    bgGradient="var(--hm-gradient-cta)"
                    color="white"
                    _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                    size="lg"
                  >
                    {t('voicemate.createButtonText', '✨ Create My VoiceTwin')}
                  </Button>
                  <Text fontSize="sm" color="var(--hm-color-text-muted)" textAlign="center">
                    {t('voicemate.createButtonNote', '⏱️ Takes only 60 seconds')}
                  </Text>
                </VStack>
              </TabPanel>

              {/* Tab 2: Multi-Speaker Diarization */}
              <TabPanel p={0}>
                <VStack align="stretch" spacing={6}>

                  {/* Tab Description */}
                  <Box
                    bg="var(--hm-color-bg-secondary)"
                    p={4}
                    borderRadius="lg"
                    border="1px solid var(--hm-border-glass)"
                  >
                    <VStack align="start" spacing={3}>
                      <Heading size="sm" color="var(--hm-color-text-primary)">
                        {t('voicemate.multiSpeakerTitle', '👥 Extract Voices from Group Conversations')}
                      </Heading>
                      <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                        {t('voicemate.multiSpeakerSubtitle', 'Upload a family video or group recording. AI automatically separates each person\'s voice!')}
                      </Text>

                      <Box mt={2}>
                        <Text fontSize="xs" fontWeight="600" color="var(--hm-color-text-tertiary)" mb={2}>
                          {t('voicemate.multiSpeakerPerfectForTitle', 'Perfect For:')}
                        </Text>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerUse1', '🎥 Family videos (birthdays, weddings, festivals)')}
                          </Text>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerUse2', '📹 Group conversations (preserve everyone\'s voice)')}
                          </Text>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerUse3', '🎬 Old recordings (extract grandparents\' voices from family videos)')}
                          </Text>
                        </VStack>
                      </Box>

                      <Box
                        bg="var(--hm-color-bg)"
                        p={3}
                        borderRadius="md"
                        border="1px solid var(--hm-border-glass)"
                        mt={2}
                      >
                        <Text fontSize="xs" fontWeight="600" color="var(--hm-color-text-tertiary)" mb={2}>
                          {t('voicemate.multiSpeakerHowTitle', 'How It Works:')}
                        </Text>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerStep1', '1. Upload video/audio file (MP4, MOV, MP3, WAV)')}
                          </Text>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerStep2', '2. AI analyzes and finds all speakers (takes 2-5 minutes)')}
                          </Text>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerStep3', '3. Preview each voice separately')}
                          </Text>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerStep4', '4. Choose which voices to save')}
                          </Text>
                          <Text fontSize="xs" color="var(--hm-color-text-muted)">
                            {t('voicemate.multiSpeakerStep5', '5. Create VoiceTwins for each person!')}
                          </Text>
                        </VStack>
                      </Box>

                      <Text fontSize="xs" color="var(--hm-color-text-tertiary)" fontStyle="italic" mt={2}>
                        💡 {t('voicemate.multiSpeakerProTip', 'Pro Tip: Longer videos (2-5 minutes) work best. Each person should speak for at least 30 seconds.')}
                      </Text>
                    </VStack>
                  </Box>

                  {/* File Upload */}
                  <Box>
                    <Input
                      ref={diarizationFileInputRef}
                      type="file"
                      accept="video/*,audio/*"
                      display="none"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setDiarizationFile(f);
                        setSpeakers([]);
                      }}
                    />
                    <Button
                      onClick={() => diarizationFileInputRef.current?.click()}
                      variant="outline"
                      borderColor="var(--hm-border-glass)"
                      color="var(--hm-color-text-primary)"
                      _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}
                      leftIcon={<FiUpload />}
                      w="full"
                      size="lg"
                    >
                      {diarizationFile?.name || t('voicemate.multiSpeakerUploadButton', '📤 Upload Group Recording')}
                    </Button>
                  </Box>

                  {/* Analyze Button */}
                  {diarizationFile && speakers.length === 0 && (
                    <Button
                      onClick={analyzeSpeakers}
                      isLoading={diarizationProcessing}
                      borderRadius="full"
                      bgGradient="var(--hm-gradient-cta)"
                      color="white"
                      _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                      size="lg"
                    >
                      {t('voicemate.analyzeSpeakers', 'Analyze Speakers')}
                    </Button>
                  )}

                  {/* Processing Indicator */}
                  {diarizationProcessing && (
                    <Box
                      textAlign="center"
                      py={6}
                      bg="var(--hm-color-bg-secondary)"
                      borderRadius="lg"
                      border="1px solid var(--hm-border-glass)"
                      p={6}
                    >
                      <Spinner size="xl" color="var(--hm-color-brand)" mb={4} />
                      <Text color="var(--hm-color-text-primary)" fontWeight="600" fontSize="md" mb={2}>
                        {t('voicemate.multiSpeakerAnalyzing', '🔍 Analyzing speakers... This may take 2-5 minutes')}
                      </Text>
                      <Text color="var(--hm-color-text-secondary)" fontSize="sm" mb={4}>
                        {t('voicemate.multiSpeakerEncouragement', 'Grab a cup of tea ☕ while AI does the magic!')}
                      </Text>
                      <Progress size="xs" isIndeterminate mt={4} colorScheme="purple" />
                    </Box>
                  )}

                  {/* Speaker List */}
                  {speakers.length > 0 && (
                    <Box>
                      <VStack align="start" spacing={2} mb={4}>
                        <Heading size="sm" color="var(--hm-color-text-primary)">
                          {t('voicemate.multiSpeakerFoundTitle', '{{count}} Speakers Found! 🎉', { count: speakers.length })}
                        </Heading>
                        <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                          {t('voicemate.multiSpeakerFoundInstructions', 'Preview each voice. Select the ones you want to save.')}
                        </Text>
                      </VStack>
                      <VStack align="stretch" spacing={3}>
                        {speakers.map((speaker, idx) => (
                          <Card
                            key={speaker.speaker}
                            border="1px solid var(--hm-border-glass)"
                            bg={selectedSpeakers.has(speaker.speaker) ? 'var(--hm-bg-glass)' : 'transparent'}
                            transition="0.2s"
                            _hover={{ borderColor: 'var(--hm-color-brand)' }}
                          >
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between" align="start">
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Input
                                      value={speakerNames[speaker.speaker] || ''}
                                      onChange={(e) => setSpeakerNames({ ...speakerNames, [speaker.speaker]: e.target.value })}
                                      placeholder={t('voicemate.multiSpeakerNameInput', 'Give this voice a name (e.g., Papa, Maa, Dadi)')}
                                      size="sm"
                                      variant="flushed"
                                      borderColor="var(--hm-border-glass)"
                                    />
                                    <HStack spacing={2} fontSize="xs" color="var(--hm-color-text-muted)">
                                      <Badge colorScheme="purple">{speaker.segments} segments</Badge>
                                      <Text>{speaker.duration}s</Text>
                                      <Text>{speaker.size}</Text>
                                    </HStack>
                                  </VStack>
                                  <HStack spacing={2}>
                                    <IconButton
                                      icon={selectedSpeakers.has(speaker.speaker) ? <FiCheck /> : <FiX />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme={selectedSpeakers.has(speaker.speaker) ? 'green' : 'gray'}
                                      onClick={() => {
                                        const newSet = new Set(selectedSpeakers);
                                        if (newSet.has(speaker.speaker)) {
                                          newSet.delete(speaker.speaker);
                                        } else {
                                          newSet.add(speaker.speaker);
                                        }
                                        setSelectedSpeakers(newSet);
                                      }}
                                      aria-label={selectedSpeakers.has(speaker.speaker) ? 'Deselect' : 'Select'}
                                    />
                                  </HStack>
                                </HStack>

                                {/* Audio Player */}
                                <Box>
                                  {speakerAudioUrls[speaker.speaker] ? (
                                    <audio
                                      controls
                                      src={speakerAudioUrls[speaker.speaker]}
                                      style={{ width: '100%', height: '32px' }}
                                      preload="metadata"
                                    />
                                  ) : (
                                    <HStack justify="center" py={2}>
                                      <Spinner size="sm" color="var(--hm-color-brand)" />
                                      <Text fontSize="xs" color="var(--hm-color-text-muted)">
                                        Loading audio...
                                      </Text>
                                    </HStack>
                                  )}
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>

                      {/* Process Button */}
                      <Button
                        mt={4}
                        onClick={processSelectedSpeakers}
                        isDisabled={selectedSpeakers.size === 0 || processing}
                        isLoading={processing}
                        loadingText={
                          processing
                            ? t('voicemate.createLoadingCreating', '✨ Creating your VoiceTwins...')
                            : undefined
                        }
                        borderRadius="full"
                        bgGradient="var(--hm-gradient-cta)"
                        color="white"
                        _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                        size="lg"
                        w="full"
                      >
                        {t('voicemate.multiSpeakerCreateButton', 'Create {{count}} VoiceTwins', { count: selectedSpeakers.size })}
                      </Button>
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Success Message */}
        {success && (
          <Box
            className="hm-glass-card p-6 rounded-2xl"
            p="20px"
            w="full"
            border="2px solid var(--hm-color-brand)"
            bgGradient="var(--hm-gradient-cta-soft)"
            textAlign="center"
          >
            <Heading size="md" color="var(--hm-color-text-primary)">
              {t('voicemate.successModalTitle', '🎉 Shabash! Your VoiceTwin Is Ready!')}
            </Heading>
            <Text mt={2} color="var(--hm-color-text-secondary)" fontSize="md">
              {t('voicemate.successModalSubtitle', 'Your voice now lives in HearMe. Send messages that sound exactly like YOU!')}
            </Text>

            <VStack align="start" mt={4} spacing={2} bg="var(--hm-color-bg)" p={4} borderRadius="lg">
              <Text fontSize="sm" fontWeight="600" color="var(--hm-color-text-primary)">
                {t('voicemate.successWhatYouCanDoTitle', 'What You Can Do Now:')}
              </Text>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('voicemate.successAction1', '💬 Send voice messages in chat (type text, hear YOUR voice)')}
              </Text>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('voicemate.successAction2', '📱 Share with family across India or abroad')}
              </Text>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('voicemate.successAction3', '🌙 Send bedtime stories to kids (even when you\'re working late)')}
              </Text>
            </VStack>

            <Stack direction={["column", "column", "row"]} mt={4} spacing={3} justify="center" w={["full", "full", "auto"]} px={[4, 6, 0]}>
              <Button
                as={RouterLink}
                to="/chat"
                borderRadius="full"
                bgGradient="var(--hm-gradient-cta)"
                color="white"
                _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                size="md"
                w={["full", "full", "auto"]}
              >
                {t('voicemate.successCtaPrimary', '💬 Try It in Chat Now')}
              </Button>
              <Button
                onClick={() => setSuccess(false)}
                borderRadius="full"
                variant="outline"
                borderColor="var(--hm-color-brand)"
                color="var(--hm-color-brand)"
                _hover={{ bg: 'var(--hm-color-brand)', color: 'white' }}
                size="md"
                w={["full", "full", "auto"]}
              >
                {t('voicemate.successCtaSecondary', 'Create Another Voice')}
              </Button>
            </Stack>
          </Box>
        )}

        {/* My Voices Section */}
        {voices.length > 0 && (
          <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
            <VStack align="start" spacing={3} mb={6}>
              <HStack spacing={3}>
                <Icon as={FiFolder} boxSize={6} color="var(--hm-color-brand)" />
                <Heading size="md" color="var(--hm-color-text-primary)">
                  {t('voicemate.myVoicesTitle', 'Your Voice Collection 🎙️')}
                </Heading>
                <Badge
                  colorScheme="purple"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="var(--hm-bg-glass)"
                  color="var(--hm-color-brand)"
                  border="1px solid var(--hm-border-glass)"
                >
                  {voices.length}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                {t('voicemate.myVoicesSubtitle', 'All your VoiceTwins in one place. Rename, preview, or delete anytime.')}
              </Text>
              <Text fontSize="xs" color="var(--hm-color-text-tertiary)" fontStyle="italic">
                {voices.length === 1
                  ? t('voicemate.myVoices1', 'Great start! You have 1 VoiceTwin. Create more for different moods or languages!')
                  : t('voicemate.myVoicesMany', 'Amazing! You have {{count}} VoiceTwins. You\'re a pro! 🌟', { count: voices.length })
                }
              </Text>
            </VStack>

            {loadingVoices ? (
              <HStack justify="center" py={8}>
                <Spinner size="lg" color="var(--hm-color-brand)" />
                <Text color="var(--hm-color-text-secondary)">
                  {t('voicemate.loadingVoices', 'Loading your voices...')}
                </Text>
              </HStack>
            ) : (
              <SimpleGrid columns={[1, 1, 2]} spacing={4}>
                {voices.map((voice) => (
                  <Card
                    key={voice.voiceId}
                    border="1px solid var(--hm-border-glass)"
                    bg="transparent"
                    transition="all 0.3s"
                    _hover={{
                      borderColor: 'var(--hm-color-brand)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
                    }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        {/* Voice Header */}
                        <HStack justify="space-between" align="start">
                          <HStack spacing={2} flex={1}>
                            <Icon as={FiStar} color="var(--hm-color-brand)" boxSize={5} />
                            <Editable
                              value={voice.name}
                              onSubmit={(newName) => handleRenameVoice(voice.voiceId, newName)}
                              isDisabled={editingVoiceId === voice.voiceId}
                              flex={1}
                            >
                              <Tooltip label={t('voicemate.clickToRename', 'Click to rename')} placement="top">
                                <EditablePreview
                                  fontSize="md"
                                  fontWeight="600"
                                  color="var(--hm-color-text-primary)"
                                  cursor="pointer"
                                  _hover={{ color: 'var(--hm-color-brand)' }}
                                  py={1}
                                  px={2}
                                  borderRadius="md"
                                />
                              </Tooltip>
                              <EditableInput
                                fontSize="md"
                                fontWeight="600"
                                color="var(--hm-color-text-primary)"
                                bg="var(--hm-bg-glass)"
                                borderColor="var(--hm-border-glass)"
                                _focus={{ borderColor: 'var(--hm-color-brand)' }}
                                py={1}
                                px={2}
                              />
                            </Editable>
                          </HStack>
                        </HStack>

                        {/* Voice Metadata */}
                        <HStack spacing={3} fontSize="xs" color="var(--hm-color-text-muted)">
                          <HStack spacing={1}>
                            <Icon as={FiClock} boxSize={3} />
                            <Text>
                              {voice.createdAt
                                ? new Date(voice.createdAt).toLocaleDateString()
                                : t('voicemate.unknown', 'Unknown')}
                            </Text>
                          </HStack>
                          <Badge
                            colorScheme="purple"
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg="var(--hm-bg-glass)"
                            color="var(--hm-color-brand)"
                            border="1px solid var(--hm-border-glass)"
                          >
                            {voice.sourceType === 'record' ? t('voicemate.recorded', 'Recorded') : t('voicemate.uploaded', 'Uploaded')}
                          </Badge>
                        </HStack>

                        {/* Action Buttons */}
                        <HStack spacing={2} justify="flex-end">
                          <Tooltip label={t('voicemate.playPreview', 'Play preview')} placement="top">
                            <IconButton
                              icon={playingVoiceId === voice.voiceId ? <FiPause /> : <FiPlay />}
                              size="sm"
                              variant="ghost"
                              color={playingVoiceId === voice.voiceId ? 'var(--hm-color-brand)' : 'var(--hm-color-text-muted)'}
                              _hover={{ color: 'var(--hm-color-brand)', bg: 'var(--hm-bg-glass)' }}
                              onClick={() => handlePlayVoice(voice)}
                              isLoading={playingVoiceId === voice.voiceId}
                              aria-label={t('voicemate.playPreview', 'Play preview')}
                            />
                          </Tooltip>
                          <Tooltip label={t('voicemate.rename', 'Rename')} placement="top">
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              variant="ghost"
                              color="var(--hm-color-text-muted)"
                              _hover={{ color: 'var(--hm-color-brand)', bg: 'var(--hm-bg-glass)' }}
                              onClick={() => setEditingVoiceId(voice.voiceId)}
                              aria-label={t('voicemate.rename', 'Rename')}
                            />
                          </Tooltip>
                          <Tooltip label={t('voicemate.delete', 'Delete')} placement="top">
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              color="var(--hm-color-text-muted)"
                              _hover={{ color: 'red.500', bg: 'var(--hm-bg-glass)' }}
                              onClick={() => confirmDelete(voice)}
                              isLoading={deletingVoiceId === voice.voiceId}
                              aria-label={t('voicemate.delete', 'Delete')}
                            />
                          </Tooltip>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Box>
        )}

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} isCentered>
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent
            bg="var(--hm-bg-glass)"
            borderColor="var(--hm-border-glass)"
            border="1px solid"
            backdropFilter="blur(10px)"
          >
            <ModalHeader color="var(--hm-color-text-primary)">
              {t('voicemate.confirmDelete', 'Delete Voice?')}
            </ModalHeader>
            <ModalCloseButton color="var(--hm-color-text-muted)" />
            <ModalBody>
              <VStack align="start" spacing={3}>
                <Text color="var(--hm-color-text-secondary)">
                  {t('voicemate.deleteWarning', 'Are you sure you want to delete this voice? This action cannot be undone.')}
                </Text>
                {voiceToDelete && (
                  <HStack
                    p={3}
                    bg="var(--hm-bg-glass)"
                    borderRadius="md"
                    border="1px solid var(--hm-border-glass)"
                    w="full"
                  >
                    <Icon as={FiStar} color="var(--hm-color-brand)" />
                    <Text fontWeight="600" color="var(--hm-color-text-primary)">
                      {voiceToDelete.name}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button
                  variant="ghost"
                  onClick={onDeleteModalClose}
                  color="var(--hm-color-text-muted)"
                  _hover={{ color: 'var(--hm-color-text-primary)', bg: 'var(--hm-bg-glass)' }}
                >
                  {t('voicemate.cancel', 'Cancel')}
                </Button>
                <Button
                  bgGradient="linear(to-r, red.500, red.600)"
                  color="white"
                  _hover={{ bgGradient: 'linear(to-r, red.600, red.700)' }}
                  onClick={handleDeleteVoice}
                  isLoading={!!deletingVoiceId}
                >
                  {t('voicemate.deleteConfirm', 'Delete')}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* How It Works */}
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.howTitle', 'How It Works')}</Heading>
          <SimpleGrid mt={4} columns={[1, 2]} spacing={6}>
            <Card border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Heading size="sm" color="var(--hm-color-brand)">
                    <FiMic style={{ display: 'inline', marginRight: '8px' }} />
                    {t('voicemate.singleVoiceTitle', 'Single Voice')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.singleVoiceDesc', 'Record or upload your own voice sample. Perfect for creating your personal VoiceTwin.')}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Heading size="sm" color="var(--hm-color-brand)">
                    <FiUsers style={{ display: 'inline', marginRight: '8px' }} />
                    {t('voicemate.groupConversationTitle', 'Group Conversation')}
                  </Heading>
                  <Text fontSize="sm" color="var(--hm-color-text-secondary)">
                    {t('voicemate.groupConversationDesc', 'Upload a video/audio with multiple speakers. AI separates each voice automatically.')}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </VStack>
    </Flex>
  );
}

