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
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiMic, FiUpload, FiCheck, FiX, FiUsers } from 'react-icons/fi';

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
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/voicetwin/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        if (res.ok) {
          const data = await res.json();
          setVoices(Array.isArray(data?.voices) ? data.voices : []);
        }
      } catch (e) {
        // ignore
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
          <Box className="hm-glass-card p-8 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} bgGradient="var(--hm-gradient-cta-soft)">
            <VStack align="start" spacing={4}>
              <Heading size="lg" color="var(--hm-color-text-primary)">
                {t('voicemate.heroTitle', 'Your Voice Has Power — Let It Speak')}
              </Heading>
              <Text color="var(--hm-color-text-secondary)">
                {t('voicemate.heroSub', 'Create AI voices from your recordings or extract voices from group conversations.')}
              </Text>
              <Button as={RouterLink} to="/login" size="md" borderRadius="full"
                bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
                {t('voicemate.ctaSignIn', '✨ Sign In to Create My VoiceTwin')}
              </Button>
            </VStack>
          </Box>
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
          <VStack align="start" spacing={3}>
            <Heading size="lg" color="var(--hm-color-text-primary)">
              {t('voicemate.userHero', 'Hey {{name}}, Ready to Bring Your Voice to Life?', { name: user?.name || t('voicemate.user', 'Friend') })}
            </Heading>
            <Text color="var(--hm-color-text-secondary)">
              {t('voicemate.heroSub', 'Create AI voices from your recordings or extract voices from group conversations.')}
            </Text>
          </VStack>
        </Box>

        {/* Tabbed Interface */}
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <Tabs index={tabIndex} onChange={setTabIndex} variant="soft-rounded" colorScheme="purple">
            <TabList mb={6}>
              <Tab
                _selected={{ bg: 'var(--hm-gradient-cta)', color: 'white' }}
                color="var(--hm-color-text-muted)"
                _hover={{ color: 'var(--hm-color-brand)' }}
                borderRadius="full"
              >
                <HStack spacing={2}>
                  <FiMic />
                  <Text>{t('voicemate.singleVoice', 'Single Voice')}</Text>
                </HStack>
              </Tab>
              <Tab
                _selected={{ bg: 'var(--hm-gradient-cta)', color: 'white' }}
                color="var(--hm-color-text-muted)"
                _hover={{ color: 'var(--hm-color-brand)' }}
                borderRadius="full"
                ml={2}
              >
                <HStack spacing={2}>
                  <FiUsers />
                  <Text>{t('voicemate.multiSpeaker', 'Group Conversation')}</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Single Voice (Record or Upload) */}
              <TabPanel p={0}>
                <VStack align="stretch" spacing={6}>
                  {/* Recording Section */}
                  <Box>
                    <Heading size="sm" color="var(--hm-color-text-primary)" mb={3}>
                      {t('voicemate.recordOrUpload', 'Record or Upload Your Voice')}
                    </Heading>

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
                      {t('voicemate.nameLabel', 'Name your voice')}
                    </Heading>
                    <Input
                      placeholder={t('voicemate.namePlaceholder', 'e.g., My Voice')}
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      bg="transparent"
                      borderColor="var(--hm-border-glass)"
                    />
                  </Box>

                  {/* Upload Button */}
                  <Button
                    onClick={uploadSingleVoice}
                    isDisabled={!voiceName.trim() || (!audioUrl && !selectedFile) || processing}
                    isLoading={processing}
                    borderRadius="full"
                    bgGradient="var(--hm-gradient-cta)"
                    color="white"
                    _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                    size="lg"
                  >
                    {t('voicemate.createVoice', 'Create VoiceTwin')}
                  </Button>
                </VStack>
              </TabPanel>

              {/* Tab 2: Multi-Speaker Diarization */}
              <TabPanel p={0}>
                <VStack align="stretch" spacing={6}>
                  <Text color="var(--hm-color-text-secondary)">
                    {t('voicemate.multiSpeakerDesc', 'Upload a video or audio file with multiple speakers. We\'ll automatically separate each voice for you.')}
                  </Text>

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
                    >
                      {diarizationFile?.name || t('voicemate.uploadVideo', 'Upload Video/Audio File')}
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
                    <Box textAlign="center" py={6}>
                      <Spinner size="xl" color="var(--hm-color-brand)" mb={4} />
                      <Text color="var(--hm-color-text-secondary)">
                        {t('voicemate.analyzing', 'Analyzing speakers... This may take a few minutes.')}
                      </Text>
                      <Progress size="xs" isIndeterminate mt={4} colorScheme="purple" />
                    </Box>
                  )}

                  {/* Speaker List */}
                  {speakers.length > 0 && (
                    <Box>
                      <Heading size="sm" color="var(--hm-color-text-primary)" mb={4}>
                        {t('voicemate.foundSpeakers', `Found ${speakers.length} Speaker(s)`)}
                      </Heading>
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
                                      placeholder={`Speaker ${idx + 1}`}
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
                        borderRadius="full"
                        bgGradient="var(--hm-gradient-cta)"
                        color="white"
                        _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}
                        size="lg"
                        w="full"
                      >
                        {t('voicemate.createSelectedVoices', `Create ${selectedSpeakers.size} Voice(s)`)}
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
          <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" textAlign="center">
            <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.readyTitle', 'Your VoiceTwin Is Ready!')}</Heading>
            <Text mt={2} color="var(--hm-color-text-secondary)">{t('voicemate.readySub', 'Now your messages will sound like you.')}</Text>
            <HStack mt={4} spacing={3} justify="center">
              <Button as={RouterLink} to="/chat" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
                {t('voicemate.tryInChat', '💬 Try It in Chat')}
              </Button>
            </HStack>
          </Box>
        )}

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

