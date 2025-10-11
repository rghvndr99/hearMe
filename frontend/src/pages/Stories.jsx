import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Textarea,
  Button,
  SimpleGrid,
  Avatar,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const mockStories = [
  {
    name: "Amanda S.",
    role: "Product Designer",
    story:
      '"HearMe provided a safe space for me to share my thoughts during difficult times. Truly life-changing."',
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "James C.",
    role: "Software Engineer",
    story:
      "The connections I've made here are supportive and genuine. It’s been a vital part of my mental health journey.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Sarah M.",
    role: "Artist",
    story:
      "Expressing myself on HearMe has helped me gain clarity and find my creative voice again.",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "David W.",
    role: "Small Business Owner",
    story:
      "Finding like-minded people to share my challenges with has been incredibly rewarding.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const Stories = () => {
  const [newStory, setNewStory] = useState("");

  const handlePost = () => {
    if (newStory.trim()) {
      alert("✅ Thank you for sharing your story!");
      setNewStory("");
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="#0A0A0F"
      color="white"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      py={[12, 20]}
      textAlign="center"
    >
      {/* === BACKGROUND GRADIENT BRUSH STROKES === */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-15%"
        w="80%"
        h="80%"
        bg="radial-gradient(circle at top left, rgba(247,107,138,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-15%"
        w="80%"
        h="80%"
        bg="radial-gradient(circle at bottom right, rgba(55,114,255,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="0%"
        left="0%"
        w="100%"
        h="100%"
        bg="radial-gradient(circle at bottom left, rgba(249,168,38,0.15), transparent 70%)"
        filter="blur(150px)"
      />

      {/* === PAGE CONTENT === */}
      <VStack spacing={10} zIndex={1} maxW="900px">
        <Heading
          as="h1"
          fontSize={["4xl", "5xl", "6xl"]}
          fontWeight="800"
          color="#CBB9FF"
        >
          Success Stories
        </Heading>

        {/* Share Your Story Section */}
        <Box
          w="full"
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.1)"
          borderRadius="xl"
          p={[6, 8]}
          backdropFilter="blur(10px)"
        >
          <Text fontSize="lg" mb={4} color="#D0CFE0">
            Share your own HearMe journey with our community 💬
          </Text>
          <Textarea
            placeholder="Write your success story..."
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            _focus={{ borderColor: "#F76B1C" }}
            color="white"
            _placeholder={{ color: "#A0A0A0" }}
            borderRadius="md"
            p={4}
            mb={4}
            value={newStory}
            onChange={(e) => setNewStory(e.target.value)}
          />
          <Button
            bgGradient="linear(to-r, #6750A4, #F76B1C)"
            _hover={{ bgGradient: "linear(to-r, #F76B1C, #6750A4)" }}
            color="white"
            fontWeight="600"
            borderRadius="md"
            px={8}
            onClick={handlePost}
          >
            Share Your Story
          </Button>
        </Box>

        {/* Success Stories Grid */}
        <SimpleGrid columns={[1, 2]} spacing={8} pt={10} w="full">
          {mockStories.map((s, i) => (
            <Box
              key={i}
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.1)"
              borderRadius="xl"
              p={[6, 8]}
              textAlign="left"
              backdropFilter="blur(10px)"
              transition="0.3s"
              _hover={{ borderColor: "#F76B1C" }}
            >
              <Flex align="center" mb={4}>
                <Avatar name={s.name} src={s.avatar} size="md" mr={4} />
                <Box>
                  <Text fontWeight="600" color="#FFF8E7">
                    {s.name}
                  </Text>
                  <Text fontSize="sm" color="#CFCFCF">
                    {s.role}
                  </Text>
                </Box>
              </Flex>
              <Text color="#E8E8E8" fontSize="md">
                {s.story}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Flex>
  );
};

export default Stories;
