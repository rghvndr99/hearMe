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
      bg="#0A0A0F"
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
        bg="radial-gradient(circle at top left, rgba(247,107,138,0.25), transparent 70%)"
        filter="blur(100px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-20%"
        right="-10%"
        w="70%"
        h="70%"
        bg="radial-gradient(circle at bottom right, rgba(55,114,255,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Header */}
      <VStack spacing={4} mb={8} zIndex={1}>
        <Avatar
          name="Albert Flores"
          src="https://i.pravatar.cc/150?img=32"
          size="lg"
          border="2px solid rgba(255,255,255,0.2)"
        />
        <Text fontSize="2xl" fontWeight="600" color="#FFFFFF">
          Albert Flores
        </Text>
      </VStack>

      {/* Chat Input Section */}
      <VStack spacing={4} w={["90%", "400px"]} zIndex={1}>
        <Input
          placeholder="Type a message..."
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.1)"
          _focus={{ borderColor: "#6C63FF" }}
          color="white"
          borderRadius="md"
          p={4}
          fontSize="md"
        />
        <HStack spacing={3} justify="center">
          <Button
            bg="rgba(255,255,255,0.08)"
            _hover={{ bg: "rgba(255,255,255,0.15)" }}
            color="white"
            borderRadius="full"
            px={5}
            py={2}
            fontWeight="500"
          >
            Hi Albert!
          </Button>
          <Button
            bg="rgba(255,255,255,0.08)"
            _hover={{ bg: "rgba(255,255,255,0.15)" }}
            color="white"
            borderRadius="full"
            px={5}
            py={2}
            fontWeight="500"
          >
            I have a question.
          </Button>
          <Button
            bgGradient="linear(to-r, #6750A4, #F76B1C)"
            _hover={{ bgGradient: "linear(to-r, #F76B1C, #6750A4)" }}
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