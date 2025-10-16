import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

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
      {/* === BACKGROUND GRADIENTS (Neo Expressionist Glow) === */}
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

      {/* === PAGE CONTENT === */}
      <VStack spacing={10} zIndex={1} maxW="800px">
        <Heading
          as="h1"
          fontSize={["3xl", "5xl", "6xl"]}
          fontWeight="800"
          color="var(--hm-color-text-primary)"
        >
          {t('about.title')}
        </Heading>


        <VStack spacing={4}>
          <Text fontSize={["md","lg"]} color="var(--hm-color-text-tertiary)" lineHeight="1.8">
            {t('about.p1')}
          </Text>
          <Text fontSize={["md","lg"]} color="var(--hm-color-text-tertiary)" lineHeight="1.8">
            {t('about.p2')}
          </Text>
        </VStack>

        {/* Mission Section */}
        <Box pt={10}>
          <Heading
            as="h2"
            fontSize={["xl", "2xl"]}
            mb={4}
            color="var(--hm-color-text-primary)"
            fontWeight="700"
          >
            {t('about.mission.title')}
          </Heading>
          <Text fontSize={["sm","md"]} color="var(--hm-color-text-secondary)" maxW="700px" mx="auto">
            {t('about.mission.p')}
          </Text>
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
      </VStack>
    </Flex>
  );
};

export default About;
