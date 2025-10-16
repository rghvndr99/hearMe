import React from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const MotionBox = motion(Box);

import { useTranslation } from "react-i18next";

const Header= () => {
  const { t, i18n } = useTranslation('common');

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="var(--hm-header-bg)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid var(--hm-border-glass)"
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
            {t('nav.about')}
          </Link>
          <Link as={RouterLink} to="/resources"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.resources')}
          </Link>
          <Link as={RouterLink} to="/chat"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.chat')}
          </Link>
          <Link as={RouterLink} to="/stories"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.stories')}
          </Link>
          <Link as={RouterLink} to="/contact"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.contact')}
          </Link>
          <Link as={RouterLink} to="/volunteer" _hover={{ color: "var(--hm-color-brand)" }} color="var(--hm-color-text-muted)" fontWeight="500">
            {t('nav.volunteer')}
          </Link>
        </HStack>

        {/* Theme Toggle & CTA */}
        <HStack spacing={3}>
          <ThemeToggle />
          {/* Language selector */}
          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm">🌐 {i18n.language?.toUpperCase()}</MenuButton>
            <MenuList bg="var(--hm-bg-glass-strong)" border="1px solid var(--hm-border-glass)">
              {['en','hi'].map(lng => (
                <MenuItem key={lng} onClick={() => {
                  i18n.changeLanguage(lng);
                  // Keep Chat page language in sync with UI language
                  const map = { en: 'en-US', hi: 'hi-IN' };
                  const chatLang = map[lng] || 'en-US';
                  localStorage.setItem('hm-language', chatLang);
                  localStorage.setItem('hm-ui-language', lng);
                }}>
                  {t(`language.${lng}`)}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Button
            bgGradient="var(--hm-gradient-cta)"
            _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
            color="white"
            borderRadius="full"
            size="sm"
            px={5}
          >
            {t('nav.joinNow')}
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
