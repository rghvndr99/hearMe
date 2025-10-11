
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
      color="white"
      px={6}
    >
      {/* Background gradients - Neo Expressionist */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-15%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-pink"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-15%"
        w="80%"
        h="80%"
        className="hm-bg-gradient-blue"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

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
            Have questions or feedback? Reach out to us.
          </Text>
        </VStack>

        <VStack spacing={4} w="100%">
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="hm-input"
            _focus={{ borderColor: "var(--hm-color-brand)" }}
            color="white"
            _placeholder={{ color: "var(--hm-color-placeholder)" }}
            borderRadius="md"
            p={4}
          />
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="hm-input"
            _focus={{ borderColor: "var(--hm-color-brand)" }}
            color="white"
            _placeholder={{ color: "var(--hm-color-placeholder)" }}
            borderRadius="md"
            p={4}
          />
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Message"
            className="hm-input"
            _focus={{ borderColor: "var(--hm-color-brand)" }}
            color="white"
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