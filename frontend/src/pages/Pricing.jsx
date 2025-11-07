import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Button, Switch, HStack, VStack, Image, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiShield, FiMic, FiUsers, FiRotateCcw, FiTrendingUp, FiSmartphone } from 'react-icons/fi';


// Pricing page aligned with HearMe architecture
// - Theme-aware via CSS variables and reusable classes (components.css)
// - i18n with fallbacks
// - Auth guard: redirects to login if not authenticated

const currency = (n) => `₹${n}`;

const PLANS = {
  monthly: [
    {
      id: 'free',
      nameKey: 'pricing.plans.free',
      nameFallback: 'Free',
      price: 0,
      priceSuffixKey: 'pricing.mo',
      priceSuffixFallback: '/mo',
      features: [
        '10 mins/week voice chat',
        '2 languages (Hindi/English)',
        'Basic AI support',
        'Text+ default speakers access',
      ],
      ctaKey: 'pricing.cta.startFree',
      ctaFallback: 'Start Free',
    },
    {
      id: 'care',
      nameKey: 'pricing.plans.care',
      nameFallback: 'Care',
      price: 299,
      priceSuffixKey: 'pricing.mo',
      priceSuffixFallback: '/mo',
      features: [
        '300 mins/month',
        '2 voice clones',
        'Emotion detection',
        'Volunteer calls (2/week)',
        '3 tone themes',
      ],
      featured: true,
      ctaKey: 'pricing.cta.getCare',
      ctaFallback: 'Get Care',
    },
    {
      id: 'companion',
      nameKey: 'pricing.plans.companion',
      nameFallback: 'Companion',
      price: 499,
      priceSuffixKey: 'pricing.mo',
      priceSuffixFallback: '/mo',
      features: [
        'Unlimited voice minutes',
        '5 voice clones',
        'All languages',
        'Full volunteer support',
        'VoiceVault legacy + custom tones',
      ],
      ctaKey: 'pricing.cta.getCompanion',
      ctaFallback: 'Get Companion',
    },
  ],
  annual: [
    // ~30% off per month equivalent
    {
      id: 'free',
      nameKey: 'pricing.plans.free',
      nameFallback: 'Free',
      price: 0,
      priceSuffixKey: 'pricing.mo',
      priceSuffixFallback: '/mo',
      features: [
        '10 mins/week voice chat',
        '2 languages (Hindi/English)',
        'Basic AI support',
        'Text+ default speakers access',
      ],
      ctaKey: 'pricing.cta.startFree',
      ctaFallback: 'Start Free',
    },
    {
      id: 'care',
      nameKey: 'pricing.plans.care',
      nameFallback: 'Care',
      price: 240, // 299 * 0.8 ≈ 209
      priceSuffixKey: 'pricing.mo',
      priceSuffixFallback: '/mo',
      features: [
        '300 mins/month',
        '2 voice clones',
        'Emotion detection',
        'Volunteer calls (2/week)',
        '3 tone themes',
      ],
      featured: true,
      ctaKey: 'pricing.cta.getCare',
      ctaFallback: 'Get Care',
    },
    {
      id: 'companion',
      nameKey: 'pricing.plans.companion',
      nameFallback: 'Companion',
      price: 400, // 499 * 0.8 ≈ 349
      priceSuffixKey: 'pricing.mo',
      priceSuffixFallback: '/mo',
      features: [
        'Unlimited voice minutes',
        '5 voice clones',
        'All languages',
        'Full volunteer support',
        'VoiceVault legacy + custom tones',
      ],
      ctaKey: 'pricing.cta.getCompanion',
      ctaFallback: 'Get Companion',
    },
  ],
};

export default function Pricing() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  // Pricing page is public. Auth is enforced when user attempts to buy.

  const [billing, setBilling] = useState('monthly');
  const plans = useMemo(() => PLANS[billing], [billing]);

  const title = t(
    'pricing.title',
    'Mental support that listens in your voice — when it matters most.'
  );
  const subtitle = t(
    'pricing.subtitle',
    'Choose a plan that fits your rhythm: casual chat, deeper care, or full companionship.'
  );

  const onSelectPlan = (planId) => {
    const token = localStorage.getItem('hm-token');
    const returnTo = '/pricing';
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    const selected = plans.find(pl => pl.id === planId);
    const amount = selected?.price ?? 0;
    if (planId === 'free') {
      navigate('/chat');
    } else {
      navigate(`/payment?plan=${encodeURIComponent(planId)}&billing=${encodeURIComponent(billing)}&price=${encodeURIComponent(amount)}&status=pending`);
    }

  };

  return (
    <Box className="hm-page-container">
      <Box className="hm-section" textAlign="center">

        {/* Hero banner */}
        <Box border="1px solid var(--hm-border-subtle)" borderRadius="0.75rem" overflow="hidden" mb={6}>
          <Image
            src="/images/why-hearMe.png"
            alt={t('pricing.bannerAlt','Why HearMe — care that listens')}
            w="100%"
            h={{ base: '160px', md: '220px' }}
            objectFit="cover"
          />
        </Box>

        {/* Benefit tiles */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
          <Box className="hm-card" p={4}>
            <HStack align="start" spacing={3}>
              <Icon as={FiShield} color="var(--hm-color-brand)" mt="3px" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" color="var(--hm-color-text-primary)">{t('pricing.benefits.privacyTitle','Private & secure')}</Text>
                <Text className="hm-text-tertiary">{t('pricing.benefits.privacyDesc','Anonymous, encrypted chats with privacy-first design.')}</Text>
              </VStack>
            </HStack>
          </Box>
          <Box className="hm-card" p={4}>
            <HStack align="start" spacing={3}>
              <Icon as={FiMic} color="var(--hm-color-brand)" mt="3px" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" color="var(--hm-color-text-primary)">{t('pricing.benefits.voiceTitle','Your voice matters')}</Text>
                <Text className="hm-text-tertiary">{t('pricing.benefits.voiceDesc','Realistic voices, VoiceTwins, and emotion-aware responses.')}</Text>
              </VStack>
            </HStack>
          </Box>
          <Box className="hm-card" p={4}>
            <HStack align="start" spacing={3}>
              <Icon as={FiUsers} color="var(--hm-color-brand)" mt="3px" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="600" color="var(--hm-color-text-primary)">{t('pricing.benefits.supportTitle','Human support when needed')}</Text>
                <Text className="hm-text-tertiary">{t('pricing.benefits.supportDesc','Volunteer calls and community care beyond chat.')}</Text>
              </VStack>
            </HStack>
          </Box>
        </SimpleGrid>

        <Heading as="h1" className="hm-heading-primary" mb={2}>{title}</Heading>
        <Text className="hm-text-secondary" mb={6}>{subtitle}</Text>

        {/* Billing toggle */}
        <HStack spacing={4} justify="center" mb={8} color="var(--hm-color-text-secondary)">
          <Text className="hm-text-tertiary">{t('pricing.monthly','Monthly')}</Text>
          <Switch colorScheme="orange" isChecked={billing==='annual'} onChange={(e)=>setBilling(e.target.checked?'annual':'monthly')} />
          <HStack spacing={2}>
            <Text className="hm-text-tertiary">{t('pricing.annual','Annual')}</Text>
            <Text className="hm-text-tertiary" color="var(--hm-color-brand)">{t('pricing.save30','Save 20%')}</Text>
          </HStack>
        </HStack>

        {/* Feature gating promo */}
        <Box mb={4} p={3} border="1px solid var(--hm-border-subtle)" borderRadius="0.75rem" bg="var(--hm-bg-glass)">
          <Text className="hm-text-secondary">
            {t('pricing.promo.gating','Promo: chat minutes not enforced yet')}
          </Text>
        </Box>


        {/* Plans */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {plans.map((p) => (
            <Box key={p.id} className="hm-card hm-card-hover" textAlign="left" borderColor={p.featured ? 'var(--hm-color-brand)' : 'var(--hm-border-subtle)'} borderWidth={p.featured ? '2px' : '1px'}>
              <VStack align="start" spacing={3}>
                {p.featured && (
                  <Text fontSize="xs" color="var(--hm-color-brand)" bg="var(--hm-bg-glass)" px={2} py={1} borderRadius="full">
                    {t('pricing.mostPopular','Most popular')}
                  </Text>
                )}

                <Heading as="h3" size="md" color="var(--hm-color-text-primary)">{t(p.nameKey, p.nameFallback)}</Heading>
                <Box>
                  <Heading as="div" size="lg" color="var(--hm-color-text-primary)">{currency(p.price)}<Text as="span" fontSize="md" color="var(--hm-color-text-secondary)">{t(p.priceSuffixKey, p.priceSuffixFallback)}</Text></Heading>
                </Box>
                <VStack align="start" spacing={2} mt={2}>
                  {p.features.map((f, idx) => (
                    <HStack key={idx} align="start" spacing={2}>
                      <Icon as={FiCheckCircle} color="var(--hm-color-brand)" mt="2px" boxSize={4} />


                      <Text className="hm-text-secondary">{t(`pricing.features.${p.id}.${idx}`, f)}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Button className="hm-button-primary" onClick={() => onSelectPlan(p.id)}>{t(p.ctaKey, p.ctaFallback)}</Button>
              </VStack>
            </Box>
          ))}


        </SimpleGrid>

        {/* Assurances */}
        <Box mt={6} p={4} border="1px solid var(--hm-border-subtle)" bg="var(--hm-bg-glass)" borderRadius="0.75rem">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <HStack align="start" spacing={2}>
              <Icon as={FiRotateCcw} color="var(--hm-color-brand)" mt="2px" />
              <Text className="hm-text-secondary">{t('pricing.assurance.cancel','Cancel anytime — your remaining period will be refunded back to you.')}</Text>
            </HStack>
            <HStack align="start" spacing={2}>
              <Icon as={FiTrendingUp} color="var(--hm-color-brand)" mt="2px" />
              <Text className="hm-text-secondary">{t('pricing.assurance.upgrade','Upgrade anytime — what you\'ve already paid will be adjusted towards the higher plan.')}</Text>
            </HStack>
            <HStack align="start" spacing={2}>
              <Icon as={FiSmartphone} color="var(--hm-color-brand)" mt="2px" />
              <Text className="hm-text-secondary">{t('pricing.assurance.upi','UPI secure payments with PhonePe')}</Text>
            </HStack>
          </SimpleGrid>
        </Box>


        {/* Promo banner */}
        <Box mt={8} border="1px solid var(--hm-border-subtle)" borderRadius="0.75rem" p={4} bg="var(--hm-bg-glass)">
          <Text className="hm-text-secondary">
            ✨ {t('pricing.promo.headline', 'Special Offer: Get Companion Plan at ₹399/mo for 3 months!')}<br/>
            <Text as="span" className="hm-text-tertiary">{t('pricing.promo.sub','Use code')} <b>CAREME75</b> {t('pricing.promo.tail','at checkout. Valid till Sunday 11:59 PM.')}</Text>
          </Text>
        </Box>

        {/* FAQ */}
        <Box mt={12} textAlign="center">
          <Heading as="h2" className="hm-heading-secondary" mb={6}>{t('pricing.faq.title','Frequently Asked Questions')}</Heading>
          <VStack spacing={3} align="stretch">
            {[
              {
                q: 'What is a VoiceTwin?',
                a: "VoiceTwin allows you to clone your own or a loved one's voice to chat with AI in that voice.",


              },
              {
                q: 'Can I talk in Hindi or other languages?',
                a: 'Yes, HearMe supports Hindi, English, and many regional languages for maximum comfort.',
              },
              {
                q: 'Do I need to pay to use HearMe?',
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
              <Box key={idx} className="hm-card" p={3} textAlign="left">
                <Text fontWeight="600" color="var(--hm-color-text-primary)">{t(`pricing.faq.q${idx+1}`, item.q)}</Text>
                <Text className="hm-text-tertiary" mt={1}>{t(`pricing.faq.a${idx+1}`, item.a)}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}

