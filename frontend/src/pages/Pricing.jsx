import React, { useEffect, useMemo, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Button, HStack, VStack, Image, Icon, Spinner, Switch } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiShield, FiMic, FiUsers, FiRotateCcw, FiTrendingUp, FiSmartphone } from 'react-icons/fi';


// Pricing page aligned with VoiceLap architecture
// - Theme-aware via CSS variables and reusable classes (components.css)
// - i18n with fallbacks
// - Auth guard: redirects to login if not authenticated

const currency = (n) => `₹${n}`;


export default function Pricing() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  // Pricing page is public. Auth is enforced when user attempts to buy.

  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);
  const supportsAnnual = import.meta.env.VITE_ENABLE_ANNUAL_PLANS === 'true';
  const [billing, setBilling] = useState('monthly');
  const annualDiscount = Number(import.meta.env.VITE_ANNUAL_DISCOUNT || '0.2');
  const discountPercent = Math.round(annualDiscount * 100);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pricing`);
        if (!res.ok) throw new Error('pricing fetch failed');
        const json = await res.json();
        if (alive) setRemote(json);
      } catch (e) {
        // swallow; fallback to static
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);
  // Build exhaustive, human-readable bullets from plan.features (no truncation)
  function buildFeatureBullets(f) {
    const bullets = [];
    const v = f?.voice || {};

    // Text chat
    if (f?.ai_chat_text === 'unlimited') bullets.push('Unlimited text chat');
    else if (typeof f?.ai_chat_text === 'number') bullets.push(`${f.ai_chat_text} text messages/month`);

    // Voice minutes with default voices (legacy key)
    if (f?.ai_chat_voice_with_default_voices === 'unlimited') {
      bullets.push('Unlimited voice minutes');
    } else if (typeof f?.ai_chat_voice_with_default_voices === 'number') {
      bullets.push(`${f.ai_chat_voice_with_default_voices} voice minutes/month`);
    }

    // Default voices library size (new nested or legacy)
    if (typeof v?.default_voices_in_library === 'number') {
      bullets.push(`${v.default_voices_in_library} default voices in library`);
    } else if (typeof f?.default_voices_in_library === 'number') {
      bullets.push(`${f.default_voices_in_library} default voices in library`);
    }

    // Voice cloning (new nested model)
    if (typeof v?.group_voice_clone === 'number' && v.group_voice_clone > 0) bullets.push(` ${v.group_voice_clone} voice clones allowed from a video or audio`);
    const steadyGroup = v['group_voice_clone_steady'] ?? v['group_voice_clone_steady:'];
    if (typeof v?.voice_clone_from_audio === 'number' && v.voice_clone_from_audio > 0) bullets.push(` ${v.voice_clone_from_audio} voice clones from instant or recorded audio`);
    if (v?.voice_clone_steady === true || steadyGroup === true) {
      bullets.push('Voice clones will be saved for future');
    }
    else {
      bullets.push('Voice clones will not be saved');
    }

    // Voice cloning (legacy top-level)
    if (f?.voice_cloning_allowed === true) {
      if (typeof f?.voice_clones_included === 'number') {
        bullets.push(`${f.voice_clones_included} voice clones included`);
      } else {
        bullets.push('Voice cloning allowed');
      }
    } else if (f && f.voice_cloning_allowed === false) {
      bullets.push('Custom voice cloning not included');
    }

    // Custom voice usage minutes (per-user or shared)
    if (v?.custom_voice_use_minutes_per_month === 'unlimited') {
      bullets.push('Unlimited custom voice usage');
    }
    if (f?.custom_voice_use_minutes_per_month === 'unlimited') {
      bullets.push('Unlimited custom voice usage');
    }

    // Create voices from video/audio (legacy)
    if (f?.voice_from_video_allowed === true) {
      bullets.push('Create voices from video/audio');
    }

    // Human care / human support
    if (f?.human_care?.available) {
      const hc = f.human_care;

      // Summary: availability and scheduling capability
      const modes = Array.isArray(hc.session_mode) ? hc.session_mode.map((m)=>String(m)) : [];
      const hasScheduled = modes.some(m => m.includes('scheduled'));
      const hasOnCall = modes.some(m => m.includes('on-call'));
      if (hasScheduled || hasOnCall) {
        const caps = [];
        if (hasScheduled) caps.push('scheduled');
        if (hasOnCall) caps.push('on-call');
        bullets.push(`Human Support: ${caps.join(' and ')}`);
      }

      if (typeof hc.sessions_per_month === 'number' && hc.sessions_per_month > 0) {
        bullets.push(`${hc.sessions_per_month} Human care sessions per month`);
      }
      if (hc.trial_sessions_total != null && typeof hc.trial_sessions_total === 'number') {
        bullets.push(`Trial human care sessions: ${hc.trial_sessions_total}`);
      }
    } else if (f?.human_care && f.human_care.available === false) {
      bullets.push('Human support: Not available');
    }

    if (f?.storage?.chat_storage_days != null) {
      bullets.push(`Chats will be stored for ${f.storage.chat_storage_days} days`);
    }

    return bullets;
  }


  const plans = useMemo(() => {
    if (!remote?.plans?.length) return [];
    return remote.plans.map((p) => {
      const cycleDays = p.billing_cycle_days || 30;
      const computedPrice = supportsAnnual && billing === 'annual'
        ? Math.round(p.price * (1 - annualDiscount))
        : p.price;
      return {
        id: p.plan_id,
        name: p.display_name,
        price: computedPrice,
        cycleDays,
        featuresBullets: buildFeatureBullets(p.features || {}),
        ctaText: p.ui?.cta_text || null,
        badge: p.ui?.badge || null,
        featured: p.ui?.featured === true,
      };
    });
  }, [remote, supportsAnnual, billing, annualDiscount]);

  const featureDocs = useMemo(() => {
const docMap = {
  voiceMinutes: {
    icon: FiMic,
    titleKey: 'pricing.featuresDoc.voiceMinutes.title',
    title: 'Voice minutes',
    descKey: 'pricing.featuresDoc.voiceMinutes.desc',
    desc: 'Talk freely with VoiceLap — your voice companion. These are the total minutes you can spend talking using either default or your own created voices.'
  },

  defaultVoices: {
    icon: FiMic,
    titleKey: 'pricing.featuresDoc.defaultVoices.title',
    title: 'Default voices',
    descKey: 'pricing.featuresDoc.defaultVoices.desc',
    desc: 'Beautiful, ready-to-use voices already inside VoiceLap — calm, warm, or energetic — so you can start speaking and listening without setting up anything.'
  },

  voiceClones: {
    icon: FiUsers,
    titleKey: 'pricing.featuresDoc.voiceClones.title',
    title: 'Voice cloning (VoiceTwins)',
    descKey: 'pricing.featuresDoc.voiceClones.desc',
    desc: 'Record your own voice or a loved one’s, and VoiceLap will create a digital “VoiceTwin.” You can even clone voices from family videos or recordings (with consent). It’s like keeping a voice memory alive.'
  },

  customVoiceMinutes: {
    icon: FiMic,
    titleKey: 'pricing.featuresDoc.customVoiceMinutes.title',
    title: 'Custom voice minutes',
    descKey: 'pricing.featuresDoc.customVoiceMinutes.desc',
    desc: 'These are minutes where you can use your own cloned voice while talking. Hear yourself or your loved one’s voice responding — it feels personal, warm, and real.'
  },

  volunteerSupport: {
    icon: FiSmartphone,
    titleKey: 'pricing.featuresDoc.volunteerSupport.title',
    title: 'Human / volunteer support',
    descKey: 'pricing.featuresDoc.volunteerSupport.desc',
    desc: 'Sometimes, only a real human touch can help. VoiceLap connects you with kind volunteers — people who listen without judging and speak from the heart.'
  },

  chatMemory: {
    icon: FiRotateCcw,
    titleKey: 'pricing.featuresDoc.chatMemory.title',
    title: 'Chat memory',
    descKey: 'pricing.featuresDoc.chatMemory.desc',
    desc: 'VoiceLap remembers your feelings and important talks — only if you choose. For paid users, this helps our AI and listeners understand your journey better and respond with more care.'
  },

  aiChatText: {
    icon: FiRotateCcw,
    titleKey: 'pricing.featuresDoc.aiChatText.title',
    title: 'Text chat',
    descKey: 'pricing.featuresDoc.aiChatText.desc',
    desc: 'Unlimited chatting — express your thoughts in words anytime. VoiceLap listens with patience, whether you write in English or Hindi.'
  },

  voiceFromVideo: {
    icon: FiMic,
    titleKey: 'pricing.featuresDoc.voiceFromVideo.title',
    title: 'Voice from video / audio',
    descKey: 'pricing.featuresDoc.voiceFromVideo.desc',
    desc: 'Upload a video or an old audio clip, and VoiceLap can carefully extract and recreate that voice — keeping the memories of your loved ones close forever.'
  },

  storage: {
    icon: FiShield,
    titleKey: 'pricing.featuresDoc.storage.title',
    title: 'Storage & retention',
    descKey: 'pricing.featuresDoc.storage.desc',
    desc: 'VoiceLap keeps your voice and chat history safe and private. For free users, data is temporary; for subscribers, it’s stored longer so your emotional journey stays preserved.'
  },

  supportLevel: {
    icon: FiUsers,
    titleKey: 'pricing.featuresDoc.supportLevel.title',
    title: 'Support level',
    descKey: 'pricing.featuresDoc.supportLevel.desc',
    desc: 'From quick help to personal calls — support grows with your plan. Our team and volunteers are always there to guide, listen, or just be there when you need someone.'
  }
};


    const keys = new Set();
    (remote?.plans || []).forEach((p) => {
      const f = p.features || {};
      const v = f.voice || {};
      if ('ai_chat_text' in f) keys.add('aiChatText');
      if ('ai_chat_voice_with_default_voices' in f) keys.add('voiceMinutes'); // legacy

      // Voice library / cloning (nested)
      if ('default_voices_in_library' in v) keys.add('defaultVoices');
      if ('create_voice_clone' in v || 'voice_clone_from_audio' in v || 'group_voice_clone' in v || 'voice_clone_steady' in v || 'voice_clone_from_group_allowed' in v || 'group_voice_clone_steady' in v || 'group_voice_clone_steady:' in v) {
        keys.add('voiceClones');
      }
      if ('voice_clone_from_audio' in v) keys.add('voiceFromVideo');
      if ('custom_voice_use_minutes_per_month' in v) keys.add('customVoiceMinutes');

      // Legacy top-level fallbacks
      if ('default_voices_in_library' in f) keys.add('defaultVoices');
      if ('voice_cloning_allowed' in f || 'voice_clones_included' in f) keys.add('voiceClones');
      if ('custom_voice_use_minutes_per_month' in f) keys.add('customVoiceMinutes');
      if ('custom_voice_use_minutes_shared_per_month' in f) keys.add('customVoiceMinutesShared');
      if ('voice_from_video_allowed' in f) keys.add('voiceFromVideo');
      if ('members_included' in f) keys.add('membersIncluded');

      // Other groups
      if ('human_care' in f) keys.add('volunteerSupport');
      if ('emotion_insights' in f) keys.add('emotionInsights');
      if ('chat_memory' in f) keys.add('chatMemory');
      if ('themes' in f) keys.add('themes');
      if ('support_level' in f) keys.add('supportLevel');
      if ('storage' in f) keys.add('storage');
    });

    if (!keys.size) {
      // Fallback to a small default list if nothing detected
      return [
        { k: 'voiceMinutes', ...docMap.voiceMinutes },
        { k: 'voiceClones', ...docMap.voiceClones },
        { k: 'emotionInsights', ...docMap.emotionInsights },
        { k: 'volunteerSupport', ...docMap.volunteerSupport },
        { k: 'chatMemory', ...docMap.chatMemory },
        { k: 'defaultVoices', ...docMap.defaultVoices },
      ];
    }

    return Array.from(keys).map((k) => ({ k, ...docMap[k] })).filter(Boolean);
  }, [remote, t]);


  const title = t(
    'pricing.title',
    'Mental support that listens in your voice — when it matters most.'
  );

  const onSelectPlan = (planId) => {
    const token = localStorage.getItem('vl-token');
    const returnTo = '/pricing';
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    const selected = plans.find(pl => pl.id === planId);
    const amount = selected?.price ?? 0;
    const billingParam = supportsAnnual ? billing : 'monthly';
    if (planId === 'free') {
      navigate('/chat');
    } else {
      navigate(`/payment?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billingParam)}&price=${encodeURIComponent(amount)}&status=pending`);
    }

  };

  return (
    <Box className="vl-page-container vl-cid-pricing-root" data-cid="pricing-root">
      <Box className="vl-section" textAlign="center">

        {/* Hero banner */}
        <Box border="1px solid var(--vl-border-subtle)" borderRadius="0.75rem" overflow="hidden" mb={6} className="vl-cid-pricing-banner" data-cid="pricing-banner">
          <Image
            src="/images/why-voicelap.png"
            alt={t('pricing.bannerAlt','Why VoiceLap — care that listens')}
            w="100%"
            h={{ base: '160px', md: '220px' }}
            objectFit="cover"
          />
        </Box>

        {/* Benefit tiles */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
          <Box className="vl-card" p={4}>
            <HStack align="start" spacing={3}>
              <Icon as={FiShield} color="var(--vl-color-brand)" mt="3px" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" color="var(--vl-color-text-primary)">{t('pricing.benefits.privacyTitle','Private & secure')}</Text>
                <Text className="vl-text-tertiary">{t('pricing.benefits.privacyDesc','Anonymous, encrypted chats with privacy-first design.')}</Text>
              </VStack>
            </HStack>
          </Box>
          <Box className="vl-card" p={4}>
            <HStack align="start" spacing={3}>
              <Icon as={FiMic} color="var(--vl-color-brand)" mt="3px" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" color="var(--vl-color-text-primary)">{t('pricing.benefits.voiceTitle','Your voice matters')}</Text>
                <Text className="vl-text-tertiary">{t('pricing.benefits.voiceDesc','Realistic voices, VoiceTwins, and emotion-aware responses.')}</Text>
              </VStack>
            </HStack>
          </Box>
          <Box className="vl-card" p={4}>
            <HStack align="start" spacing={3}>
              <Icon as={FiUsers} color="var(--vl-color-brand)" mt="3px" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" color="var(--vl-color-text-primary)">{t('pricing.benefits.supportTitle','Human support when needed')}</Text>
                <Text className="vl-text-tertiary">{t('pricing.benefits.supportDesc','Volunteer calls and community care beyond chat.')}</Text>
              </VStack>
            </HStack>
          </Box>
        </SimpleGrid>

        <Heading as="h1" className="vl-heading-primary" mb={6}>{title}</Heading>


        {loading && !remote && (
          <HStack spacing={2} justify="center" mb={3}>
            <Spinner size="sm" />
            <Text className="vl-text-tertiary">{t('pricing.loading','Loading latest plans...')}</Text>
          </HStack>
        )}
        {supportsAnnual && (
          <HStack spacing={4} justify="center" mb={8} color="var(--vl-color-text-secondary)">
            <Text className="vl-text-tertiary">{t('pricing.monthly','Monthly')}</Text>
            <Switch colorScheme="orange" isChecked={billing==='annual'} onChange={(e)=>setBilling(e.target.checked?'annual':'monthly')} />
            <HStack spacing={2}>
              <Text className="vl-text-tertiary">{t('pricing.annual','Annual')}</Text>
              <Text className="vl-text-tertiary" color="var(--vl-color-brand)">{t('pricing.save30', `Save ${discountPercent}%`)}</Text>
            </HStack>
          </HStack>
        )}

        {/* Plans */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} className="vl-cid-pricing-plans" data-cid="pricing-plans">
          {plans.map((p) => (
            <Box key={p.id} className="vl-card vl-card-hover" textAlign="left" borderColor={p.featured ? 'var(--vl-color-brand)' : 'var(--vl-border-subtle)'} borderWidth={p.featured ? '2px' : '1px'}>
              <VStack align="start" spacing={3}>
                {p.featured && (
                  <Text fontSize="xs" color="var(--vl-color-brand)" bg="var(--vl-bg-glass)" px={2} py={1} borderRadius="full">
                    {p.badge || t('pricing.mostPopular','Most popular')}
                  </Text>
                )}

                <Heading as="h3" size="md" color="var(--vl-color-text-primary)">{p.name}</Heading>
                <Box>
                  <Heading as="div" size="lg" color="var(--vl-color-text-primary)">{currency(p.price)}<Text as="span" fontSize="md" color="var(--vl-color-text-secondary)">{p.cycleDays === 30 ? t('pricing.mo','/mo') : `/${p.cycleDays}d`}</Text></Heading>
                </Box>
                <VStack align="start" spacing={2} mt={2}>
                  {p.featuresBullets.map((f, idx) => (
                    <HStack key={idx} align="start" spacing={2}>
                      <Icon as={FiCheckCircle} color="var(--vl-color-brand)" mt="2px" boxSize={4} />
                      <Text className="vl-text-secondary">{f}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Button className="vl-button-primary" onClick={() => onSelectPlan(p.id)}>{p.ctaText || t('pricing.cta.select','Select plan')}</Button>
              </VStack>
            </Box>
          ))}


        </SimpleGrid>

        {/* Assurances */}
        <Box mt={6} p={4} border="1px solid var(--vl-border-subtle)" bg="var(--vl-bg-glass)" borderRadius="0.75rem">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <HStack align="start" spacing={2}>
              <Icon as={FiRotateCcw} color="var(--vl-color-brand)" mt="2px" />
              <Text className="vl-text-secondary">{t('pricing.assurance.cancel','Cancel anytime — your remaining period will be refunded back to you.')}</Text>
            </HStack>
            <HStack align="start" spacing={2}>
              <Icon as={FiTrendingUp} color="var(--vl-color-brand)" mt="2px" />
              <Text className="vl-text-secondary">{t('pricing.assurance.upgrade','Upgrade anytime — what you\'ve already paid will be adjusted towards the higher plan.')}</Text>
            </HStack>
            <HStack align="start" spacing={2}>
              <Icon as={FiSmartphone} color="var(--vl-color-brand)" mt="2px" />
              <Text className="vl-text-secondary">{t('pricing.assurance.upi','UPI secure payments with PhonePe')}</Text>
            </HStack>
          </SimpleGrid>
        </Box>


        {/* Promo banner */}
        <Box mt={8} border="1px solid var(--vl-border-subtle)" borderRadius="0.75rem" p={4} bg="var(--vl-bg-glass)">
        {/* Feature explanations */}
        <Box textAlign="center">
          <Heading as="h2" className="vl-heading-secondary" mb={2}>
            {t('pricing.featuresDoc.title','Understand each feature')}
          </Heading>
          <Text className="vl-text-secondary" mb={6}>
            {t('pricing.featuresDoc.subtitle','What each perk means and how it helps you')}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} textAlign="left">
            {featureDocs.map(fd => (
              <Box key={fd.k} className="vl-card" p={4}>
                <HStack align="start" spacing={3}>
                  <Icon as={fd.icon} color="var(--vl-color-brand)" mt="3px" />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="600" color="var(--vl-color-text-primary)">
                      {t(`pricing.featuresDoc.${fd.k}.title`, fd.title)}
                    </Text>
                    <Text className="vl-text-tertiary">
                      {t(`pricing.featuresDoc.${fd.k}.desc`, fd.desc)}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        </Box>

        {/* FAQ */}
        <Box mt={12} textAlign="center">
          <Heading as="h2" className="vl-heading-secondary" mb={6}>{t('pricing.faq.title','Frequently Asked Questions')}</Heading>
          <VStack spacing={3} align="stretch">

            {[
              {
                q: 'What is a VoiceTwin?',
                a: "VoiceTwin allows you to clone your own or a loved one's voice to chat with AI in that voice.",


              },
              {
                q: 'Can I talk in Hindi or other languages?',
                a: 'Yes, VoiceLap supports Hindi, English, and many regional languages for maximum comfort.',
              },
              {
                q: 'Do I need to pay to use VoiceLap?',
                a: 'You can start with the Free plan. Paid plans unlock more voice minutes, features, and volunteer access.',
              },
              {
                q: 'Are my conversations private?',
                a: 'Absolutely. All chats are encrypted, private, and anonymous. Your emotions are safe with us.',
              },
              {
                q: 'What if I run out of voice minutes?',
                a: 'You can easily top up using our wallet recharge options anytime.',
              },
            ].map((item, idx) => (
              <Box key={idx} className="vl-card" p={3} textAlign="left">
                <Text fontWeight="600" color="var(--vl-color-text-primary)">{t(`pricing.faq.q${idx+1}`, item.q)}</Text>
                <Text className="vl-text-tertiary" mt={1}>{t(`pricing.faq.a${idx+1}`, item.a)}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

