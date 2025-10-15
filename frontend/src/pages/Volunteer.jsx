import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Button,
  Icon,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaHeart, FaUsers, FaStar } from "react-icons/fa";


const MotionBox = motion(Box);

const Volunteer = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    skills: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      alert("Please fill in all required fields ✍️");
      return;
    }
    alert("✅ Thank you for applying to volunteer with HearMe!");
    setForm({ name: "", email: "", skills: "", message: "" });
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-primary)"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
      textAlign="center"
    >
      {/* === BACKGROUND BRUSHSTROKES === */}
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

      {/* === PAGE CONTENT === */}
      <VStack spacing={10} zIndex={1} maxW="900px">
        {/* Heading Section */}
        <Heading
          as="h1"
          fontSize={["4xl", "5xl", "6xl"]}
          fontWeight="800"
          color="var(--hm-color-text-primary)"
          lineHeight="1.2"
        >
          Help someone feel less alone.
        </Heading>


        <Text fontSize="lg" color="var(--hm-color-text-tertiary)" maxW="700px">
          Join HearMe’s mission to offer simple, private support in many Indian languages.
          You don’t need to be a counselor—just a kind, patient listener.
          We’ll guide you on how to listen with care and without judgment.
        </Text>

        {/* Apply Now Button */}
        <Button
          bgGradient="var(--hm-gradient-cta)"
          _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
          color="white"
          borderRadius="full"
          px={10}
          py={6}
          fontWeight="600"
          fontSize="lg"
          shadow="0px 0px 20px rgba(247,107,138,0.3)"
        >
          Apply to Volunteer
        </Button>

        {/* Benefits Section */}
        <SimpleGrid columns={[1, 3]} spacing={8} pt={12} w="full">
          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 8]}
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Icon as={FaHeart} boxSize={8} color="var(--hm-color-brand)" mb={4} />
            <Text fontSize="xl" fontWeight="600" mb={2}>
              Support Others
            </Text>
            <Text color="var(--hm-color-text-secondary)">
              Offer calm, non-judgmental listening so someone can feel heardin their own words.
            </Text>
          </Box>

          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 8]}
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Icon as={FaUsers} boxSize={8} color="var(--hm-color-accent-orange)" mb={4} />
            <Text fontSize="xl" fontWeight="600" mb={2}>
              Gain Experience
            </Text>
            <Text color="var(--hm-color-text-secondary)">
              Build practical skills in active listening, empathy, and compassionate communication.
            </Text>
          </Box>

          <Box
            className="hm-glass-card"
            borderRadius="xl"
            p={[6, 8]}
            transition="0.3s"
            _hover={{ borderColor: "var(--hm-color-brand)" }}
          >
            <Icon as={FaStar} boxSize={8} color="var(--hm-color-accent-purple)" mb={4} />
            <Text fontSize="xl" fontWeight="600" mb={2}>
              Build Community
            </Text>
            <Text color="var(--hm-color-text-secondary)">
              Be part of a caring, inclusive community supporting mental wellness across India.
            </Text>
          </Box>
        </SimpleGrid>

        {/* === Volunteer Application Form === */}
        <Box
          w="full"
          mt={16}
          className="hm-glass-card"
          borderRadius="xl"
          p={[6, 10]}
          textAlign="left"
        >
          <Heading
            as="h2"
            fontSize="2xl"
            mb={2}
            textAlign="center"
            color="var(--hm-color-text-primary)"
          >
            Volunteer Application
          </Heading>
          <Text textAlign="center" color="var(--hm-color-text-secondary)" mb={6}>
            Note: This form is for volunteering. If youre seeking support, please use the Chat page.
          </Text>

          <VStack spacing={4} align="stretch">
            <Input
              name="name"
              placeholder="Full Name *"
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.name}
              onChange={handleChange}
            />
            <Input
              name="email"
              placeholder="Email Address *"
              type="email"
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.email}
              onChange={handleChange}
            />
            <Input
              name="skills"
              placeholder="Skills / Areas of Expertise"
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.skills}
              onChange={handleChange}
            />
            <Textarea
              name="message"
              placeholder="Tell us why you want to volunteer *"
              rows={5}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.message}
              onChange={handleChange}
            />
          </VStack>

          <Flex justify="center" mt={6}>
            <Button
              bgGradient="var(--hm-gradient-cta)"
              _hover={{ bgGradient: "var(--hm-gradient-cta-hover)" }}
              color="white"
              borderRadius="full"
              px={10}
              py={6}
              fontWeight="600"
              fontSize="md"
              shadow="0px 0px 20px rgba(247,107,138,0.3)"
              onClick={handleSubmit}
            >
              Submit Application
            </Button>
          </Flex>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Volunteer;

