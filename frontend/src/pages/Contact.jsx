
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
      alert(t('contact.alertThanks'));
      setFormData({ name: '', email: '', message: '' });
    } else {
      alert(t('contact.alertFillAll'));
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
        <VStack spacing={3} textAlign="center">
          <Heading fontSize={["3xl", "4xl"]} fontWeight="700" color="var(--hm-color-text-primary)">
            {t('contact.title')}
          </Heading>

          <Text color="var(--hm-color-text-secondary)">
            {t('contact.intro1')}
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize="sm">
            {t('contact.intro2')}
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize="sm">
            You can also reach us at
            <Link href="tel:+918105568665" color="var(--hm-color-accent-link)">+91 8105568665</Link>
            {"  ·  "}
            <Link href="mailto:rghvndr99@gmail.com" color="var(--hm-color-accent-link)">rghvndr99@gmail.com</Link>
            {"  ·  "}
            <Link href="https://hearme.com" isExternal color="var(--hm-color-accent-link)">hearme.com</Link>
          </Text>
        </VStack>

        <VStack spacing={4} w="100%">
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder={t('contact.name')}
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
            placeholder={t('contact.email')}
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
            placeholder={t('contact.message')}
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
          borderRadius="md"
          shadow="0px 0px 10px rgba(255, 107, 138, 0.4)"
        >
          {t('contact.send')}
        </Button>
      </VStack>
    </Flex>
  );
};

export default Contact;