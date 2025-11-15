import React from 'react';
import { Box, SimpleGrid, Image, Heading, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Local fallback + map feature keys to images in public/images/
const FALLBACK_IMG = '/images/fallback.png';
const FEATURE_IMAGES = {
  anon: '/images/privacy.png',
  availability: '/images/emotional-support.png',
  languages: '/images/language-support.png',
  humanSupport: '/images/voice-support.png',
  voice: '/images/more-than-chat.png',
  ai: '/images/in-person-connect.png',
  crisis: '/images/critical-support.png',
  voicePersonal: '/images/voice-clone.png',
};

export default function FeatureImageTiles() {
  const { t } = useTranslation('common');

  const items = [
    { key: 'anon' },
    { key: 'availability' },
    { key: 'languages' },
    { key: 'humanSupport' },
    { key: 'voice' },
    { key: 'ai' },
    { key: 'crisis' },
    { key: 'voicePersonal' },
  ];

  return (
    <SimpleGrid columns={[1, 2]} spacing={[6, 8]} mt={20} className="vl-cid-home-feature-tiles-grid" data-cid="home-feature-tiles-grid">
      {items.map(({ key }) => {
        const title = t(`home.features.${key}.title`);
        const desc = t(`home.features.${key}.desc`);
        const img = FEATURE_IMAGES[key];
        return (
          <Box
            key={key}
            borderRadius="xl"
            overflow="hidden"
            border="1px solid var(--vl-color-border)"
            bg="var(--vl-color-card, rgba(255,255,255,0.04))"
            transition="transform 0.25s ease, box-shadow 0.25s ease"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }} className={`vl-cid-home-feature-${key}`} data-cid={`home-feature-${key}` }
          >
            <Image
              src={img}
              alt={title}
              w="100%"
              h="auto"
              display="block"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.dataset.fb) { el.dataset.fb = '1'; el.src = FALLBACK_IMG; }
              }}
            />

            <VStack align="start" spacing={3} p={[5, 6]}>
              <Heading fontSize={["lg","xl"]} fontWeight="700" className={`vl-cid-home-feature-title-${key}`} data-cid={`home-feature-title-${key}`}>{title}</Heading>
              <Text fontSize={["sm","md"]} color="var(--vl-color-text-secondary)" className={`vl-cid-home-feature-desc-${key}`} data-cid={`home-feature-desc-${key}`}>{desc}</Text>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

