import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  HStack,
  IconButton,
  VStack,
  SimpleGrid,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaGlobe, FaPhoneAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

const Footer = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      position="relative"
      py={16}
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-muted)"
      overflow="hidden"
      className="hm-border-top"
    >
      <VStack spacing={12} maxW="1200px" mx="auto" px={[6, 8]} zIndex={1}>

        {/* Top Section: Brand + Tagline */}
        <VStack spacing={4} textAlign="center" w="full">
          <Text fontSize="3xl" fontWeight="700" color="var(--hm-color-text-primary)">
            Hear<span className="hm-brand">Me</span>
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize="md" maxW="800px" lineHeight="1.8">
            {t('footer.tagline', 'Aapki awaaz, aapki kahani, aapka safe space. Mental health support jo samajhta hai aapko — judgment-free, anonymous, aur bilkul free. Aap akele nahi ho.')}
          </Text>
        </VStack>

        <Divider borderColor="var(--hm-border-glass)" />

        {/* Main Content Grid */}
        <SimpleGrid columns={[1, 1, 3]} spacing={10} w="full">

          {/* Navigation Links */}
          <VStack align={["center", "center", "start"]} spacing={3}>
            <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
              {t('footer.navigation.heading', 'Quick Links')}
            </Heading>
            <Link as={RouterLink} to="/about" fontSize="sm" _hover={{ color: "var(--hm-color-brand)" }}>
              {t('footer.navigation.about', 'About Us')}
            </Link>
            <Link as={RouterLink} to="/resources" fontSize="sm" _hover={{ color: "var(--hm-color-brand)" }}>
              {t('footer.navigation.resources', 'Resources')}
            </Link>
            <Link as={RouterLink} to="/chat" fontSize="sm" _hover={{ color: "var(--hm-color-brand)" }}>
              {t('footer.navigation.chat', 'Chat Support')}
            </Link>
            <Link as={RouterLink} to="/stories" fontSize="sm" _hover={{ color: "var(--hm-color-brand)" }}>
              {t('footer.navigation.stories', 'Success Stories')}
            </Link>
            <Link as={RouterLink} to="/volunteer" fontSize="sm" _hover={{ color: "var(--hm-color-brand)" }}>
              {t('footer.navigation.volunteer', 'Volunteer')}
            </Link>
            <Link as={RouterLink} to="/contact" fontSize="sm" _hover={{ color: "var(--hm-color-brand)" }}>
              {t('footer.navigation.contact', 'Contact Us')}
            </Link>
          </VStack>

          {/* Crisis Resources */}
          <VStack align={["center", "center", "start"]} spacing={3}>
            <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
              {t('footer.crisis.heading', '🆘 Crisis Mein Ho? Turant Madad Yahan Hai')}
            </Heading>
            <Text fontSize="xs" color="var(--hm-color-text-secondary)" lineHeight="1.6" textAlign={["center", "center", "left"]}>
              {t('footer.crisis.note', 'You\'re not alone. Help is just a call away.')}
            </Text>
            <VStack align={["center", "center", "start"]} spacing={2} pt={2}>
              <Link href="tel:9820466726" fontSize="sm" color="var(--hm-color-brand)" fontWeight="600" _hover={{ textDecoration: "underline" }}>
                <HStack spacing={2}>
                  <FaPhoneAlt />
                  <Text>{t('footer.crisis.helplines.aasra.name', 'AASRA')}: 9820466726</Text>
                </HStack>
              </Link>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('footer.crisis.helplines.aasra.availability', '24/7 Crisis Helpline')}
              </Text>

              <Link href="tel:18602662345" fontSize="sm" color="var(--hm-color-brand)" fontWeight="600" _hover={{ textDecoration: "underline" }} pt={2}>
                <HStack spacing={2}>
                  <FaPhoneAlt />
                  <Text>{t('footer.crisis.helplines.vandrevala.name', 'Vandrevala Foundation')}: 1860 2662 345</Text>
                </HStack>
              </Link>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('footer.crisis.helplines.vandrevala.availability', '24/7 Crisis Helpline')}
              </Text>

              <Link href="tel:9152987821" fontSize="sm" color="var(--hm-color-brand)" fontWeight="600" _hover={{ textDecoration: "underline" }} pt={2}>
                <HStack spacing={2}>
                  <FaPhoneAlt />
                  <Text>{t('footer.crisis.helplines.icall.name', 'iCall')}: 9152987821</Text>
                </HStack>
              </Link>
              <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                {t('footer.crisis.helplines.icall.availability', 'Mon-Sat, 8 AM - 10 PM')}
              </Text>
            </VStack>
          </VStack>

          {/* Social & Contact */}
          <VStack align={["center", "center", "start"]} spacing={3}>
            <Heading size="sm" color="var(--hm-color-text-primary)" mb={2}>
              {t('footer.social.heading', 'Humse Judo — Connect With Us')}
            </Heading>
            <HStack spacing={3} flexWrap="wrap" justify={["center", "center", "flex-start"]}>
              <IconButton
                aria-label={t('footer.social.twitter', 'Follow us on Twitter')}
                icon={<FaTwitter />}
                variant="ghost"
                size="sm"
                color="var(--hm-color-text-muted)"
                _hover={{ color: "var(--hm-color-brand)" }}
              />
              <IconButton
                aria-label={t('footer.social.instagram', 'Follow us on Instagram')}
                icon={<FaInstagram />}
                variant="ghost"
                size="sm"
                color="var(--hm-color-text-muted)"
                _hover={{ color: "var(--hm-color-brand)" }}
              />
              <IconButton
                aria-label={t('footer.social.linkedin', 'Connect on LinkedIn')}
                icon={<FaLinkedin />}
                variant="ghost"
                size="sm"
                color="var(--hm-color-text-muted)"
                _hover={{ color: "var(--hm-color-brand)" }}
              />
              <Link href="mailto:rghvndr99@gmail.com">
                <IconButton
                  aria-label={t('footer.social.email', 'Email us at rghvndr99@gmail.com')}
                  icon={<FaEnvelope />}
                  variant="ghost"
                  size="sm"
                  color="var(--hm-color-text-muted)"
                  _hover={{ color: "var(--hm-color-brand)" }}
                />
              </Link>
              <Link href="tel:+918105568665">
                <IconButton
                  aria-label={t('footer.social.phone', 'Call us at +91 81055 68665')}
                  icon={<FaPhone />}
                  variant="ghost"
                  size="sm"
                  color="var(--hm-color-text-muted)"
                  _hover={{ color: "var(--hm-color-brand)" }}
                />
              </Link>
              <Link href="https://hearme.com" isExternal>
                <IconButton
                  aria-label={t('footer.social.website', 'Visit our website')}
                  icon={<FaGlobe />}
                  variant="ghost"
                  size="sm"
                  color="var(--hm-color-text-muted)"
                  _hover={{ color: "var(--hm-color-brand)" }}
                />
              </Link>
            </HStack>

            {/* Legal Links */}
            <VStack align={["center", "center", "start"]} spacing={2} pt={4}>
              <Link as={RouterLink} to="/privacy" fontSize="xs" color="var(--hm-color-text-secondary)" _hover={{ color: "var(--hm-color-brand)" }}>
                {t('footer.legal.privacy', 'Privacy Policy (Aapki privacy humari zimmedari)')}
              </Link>
              <Link as={RouterLink} to="/terms" fontSize="xs" color="var(--hm-color-text-secondary)" _hover={{ color: "var(--hm-color-brand)" }}>
                {t('footer.legal.terms', 'Terms of Service')}
              </Link>
            </VStack>
          </VStack>
        </SimpleGrid>

        <Divider borderColor="var(--hm-border-glass)" />

        {/* Bottom Copyright */}
        <VStack spacing={2} textAlign="center">
          <Text fontSize="sm" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('footer.copyright', `© ${currentYear} HearMe — Made with  for India. Aapki mental health, humari zimmedari. Thank you for trusting us with your story.`, { year: currentYear })}
          </Text>
          <Text fontSize="xs" color="var(--hm-color-text-muted)">
            {t('footer.madeWith', 'Made with  for India')}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Footer;
