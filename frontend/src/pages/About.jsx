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
      py={[12, 20]}
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
      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-15%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-blue"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="0%"
        left="0%"
        w="100%"
        h="100%"
        className="hm-bg-gradient-orange"
      />

      {/* === PAGE CONTENT === */}
      <VStack spacing={10} zIndex={1} maxW="800px">
        <Heading
          as="h1"
          fontSize={["4xl", "5xl", "6xl"]}
          fontWeight="800"
          color="var(--hm-color-text-primary)"
        >
          About Us.
        </Heading>

        <Text fontSize="lg" color="var(--hm-color-text-tertiary)" lineHeight="1.8">
          At <strong>HearMe</strong>, we’re dedicated to providing a safe and open space
          for everyone to share their thoughts, feelings, and creations.
          Our platform empowers individuals to connect authentically and express
          themselves freely.
        </Text>

        {/* Mission Section */}
        <Box pt={10}>
          <Heading
            as="h2"
            fontSize={["2xl", "3xl"]}
            mb={4}
            color="var(--hm-color-text-primary)"
            fontWeight="700"
          >
            Our Mission
          </Heading>
          <Text fontSize="md" color="var(--hm-color-text-secondary)" maxW="600px" mx="auto">
            To foster a community where every voice can be heard and valued.
          </Text>
        </Box>

        {/* Values & Team Section */}
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
            <Text fontSize="md" color="var(--hm-color-text-secondary)">
              Empathy, inclusivity, and creativity are at the core of what we do.
            </Text>
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
              Our Team
            </Heading>
            <Text fontSize="md" color="var(--hm-color-text-secondary)">
              A diverse group of passionate individuals committed to making a
              difference.
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};

export default About;
