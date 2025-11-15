import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Stack,
  Link,
  Divider,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";


const Privacy = () => {
  const { t } = useTranslation("common");




  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="var(--vl-color-bg)"
      color="var(--vl-color-text-primary)"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
      textAlign="left"
      className="vl-cid-privacy-root"
      data-cid="privacy-root"
    >
      <VStack spacing={10} zIndex={1} w="full" maxW="1200px" align="stretch">

        {/* Page Header */}
        <Stack direction={["column", "row"]} spacing={[6, 8]} className="vl-glass-card vl-cid-privacy-header" data-cid="privacy-header" p={[6, 8]} borderRadius="xl" align="stretch">
          <VStack align="start" spacing={3} flex="1" minW={0}>
            <Heading as="h1" fontSize={["3xl", "4xl", "5xl"]} fontWeight="800" color="var(--vl-color-text-primary)" lineHeight="1.2">
              {t("privacy.title", "Privacy Policy")}
            </Heading>
            <Text fontSize={["sm", "md"]} color="var(--vl-color-text-secondary)">
              {t("privacy.updated", "Last Updated: October 2025")}
            </Text>
            <Text fontSize={["md", "lg"]} color="var(--vl-color-text-tertiary)" lineHeight="1.8">
              {t(
                "privacy.intro",
                "Welcome to VoiceLap (\"we\", \"our\", or \"us\"). This Privacy Policy explains how VoiceLap collects, uses, stores, and protects your personal data when you use our platform, mobile app, or related services that enable emotional voice chat, voice cloning, and multilingual communication in Hindi and English."
              )}
            </Text>
          </VStack>
        </Stack>

        {/* 1. Overview */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.overview.title", "1. Overview")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" lineHeight="1.8">
            {t(
              "privacy.overview.body",
              "VoiceLap is built to help people connect emotionally through voice. Our platform allows users to clone their voice or the voice of loved ones (with consent), chat using emotional tone detection, and communicate naturally in their preferred language. We respect your privacy and are committed to protecting your personal information in compliance with applicable Indian data protection laws and global standards."
            )}
          </Text>
        </Box>

        {/* 2. Information We Collect */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.collect.title", "2. Information We Collect")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" mb={4}>
            {t("privacy.collect.subtitle", "We collect the following categories of data to provide and improve our services:")}
          </Text>

          <VStack align="start" spacing={5} color="var(--vl-color-text-secondary)">
            <Box>
              <Heading as="h3" fontSize="xl" mb={2} fontWeight="700">
                {t("privacy.collect.voice.title", "a. Voice & Audio Data")}
              </Heading>
              <UnorderedList spacing={2} pl={6}>
                <ListItem>{t("privacy.collect.voice.i1", "Voice samples you record or upload for cloning or speech analysis")}</ListItem>
                <ListItem>{t("privacy.collect.voice.i2", "Audio messages sent during voice chats")}</ListItem>
                <ListItem>{t("privacy.collect.voice.i3", "Emotion tone data derived from voice analysis")}</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h3" fontSize="xl" mb={2} fontWeight="700">
                {t("privacy.collect.text.title", "b. Text & Emotional Data")}
              </Heading>
              <UnorderedList spacing={2} pl={6}>
                <ListItem>{t("privacy.collect.text.i1", "Text messages exchanged in chat")}</ListItem>
                <ListItem>{t("privacy.collect.text.i2", "Emotional tone metrics generated during your conversations for personalization")}</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h3" fontSize="xl" mb={2} fontWeight="700">
                {t("privacy.collect.profile.title", "c. Profile & Account Information")}
              </Heading>
              <UnorderedList spacing={2} pl={6}>
                <ListItem>{t("privacy.collect.profile.i1", "Name, email address, phone number, and profile image")}</ListItem>
                <ListItem>{t("privacy.collect.profile.i2", "Account settings, themes, and preferred language")}</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h3" fontSize="xl" mb={2} fontWeight="700">
                {t("privacy.collect.payment.title", "d. Payment Information")}
              </Heading>
              <UnorderedList spacing={2} pl={6}>
                <ListItem>{t("privacy.collect.payment.i1", "Wallet and transaction data (via UPI, Paytm, PhonePe, debit/credit cards)")}</ListItem>
                <ListItem>{t("privacy.collect.payment.i2", "Credit usage and subscription plan history")}</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h3" fontSize="xl" mb={2} fontWeight="700">
                {t("privacy.collect.technical.title", "e. Technical Information")}
              </Heading>
              <UnorderedList spacing={2} pl={6}>
                <ListItem>{t("privacy.collect.technical.i1", "Device type, IP address, and log data to enhance app performance and prevent misuse")}</ListItem>
              </UnorderedList>
            </Box>
          </VStack>
        </Box>

        {/* 3. How We Use Your Data */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.use.title", "3. How We Use Your Data")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" mb={4}>
            {t("privacy.use.subtitle", "We use collected data solely to deliver, personalize, and enhance the VoiceLap experience:")}
          </Text>
          <UnorderedList spacing={2} pl={6} color="var(--vl-color-text-secondary)">
            <ListItem>{t("privacy.use.i1", "Enable multilingual chat and emotional tone recognition")}</ListItem>
            <ListItem>{t("privacy.use.i2", "Generate personalized emotional responses")}</ListItem>
            <ListItem>{t("privacy.use.i3", "Create and store your VoiceTwin or cloned voices")}</ListItem>
            <ListItem>{t("privacy.use.i4", "Track and improve emotional engagement accuracy")}</ListItem>
            <ListItem>{t("privacy.use.i5", "Process payments and manage subscriptions")}</ListItem>
            <ListItem>{t("privacy.use.i6", "Ensure account security and prevent fraudulent activities")}</ListItem>
            <ListItem>
              {t("privacy.use.i7a", "Provide customer support through ")}
              <Link href="mailto:support@voicelap.com" color="var(--vl-color-brand)">support@voicelap.com</Link>
            </ListItem>
          </UnorderedList>
          <Text color="var(--vl-color-text-secondary)" mt={4}>
            {t("privacy.use.noSell", "We do not sell or rent your personal data to any third parties.")}
          </Text>
        </Box>

        {/* 4. Data Sharing & Third-Party Processors */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.sharing.title", "4. Data Sharing & Third-Party Processors")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" mb={3}>
            {t("privacy.sharing.intro", "We may share limited necessary data with trusted service providers who help us deliver VoiceLap’s features:")}
          </Text>
          <UnorderedList spacing={2} pl={6} color="var(--vl-color-text-secondary)">
            <ListItem>{t("privacy.sharing.i1", "ElevenLabs – for text-to-speech and voice cloning")}</ListItem>
            <ListItem>{t("privacy.sharing.i2", "Deepgram / AssemblyAI – for voice extraction and transcription")}</ListItem>
            <ListItem>{t("privacy.sharing.i3", "Google Translate API – for multilingual translation")}</ListItem>
            <ListItem>{t("privacy.sharing.i4", "Payment gateways (UPI, Paytm, PhonePe) – for secure transaction handling")}</ListItem>
          </UnorderedList>
          <Text color="var(--vl-color-text-secondary)" mt={4}>
            {t("privacy.sharing.note", "All third-party partners process data under strict confidentiality and data protection agreements.")}
          </Text>
        </Box>

        {/* 5. User Control & Data Management */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.control.title", "5. User Control & Data Management")}
          </Heading>
          <UnorderedList spacing={2} pl={6} color="var(--vl-color-text-secondary)">
            <ListItem>
              {t("privacy.control.i1a", "You can delete your voice data, account, or cloned voices anytime from your profile settings or by contacting ")}
              <Link href="mailto:support@voicelap.com" color="var(--vl-color-brand)">support@voicelap.com</Link>.
            </ListItem>
            <ListItem>{t("privacy.control.i2", "You can manage your emotional tone and theme preferences.")}</ListItem>
            <ListItem>{t("privacy.control.i3", "However, data export or consent withdrawal options are currently not supported.")}</ListItem>
          </UnorderedList>
          <Text color="var(--vl-color-text-secondary)" mt={4}>
            {t("privacy.control.erase", "Once your account is deleted, related data (voice, chats, and emotional metrics) will be permanently erased within 30 days.")}
          </Text>
        </Box>

        {/* 6. Data Retention */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.retention.title", "6. Data Retention")}
          </Heading>
          <UnorderedList spacing={2} pl={6} color="var(--vl-color-text-secondary)">
            <ListItem>{t("privacy.retention.i1", "Voice and chat data: retained until account deletion")}</ListItem>
            <ListItem>{t("privacy.retention.i2", "Payment records: retained as required by Indian financial regulations")}</ListItem>
            <ListItem>{t("privacy.retention.i3", "Emotional analysis data: anonymized for aggregate analytics")}</ListItem>
          </UnorderedList>
        </Box>

        {/* 7. Children’s Privacy */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.children.title", "7. Children’s Privacy")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" lineHeight="1.8">
            {t("privacy.children.body", "VoiceLap is not intended for users under 15 years of age. We do not knowingly collect or process personal information from children below this age. If such data is found, it will be deleted immediately upon discovery.")}
          </Text>
        </Box>

        {/* 8. Data Security */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.security.title", "8. Data Security")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" mb={3}>
            {t("privacy.security.intro", "We use industry-standard encryption and security measures, including:")}
          </Text>
          <UnorderedList spacing={2} pl={6} color="var(--vl-color-text-secondary)">
            <ListItem>{t("privacy.security.i1", "Secure storage on AWS S3")}</ListItem>
            <ListItem>{t("privacy.security.i2", "Encrypted transmission (HTTPS / TLS)")}</ListItem>
            <ListItem>{t("privacy.security.i3", "JWT-based authentication")}</ListItem>
            <ListItem>{t("privacy.security.i4", "Limited internal access and audit trails")}</ListItem>
          </UnorderedList>
          <Text color="var(--vl-color-text-secondary)" mt={4}>
            {t("privacy.security.disclaimer", "Despite these safeguards, no online platform is 100% secure. We encourage you to use strong passwords and protect your login credentials.")}
          </Text>
        </Box>

        {/* 9. International Data Transfer */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.transfer.title", "9. International Data Transfer")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" lineHeight="1.8">
            {t("privacy.transfer.body", "All data is primarily stored and processed in India, though third-party processors may operate globally. We ensure adequate protection measures are applied to all cross-border data transfers.")}
          </Text>
        </Box>

        {/* 10. Updates to This Policy */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.updates.title", "10. Updates to This Policy")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" lineHeight="1.8">
            {t("privacy.updates.body", "We may update this Privacy Policy periodically to reflect new features or legal requirements. The latest version will always be available on our website or app. Significant changes will be notified via email or in-app alert.")}
          </Text>
        </Box>

        {/* 11. Contact Us */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h2" fontSize={["2xl", "3xl"]} mb={3} fontWeight="700">
            {t("privacy.contact.title", "11. Contact Us")}
          </Heading>
          <VStack align="start" spacing={2} color="var(--vl-color-text-secondary)">
            <Text>
              {t("privacy.contact.line1", "If you have any questions or concerns regarding this Privacy Policy or your personal data, please reach out to:")}
            </Text>
            <Text>
              {t("privacy.contact.emailPrefix", "Email:")} {" "}
              <Link href="mailto:support@voicelap.com" color="var(--vl-color-brand)">support@voicelap.com</Link>
            </Text>
            <Text>
              {t("privacy.contact.webPrefix", "Website:")} {" "}
              <Link href="http://www.voicelap.com" isExternal color="var(--vl-color-brand)">www.voicelap.com</Link>
            </Text>
          </VStack>
        </Box>

        <Divider borderColor="var(--vl-border-glass)" />

        {/* Summary */}
        <Box className="vl-glass-card" p={[6, 8]} borderRadius="xl">
          <Heading as="h3" fontSize={["xl", "2xl"]} mb={3} fontWeight="700">
            {t("privacy.summary.title", "Summary")}
          </Heading>
          <Text color="var(--vl-color-text-secondary)" lineHeight="1.8">
            {t(
              "privacy.summary.body",
              "VoiceLap believes emotional connection should never compromise privacy. Your voice, your emotions, and your language stay yours — always protected, personal, and private."
            )}
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Privacy;

