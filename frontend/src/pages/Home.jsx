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
import { FaUserSecret, FaClock, FaGlobe, FaMicrophone, FaRobot, FaLifeRing, FaLock, FaUpload } from "react-icons/fa";


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
      overflow="hidden"
      px={[6, 10]}
      pt="100px"
      pb={[12, 24]}
    >

      {/* Hero Section */}
      <VStack spacing={6} align="center" textAlign="center" zIndex={1} position="relative">
        <Heading fontSize={["3xl", "5xl", "6xl"]} fontWeight="800">
          {t('home.hero.title')}
        </Heading>
        <Text fontSize={["md", "lg"]} color="var(--hm-color-text-tertiary)" maxW="780px">
          {t('home.hero.subtitle')}
        </Text>

        {/* Banner Image */
        }
        <Box maxW="1100px" w="full" className="hm-glass-card-light" borderRadius="2xl" overflow="hidden" position="relative">
          <Image
            src={bannerSrc}
            alt="Calming, supportive banner illustrating connection and emotional well-being — HearMe"
            w="100%"
            h={["180px","260px","360px"]}
            objectFit="cover"
            loading="lazy"
            onError={() => { if (bannerSrc !== DEFAULT_BANNER_FALLBACK) setBannerSrc(DEFAULT_BANNER_FALLBACK); }}
          />
          {/* Subtle overlay to harmonize with themes and glass look */}
          <Box position="absolute" inset={0} bg="linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0))" />
        </Box>

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

      {/* Key Features */}
      <SimpleGrid columns={[1, 2, 3]} spacing={8} mt={20} zIndex={1} position="relative">
        {[
          { title: t('home.features.anon.title'), icon: FaUserSecret, desc: t('home.features.anon.desc') },
          { title: t('home.features.availability.title'), icon: FaClock, desc: t('home.features.availability.desc') },
          { title: t('home.features.languages.title'), icon: FaGlobe, desc: t('home.features.languages.desc') },
          { title: t('home.features.voice.title'), icon: FaMicrophone, desc: t('home.features.voice.desc') },
          { title: t('home.features.ai.title'), icon: FaRobot, desc: t('home.features.ai.desc') },
          { title: t('home.features.crisis.title'), icon: FaLifeRing, desc: t('home.features.crisis.desc') },
          { title: t('home.features.voicePersonal.title'), icon: FaUpload, desc: t('home.features.voicePersonal.desc') },
        ].map((f, i) => (
          <Box
            key={i}
            className="hm-glass-card"
            p={8}
            borderRadius="xl"
            textAlign="left"
            transition="0.3s"
            _hover={{ transform: "translateY(-5px)", borderColor: "var(--hm-color-brand)" }}
          >
            <HStack spacing={4} mb={3}>
              <Box fontSize="2xl" color="var(--hm-color-brand)">
                <f.icon />
              </Box>
              <Text fontSize="xl" fontWeight="600">{f.title}</Text>
            </HStack>
            <Text color="var(--hm-color-text-secondary)" fontSize="sm">
              {f.desc}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Introduction */}
      <Box mt={24} position="relative" zIndex={1} maxW="900px">
        <VStack align="start" spacing={4} className="hm-glass-card" p={[6,8]} borderRadius="xl">
          <Heading fontSize={["xl","2xl"]}>{t('home.intro.title')}</Heading>
          <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
            {t('home.intro.p1')}
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
            {t('home.intro.p2')}
          </Text>
        </VStack>
      </Box>

      {/* Trust & Safety */}
      <Box mt={12} position="relative" zIndex={1} maxW="900px">
        <VStack align="start" spacing={4} className="hm-glass-card" p={[6,8]} borderRadius="xl">
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
