import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Box, HStack, VStack, Text, IconButton, Button, VisuallyHidden } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';


// Fallback image if any slide fails to load
const FALLBACK_CAROUSEL_IMG = '/images/fallback.png';

// Simple, dependency-free, scroll-snap carousel focused on empathy & authenticity
// Images are served from the public /images folder for reliability and control

// Use exactly five images from the public /images folder: /images/1.png ... /images/5.png
const RAW_SLIDES = [
  { key: 'slide-1', img: '/images/1.png', alt: { en: 'Slide 1', hi: 'स्लाइड 1' } },
  { key: 'slide-2', img: '/images/2.png', alt: { en: 'Slide 2', hi: 'स्लाइड 2' } },
  { key: 'slide-3', img: '/images/3.png', alt: { en: 'Slide 3', hi: 'स्लाइड 3' } },
  { key: 'slide-4', img: '/images/4.png', alt: { en: 'Slide 4', hi: 'स्लाइड 4' } },
  { key: 'slide-5', img: '/images/5.png', alt: { en: 'Slide 5', hi: 'स्लाइड 5' } }
];

export default function EmotionCarousel() {
  const { i18n } = useTranslation('common');
  const lang = (i18n.language || 'en').startsWith('hi') ? 'hi' : 'en';
  const slides = useMemo(() => RAW_SLIDES, []);
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const listener = () => setReducedMotion(media.matches);
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);

  const scrollTo = (i) => {
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    setIndex(clamped);
    const track = trackRef.current;
    if (!track) return;
    const slideEl = track.children[clamped];
    if (slideEl) slideEl.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
  };

  const next = () => scrollTo(index + 1);
  const prev = () => scrollTo(index - 1);

  return (
    <Box position="relative" w="100%" h="100%" minH="188px" maxW="100%" ml={0} borderRadius="0" overflow="hidden">
      {/* Scroll track */}
      <HStack
        ref={trackRef} h="100%"
        spacing={0}
        overflowX="auto"
        scrollSnapType="x mandatory"
        css={{ scrollbarWidth: 'none' }}
        sx={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollBehavior: reducedMotion ? 'auto' : 'smooth'
        }}
      >
        {slides.map((s, i) => (
          <Box key={s.key} minW="100%" h="100%" position="relative" scrollSnapAlign="start">
            {/* Image */}
            <Box as="img"
                 src={s.img}
                 alt={s.alt[lang]}
                 width="100%"
                 height="100%"
                 style={{ objectFit: 'cover' }}
                 loading={i === 0 ? 'eager' : 'lazy'}
                 fetchpriority={i === 0 ? 'high' : 'auto'}
                 decoding="async"
                 onError={(e)=>{ const img=e.currentTarget; if(!img.dataset.fb){ img.dataset.fb='1'; img.src=FALLBACK_CAROUSEL_IMG; } }}
            />
            {/* Optional overlay + captions (rendered only if provided) */}
            {(s[lang]?.title || s[lang]?.cta) && (
              <>
                <Box position="absolute" inset={0} bgGradient="linear(to-b, blackAlpha.300, blackAlpha.700)" />
                <VStack position="absolute" bottom={0} left={0} right={0} p={[4,6]} align="flex-start" spacing={3} color="white">
                  {s[lang]?.title && (
                    <Text fontSize={["lg","xl","2xl"]} fontWeight={700} lineHeight={1.2}>
                      {s[lang].title}
                    </Text>
                  )}
                  {s[lang]?.cta && (
                    <HStack>
                      <Button as={RouterLink} to="/chat" size="sm" colorScheme="blue" bgGradient="var(--hm-gradient-cta)" _hover={{ bgGradient: 'var(--hm-gradient-cta-hover)', transform: 'translateY(-1px)' }} borderRadius="full">
                        {s[lang].cta}
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </>
            )}
          </Box>
        ))}
      </HStack>

      {/* Controls */}
      <IconButton aria-label="Previous" icon={<FaChevronLeft />} onClick={prev}
                  position="absolute" top="50%" left={3} transform="translateY(-50%)" borderRadius="full"
                  bg="blackAlpha.500" color="white" _hover={{ bg: 'blackAlpha.700' }} />
      <IconButton aria-label="Next" icon={<FaChevronRight />} onClick={next}
                  position="absolute" top="50%" right={3} transform="translateY(-50%)" borderRadius="full"
                  bg="blackAlpha.500" color="white" _hover={{ bg: 'blackAlpha.700' }} />

      {/* Dots */}
      <HStack position="absolute" bottom={3} left="50%" transform="translateX(-50%)" spacing={2}>
        {slides.map((_, i) => (
          <Box key={i} as="button" onClick={() => scrollTo(i)} w={i === index ? 6 : 2} h={2} borderRadius="full" bg={i === index ? 'white' : 'whiteAlpha.700'} aria-label={`Go to slide ${i+1}`}>
            <VisuallyHidden>Slide {i + 1}</VisuallyHidden>
          </Box>
        ))}
      </HStack>
    </Box>
  );
}

