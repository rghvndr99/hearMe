import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Divider,
  Input,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';
const MotionBox = motion(Box);

export default function VoiceMate() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  // Auth state
  const token = typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null;
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(!!token);

  // Recording state (placeholder but functional)
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Voice creation state
  const [voiceName, setVoiceName] = useState('');
  const [mode, setMode] = useState(''); // '', 'record' | 'upload'
  const [selectedFile, setSelectedFile] = useState(null);


	  const fileInputRef = useRef(null);

  const [filePreviewUrl, setFilePreviewUrl] = useState('');

  // Saved voices
  const [voices, setVoices] = useState([]);

  const API_URL = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:5001', []);

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

  // Anonymous demo: simple TTS using SpeechSynthesis as a placeholder
  const playDemo = () => {
    try {
      const phrase = t(
        'voicemate.demoPhrase',
        'This is a demo of what is possible. Imagine hearing your own voice delivering these words.'
      );
      const u = new SpeechSynthesisUtterance(phrase);
      u.lang = (localStorage.getItem('hm-language') || 'en-US');
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch (e) {
      toast({ title: t('voicemate.demoError', 'Demo not available in this browser'), status: 'warning' });
    }
  };

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
      // auto-stop after 30s
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

  // Upload from file helper
  const uploadFromFile = async () => {
    if (!selectedFile) return;
    // Client-side validation: size <= 10MB and basic audio mimetype
    const allowed = new Set(['audio/webm','audio/wav','audio/x-wav','audio/mpeg','audio/mp3','audio/ogg','audio/opus','audio/aac','audio/m4a','audio/x-m4a']);
    if (!allowed.has(selectedFile.type)) {
      toast({ title: t('voicemate.uploadError', 'Could not create VoiceTwin'), description: t('voicemate.unsupportedAudio', 'Unsupported audio type'), status: 'error' });
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({ title: t('voicemate.uploadError', 'Could not create VoiceTwin'), description: t('voicemate.tooLarge', 'File too large. Please keep it under 10MB.'), status: 'error' });
      return;
    }
    if (!voiceName || !voiceName.trim()) {
      toast({ title: t('voicemate.nameLabel', 'Name your voice'), description: t('voicemate.nameRequired', 'Please enter a name for your voice before saving.'), status: 'warning' });
      return;
    }
    try {
      setProcessing(true);
      setSuccess(false);
      const form = new FormData();
      form.append('audio', selectedFile, selectedFile.name || 'sample.wav');
      form.append('name', (voiceName && voiceName.trim()) || (user?.name ? `${user.name}'s VoiceTwin` : 'VoiceTwin'));
      form.append('sourceType', 'upload');
      const resp = await fetch(`${API_URL}/api/voicetwin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Upload failed');
      toast({ title: t('voicemate.ready', 'Your VoiceTwin is ready!'), status: 'success' });
      setSuccess(true);
      setSelectedFile(null);
    } catch (e) {
      toast({ title: t('voicemate.uploadError', 'Could not create VoiceTwin'), description: String(e?.message || e), status: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  // Rename a saved voice
  const renameVoice = async (id) => {
    const current = voices.find(v => (v.id || v._id) === id)?.name || '';
    const name = typeof window !== 'undefined' ? window.prompt(t('voicemate.nameLabel', 'Name your voice'), current) : '';
    if (!name) return;
    try {
      const resp = await fetch(`${API_URL}/api/voicetwin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (!resp.ok) throw new Error('Rename failed');
      setVoices(prev => prev.map(v => ((v.id || v._id) === id ? { ...v, name } : v)));
      toast({ title: t('voicemate.renamed', 'Voice renamed'), status: 'success' });
    } catch (e) {
      toast({ title: t('voicemate.error', 'Something went wrong'), description: String(e?.message || e), status: 'error' });
    }
  };

  // Delete a saved voice
  const deleteVoice = async (id) => {
    if (!(typeof window !== 'undefined' && window.confirm(t('voicemate.confirmDelete', 'Delete this voice?')))) return;
    try {
      const resp = await fetch(`${API_URL}/api/voicetwin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Delete failed');
      setVoices(prev => prev.filter(v => (v.id || v._id) !== id));
      toast({ title: t('voicemate.deleted', 'Voice deleted'), status: 'success' });
    } catch (e) {
      toast({ title: t('voicemate.error', 'Something went wrong'), description: String(e?.message || e), status: 'error' });
    }
  };


  // Play a short sample with a saved voice
  const playVoiceSample = async (voiceId) => {
    try {
      const text = t('voicemate.sampleReadText', "Hi, this is me. I’m recording this short paragraph so HearMe can learn my unique voice. I speak naturally, clearly, and calmly. I am comfortable and safe. This is a sample for my VoiceTwin.");
      const resp = await fetch(`${API_URL}/api/tts/eleven`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId })
      });
      if (!resp.ok) throw new Error('TTS failed');
      const buf = await resp.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }));
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      toast({ title: 'Sample failed', description: String(e?.message || e), status: 'error' });
    }
  };

  const uploadAndProcess = async () => {
    if (!audioUrl) return;
    if (!voiceName || !voiceName.trim()) {
      toast({ title: t('voicemate.nameLabel', 'Name your voice'), description: t('voicemate.nameRequired', 'Please enter a name for your voice before saving.'), status: 'warning' });
      return;
    }
    try {
      setProcessing(true);
      setSuccess(false);
      // Fetch recorded audio blob from object URL
      const blob = await (await fetch(audioUrl)).blob();
      const form = new FormData();
      form.append('audio', blob, 'sample.webm');
      form.append('name', (voiceName && voiceName.trim()) || (user?.name ? `${user.name}'s VoiceTwin` : 'VoiceTwin'));
      form.append('sourceType', 'record');
      const resp = await fetch(`${API_URL}/api/voicetwin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || 'Upload failed');
      }
      if (data?.voiceId) {
        try { localStorage.setItem('hm-voicetwin-voice-id', data.voiceId); } catch {}
      }
      toast({ title: t('voicemate.ready', 'Your VoiceTwin is ready!'), status: 'success' });
      setSuccess(true);
      // refresh list and clear preview
      try { setAudioUrl(''); } catch {}
    } catch (e) {
      toast({ title: t('voicemate.uploadError', 'Could not create VoiceTwin'), description: String(e?.message || e), status: 'error' });
    } finally {
      setProcessing(false);
    }
  };
  // Unified save handler: decides between recorded audio vs file upload
  const saveVoiceHandler = async () => {
    if (!voiceName || !voiceName.trim()) {
      toast({ title: t('voicemate.nameLabel', 'Name your voice'), description: t('voicemate.nameRequired', 'Please enter a name for your voice before saving.'), status: 'warning' });
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }
    if (audioUrl) {
      await uploadAndProcess();
      return;
    }
    if (selectedFile) {
      await uploadFromFile();
      return;
    }
    toast({ title: t('voicemate.preview', 'Preview'), description: t('voicemate.noAudio', 'Please record or select an audio file first.'), status: 'warning' });
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
          // rounded rect
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

  const AnonymousView = () => (
    <VStack align="stretch" spacing={10}>
      {/* Hero */}
      <Box className="hm-glass-card p-8 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} bgGradient="var(--hm-gradient-cta-soft)">
        <VStack align="start" spacing={4}>
          <Heading size="lg" color="var(--hm-color-text-primary)">
            {t('voicemate.heroTitle', 'Your Voice Has Power — Let It Speak, Even When You’re Not There.')}
          </Heading>
          <Text color="var(--hm-color-text-secondary)">
            {t('voicemate.heroSub', 'With HearMe’s VoiceTwin, your voice becomes your messenger — speaking your words, emotions, and feelings through AI.')}
          </Text>
          <HStack spacing={3} flexWrap="wrap">
            <Button as={RouterLink} to="/login" size="md" borderRadius="full"
              bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
              {t('voicemate.ctaSignIn', '✨ Sign In to Create My VoiceTwin')}
            </Button>
            <Button as={RouterLink} to="/about" variant="ghost" color="var(--hm-color-brand)" _hover={{ color: 'var(--hm-color-brand)' }}>
              {t('voicemate.learnHow', 'Learn How It Works →')}
            </Button>
          </HStack>
          <Box mt={6}>
            <WaveformBars active={true} />
          </Box>
        </VStack>
      </Box>

      {/* Benefits */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <Heading size="md" color="var(--hm-color-text-primary)">
          {t('voicemate.benefitsTitle', 'Why Create Your VoiceTwin?')}
        </Heading>
        <SimpleGrid mt={5} columns={[1, 3]} spacing={6}>
          {[
            t('voicemate.benefit1', 'Stay connected with loved ones through your own voice.'),
            t('voicemate.benefit2', 'Make your chats sound human, not robotic.'),
            t('voicemate.benefit3', 'Preserve your voice and emotions with privacy.'),
          ].map((text, idx) => (
            <Card key={idx} className="rounded-xl" border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Box fontSize="lg">🔊</Box>
                  <Text color="var(--hm-color-text-secondary)">{text}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Emotional hook */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <VStack align="start" spacing={3}>
          <Heading size="md" color="var(--hm-color-text-primary)">❤️ {t('voicemate.anonEmotionalTitle', 'When distance grows, a familiar voice brings us back.')}</Heading>
          <Text color="var(--hm-color-text-secondary)">
            {t('voicemate.anonEmotionalBody', "Imagine your child hearing your words in your true voice when you’re late at work. Or a parent abroad hearing your warmth across time zones. For some of us, it’s also a way to preserve a voice we never want to lose.")}
          </Text>
          <HStack pt={2} spacing={3}>
            <Button as={RouterLink} to="/login" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
              {t('voicemate.ctaSignIn', '✨ Sign In to Create My VoiceTwin')}
            </Button>
            <Button as={RouterLink} to="/about" variant="ghost" color="var(--hm-color-brand)" _hover={{ color: 'var(--hm-color-brand)' }}>
              {t('voicemate.anonGetStarted', 'Get Started')}
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Value proposition */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <VStack align="start" spacing={3}>
          <Heading size="md" color="var(--hm-color-text-primary)">💛 {t('voicemate.anonValueTitle','Priceless connection, not just technology')}</Heading>
          <Text color="var(--hm-color-text-secondary)">{t('voicemate.anonValueBody','Money can’t replace the comfort of a real, familiar voice. VoiceTwin lets your words carry your emotion — safely, privately, and in your language.')}</Text>
        </VStack>
      </Box>

      {/* What is VoiceTwin */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <VStack align="start" spacing={3}>
          <Heading size="md" color="var(--hm-color-text-primary)">🧠 {t('voicemate.anonWhatTitle','What is VoiceTwin?')}</Heading>
          <Text color="var(--hm-color-text-secondary)">{t('voicemate.anonWhatBody','VoiceTwin is an AI-powered way to create a digital version of your voice. Record or upload a short sample, and in about a minute, you can send messages that sound like you.')}</Text>
        </VStack>
      </Box>

      {/* Use cases */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <Heading size="md" color="var(--hm-color-text-primary)">📌 {t('voicemate.anonUseCasesTitle', 'Made for the moments that matter')}</Heading>
        <SimpleGrid mt={4} columns={[1, 3]} spacing={6}>
          {[t('voicemate.anonUseCase1','Stay close to family across borders — send messages in your own voice.'),
            t('voicemate.anonUseCase2','Leave loving notes for children — bedtime stories, reminders, encouragement.'),
            t('voicemate.anonUseCase3','Preserve memories — keep your voice for the people who love you.')].map((s, i) => (
            <Card key={i} border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text>• {s}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Visual flow */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.howTitle', 'How It Works')}</Heading>
        <HStack mt={4} spacing={4} align="center" wrap="wrap">
          <Box>
            <Text fontWeight="700" color="var(--hm-color-brand)">1</Text>
            <Text color="var(--hm-color-text-secondary)">{t('voicemate.step1', 'Record your voice (30 seconds).')}</Text>
          </Box>
          <Text color="var(--hm-color-text-muted)">→</Text>
          <Box>
            <Text fontWeight="700" color="var(--hm-color-brand)">2</Text>
            <Text color="var(--hm-color-text-secondary)">{t('voicemate.step2', 'AI creates your VoiceTwin.')}</Text>
          </Box>
          <Text color="var(--hm-color-text-muted)">→</Text>
          <Box>
            <Text fontWeight="700" color="var(--hm-color-brand)">3</Text>
            <Text color="var(--hm-color-text-secondary)">{t('voicemate.step3', 'Use it in chats instantly.')}</Text>
          </Box>
        </HStack>
        <HStack mt={4} spacing={3}>
          <Button as={RouterLink} to="/login" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
            {t('voicemate.ctaSignIn', '✨ Sign In to Create My VoiceTwin')}
          </Button>
          <Button as={RouterLink} to="/about" variant="ghost" color="var(--hm-color-brand)" _hover={{ color: 'var(--hm-color-brand)' }}>
            {t('voicemate.learnHow', 'Learn How It Works →')}
          </Button>
        </HStack>
      </Box>

      {/* Trust */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <Heading size="md" color="var(--hm-color-text-primary)">🔒 {t('voicemate.trustTitle', 'Privacy and security you can rely on')}</Heading>
        <VStack align="start" spacing={2} mt={3}>
          <Text>• {t('voicemate.trust1', 'Your audio is encrypted in transit and stored securely.')}</Text>
          <Text>• {t('voicemate.trust2', 'We only use your sample to create your VoiceTwin — never for ads.')}</Text>
          <Text>• {t('voicemate.trust3', 'You control your data. Rename or delete your voice anytime.')}</Text>
        </VStack>
      </Box>

      {/* Demo */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <HStack justify="space-between" align="center">
          <Heading size="md" color="var(--hm-color-text-primary)">
            {t('voicemate.hearWhatsPossible', 'Hear What’s Possible')}
          </Heading>
          <Button onClick={playDemo} borderRadius="full" variant="ghost" color="var(--hm-color-brand)" _hover={{ color: 'var(--hm-color-brand)' }}>🔈 {t('voicemate.hearDemo', 'Hear a Demo')}</Button>
        </HStack>
        <Text mt={3} color="var(--hm-color-text-muted)">
          {t('voicemate.demoNote', 'Demo uses your browser’s voice as a teaser. The real VoiceTwin uses your own voice via ElevenLabs.')}
        </Text>
      </Box>

      {/* Upgrade CTA */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} textAlign="center">
        <Heading size="md" color="var(--hm-color-text-primary)">
          {t('voicemate.upgradeCopy', 'Sign in and create your VoiceTwin in under 1 minute.')}
        </Heading>
        <Button as={RouterLink} to="/login" mt={4} borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
          {t('voicemate.upgradeCta', '🎙️ Sign In & Create My VoiceTwin')}
        </Button>
        <Text mt={2} color="var(--hm-color-text-muted)">
          {t('voicemate.privacy', 'We’ll guide you step-by-step. Your voice stays private and secure.')}
        </Text>
      </Box>
    </VStack>
  );

  const LoggedInView = () => (
    <VStack align="stretch" spacing={8}>
      {/* Hero */}
      <Box className="hm-glass-card p-8 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} bgGradient="var(--hm-gradient-cta-soft)">
        <VStack align="start" spacing={3}>
          <Heading size="lg" color="var(--hm-color-text-primary)">
            {t('voicemate.userHero', 'Hey {{name}}, Ready to Bring Your Voice to Life?', { name: user?.name || t('voicemate.user', 'Friend') })}
          </Heading>
          <Text color="var(--hm-color-text-secondary)">
            {t('voicemate.userSub', 'Record a short voice sample, and our AI will create your unique VoiceTwin.')}
          </Text>
          <Box position="relative" display="inline-block">
            <Box className={isRecording ? 'animate-pulse' : ''}
                 position="absolute" inset={0} borderRadius="full"
                 bgGradient="var(--hm-gradient-cta)" opacity={0.6}
                 filter="blur(16px)" />
            <Button onClick={() => { if (!isRecording) startRecording(); else stopRecording(); }}
              size="md" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
              {isRecording ? t('voicemate.stopRecording', '⏹️ Stop Recording') : t('voicemate.startRecording', '🎙️ Start Recording')}
            </Button>
          </Box>
          <Box mt={4}><WaveformBars active={isRecording} width={260} height={36} /></Box>
          {isRecording && (<Text mt={2} color="var(--hm-color-text-muted)">{t('voicemate.sampleReadText', "Hi, this is me. I’m recording this short paragraph so HearMe can learn my unique voice. I speak naturally, clearly, and calmly. I am comfortable and safe. This is a sample for my VoiceTwin.")}</Text>)}
        </VStack>
      </Box>

      {/* Create section: name + mode + upload (logged-in) */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <VStack align="stretch" spacing={3}>
          <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.recordOrUploadTitle', 'Create your VoiceTwin')}</Heading>
          <Input
            placeholder={t('voicemate.nameLabel', 'Name your voice')}
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            bg="transparent"
            borderColor="var(--hm-border-glass)"
          />
          <HStack spacing={3}>
            <Button variant={mode==='upload' ? 'solid' : 'ghost'} borderRadius="full"
              bgGradient={mode==='upload' ? 'var(--hm-gradient-cta)' : undefined}
              color={mode==='upload' ? 'white' : 'var(--hm-color-brand)'}
              _hover={mode==='upload' ? { bgGradient: 'var(--hm-gradient-cta-hover)' } : { color: 'var(--hm-color-brand)' }}
              onClick={() => setMode('upload')}
            >{t('voicemate.uploadOptionLabel', 'Upload audio file')}</Button>
          </HStack>

          {mode==='upload' && (
            <HStack spacing={3} flexWrap="wrap">
              <Input type="file" accept="audio/*" onChange={(e)=> { const f = e.target.files?.[0] || null; setSelectedFile(f); setAudioUrl(''); setSuccess(false); setProcessing(false); }} />
              <Button onClick={uploadFromFile} isDisabled={!selectedFile || !voiceName || !voiceName.trim()} borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>{t('voicemate.previewUpload', 'Preview & Upload')}</Button>
              <Button variant="ghost" onClick={() => setMode('record')} _hover={{ color: 'var(--hm-color-brand)' }}>{t('voicemate.useMic', 'Use microphone instead')}</Button>
            </HStack>
          )}
        </VStack>
      </Box>


      {/* How it works */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.howTitle', 'How It Works')}</Heading>
        <SimpleGrid mt={4} columns={[1, 3]} spacing={6}>
          {[t('voicemate.step1', 'Record your voice (30 seconds).'), t('voicemate.step2', 'AI creates your VoiceTwin.'), t('voicemate.step3', 'Use it in chats instantly.')].map((s, i) => (
            <Card key={i} border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}><CardBody><Text>• {s}</Text></CardBody></Card>
          ))}
        </SimpleGrid>
      </Box>


      {/* My Voices */}
      {!!voices.length && (
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.myVoices', 'My Voices')}</Heading>
          <SimpleGrid mt={4} columns={[1, 2]} spacing={4}>
            {voices.map((v) => (
              <Card key={v._id || v.id} border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="600">{v.name}</Text>
                      <Text fontSize="sm" color="var(--hm-color-text-muted)">
                        {new Date(v.createdAt).toLocaleString()} · {v.sourceType}
                      </Text>
                    </VStack>
                    <HStack spacing={2}>
                      <Button size="sm" variant="ghost" color="var(--hm-color-brand)" _hover={{ color: 'var(--hm-color-brand)' }} onClick={() => playVoiceSample(v.voiceId)}>
                        🔈 {t('voicemate.playSample', 'Play Sample')}
                      </Button>
                      <Button size="sm" variant="ghost" color="var(--hm-color-text-muted)" _hover={{ color: 'var(--hm-color-brand)' }} onClick={() => renameVoice(v.id || v._id)}>
                        ✏️ {t('voicemate.rename', 'Rename')}
                      </Button>
                      <Button size="sm" variant="ghost" color="var(--hm-color-text-muted)" _hover={{ color: 'var(--hm-color-brand)' }} onClick={() => deleteVoice(v.id || v._id)}>
                        🗑️ {t('voicemate.delete', 'Delete')}
                      </Button>
                    </HStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Preview & Upload */}
      {(audioUrl && !processing && !success) && (
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <Heading size="sm" color="var(--hm-color-text-primary)">{t('voicemate.preview', 'Preview')}</Heading>
          <audio controls src={audioUrl} className="mt-3 w-full" />
          <HStack mt={4} spacing={3}>
            <Button onClick={uploadAndProcess} isDisabled={!voiceName || !voiceName.trim()} borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>{t('voicemate.previewUpload', 'Preview & Upload')}</Button>
            <Button onClick={() => { setAudioUrl(''); setSuccess(false); }} variant="ghost" _hover={{ color: 'var(--hm-color-brand)' }}>{t('voicemate.reRecord', 'Re-record')}</Button>
          </HStack>
        </Box>
      )}

      {/* Processing */}
      {processing && (
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} textAlign="center">
          <Box position="relative" display="inline-block" mt={2}>
            <Box className="animate-pulse" position="absolute" inset={0} borderRadius="full" bgGradient="var(--hm-gradient-cta)" opacity={0.5} filter="blur(18px)" />
            <Box as="span" display="inline-flex" alignItems="center" justifyContent="center" w="56px" h="56px" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" fontSize="xl">🎙️</Box>
          </Box>
          <Box mt={4} display="flex" justifyContent="center"><WaveformBars active={true} width={300} height={40} /></Box>
          <Text mt={3}>{t('voicemate.processing', 'We’re building your VoiceTwin… this takes about a minute.')}</Text>
        </Box>
      )}

      {/* Success */}
      {success && (
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }} textAlign="center">
          <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.readyTitle', 'Your VoiceTwin Is Ready!')}</Heading>
          <Text mt={2} color="var(--hm-color-text-secondary)">{t('voicemate.readySub', 'Now your messages will sound like you.')}</Text>
          <HStack mt={4} spacing={3} justify="center">
            <Button as={RouterLink} to="/chat" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>{t('voicemate.tryInChat', '💬 Try It in Chat')}</Button>
            <Button as={RouterLink} to="/profile#upgrade" borderRadius="full" variant="ghost" _hover={{ color: 'var(--hm-color-brand)' }}>{t('voicemate.upgradeUnlimited', '💖 Upgrade for Unlimited Use')}</Button>
          </HStack>
        </Box>
      )}

      {/* Plans */}
      <Box className="hm-glass-card p-6 rounded-2xl" p="20px" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
        <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.plans', 'Upgrade & Unlock VoiceTwin')}</Heading>
        <SimpleGrid mt={4} columns={[1, 3]} spacing={6}>
          {[
            { name: t('voicemate.free', 'Free'), price: t('voicemate.freePrice', '$0'), features: [t('voicemate.f1', 'Create 1 VoiceTwin'), t('voicemate.f2', 'Basic quality'), t('voicemate.f3', 'Limited usage')] },
            { name: t('voicemate.premium', 'Premium'), price: t('voicemate.premiumPrice', '$5/mo'), features: [t('voicemate.p1', 'Higher quality'), t('voicemate.p2', 'More usage'), t('voicemate.p3', 'Priority processing')] },
            { name: t('voicemate.pro', 'Pro'), price: t('voicemate.proPrice', '$12/mo'), features: [t('voicemate.pr1', 'Studio quality'), t('voicemate.pr2', 'Unlimited usage'), t('voicemate.pr3', 'Fastest processing')] },
          ].map((plan, idx) => (
            <Card key={idx} className="rounded-xl" border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Heading size="sm">{plan.name}</Heading>
                  <Text fontWeight="700">{plan.price}</Text>
                  <Divider />
                  <VStack align="start" spacing={1}>
                    {plan.features.map((f, i) => <Text key={i}>• {f}</Text>)}
                  </VStack>
                  <Button as={RouterLink} to="/profile#upgrade" mt={3} size="sm" variant="ghost" _hover={{ color: 'var(--hm-color-brand)' }}>{t('voicemate.upgradeNow', 'Upgrade')}</Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );

  const isAuthed = !!token;

  if (!isAuthed) {
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
        <MotionBox
          position="absolute"
          top="-10%"
          left="-15%"
          w="80%"
          h="80%"
          className="hm-bg-gradient-pink"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <AnonymousView />
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
      <MotionBox
        position="absolute"
        top="-10%"
        left="-15%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-pink"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <VStack spacing={8} zIndex={1} maxW="900px" w="full">
        {/* Section 1: Capture (record or upload) */}
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <VStack align="stretch" spacing={5}>
            <Heading size="lg" color="var(--hm-color-text-primary)">{t('voicemate.recordOrUploadTitle', 'Create your VoiceTwin')}</Heading>

            {/* 1.a Record your own voice */}
            <Box p="12px" border="none" borderRadius="lg">

            <Box p="12px" border="none" boxShadow={mode==='record' ? '0 0 0 1px var(--hm-color-brand)' : 'none'} borderRadius="lg" transition="0.2s" cursor="pointer" role="button" tabIndex={0} onClick={() => setMode('record')} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setMode('record'); }}}>
              <Heading size="sm" color="var(--hm-color-text-primary)">{t('voicemate.recordSectionTitle', 'Record your own voice')}</Heading>
              <Box mt={2} position="relative" display="inline-block">
                <Box className={isRecording ? 'animate-pulse' : ''} position="absolute" inset={0} borderRadius="full" bgGradient="var(--hm-gradient-cta)" opacity={0.6} filter="blur(16px)" />
                <Button onClick={() => { if (!isRecording) { setSelectedFile(null); setFilePreviewUrl(''); setSuccess(false); setProcessing(false); setMode('record'); startRecording(); } else { stopRecording(); } }}
                  size="md" borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
                  {isRecording ? t('voicemate.stopRecording', '⏹️ Stop Recording') : t('voicemate.startRecording', '🎙️ Start Recording')}
                </Button>
              </Box>
              <Box mt={3}><WaveformBars active={isRecording} width={260} height={36} /></Box>
              {isRecording && (
                <Text mt={2} color="var(--hm-color-text-muted)">
                  {t('voicemate.sampleReadText', "Hi, this is me. I’m recording this short paragraph so HearMe can learn my unique voice. I speak naturally, clearly, and calmly. I am comfortable and safe. This is a sample for my VoiceTwin.")}
                </Text>
              )}
            </Box>

            {/* OR divider */}
            <HStack my={4} align="center">
              <Box flex="1" h="1px" bg="var(--hm-border-glass)" />
              <Text fontSize="sm" color="var(--hm-color-text-muted)">{t('voicemate.or', 'or')}</Text>
              <Box flex="1" h="1px" bg="var(--hm-border-glass)" />
            </HStack>


            {/* 1.b Upload your own voice */}
            <Box p="12px" border="none" boxShadow={mode==='upload' ? '0 0 0 1px var(--hm-color-brand)' : 'none'} borderRadius="lg" transition="0.2s" cursor="pointer" role="button" tabIndex={0} onClick={() => setMode('upload')} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setMode('upload'); }}}>
              <Heading size="sm" color="var(--hm-color-text-primary)">{t('voicemate.uploadSectionTitle', 'Upload your own voice')}</Heading>
              {/* Custom file chooser for i18nable labels */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                display="none"
                onChange={(e)=> {
                  const f = e.target.files?.[0] || null;
                  setSelectedFile(f);
                  setAudioUrl('');
                  setSuccess(false);
                  setProcessing(false);
                  setMode('upload');
                }}
              />
              <Box mt={2} border="1px solid var(--hm-border-glass)" borderRadius="md" px={3} py={2} bg="transparent">
                <HStack justify="space-between" align="center">
                  <Text color="var(--hm-color-text-muted)" noOfLines={1}>
                    {selectedFile?.name || t('voicemate.noFileChosen','No file chosen')}
                  </Text>
                  <Button size="sm" variant="ghost" borderRadius="full" color="var(--hm-color-brand)"
                    onClick={(e)=>{ e.stopPropagation(); fileInputRef.current?.click(); }}>
                    {t('voicemate.chooseFile','Choose File')}
                  </Button>
                </HStack>
              </Box>
            </Box>
            </Box>



            {/* Preview inside Create tile */}
            <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.preview', 'Preview')}</Heading>
            {(audioUrl || filePreviewUrl) ? (
              <audio controls src={audioUrl || filePreviewUrl} className="mt-3 w-full" />
            ) : (
              <Text mt={3} color="var(--hm-color-text-muted)">{t('voicemate.noAudio', 'Please record or select an audio file first.')}</Text>
            )}

            {/* Re-record action inside Create tile */}
            <Box mt={4}>
              {(audioUrl || filePreviewUrl) && (
                <Button
                  onClick={() => { setAudioUrl(''); setSelectedFile(null); setSuccess(false); }}
                  borderRadius="full"
                  variant="outline"
                  borderColor="var(--hm-color-brand)"
                  color="var(--hm-color-brand)"
                  _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}
                  isDisabled={processing}
                >
                  {t('voicemate.reRecord', 'Re-record')}
                </Button>
              )}
            </Box>

          </VStack>
        </Box>

        {/* Section 2: Upload (name + action) */}
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <VStack align="stretch" spacing={5}>
            <Heading size="lg" color="var(--hm-color-text-primary)">{t('voicemate.uploadActionTitle','Upload')}</Heading>
            <Box>
              <Heading size="sm" color="var(--hm-color-text-primary)">{t('voicemate.nameSectionTitle','Name of the voice')}</Heading>
              <Input mt={2} placeholder={t('voicemate.nameLabel','Name your voice')} value={voiceName} onChange={(e)=>setVoiceName(e.target.value)} bg="transparent" borderColor="var(--hm-border-glass)" />
            </Box>
            <HStack>
              {token ? (
                <Button onClick={saveVoiceHandler} isDisabled={!voiceName || !voiceName.trim() || !(audioUrl || filePreviewUrl)} borderRadius="full" bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)' }}>
                  {t('voicemate.upload','Upload')}
                </Button>
              ) : (
                <Button as={RouterLink} to="/login" borderRadius="full" variant="ghost" _hover={{ color: 'var(--hm-color-brand)' }}>
                  {t('voicemate.ctaSignIn','✨ Sign In to Create My VoiceTwin')}
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>




        {/* Section 3: Description - How it works */}
        <Box className="hm-glass-card p-6 rounded-2xl" p="20px" w="full" border="1px solid var(--hm-border-glass)" _hover={{ borderColor: 'var(--hm-color-brand)' }}>
          <Heading size="md" color="var(--hm-color-text-primary)">{t('voicemate.howTitle', 'How It Works')}</Heading>
          <SimpleGrid mt={4} columns={[1, 3]} spacing={6}>
            {[t('voicemate.step1', 'Record or upload a short sample.'), t('voicemate.step2', 'AI creates your VoiceTwin.'), t('voicemate.step3', 'Use it in chats instantly.')].map((s, i) => (
              <Card key={i} border="1px solid var(--hm-border-glass)" transition="0.3s" _hover={{ borderColor: 'var(--hm-color-brand)' }}><CardBody><Text>• {s}</Text></CardBody></Card>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Flex>
  );
}
