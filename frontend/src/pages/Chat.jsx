import React from "react";
import { Box, Flex, Text, Input, Button, Avatar, VStack, HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";

const MotionBox = motion(Box);

const Chat = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      bg="var(--hm-color-bg)"
      position="relative"
      overflow="hidden"
      color="white"
    >
      {/* Background Gradient Brush Strokes */}
      <MotionBox
        position="absolute"
        top="-20%"
        left="-10%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-pink"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="70%"
        h="70%"
        className="hm-bg-gradient-blue"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Header */}
      <VStack spacing={4} mb={8} zIndex={1}>
        <Avatar
          name="Albert Flores"
          src="https://i.pravatar.cc/150?img=32"
          size="lg"
          className="hm-border-outline"
        />
        <Text fontSize="2xl" fontWeight="600" color="#FFFFFF">
          Albert Flores
        </Text>
      </VStack>

      {/* Chat Input Section */}
      <VStack spacing={4} w={["90%", "400px"]} zIndex={1}>
        <Input
          placeholder="Type a message..."
          className="hm-input"
          _focus={{ borderColor: "#6C63FF" }}
          color="white"
          borderRadius="md"
          p={4}
          fontSize="md"
        />
        <HStack spacing={3} justify="center">
          <Button
            bg="var(--hm-bg-glass-strong)"
            className="hm-hover-bg"
            color="white"
            borderRadius="full"
            px={5}
            py={2}
            fontWeight="500"
          >
            Hi Albert!
          </Button>
          <Button
            bg="var(--hm-bg-glass-strong)"
            className="hm-hover-bg"
            color="white"
            borderRadius="full"
            px={5}
            py={2}
            fontWeight="500"
          >
            I have a question.
          </Button>
          <Button
            bgGradient="var(--hm-gradient-cta)"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
            color="white"
            borderRadius="full"
            px={3}
            py={2}
            rightIcon={<FiSend />}
          >
            Send
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default Chat;