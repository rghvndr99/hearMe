import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { FaUserSecret, FaClock, FaGlobe, FaMicrophone, FaRobot, FaLifeRing, FaLock, FaUpload } from "react-icons/fa";


const MotionBox = motion(Box);

const Home = () => {
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
          You don’t have to carry it alone.
        </Heading>
        <Text fontSize={["md", "lg"]} color="var(--hm-color-text-tertiary)" maxW="780px">
          HearMe is a safe, anonymous chat space—day or night. Talk in your language, type or speak, and feel heard without judgment.
        </Text>

        <HStack spacing={4}>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)", transform: "translateY(-2px)" }}
            borderRadius="full"
          >
            Start a safe conversation
          </Button>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            variant="outline"
            className="hm-border-outline hm-hover-bg"
            borderRadius="full"
            color="var(--hm-color-text-primary)"
          >
            I just want to talk
          </Button>
        </HStack>

      </VStack>

      {/* Key Features */}
      <SimpleGrid columns={[1, 2, 3]} spacing={8} mt={20} zIndex={1} position="relative">
        {[
          {
            title: "Anonymous & Confidential",
            icon: FaUserSecret,
            desc: "No personal details needed. Your privacy comes first.",
          },
          {
            title: "24/7 Availability",
            icon: FaClock,
            desc: "We’re here day and night — whenever you need to talk.",
          },
          {
            title: "Multi‑language Support",
            icon: FaGlobe,
            desc: "Chat in the language you’re most comfortable with — English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and more.",
          },
          {
            title: "Voice Input & Replies",
            icon: FaMicrophone,
            desc: "Don’t want to type? Speak your heart. You can also listen to responses.",
          },
          {
            title: "Caring AI Guidance",
            icon: FaRobot,
            desc: "Calm, non‑judgmental support to help you breathe, think, and take small steps.",
          },
          {
            title: "Crisis Detection",
            icon: FaLifeRing,
            desc: "If you’re in danger or feel unsafe, we’ll guide you to urgent help options right away.",
          },
          {
            title: "Personal Voice (Experimental)",
            icon: FaUpload,
            desc: "Upload your voice and hear replies in a similar tone. Try this early feature to make conversations feel more like you.",
          },
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
          <Heading fontSize={["xl","2xl"]}>A simple, safe place to talk</Heading>
          <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
            Life in India can be intense study pressure, job stress, family expectations, money worries, loneliness, or simply feeling stuck. If your mind feels heavy, we are here for you.
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
            HearMe is an AIsupported chat that listens with care. Its private, confidential, and always available. You can share what you feel, at your own pace, in simple words. No signup. No judgment. Just support.
          </Text>
        </VStack>
      </Box>

      {/* Trust & Safety */}
      <Box mt={12} position="relative" zIndex={1} maxW="900px">
        <VStack align="start" spacing={4} className="hm-glass-card" p={[6,8]} borderRadius="xl">
          <HStack spacing={3}>
            <Box color="var(--hm-color-brand)" fontSize="xl"><FaLock /></Box>
            <Heading fontSize={["lg","xl"]}>Trust & Safety</Heading>
          </HStack>
          <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
            Your safety and privacy matter to us. Your chats stay anonymous and confidential. HearMe is a supportive space, not a replacement for medical or emergency care.
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize={["sm","md"]}>
            If you are in immediate danger or thinking of harming yourself, please call your local emergency number (India: <strong>112</strong>) or reach a trusted crisis helpline in your area. Your life matters.
          </Text>
        </VStack>
      </Box>

      {/* CTA Footer */}
      <VStack mt={24} spacing={6} textAlign="center">
        <Text fontSize="2xl" fontWeight="700">
          You are not alone.
        </Text>
        <Text fontSize="lg" color="var(--hm-color-text-secondary)">
          Share whats on your mind. Were here to listen.
        </Text>
        <HStack spacing={4} justify="center">
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            borderRadius="full"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)", transform: "translateY(-2px)" }}
          >
            Start a safe conversation
          </Button>
          <Button
            as={RouterLink}
            to="/chat"
            size="lg"
            variant="outline"
            className="hm-border-outline hm-hover-bg"
            borderRadius="full"
            color="var(--hm-color-text-primary)"
          >
            Continue as anonymous
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Home;
