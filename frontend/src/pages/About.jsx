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


const MotionBox = motion(Box);

const About= () => {
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
          About HearMe
        </Heading>


        <VStack spacing={4}>
          <Text fontSize={["md","lg"]} color="var(--hm-color-text-tertiary)" lineHeight="1.8">
            HearMe is a simple, private chat space for anyone feeling stressed, overwhelmed, or alone.
            You can talk in your own language, type or speak, and share at your own pace. No judgment. No pressure.
          </Text>
          <Text fontSize={["md","lg"]} color="var(--hm-color-text-tertiary)" lineHeight="1.8">
            We built HearMe for real life in India study pressure, job stress, family expectations, money worries, and everything in between.
            When your mind feels heavy, were here to listen with care.
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
            Our Mission
          </Heading>
          <Text fontSize={["sm","md"]} color="var(--hm-color-text-secondary)" maxW="700px" mx="auto">
            Make emotional support simple, private, and available in the language you think in  24/7.
            We use caring AI to listen without judgment and guide gentle next steps when you feel stuck.
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
              Our Values
            </Heading>
            <VStack align="start" spacing={2} color="var(--hm-color-text-secondary)">
              <Text><strong>Empathy:</strong> We listen with care and respect.</Text>
              <Text><strong>Privacy:</strong> Anonymous and confidential by design.</Text>
              <Text><strong>Inclusivity:</strong> Support for many languages and backgrounds.</Text>
              <Text><strong>Simplicity:</strong> Easy to use, even on a hard day.</Text>
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
              Who We Serve
            </Heading>
            <VStack align="start" spacing={2} color="var(--hm-color-text-secondary)">
              <Text>Students facing exam or career pressure</Text>
              <Text>Working professionals under deadlines and workload</Text>
              <Text>Caregivers and parents juggling many roles</Text>
              <Text>Anyone feeling lonely, anxious, or overwhelmed</Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};

export default About;
