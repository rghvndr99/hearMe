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
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Footer = () => {
  return (
    <Box
      as="footer"
      position="relative"
      py={12}
      bg="#0A0A0F"
      color="#E0DFF5"
      overflow="hidden"
      borderTop="1px solid rgba(255,255,255,0.1)"
    >
      {/* Brushstroke Glow Background */}
      <MotionBox
        position="absolute"
        top="-20%"
        left="-10%"
        w="70%"
        h="100%"
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
        h="100%"
        bg="radial-gradient(circle at bottom right, rgba(55,114,255,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

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
          <Text fontSize="2xl" fontWeight="700" color="#FFF8E7">
            Hear<span style={{ color: "#F76B1C" }}>Me</span>
          </Text>
          <Text color="#CFCFCF" fontSize="sm" maxW="400px">
            A safe, expressive, and inclusive space where every voice matters.
          </Text>
        </VStack>

        {/* Middle Navigation */}
        <HStack spacing={6}>
          <Link href="/about" _hover={{ color: "#F76B1C" }}>
            About
          </Link>
          <Link href="/resources" _hover={{ color: "#F76B1C" }}>
            Resources
          </Link>
           <Link href="/chat" _hover={{ color: "#F76B1C" }}>
            Chat
          </Link>
          <Link href="/stories" _hover={{ color: "#F76B1C" }}>
            Success
          </Link>
          <Link href="/contact" _hover={{ color: "#F76B1C" }}>
            Contact
          </Link>
        </HStack>

        {/* Right Social Icons */}
        <HStack spacing={4} mt={[6, 0]}>
          <IconButton
            aria-label="Twitter"
            icon={<FaTwitter />}
            variant="ghost"
            color="#E0DFF5"
            _hover={{ color: "#F76B1C" }}
          />
          <IconButton
            aria-label="Instagram"
            icon={<FaInstagram />}
            variant="ghost"
            color="#E0DFF5"
            _hover={{ color: "#F76B1C" }}
          />
          <IconButton
            aria-label="LinkedIn"
            icon={<FaLinkedin />}
            variant="ghost"
            color="#E0DFF5"
            _hover={{ color: "#F76B1C" }}
          />
          <IconButton
            aria-label="Email"
            icon={<FaEnvelope />}
            variant="ghost"
            color="#E0DFF5"
            _hover={{ color: "#F76B1C" }}
          />
        </HStack>
      </Flex>

      {/* Bottom Text */}
      <Text
        textAlign="center"
        mt={10}
        fontSize="sm"
        color="#CFCFCF"
        opacity="0.8"
      >
        © {new Date().getFullYear()} HearMe. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
