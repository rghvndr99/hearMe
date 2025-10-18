import React, { useEffect, useState } from "react";
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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const MotionBox = motion(Box);

import { useTranslation } from "react-i18next";

const Header= () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [authToken, setAuthToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null));
  useEffect(() => {
    const update = () => setAuthToken(typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null);
    window.addEventListener('storage', update);
    window.addEventListener('hm-auth-changed', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('hm-auth-changed', update);
    };
  }, []);


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
          <Link as={RouterLink} to="/voicemate"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.voiceMate', 'VoiceMate')}
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
            <MenuButton as={Button} variant="ghost" size="sm" color="var(--hm-color-text-muted)" _hover={{ color: 'var(--hm-color-brand)' }}>🌐 {i18n.language?.toUpperCase()}</MenuButton>
            <MenuList bg="var(--hm-bg-glass-strong)" border="1px solid var(--hm-border-glass)">
              {['en','hi'].map(lng => (
                <MenuItem key={lng} color={lng === i18n.language ? 'var(--hm-color-brand)' : 'var(--hm-color-text-muted)'} fontWeight={lng === i18n.language ? '700' : '500'} _hover={{ color: 'var(--hm-color-brand)', bg: 'transparent' }} onClick={() => {
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
          {/* Auth Links */}
          {authToken ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="outline"
                size="sm"
                color="var(--hm-color-text-muted)"
                borderColor="var(--hm-border-glass)"
                _hover={{ color: 'var(--hm-color-brand)', borderColor: 'var(--hm-color-brand)' }}
              >
                {t('nav.account', 'Account')}
              </MenuButton>
              <MenuList
                bg="var(--hm-bg-glass-strong)"
                border="1px solid var(--hm-border-glass)"
              >
                <MenuItem as={RouterLink} to="/profile" color="var(--hm-color-text-primary)" _hover={{ bg: 'transparent', color: 'var(--hm-color-brand)' }}>
                  {t('nav.profile', 'Profile')}
                </MenuItem>
                <MenuItem as={RouterLink} to="/voicemate" color="var(--hm-color-text-primary)" _hover={{ bg: 'transparent', color: 'var(--hm-color-brand)' }}>
                  {t('nav.voiceMate', 'VoiceMate')}
                </MenuItem>
                <MenuItem as={RouterLink} to="/change-password" color="var(--hm-color-text-primary)" _hover={{ bg: 'transparent', color: 'var(--hm-color-brand)' }}>
                  {t('nav.changePassword', 'Change Password')}
                </MenuItem>
                <MenuItem as={RouterLink} to="/change-email" color="var(--hm-color-text-primary)" _hover={{ bg: 'transparent', color: 'var(--hm-color-brand)' }}>
                  {t('nav.changeEmail', 'Change Email')}
                </MenuItem>
                <MenuItem onClick={() => { try { localStorage.removeItem('hm-token'); setAuthToken(null); window.dispatchEvent(new Event('hm-auth-changed')); } catch {} navigate('/login'); }} color="var(--hm-color-text-primary)" _hover={{ bg: 'transparent', color: 'var(--hm-color-brand)' }}>
                  {t('nav.logout', 'Logout')}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button as={RouterLink} to="/login" variant="ghost" size="sm" color="var(--hm-color-text-muted)" _hover={{ color: 'var(--hm-color-brand)' }}>{t('nav.login', 'Login')}</Button>
              <Button as={RouterLink} to="/register"
                bgGradient="var(--hm-gradient-cta)"
                _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
                color="white"
                borderRadius="full"
                size="sm"
                px={5}
              >
                {t('nav.signUp', 'Sign up')}
              </Button>
            </>
          )}
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
