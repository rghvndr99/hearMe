
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
} from "@chakra-ui/react";
import { motion } from "framer-motion";


const MotionBox = motion(Box);

const Contact = () => {
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
      alert('✅ Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } else {
      alert('⚠️ Please fill in all fields.');
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
            Contact Us.
          </Heading>

          <Text color="var(--hm-color-text-secondary)">
            For feedback, partnerships, or non-urgent questions. For emotional support, please use the Chat page.
          </Text>
          <Text color="var(--hm-color-text-secondary)" fontSize="sm">
            If you are in immediate danger or feel unsafe, call <strong>112</strong> (India) or see Resources for more help options.
          </Text>
        </VStack>

        <VStack spacing={4} w="100%">
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your name"
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
            placeholder="Your email"
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
            placeholder="How can we help? (feedback, partnership, non-urgent)"
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
          Send
        </Button>
      </VStack>
    </Flex>
  );
};

export default Contact;