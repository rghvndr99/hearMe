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
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaPaintBrush, FaHandshake, FaChartBar, FaHeart } from "react-icons/fa";

const MotionBox = motion(Box);

const Home = () => {
  return (
    <Box
      bg="var(--hm-color-bg)"
      color="white"
      minH="100vh"
      position="relative"
      overflow="hidden"
      px={[6, 10]}
      py={[12, 24]}
    >
      {/* Background gradients */}
      <MotionBox
        position="absolute"
        top="-20%"
        left="-10%"
        w="80%"
        h="80%"
        bg="radial-gradient(circle at top left, rgba(247,107,138,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="80%"
        h="80%"
        bg="radial-gradient(circle at bottom right, rgba(55,114,255,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Hero Section */}
      <VStack spacing={6} align="center" textAlign="center" zIndex={1} position="relative">
        <Heading fontSize={["4xl", "6xl", "7xl"]} fontWeight="800">
          Hear yourself.<br />Feel heard.
        </Heading>
        <Text fontSize="lg" color="#D0CFE0" maxW="600px">
          Your space to express, create, and connect freely.
        </Text>

        <HStack spacing={4}>
          <Button
            size="lg"
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
            borderRadius="full"
          >
            Start Building
          </Button>
          <Button
            size="lg"
            variant="outline"
            borderColor="rgba(255,255,255,0.2)"
            _hover={{ bg: "rgba(255,255,255,0.1)" }}
            borderRadius="full"
          >
            Explore the Community
          </Button>
        </HStack>
      </VStack>

      {/* Feature Cards */}
      <SimpleGrid columns={[1, 3]} spacing={8} mt={20} zIndex={1} position="relative">
        {[
          {
            title: "Create Freely",
            icon: FaPaintBrush,
            desc: "Drag, drop, and design your emotions into expression.",
          },
          {
            title: "Collaborate Instantly",
            icon: FaHandshake,
            desc: "Invite friends to co-create in real time.",
          },
          {
            title: "Understand Your Voice",
            icon: FaChartBar,
            desc: "Track engagement and insights on your expressions.",
          },
        ].map((f, i) => (
          <Box
            key={i}
            bg="rgba(255,255,255,0.05)"
            p={8}
            borderRadius="xl"
            textAlign="center"
            border="1px solid rgba(255,255,255,0.1)"
            backdropFilter="blur(10px)"
            transition="0.3s"
            _hover={{ transform: "translateY(-5px)", borderColor: "var(--hm-color-brand)" }}
          >
            <Box fontSize="3xl" mb={4} color="var(--hm-color-brand)">
              <f.icon />
            </Box>
            <Text fontSize="xl" fontWeight="600" mb={2}>
              {f.title}
            </Text>
            <Text color="#CFCFCF" fontSize="sm">
              {f.desc}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Community Showcase */}
      <Box mt={24} position="relative" zIndex={1}>
        <Heading fontSize="2xl" mb={6}>
          See how others express themselves.
        </Heading>
        <SimpleGrid columns={[1, 2, 4]} spacing={6}>
          {[
            { name: "My Next Idea", likes: 8 },
            { name: "Shared Playlist", likes: 4 },
            { name: "Time to Create", likes: 620 },
            { name: "Reflecting", likes: 339 },
          ].map((item, i) => (
            <Box
              key={i}
              p={6}
              borderRadius="xl"
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.08)"
              backdropFilter="blur(8px)"
              transition="0.3s"
              _hover={{ borderColor: "var(--hm-color-brand)" }}
            >
              <HStack spacing={3} mb={3}>
                <Avatar name={item.name} size="sm" />
                <Text fontWeight="500">{item.name}</Text>
              </HStack>
              <HStack spacing={2}>
                <FaHeart color="var(--hm-color-brand)" />
                <Text>{item.likes}</Text>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* CTA Footer */}
      <VStack mt={24} spacing={6} textAlign="center">
        <Text fontSize="2xl" fontWeight="600">
          Your voice deserves to be heard.
        </Text>
        <Text fontSize="xl">Start creating today.</Text>
        <HStack spacing={4}>
          <Button
            bgGradient="var(--hm-gradient-cta)"
            color="white"
            borderRadius="full"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
          >
            Join Free
          </Button>
          <Button
            variant="outline"
            borderColor="rgba(255,255,255,0.2)"
            borderRadius="full"
            _hover={{ bg: "rgba(255,255,255,0.1)" }}
          >
            Sign In
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Home;
