import React from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Link,
  Button,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

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
        <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
          <Text
            fontSize="2xl"
            fontWeight="800"
            color="var(--hm-color-text-primary)"
            letterSpacing="tight"
          >
            Hear<span className="hm-brand">Me</span>
          </Text>
        </Link>

        {/* Navigation Links */}
        <HStack spacing={[4, 8]} display={["none", "flex"]}>
          <Link as={RouterLink} to="/about"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            About
          </Link>
          <Link as={RouterLink} to="/resources"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            Resources
          </Link>
                    <Link as={RouterLink} to="/chat"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            Chat
          </Link>
          <Link as={RouterLink} to="/stories"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            Success Stories
          </Link>
          <Link as={RouterLink} to="/contact"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            Contact
          </Link>
          <Link as={RouterLink} to="/volunteer" _hover={{ color: "var(--hm-color-brand)" }} color="var(--hm-color-text-muted)" fontWeight="500">
            Volunteer
          </Link>
        </HStack>

        {/* Theme Toggle & CTA */}
        <HStack spacing={3}>
          <ThemeToggle />
          <Button
            bgGradient="var(--hm-gradient-cta)"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
            color="white"
            borderRadius="full"
            size="sm"
            px={5}
          >
            Join Now
          </Button>
        </HStack>
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
