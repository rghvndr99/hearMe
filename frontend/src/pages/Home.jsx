import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Stack,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmotionCarousel from "../components/home/EmotionCarousel";
import FeatureImageTiles from "../components/home/FeatureImageTiles";
import { FaLock } from "react-icons/fa";


const MotionBox = motion(Box);

// Banner image preference: use env var or local file; auto-fallback to Unsplash at runtime
const DEFAULT_BANNER_FALLBACK = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop";
const PREFERRED_BANNER_URL = import.meta.env.VITE_HOME_BANNER_URL || "/images/home-banner.jpg";


const Home = () => {
  const { t } = useTranslation('common');
  const [bannerSrc, setBannerSrc] = useState(PREFERRED_BANNER_URL);
  return (
    <Box
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-primary)"
      minH="100vh"
      position="relative"
      overflow="visible"
      px={[6, 10]}
      pt={0}
      pb={[12, 24]}
    >

      {/* Full-bleed Banner */}
      <Box w="100vw" ml="calc(50% - 50vw)" mr="calc(50% - 50vw)" position="relative">
        <EmotionCarousel />
      </Box>

      {/* Hero Text Block (after banner) */}
      <VStack spacing={6} align="center" textAlign="center" zIndex={1} position="relative" mt={8}>
        <Heading fontSize={["3xl", "5xl", "6xl"]} fontWeight="800">
          {t('home.hero.title')}
        </Heading>
        <Text fontSize={["md", "lg"]} color="var(--hm-color-text-tertiary)" maxW="780px">
          {t('home.hero.subtitle')}
        </Text>
        <Stack direction={["column", "column", "row"]} spacing={4} w={["full", "full", "auto"]}>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)", transform: "translateY(-2px)" }}
            borderRadius="full"
            w={["full", "full", "auto"]}
          >
            {t('home.hero.ctaPrimary')}
          </Button>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            variant="outline"
            className="hm-border-outline hm-hover-bg"
            borderRadius="full"
            color="var(--hm-color-text-primary)"
            w={["full", "full", "auto"]}
          >
            {t('home.hero.ctaSecondary')}
          </Button>
        </Stack>
      </VStack>

      {/* Image Feature Tiles */}
      <Box zIndex={1} position="relative">
        <FeatureImageTiles />
      </Box>

      {/* Why HearMe tile with right image */}
      <Box mt={24} position="relative" zIndex={1} w="full">
        <Stack direction={["column","row"]} spacing={[6,8]} className="hm-glass-card" p={[6,8]} borderRadius="xl" align="stretch">
          {/* Left: Text content (same as before) */}
          <VStack align="start" spacing={4} flex="1" minW={0}>
            <Heading fontSize={["xl","2xl"]}>{t('home.intro.title')}</Heading>
            <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
              {t('home.intro.p1')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
              {t('home.intro.p2')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
              {t('home.intro.p3')}
            </Text>
          </VStack>

          {/* Right: Image placeholder (you can replace the file later) */}
          <Box flex={["none","0 0 33.333%"]} minW={0} display="flex" alignItems="center" justifyContent="center">
            <Image
              src="/images/why-hearMe.png"
              alt="Why HearMe"
              w="100%"
              h="auto"
              loading="lazy"
              decoding="async"
              onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = '1'; el.src = '/images/fallback.png'; } }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Trust & Safety */}
      <Box mt={12} position="relative" zIndex={1} w="full">
        <Stack direction={["column","row"]} spacing={[6,8]} className="hm-glass-card" p={[6,8]} borderRadius="xl" align="stretch">
          {/* Left: Image (1/3 width) */}
          <Box flex={["none","0 0 33.333%"]} minW={0} display="flex" alignItems="center" justifyContent="center">
            <Image
              src="/images/privacy-promise.png"
              alt="Safety & Privacy"
              w="100%"
              h="auto"
              loading="lazy"
              decoding="async"
              onError={(e) => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = '1'; el.src = '/images/fallback.png'; } }}
            />
          </Box>

          {/* Right: Text content (2/3 width) */}
          <VStack align="start" spacing={4} flex="1" minW={0}>
            <HStack spacing={3}>
              <Box color="var(--hm-color-brand)" fontSize="xl"><FaLock /></Box>
              <Heading fontSize={["lg","xl"]}>{t('home.trust.title')}</Heading>
            </HStack>
            <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
              {t('home.trust.p1')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
              {t('home.trust.p2')}
            </Text>
          </VStack>
        </Stack>
      </Box>

      {/* CTA Footer */}
      <VStack mt={24} spacing={6} textAlign="center">
        <Text fontSize="2xl" fontWeight="700">
          {t('home.ctaFooter.title')}
        </Text>
        <Text fontSize="lg" color="var(--hm-color-text-secondary)">
          {t('home.ctaFooter.subtitle')}
        </Text>
        <Stack direction={["column", "column", "row"]} spacing={4} justify="center" w={["full", "full", "auto"]} px={[4, 0]}>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            borderRadius="full"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)", transform: "translateY(-2px)" }}
            w={["full", "full", "auto"]}
            minH="48px"
          >
            {t('home.ctaFooter.ctaPrimary')}
          </Button>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            variant="outline"
            className="hm-border-outline hm-hover-bg"
            borderRadius="full"
            color="var(--hm-color-text-primary)"
            w={["full", "full", "auto"]}
            minH="48px"
          >
            {t('home.ctaFooter.ctaSecondary')}
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default Home;
