import React from 'react';
import { Box, SimpleGrid, VStack, Heading, Text, Image, AspectRatio } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Local fallback image in case a tile image is missing
const TILE_IMAGE_FALLBACK = '/images/feature-fallback.png';

const TILE_CONFIG = [
  { key: 'anon', img: '/images/tile_anon.jpg' },
  { key: 'availability', img: '/images/tile_247.jpg' },
  { key: 'languages', img: '/images/tile_languages.jpg' },
  { key: 'voice', img: '/images/tile_voice.jpg' },
  { key: 'ai', img: '/images/tile_ai.jpg' },
  { key: 'humanSupport', img: '/images/tile_humans.jpg' },
  { key: 'crisis', img: '/images/tile_crisis.jpg' },
  { key: 'voicePersonal', img: '/images/tile_voicePersonal.jpg' },
];

export default function FeatureTiles() {
  const { t } = useTranslation('common');

  return (
    <SimpleGrid columns={[1, 2, 2]} spacing={[6, 8, 10]} mt={20} zIndex={1} position="relative">
      {TILE_CONFIG.map((tile) => (
        <Box
          key={tile.key}
          className="hm-glass-card"
          borderRadius="xl"
          overflow="hidden"
          transition="0.3s"
          _hover={{ transform: 'translateY(-5px)', borderColor: 'var(--hm-color-brand)' }}
        >
          {/* Top image (16:9) */}
          <AspectRatio ratio={16/9} w="full">
            <Image
              src={tile.img}
              alt={t(`home.features.${tile.key}.title`)}
              objectFit="cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fb) { img.dataset.fb = '1'; img.src = TILE_IMAGE_FALLBACK; }
              }}
            />
          </AspectRatio>

          {/* Text content */}
          <VStack align="start" spacing={2} p={[5, 6]}>
            <Heading fontSize={["lg","xl"]} fontWeight="700">
              {t(`home.features.${tile.key}.title`)}
            </Heading>
            <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
              {t(`home.features.${tile.key}.desc`)}
            </Text>
          </VStack>
        </Box>
      ))}
    </SimpleGrid>
  );
}

