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
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

const Footer = () => {
  const { t } = useTranslation('common');
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
            {t('footer.tagline')}
          </Text>
        </VStack>

        {/* Middle Navigation */}
        <HStack spacing={6}>
          <Link as={RouterLink} to="/about" _hover={{ color: "var(--hm-color-brand)" }}>
            {t('nav.about')}
          </Link>
          <Link as={RouterLink} to="/resources" _hover={{ color: "var(--hm-color-brand)" }}>
            {t('nav.resources')}
          </Link>
           <Link as={RouterLink} to="/chat" _hover={{ color: "var(--hm-color-brand)" }}>
            {t('nav.chat')}
          </Link>
          <Link as={RouterLink} to="/stories" _hover={{ color: "var(--hm-color-brand)" }}>
            {t('nav.stories')}
          </Link>
          <Link as={RouterLink} to="/volunteer" _hover={{ color: "var(--hm-color-brand)" }}>
            {t('nav.volunteer')}
          </Link>

          <Link as={RouterLink} to="/contact" _hover={{ color: "var(--hm-color-brand)" }}>
            {t('nav.contact')}
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
          <Link href="mailto:rghvndr99@gmail.com">
            <IconButton
              aria-label="Email"
              icon={<FaEnvelope />}
              variant="ghost"
              color="var(--hm-color-text-muted)"
              _hover={{ color: "#F76B1C" }}
            />
          </Link>
          <Link href="tel:+918105568665">
            <IconButton
              aria-label="Phone"
              icon={<FaPhone />}
              variant="ghost"
              color="var(--hm-color-text-muted)"
              _hover={{ color: "#F76B1C" }}
            />
          </Link>
          <Link href="https://hearme.com" isExternal>
            <IconButton
              aria-label="Website"
              icon={<FaGlobe />}
              variant="ghost"
              color="var(--hm-color-text-muted)"
              _hover={{ color: "#F76B1C" }}
            />
          </Link>
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
        © {new Date().getFullYear()} HearMe. {t('footer.rights')}
      </Text>
    </Box>
  );
};

export default Footer;
