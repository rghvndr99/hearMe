import React from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Link,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Header= () => {
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="rgba(10,10,15,0.8)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid rgba(255,255,255,0.1)"
      boxShadow="0 4px 20px rgba(0,0,0,0.3)"
    >
      <Flex
        justify="space-between"
        align="center"
        maxW="1200px"
        mx="auto"
        px={[6, 8]}
        py={4}
      >
        {/* Brand / Logo */}
        <Text
          fontSize="2xl"
          fontWeight="800"
          color="#FFF8E7"
          letterSpacing="tight"
        >
          Hear<span style={{ color: "#F76B1C" }}>Me</span>
        </Text>

        {/* Navigation Links */}
        <HStack spacing={[4, 8]} display={["none", "flex"]}>
          <Link
            href="/about"
            _hover={{ color: "#F76B1C" }}
            color="#E0DFF5"
            fontWeight="500"
          >
            About
          </Link>
          <Link
            href="/resources"
            _hover={{ color: "#F76B1C" }}
            color="#E0DFF5"
            fontWeight="500"
          >
            Resources
          </Link>
                    <Link
            href="/chat"
            _hover={{ color: "#F76B1C" }}
            color="#E0DFF5"
            fontWeight="500"
          >
            Chat
          </Link>
          <Link
            href="/stories"
            _hover={{ color: "#F76B1C" }}
            color="#E0DFF5"
            fontWeight="500"
          >
            Success Stories
          </Link>
          <Link
            href="/contact"
            _hover={{ color: "#F76B1C" }}
            color="#E0DFF5"
            fontWeight="500"
          >
            Contact
          </Link>
        </HStack>

        {/* CTA Button */}
        <Button
          bgGradient="linear(to-r, #6750A4, #F76B1C)"
          _hover={{ bgGradient: "linear(to-r, #F76B1C, #6750A4)" }}
          color="white"
          borderRadius="full"
          size="sm"
          px={5}
        >
          Join Now
        </Button>
      </Flex>

      {/* Animated Glow Line */}
      <MotionBox
        h="2px"
        w="100%"
        bgGradient="linear(to-r, rgba(103,80,164,0.6), rgba(247,107,138,0.8))"
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </Box>
  );
};

export default Header;
