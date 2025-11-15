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
  Portal,
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
  const langMenu = useDisclosure();
  const accountMenu = useDisclosure();
  const drawerLangMenu = useDisclosure();
  const [authToken, setAuthToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('vl-token') : null));
  const location = useLocation();
  const loginHref = useMemo(() => {
    const current = `${location.pathname}${location.search}${location.hash}`;
    return `/login?redirect=${encodeURIComponent(current)}`;
  }, [location]);

  useEffect(() => {
    const update = () => setAuthToken(typeof window !== 'undefined' ? localStorage.getItem('vl-token') : null);
    window.addEventListener('storage', update);
    window.addEventListener('vl-auth-changed', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('vl-auth-changed', update);
    };
  }, []);

  // Remember last non-auth route for post-login return
  useEffect(() => {
    try {
      const path = `${location.pathname}${location.search}${location.hash}`;
      if (location.pathname !== '/login') {
        localStorage.setItem('vl-last-route', path);
      }
    } catch {}
  }, [location]);

  const handleLogout = () => {
    try {
      // Clear both auth and any existing anonymous session token so a fresh alias is created next time
      localStorage.removeItem('vl-token');
      try { sessionStorage.removeItem('vl-anon-token'); } catch {}
      // Best-effort cleanup of anon usage meters
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k && k.startsWith('vl-anon-usedMs-')) localStorage.removeItem(k);
        });
      } catch {}
      setAuthToken(null);
      window.dispatchEvent(new Event('vl-auth-changed'));
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
        bg="var(--vl-header-bg)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid var(--vl-border-glass)"
        boxShadow="var(--vl-shadow-header, 0 4px 20px rgba(0,0,0,0.3))"
        className="vl-cid-header-root"
        data-cid="header-root"
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
            color="var(--vl-color-text-primary)"
            display={["flex", "flex", "none"]}
            minW="48px"
            minH="48px"
            _hover={{ color: 'var(--vl-color-brand)' }}
            className="vl-cid-header-menu-button"
            data-cid="header-menu-button"
          />

          {/* Brand / Logo */}
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} className="vl-cid-header-brand" data-cid="header-brand">
            <Text
              fontSize={["xl", "2xl"]}
              fontWeight="800"
              color="var(--vl-color-text-primary)"
              letterSpacing="tight"
            >
              Voice<span className="vl-brand">Lap</span>
            </Text>
          </Link>

        {/* Desktop Navigation Links */}
        <HStack spacing={[4, 8]} display={["none", "none", "flex"]} className="vl-cid-header-nav-desktop" data-cid="header-nav-desktop">
          <Link as={RouterLink} to="/about"
            _hover={{ color: "var(--vl-color-brand)" }}
            color="var(--vl-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.about')}
          </Link>
          <Link as={RouterLink} to="/voicemate"
            _hover={{ color: "var(--vl-color-brand)" }}
            color="var(--vl-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.voiceMate', 'VoiceMate')}
          </Link>
          <Link as={RouterLink} to="/chat"
            _hover={{ color: "var(--vl-color-brand)" }}
            color="var(--vl-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.chat')}
          </Link>
          <Link as={RouterLink} to="/stories"
            _hover={{ color: "var(--vl-color-brand)" }}
            color="var(--vl-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.stories')}
          </Link>
          <Link as={RouterLink} to="/pricing"
            _hover={{ color: "var(--vl-color-brand)" }}
            color="var(--vl-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.pricing', 'Pricing')}
          </Link>
          <Link as={RouterLink} to="/contact"
            _hover={{ color: "var(--vl-color-brand)" }}
            color="var(--vl-color-text-muted)"
            fontWeight="500"
          >
            {t('nav.contact')}
          </Link>
          <Link as={RouterLink} to="/volunteer" _hover={{ color: "var(--vl-color-brand)" }} color="var(--vl-color-text-muted)" fontWeight="500">
            {t('nav.volunteer')}
          </Link>
        </HStack>

        {/* Desktop: Theme Toggle & CTA */}
        <HStack spacing={2} display={["none", "none", "flex"]} className="vl-cid-header-cta-desktop" data-cid="header-cta-desktop">
          <ThemeToggle />
          {/* Language selector */}
          <Menu isOpen={langMenu.isOpen} onOpen={langMenu.onOpen} onClose={langMenu.onClose}>
            <MenuButton as={Button} variant="outline" size="sm" color="var(--vl-color-text-primary)" bg="var(--vl-bg-glass)" borderColor="var(--vl-border-glass)" _hover={{ color: 'var(--vl-color-brand)', bg: 'var(--vl-bg-glass-strong)' }} className="vl-cid-header-lang" data-cid="header-lang">🌐 {i18n.language?.toUpperCase()}</MenuButton>
            {langMenu.isOpen && (
              <Portal>
                <Box position="fixed" inset={0} bg="var(--vl-overlay-bg, rgba(0,0,0,0.6))" backdropFilter="blur(2px)" zIndex={1490} onClick={langMenu.onClose} />
              </Portal>
            )}
            <Portal>
              <MenuList
                bg="var(--vl-bg-glass-strong)"
                color="var(--vl-color-text-primary)"
                borderWidth="1px"
                borderColor="var(--vl-border-glass)"
                backdropFilter="blur(20px)"
                boxShadow="var(--vl-shadow-popover, 0 8px 24px rgba(0, 0, 0, 0.3))"
                zIndex={1500}
              >
                {['en','hi'].map(lng => (
                  <MenuItem
                    key={lng}
                    bg="transparent"
                    color={lng === i18n.language ? 'white' : 'var(--vl-color-text-primary)'}
                    fontWeight={lng === i18n.language ? '700' : '500'}
                    _hover={{ color: 'var(--vl-color-brand)', bg: 'var(--vl-hover-bg)' }}
                    onClick={() => {
                      i18n.changeLanguage(lng);
                      const map = { en: 'en-US', hi: 'hi-IN' };
                      const chatLang = map[lng] || 'en-US';
                      localStorage.setItem('vl-language', chatLang);
                      localStorage.setItem('vl-ui-language', lng);
                    }}
                    minH="48px"
                  >
                    {t(`language.${lng}`)}
                  </MenuItem>
                ))}
              </MenuList>
            </Portal>
          </Menu>
          {/* Auth Links */}
          {authToken ? (
            <Menu isOpen={accountMenu.isOpen} onOpen={accountMenu.onOpen} onClose={accountMenu.onClose}>
              <MenuButton
                as={Button}
                variant="outline"
                size="sm"
                color="var(--vl-color-text-primary)"
                borderColor="var(--vl-border-outline)"
                _hover={{ color: 'var(--vl-color-brand)', borderColor: 'var(--vl-color-brand)' }}
              >
                {t('nav.account', 'Account')}
              </MenuButton>
              {accountMenu.isOpen && (
                <Portal>
                  <Box position="fixed" inset={0} bg="var(--vl-overlay-bg, rgba(0,0,0,0.6))" backdropFilter="blur(2px)" zIndex={1490} onClick={accountMenu.onClose} />
                </Portal>
              )}
              <Portal>
                <MenuList
                  bg="var(--vl-bg-glass-strong)"
                  color="var(--vl-color-text-primary)"
                  borderWidth="1px"
                  borderColor="var(--vl-border-glass)"
                  backdropFilter="blur(20px)"
                  boxShadow="var(--vl-shadow-popover, 0 8px 24px rgba(0, 0, 0, 0.3))"
                  zIndex={1500}
                >
                  <MenuItem as={RouterLink} to="/profile" bg="transparent" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>
                    {t('nav.profile', 'Profile')}
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/voicemate" bg="transparent" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>
                    {t('nav.voiceMate', 'VoiceMate')}
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/change-password" bg="transparent" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>
                    {t('nav.changePassword', 'Change Password')}
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/change-email" bg="transparent" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>
                    {t('nav.changeEmail', 'Change Email')}
                  </MenuItem>
                  <MenuItem onClick={() => { try { localStorage.removeItem('vl-token'); try { sessionStorage.removeItem('vl-anon-token'); } catch {} try { Object.keys(localStorage).forEach((k) => { if (k && k.startsWith('vl-anon-usedMs-')) localStorage.removeItem(k); }); } catch {} setAuthToken(null); window.dispatchEvent(new Event('vl-auth-changed')); } catch {} navigate('/login'); }} bg="transparent" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>
                    {t('nav.logout', 'Logout')}
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          ) : (
            <>
              <Button as={RouterLink} to={loginHref} variant="ghost" size="sm" color="var(--vl-color-text-muted)" _hover={{ color: 'var(--vl-color-brand)' }} display={["none", "inline-flex"]}>{t('nav.login', 'Login')}</Button>
              <Button as={RouterLink} to="/register"
                bgGradient="var(--vl-gradient-cta)"
                _hover={{ bgGradient: "var(--vl-gradient-cta-hover)" }}
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
        bgGradient="var(--vl-header-glow, linear(to-r, rgba(103,80,164,0.6), rgba(247,107,138,0.8)))"
        animate={{
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </Box>

    {/* Mobile Navigation Drawer */}
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
      <DrawerOverlay bg="var(--vl-overlay-bg-strong, rgba(0,0,0,0.7))" backdropFilter="blur(4px)" />
      <DrawerContent bg="var(--vl-color-bg)" color="var(--vl-color-text-primary)" className="vl-cid-header-drawer" data-cid="header-drawer">
        <DrawerCloseButton size="lg" mt={2} mr={2} minW="48px" minH="48px" />
        <DrawerHeader borderBottomWidth="1px" borderColor="var(--vl-border-glass)">
          <Text fontSize="2xl" fontWeight="800">
            Voice<span className="vl-brand">Lap</span>
          </Text>
        </DrawerHeader>

        <DrawerBody pt={6} className="vl-cid-header-drawer-body" data-cid="header-drawer-body">
          <VStack spacing={1} align="stretch" className="vl-cid-header-drawer-links" data-cid="header-drawer-links">
            {/* Navigation Links */}
            <Link
              as={RouterLink}
              to="/about"
              onClick={handleNavClick}
              py={3}
              px={4}
              borderRadius="md"
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
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
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
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
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
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
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
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
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
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
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
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
              _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              color="var(--vl-color-text-primary)"
              fontWeight="500"
              fontSize="lg"
              minH="48px"
              display="flex"
              alignItems="center"
            >
              {t('nav.volunteer')}
            </Link>

            <Divider my={4} borderColor="var(--vl-border-glass)" />

            {/* Theme & Language */}
            <VStack spacing={2} align="stretch" px={4} className="vl-cid-header-drawer-settings" data-cid="header-drawer-settings">
              <HStack spacing={3} py={2} justify="space-between">
                <Text fontSize="md" color="var(--vl-color-text-primary)" fontWeight="500">{t('nav.theme', 'Theme')}</Text>
                <ThemeToggle />
              </HStack>

              <HStack spacing={3} py={2} justify="space-between">
                <Text fontSize="md" color="var(--vl-color-text-primary)" fontWeight="500">{t('nav.language', 'Language')}</Text>
                <Menu isOpen={drawerLangMenu.isOpen} onOpen={drawerLangMenu.onOpen} onClose={drawerLangMenu.onClose}>
                  <MenuButton
                    as={Button}
                    variant="outline"
                    size="sm"
                    minH="48px"
                    fontWeight="500"
                    fontSize="md"
                    color="var(--vl-color-text-primary)"
                    _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
                    rightIcon={<Text fontSize="sm">▼</Text>}
                  >
                    {i18n.language?.toUpperCase()}
                  </MenuButton>
                  {drawerLangMenu.isOpen && (
                    <Portal>
                      <Box position="fixed" inset={0} bg="var(--vl-overlay-bg, rgba(0,0,0,0.6))" backdropFilter="blur(2px)" zIndex={1490} onClick={drawerLangMenu.onClose} />
                    </Portal>
                  )}
                  <Portal>
                    <MenuList
                      bg="var(--vl-bg-glass-strong)"
                      color="var(--vl-color-text-primary)"
                      borderWidth="1px"
                      borderColor="var(--vl-border-glass)"
                      backdropFilter="blur(20px)"
                      boxShadow="var(--vl-shadow-popover, 0 8px 24px rgba(0, 0, 0, 0.3))"
                      zIndex={1500}
                    >
                      {['en','hi'].map(lng => (
                        <MenuItem
                          key={lng}
                          bg="transparent"
                          color={lng === i18n.language ? 'white' : 'var(--vl-color-text-primary)'}
                          fontWeight={lng === i18n.language ? '700' : '500'}
                          _hover={{ color: 'var(--vl-color-brand)', bg: 'var(--vl-hover-bg)' }}
                          onClick={() => {
                            i18n.changeLanguage(lng);
                            const map = { en: 'en-US', hi: 'hi-IN' };
                            const chatLang = map[lng] || 'en-US';
                            localStorage.setItem('vl-language', chatLang);
                            localStorage.setItem('vl-ui-language', lng);
                          }}
                          minH="48px"
                        >
                          {t(`language.${lng}`)}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Portal>
                </Menu>
              </HStack>
            </VStack>

            <Divider my={4} borderColor="var(--vl-border-glass)" />

            {/* Auth Section */}
            {authToken ? (
              <VStack spacing={1} align="stretch" className="vl-cid-header-drawer-auth" data-cid="header-drawer-auth">
                <Link
                  as={RouterLink}
                  to="/profile"
                  onClick={handleNavClick}
                  py={3}
                  px={4}
                  borderRadius="md"
                  _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
                  color="var(--vl-color-text-primary)"
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
                  _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
                  color="var(--vl-color-text-primary)"
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
                  _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
                  color="var(--vl-color-text-primary)"
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
                  color="var(--vl-color-text-primary)"
                  _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
                >
                  {t('nav.logout', 'Logout')}
                </Button>
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch" px={4} pt={2} className="vl-cid-header-drawer-cta" data-cid="header-drawer-cta">
                <Button
                  as={RouterLink}
                  to={loginHref}
                  onClick={handleNavClick}
                  variant="outline"
                  size="lg"
                  minH="56px"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _hover={{ borderColor: 'var(--vl-color-brand)', color: 'var(--vl-color-brand)' }}
                >
                  {t('nav.login', 'Login')}
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  onClick={handleNavClick}
                  bgGradient="var(--vl-gradient-cta)"
                  _hover={{ bgGradient: "var(--vl-gradient-cta-hover)" }}
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
