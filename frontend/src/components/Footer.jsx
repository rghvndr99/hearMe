import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  HStack,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Footer = () => {
  return (
    <Box
      as="footer"
      position="relative"
      py={12}
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-muted)"
      overflow="hidden"
      className="hm-border-top"
    >

      <Flex
        direction={["column", "row"]}
        justify="space-between"
        align="center"
        maxW="1200px"
        mx="auto"
        px={[6, 8]}
        zIndex={1}
      >
        {/* Left Section */}
        <VStack align="start" spacing={3} mb={[8, 0]}>
          <Text fontSize="2xl" fontWeight="700" color="var(--hm-color-text-primary)">
            Hear<span className="hm-brand">Me</span>
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize="sm" maxW="400px">
            A safe, expressive, and inclusive space where every voice matters.
          </Text>
        </VStack>

        {/* Middle Navigation */}
        <HStack spacing={6}>
          <Link as={RouterLink} to="/about" _hover={{ color: "var(--hm-color-brand)" }}>
            About
          </Link>
          <Link as={RouterLink} to="/resources" _hover={{ color: "var(--hm-color-brand)" }}>
            Resources
          </Link>
           <Link as={RouterLink} to="/chat" _hover={{ color: "var(--hm-color-brand)" }}>
            Chat
          </Link>
          <Link as={RouterLink} to="/stories" _hover={{ color: "var(--hm-color-brand)" }}>
            Success
          </Link>
          <Link as={RouterLink} to="/volunteer" _hover={{ color: "var(--hm-color-brand)" }}>
            Volunteer
          </Link>

          <Link as={RouterLink} to="/contact" _hover={{ color: "var(--hm-color-brand)" }}>
            Contact
          </Link>
        </HStack>

        {/* Right Social Icons */}
        <HStack spacing={4} mt={[6, 0]}>
          <IconButton
            aria-label="Twitter"
            icon={<FaTwitter />}
            variant="ghost"
            color="var(--hm-color-text-muted)"
            _hover={{ color: "#F76B1C" }}
          />
          <IconButton
            aria-label="Instagram"
            icon={<FaInstagram />}
            variant="ghost"
            color="var(--hm-color-text-muted)"
            _hover={{ color: "#F76B1C" }}
          />
          <IconButton
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            variant="ghost"
            color="var(--hm-color-text-muted)"
            _hover={{ color: "#F76B1C" }}
          />
          <IconButton
            aria-label="Email"
            icon={<FaEnvelope />}
            variant="ghost"
            color="var(--hm-color-text-muted)"
            _hover={{ color: "#F76B1C" }}
          />
        </HStack>
      </Flex>

      {/* Bottom Text */}
      <Text
        textAlign="center"
        mt={10}
        fontSize="sm"
        color="var(--hm-color-text-secondary)"
        opacity="0.8"
      >
        © {new Date().getFullYear()} HearMe. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
