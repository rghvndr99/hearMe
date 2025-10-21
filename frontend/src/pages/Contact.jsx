
import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Input,
  Textarea,
  Button,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const MotionBox = motion(Box);

const Contact = () => {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.message) {
      alert(t('contact.alertThanks', '✅ Shukriya! Thank you for reaching out. We\'ll get back to you within 24-48 hours. 💜'));
      setFormData({ name: '', email: '', message: '' });
    } else {
      alert(t('contact.alertFillAll', '⚠️ Oops! Please fill in all fields so we can help you better. 💜'));
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="var(--hm-color-bg)"
      position="relative"
      overflow="hidden"
      color="var(--hm-color-text-primary)"
      px={6}
      pt="100px"
      pb={12}
    >
      {/* Background gradients - Neo Expressionist */}

      {/* Contact Form Container */}
      <VStack
        spacing={8}
        w={["100%", "450px"]}
        className="hm-glass-card-light"
        borderRadius="xl"
        p={[6, 10]}
        zIndex={1}
      >
        <VStack spacing={4} textAlign="center">
          <Heading fontSize={["3xl", "4xl"]} fontWeight="700" color="var(--hm-color-text-primary)">
            {t('contact.title', 'Hum Hain Na — We\'re Here 💜')}
          </Heading>

          <Text color="var(--hm-color-text-secondary)" fontSize="md">
            {t('contact.intro1', 'Have feedback? Want to partner with us? Have a non-urgent question? We\'d love to hear from you. 💜')}
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize="sm" fontWeight="600">
            {t('contact.intro2', '**Important:** This form is for general inquiries only. If you need emotional support, please visit our Chat page. If you\'re in crisis, call 112 (India) or see our Resources page.')}
          </Text>

          <VStack spacing={1} pt={2}>
            <Text color="var(--hm-color-text-secondary)" fontSize="sm">
              {t('contact.contactInfo.phone', '📞 Call us: +91 8105568665 (Mon-Fri, 10 AM - 6 PM IST)')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="sm">
              {t('contact.contactInfo.email', '📧 Email us: rghvndr99@gmail.com (We reply within 24-48 hours)')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="sm">
              {t('contact.contactInfo.website', '🌐 Visit: hearme.com')}
            </Text>
          </VStack>
        </VStack>

        <VStack spacing={4} w="100%">
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t('contact.name', 'Aapka naam (Your name)')}
            className="hm-input"
            _focus={{ borderColor: "var(--hm-color-brand)" }}
            _placeholder={{ color: "var(--hm-color-placeholder)" }}
            borderRadius="md"
            p={4}
          />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('contact.email', 'Aapka email (Your email)')}
            className="hm-input"
            _focus={{ borderColor: "var(--hm-color-brand)" }}
            _placeholder={{ color: "var(--hm-color-placeholder)" }}
            borderRadius="md"
            p={4}
          />
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder={t('contact.message', 'Kya baat karni hai? (What would you like to share?)')}
            className="hm-input"
            _focus={{ borderColor: "var(--hm-color-brand)" }}
            _placeholder={{ color: "var(--hm-color-placeholder)" }}
            borderRadius="md"
            rows={5}
            p={4}
          />
        </VStack>

        <Button
          onClick={handleSubmit}
          w="100%"
          size="lg"
          bgGradient="var(--hm-gradient-cta)"
          _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
          color="white"
          fontWeight="600"
          borderRadius="full"
          py={6}
          shadow="0px 0px 10px rgba(255, 107, 138, 0.4)"
        >
          {t('contact.send', 'Bhejo (Send) 💜')}
        </Button>
      </VStack>
    </Flex>
  );
};

export default Contact;