import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  VStack,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

const MotionBox = motion(Box);

import { useTranslation } from "react-i18next";

const Header= () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [authToken, setAuthToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null));
  const location = useLocation();
  const loginHref = useMemo(() => {
    const current = `${location.pathname}${location.search}${location.hash}`;
    return `/login?redirect=${encodeURIComponent(current)}`;
  }, [location]);

  useEffect(() => {
    const update = () => setAuthToken(typeof window !== 'undefined' ? localStorage.getItem('hm-token') : null);
    window.addEventListener('storage', update);
    window.addEventListener('hm-auth-changed', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('hm-auth-changed', update);
    };
  }, []);

  // Remember last non-auth route for post-login return
  useEffect(() => {
    try {
      const path = `${location.pathname}${location.search}${location.hash}`;
      if (location.pathname !== '/login') {
        localStorage.setItem('hm-last-route', path);
      }
    } catch {}
  }, [location]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('hm-token');
      setAuthToken(null);
      window.dispatchEvent(new Event('hm-auth-changed'));
    } catch {}
    onClose();
    navigate('/login');
  };

  const handleNavClick = () => {
    onClose();
  };



  return (
    <>
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
          px={[4, 6, 8]}
          py={3}
        >
          {/* Mobile Menu Button */}
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            onClick={onOpen}
            variant="ghost"
            color="var(--hm-color-text-primary)"
            display={["flex", "flex", "none"]}
            minW="48px"
            minH="48px"
            _hover={{ color: 'var(--hm-color-brand)' }}
          />

          {/* Brand / Logo */}
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Text
              fontSize={["xl", "2xl"]}
              fontWeight="800"
              color="var(--hm-color-text-primary)"
              letterSpacing="tight"
            >
              Hear<span className="hm-brand">Me</span>
            </Text>
          </Link>

        {/* Desktop Navigation Links */}
        <HStack spacing={[4, 8]} display={["none", "none", "flex"]}>
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
          <Link as={RouterLink} to="/pricing"
            _hover={{ color: "var(--hm-color-brand)" }}
            color="var(--hm-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.pricing', 'Pricing')}
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

        {/* Desktop: Theme Toggle & CTA */}
        <HStack spacing={2} display={["none", "none", "flex"]}>
          <ThemeToggle />
          {/* Language selector */}
          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm" color="var(--hm-color-text-muted)" _hover={{ color: 'var(--hm-color-brand)' }}>🌐 {i18n.language?.toUpperCase()}</MenuButton>
            <MenuList
              bg="var(--hm-bg-glass-strong)"
              borderWidth="1px"
              borderColor="var(--hm-border-glass)"
              backdropFilter="blur(20px)"
              boxShadow="0 8px 24px rgba(0, 0, 0, 0.3)"
            >
              {['en','hi'].map(lng => (
                <MenuItem
                  key={lng}
                  bg="transparent"
                  color={lng === i18n.language ? 'var(--hm-color-brand)' : 'var(--hm-color-text-primary)'}
                  fontWeight={lng === i18n.language ? '700' : '500'}
                  _hover={{ color: 'var(--hm-color-brand)', bg: 'var(--hm-hover-bg)' }}
                  onClick={() => {
                    i18n.changeLanguage(lng);
                    const map = { en: 'en-US', hi: 'hi-IN' };
                    const chatLang = map[lng] || 'en-US';
                    localStorage.setItem('hm-language', chatLang);
                    localStorage.setItem('hm-ui-language', lng);
                  }}
                >
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
                color="var(--hm-color-text-primary)"
                borderColor="var(--hm-border-outline)"
                _hover={{ color: 'var(--hm-color-brand)', borderColor: 'var(--hm-color-brand)' }}
              >
                {t('nav.account', 'Account')}
              </MenuButton>
              <MenuList
                bg="var(--hm-bg-glass-strong)"
                borderWidth="1px"
                borderColor="var(--hm-border-glass)"
                backdropFilter="blur(20px)"
                boxShadow="0 8px 24px rgba(0, 0, 0, 0.3)"
              >
                <MenuItem as={RouterLink} to="/profile" bg="transparent" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}>
                  {t('nav.profile', 'Profile')}
                </MenuItem>
                <MenuItem as={RouterLink} to="/voicemate" bg="transparent" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}>
                  {t('nav.voiceMate', 'VoiceMate')}
                </MenuItem>
                <MenuItem as={RouterLink} to="/change-password" bg="transparent" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}>
                  {t('nav.changePassword', 'Change Password')}
                </MenuItem>
                <MenuItem as={RouterLink} to="/change-email" bg="transparent" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}>
                  {t('nav.changeEmail', 'Change Email')}
                </MenuItem>
                <MenuItem onClick={() => { try { localStorage.removeItem('hm-token'); setAuthToken(null); window.dispatchEvent(new Event('hm-auth-changed')); } catch {} navigate('/login'); }} bg="transparent" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}>
                  {t('nav.logout', 'Logout')}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button as={RouterLink} to={loginHref} variant="ghost" size="sm" color="var(--hm-color-text-muted)" _hover={{ color: 'var(--hm-color-brand)' }} display={["none", "inline-flex"]}>{t('nav.login', 'Login')}</Button>
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

    {/* Mobile Navigation Drawer */}
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
      <DrawerOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
      <DrawerContent bg="var(--hm-color-bg)" color="var(--hm-color-text-primary)">
        <DrawerCloseButton size="lg" mt={2} mr={2} minW="48px" minH="48px" />
        <DrawerHeader borderBottomWidth="1px" borderColor="var(--hm-border-glass)">
          <Text fontSize="2xl" fontWeight="800">
            Hear<span className="hm-brand">Me</span>
          </Text>
        </DrawerHeader>

        <DrawerBody pt={6}>
          <VStack spacing={1} align="stretch">
            {/* Navigation Links */}
            <Link
              as={RouterLink}
              to="/about"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.about')}
            </Link>
            <Link
              as={RouterLink}
              to="/voicemate"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.voiceMate', 'VoiceMate')}
            </Link>
            <Link
              as={RouterLink}
              to="/chat"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.chat')}
            </Link>
            <Link
              as={RouterLink}
              to="/stories"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.stories')}
            </Link>
            <Link
              as={RouterLink}
              to="/pricing"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.pricing', 'Pricing')}
            </Link>
            <Link
              as={RouterLink}
              to="/contact"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.contact')}
            </Link>
            <Link
              as={RouterLink}
              to="/volunteer"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
              color="var(--hm-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.volunteer')}
            </Link>

            <Divider my={4} borderColor="var(--hm-border-glass)" />

            {/* Theme & Language */}
            <VStack spacing={2} align="stretch" px={4}>
              <HStack spacing={3} py={2} justify="space-between">
                <Text fontSize="md" color="var(--hm-color-text-primary)" fontWeight="500">{t('nav.theme', 'Theme')}</Text>
                <ThemeToggle />
              </HStack>

              <HStack spacing={3} py={2} justify="space-between">
                <Text fontSize="md" color="var(--hm-color-text-primary)" fontWeight="500">{t('nav.language', 'Language')}</Text>
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="sm"
                    minH="48px"
                    fontWeight="500"
                    fontSize="md"
                    color="var(--hm-color-text-primary)"
                    _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
                    rightIcon={<Text fontSize="sm">▼</Text>}
                  >
                    {i18n.language?.toUpperCase()}
                  </MenuButton>
                  <MenuList
                    bg="var(--hm-bg-glass-strong)"
                    borderWidth="1px"
                    borderColor="var(--hm-border-glass)"
                    backdropFilter="blur(20px)"
                    boxShadow="0 8px 24px rgba(0, 0, 0, 0.3)"
                  >
                    {['en','hi'].map(lng => (
                      <MenuItem
                        key={lng}
                        bg="transparent"
                        color={lng === i18n.language ? 'var(--hm-color-brand)' : 'var(--hm-color-text-primary)'}
                        fontWeight={lng === i18n.language ? '700' : '500'}
                        _hover={{ color: 'var(--hm-color-brand)', bg: 'var(--hm-hover-bg)' }}
                        onClick={() => {
                          i18n.changeLanguage(lng);
                          const map = { en: 'en-US', hi: 'hi-IN' };
                          const chatLang = map[lng] || 'en-US';
                          localStorage.setItem('hm-language', chatLang);
                          localStorage.setItem('hm-ui-language', lng);
                        }}
                        minH="48px"
                      >
                        {t(`language.${lng}`)}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </HStack>
            </VStack>

            <Divider my={4} borderColor="var(--hm-border-glass)" />

            {/* Auth Section */}
            {authToken ? (
              <VStack spacing={1} align="stretch">
                <Link
                  as={RouterLink}
                  to="/profile"
                  onClick={handleNavClick}
                  py={3}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
                  color="var(--hm-color-text-primary)"
                  fontWeight="500"
                  fontSize="lg"
                  minH="48px"
                  display="flex"
                  alignItems="center"
                >
                  {t('nav.profile', 'Profile')}
                </Link>
                <Link
                  as={RouterLink}
                  to="/change-password"
                  onClick={handleNavClick}
                  py={3}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
                  color="var(--hm-color-text-primary)"
                  fontWeight="500"
                  fontSize="lg"
                  minH="48px"
                  display="flex"
                  alignItems="center"
                >
                  {t('nav.changePassword', 'Change Password')}
                </Link>
                <Link
                  as={RouterLink}
                  to="/change-email"
                  onClick={handleNavClick}
                  py={3}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
                  color="var(--hm-color-text-primary)"
                  fontWeight="500"
                  fontSize="lg"
                  minH="48px"
                  display="flex"
                  alignItems="center"
                >
                  {t('nav.changeEmail', 'Change Email')}
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  justifyContent="flex-start"
                  py={3}
                  px={4}
                  minH="48px"
                  fontWeight="500"
                  fontSize="lg"
                  color="var(--hm-color-text-primary)"
                  _hover={{ bg: 'var(--hm-hover-bg)', color: 'var(--hm-color-brand)' }}
                >
                  {t('nav.logout', 'Logout')}
                </Button>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch" px={4} pt={2}>
                <Button
                  as={RouterLink}
                  to={loginHref}
                  onClick={handleNavClick}
                  variant="outline"
                  size="lg"
                  minH="56px"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  _hover={{ borderColor: 'var(--hm-color-brand)', color: 'var(--hm-color-brand)' }}
                >
                  {t('nav.login', 'Login')}
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  onClick={handleNavClick}
                  bgGradient="var(--hm-gradient-cta)"
                  _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
                  color="white"
                  size="lg"
                  minH="56px"
                >
                  {t('nav.signUp', 'Sign up')}
                </Button>
              </VStack>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
    </>
  );
};

export default Header;
