import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Stack,
  Image,
} from "@chakra-ui/react";

// Safe local fallback image already present from carousel
const FALLBACK_ABOUT_IMG = '/images/1.png';

import { useTranslation } from "react-i18next";

const About= () => {
  const { t } = useTranslation('common');
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
      textAlign="center"
    >
      {/* === PAGE CONTENT === */}
      <VStack spacing={10} zIndex={1} w="full" maxW="1200px" align="stretch">
        {/* Hero: Text left, image right */}
        <Stack direction={["column","row"]} spacing={[6,8]} className="hm-glass-card" p={[6,8]} borderRadius="xl" align="stretch">
          <VStack align="start" spacing={4} flex="1" minW={0} textAlign="left">
            <Heading
              as="h1"
              fontSize={["3xl", "5xl", "6xl"]}
              fontWeight="800"
              color="var(--hm-color-text-primary)"
              lineHeight="1.2"
            >
              {t('about.title', 'Dil Ki Baat — We\'re Here to Listen 💜')}
            </Heading>

            <Text fontSize={["lg", "xl"]} color="var(--hm-color-text-secondary)" fontWeight="500">
              {t('about.subtitle', 'HearMe is India\'s safe space for mental wellness. Anonymous. Confidential. Judgment-free. In your language.')}
            </Text>

            <Text fontSize={["md","lg"]} color="var(--hm-color-text-tertiary)" lineHeight="1.8">
              {t('about.p1', 'We know what it feels like when your mind is heavy...')}
            </Text>
            <Text fontSize={["md","lg"]} color="var(--hm-color-text-tertiary)" lineHeight="1.8">
              {t('about.p2', 'HearMe is built for real life in India...')}
            </Text>
          </VStack>

          {/* Right: Hero image (1/3 width) */}
          <Box flex={["none","0 0 33.333%"]} minW={0} display="flex" alignItems="center" justifyContent="center">
            <Image
              src="/images/dil-ki-baat.png"
              alt="About HearMe"
              w="100%"
              h="auto"
              loading="lazy"
              decoding="async"
              onError={(e)=>{ const el=e.currentTarget; if(!el.dataset.fb){ el.dataset.fb='1'; el.src = FALLBACK_ABOUT_IMG; } }}
            />
          </Box>
        </Stack>

        {/* Mission Section */}
        <Box pt={10} w="full">
          <Stack direction={["column","row"]} spacing={[6,8]} className="hm-glass-card" p={[6,8]} borderRadius="xl" align="stretch">

            {/* Right: Mission text */}
            <VStack align="start" spacing={4} flex="1" minW={0}>
              <Heading
                as="h2"
                fontSize={["2xl", "3xl"]}
                mb={0}
                color="var(--hm-color-text-primary)"
                fontWeight="700"
              >
                {t('about.mission.title', 'Our Mission: Dil Halka Karo')}
              </Heading>
              <Text fontSize={["md","lg"]} color="var(--hm-color-text-secondary)" lineHeight="1.8">
                {t('about.mission.p', 'Make emotional support simple, private, and available 24/7...')}
              </Text>
            </VStack>
          </Stack>
        </Box>

        {/* Values & Who We Serve */}
        <SimpleGrid columns={[1, 2]} spacing={10} pt={10} w="full">
          <Box
            className="hm-glass-card"
            p={8}
            borderRadius="lg"
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Heading
              as="h3"
              fontSize="2xl"
              mb={3}
              color="var(--hm-color-text-primary)"
              fontWeight="700"
            >
              {t('about.values.title')}
            </Heading>
            <VStack align="start" spacing={2} color="var(--hm-color-text-secondary)">
              <Text>{t('about.values.empathy')}</Text>
              <Text>{t('about.values.privacy')}</Text>
              <Text>{t('about.values.inclusivity')}</Text>
              <Text>{t('about.values.simplicity')}</Text>
            </VStack>
          </Box>

          <Box
            className="hm-glass-card-light"
            p={8}
            borderRadius="lg"
            transition="0.3s"

            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Heading as="h3" fontSize="2xl" mb={3} color="var(--hm-color-text-primary)" fontWeight="700">
              {t('about.serve.title')}
            </Heading>
            <VStack align="start" spacing={2} color="var(--hm-color-text-secondary)">
              <Text>{t('about.serve.students')}</Text>
              <Text>{t('about.serve.professionals')}</Text>
              <Text>{t('about.serve.caregivers')}</Text>
              <Text>{t('about.serve.anyone')}</Text>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Why HearMe Is Different Section */}
        <Box pt={16} w="full">
          <Heading
            as="h2"
            fontSize={["2xl", "3xl"]}
            mb={8}
            textAlign="center"
            color="var(--hm-color-text-primary)"
            fontWeight="700"
          >
            {t('about.whyDifferent.title', 'Why HearMe Is Different')}
          </Heading>

          <SimpleGrid columns={[1, 2]} spacing={8} w="full">
            {/* Card 1 - Built for India */}
            <Box
              className="hm-glass-card"
              p={8}
              borderRadius="xl"
              transition="0.3s"
              _hover={{ borderColor: "var(--hm-color-brand)", transform: "translateY(-4px)" }}
            >

              <Text fontSize="2xl" mb={3} fontWeight="700" color="var(--hm-color-text-primary)">

                {t('about.whyDifferent.card1Title', '🇮🇳 Built for India')}
              </Text>
              <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
                {t('about.whyDifferent.card1Desc', 'We understand Indian family dynamics, cultural pressures, and language needs...')}
              </Text>
            </Box>

            {/* Card 2 - Your Voice, Your Way */}
            <Box
              className="hm-glass-card-light"
              p={8}
              borderRadius="xl"
              transition="0.3s"
              _hover={{ borderColor: "var(--hm-color-brand)", transform: "translateY(-4px)" }}
            >

              <Text fontSize="2xl" mb={3} fontWeight="700" color="var(--hm-color-text-primary)">
                {t('about.whyDifferent.card2Title', '🎙️ Your Voice, Your Way')}
              </Text>
              <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
                {t('about.whyDifferent.card2Desc', 'Type in English, speak in Hindi, mix both — we get it...')}
              </Text>
            </Box>

            {/* Card 3 - Truly Anonymous */}
            <Box
              className="hm-glass-card"
              p={8}
              borderRadius="xl"
              transition="0.3s"
              _hover={{ borderColor: "var(--hm-color-brand)", transform: "translateY(-4px)" }}
            >
              <Text fontSize="2xl" mb={3} fontWeight="700" color="var(--hm-color-text-primary)">
                {t('about.whyDifferent.card3Title', '🔒 Truly Anonymous')}
              </Text>
              <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
                {t('about.whyDifferent.card3Desc', 'No login required for chat. No data sold. Ever...')}
              </Text>
            </Box>

            {/* Card 4 - Judgment-Free Zone */}
            <Box
              className="hm-glass-card-light"
              p={8}
              borderRadius="xl"
              transition="0.3s"
              _hover={{ borderColor: "var(--hm-color-brand)", transform: "translateY(-4px)" }}
            >
              <Text fontSize="2xl" mb={3} fontWeight="700" color="var(--hm-color-text-primary)">
                {t('about.whyDifferent.card4Title', 'Judgment-Free Zone')}
              </Text>
              <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
                {t('about.whyDifferent.card4Desc', 'Whatever you\'re feeling, it\'s valid. We\'re here to listen, not lecture...')}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Flex>
  );
};

export default About;
