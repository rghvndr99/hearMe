import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Resources = () => {
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
      {/* === BACKGROUND BRUSH GLOWS === */}
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
      <VStack spacing={12} zIndex={1} maxW="800px">
        <Heading
          as="h1"
          fontSize={["4xl", "5xl", "6xl"]}
          fontWeight="800"
          color="var(--hm-color-text-primary)"
        >
          Mental Health Resources
        </Heading>

        <SimpleGrid columns={[1]} spacing={8} w="full">
          {/* Crisis Hotlines */}
          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 10]}
            textAlign="left"
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Heading
              as="h2"
              fontSize="2xl"
              mb={4}
              fontWeight="700"
              color="var(--hm-color-text-primary)"
            >
              Crisis Hotlines
            </Heading>

            <VStack align="start" spacing={3} color="var(--hm-color-text-tertiary)" fontSize="md">
              <Text>
                <strong>National Suicide Prevention Lifeline:</strong>{" "}
                <Link
                  href="tel:988"
                  color="var(--hm-color-accent-link)"
                  _hover={{ textDecoration: "underline" }}
                >
                  988
                </Link>
              </Text>

              <Text>
                <strong>Crisis Text Line:</strong>{" "}
                <Link
                  href="sms:741741"
                  color="var(--hm-color-accent-link)"
                  _hover={{ textDecoration: "underline" }}
                >
                  Text HOME to 741741
                </Link>
              </Text>

              <Text>
                <strong>SAMHSA National Helpline:</strong>{" "}
                <Link
                  href="tel:18006624357"
                  color="var(--hm-color-accent-link)"
                  _hover={{ textDecoration: "underline" }}
                >
                  1-800-662-4357
                </Link>
              </Text>
            </VStack>
          </Box>

          {/* Professional Help */}
          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 10]}
            textAlign="left"
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Heading
              as="h2"
              fontSize="2xl"
              mb={4}
              fontWeight="700"
              color="var(--hm-color-text-primary)"
            >
              Professional Help
            </Heading>
            <Text color="var(--hm-color-text-tertiary)" fontSize="md">
              Find licensed therapists and mental health professionals in your
              area. Many online platforms such as{" "}
              <Link
                href="https://www.betterhelp.com/"
                target="_blank"
                color="var(--hm-color-accent-link)"
                _hover={{ textDecoration: "underline" }}
              >
                BetterHelp
              </Link>{" "}
              and{" "}
              <Link
                href="https://www.talkspace.com/"
                target="_blank"
                color="var(--hm-color-accent-link)"
                _hover={{ textDecoration: "underline" }}
              >
                Talkspace
              </Link>{" "}
              offer confidential and affordable sessions from home.
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};

export default Resources;
