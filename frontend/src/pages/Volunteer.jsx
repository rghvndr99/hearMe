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
      bg="#0A0A0F"
      color="white"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      py={[12, 20]}
      textAlign="center"
    >
      {/* === BACKGROUND BRUSHSTROKES === */}
      <MotionBox
        position="absolute"
        top="-10%"
        left="-15%"
        w="80%"
        h="80%"
        bg="radial-gradient(circle at top left, rgba(247,107,138,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="-10%"
        right="-15%"
        w="80%"
        h="80%"
        bg="radial-gradient(circle at bottom right, rgba(55,114,255,0.25), transparent 70%)"
        filter="blur(120px)"
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionBox
        position="absolute"
        bottom="0%"
        left="0%"
        w="100%"
        h="100%"
        bg="radial-gradient(circle at bottom left, rgba(249,168,38,0.15), transparent 70%)"
        filter="blur(150px)"
      />

      {/* === PAGE CONTENT === */}
      <VStack spacing={10} zIndex={1} maxW="900px">
        {/* Heading Section */}
        <Heading
          as="h1"
          fontSize={["4xl", "5xl", "6xl"]}
          fontWeight="800"
          color="#FFF8E7"
          lineHeight="1.2"
        >
          Make an impact.<br />Be a volunteer.
        </Heading>

        <Text fontSize="lg" color="#D0CFE0" maxW="700px">
          Join HearMe’s mission to provide a supportive space where every voice
          can be heard. Your compassion and time can help others express and
          heal through connection.
        </Text>

        {/* Apply Now Button */}
        <Button
          bgGradient="linear(to-r, #6750A4, #F76B1C)"
          _hover={{ bgGradient: "linear(to-r, #F76B1C, #6750A4)" }}
          color="white"
          borderRadius="full"
          px={10}
          py={6}
          fontWeight="600"
          fontSize="lg"
          shadow="0px 0px 20px rgba(247,107,138,0.3)"
        >
          Apply Now
        </Button>

        {/* Benefits Section */}
        <SimpleGrid columns={[1, 3]} spacing={8} pt={12} w="full">
          <Box
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            borderRadius="xl"
            p={[6, 8]}
            backdropFilter="blur(10px)"
            transition="0.3s"
            _hover={{ borderColor: "#F76B1C" }}
          >
            <Icon as={FaHeart} boxSize={8} color="#F76B1C" mb={4} />
            <Text fontSize="xl" fontWeight="600" mb={2}>
              Support Others
            </Text>
            <Text color="#CFCFCF">
              Help individuals express themselves in a safe and welcoming
              environment.
            </Text>
          </Box>

          <Box
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            borderRadius="xl"
            p={[6, 8]}
            backdropFilter="blur(10px)"
            transition="0.3s"
            _hover={{ borderColor: "#F76B1C" }}
          >
            <Icon as={FaUsers} boxSize={8} color="#F9A826" mb={4} />
            <Text fontSize="xl" fontWeight="600" mb={2}>
              Gain Experience
            </Text>
            <Text color="#CFCFCF">
              Develop valuable skills in listening, empathy, and compassionate
              communication.
            </Text>
          </Box>

          <Box
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            borderRadius="xl"
            p={[6, 8]}
            backdropFilter="blur(10px)"
            transition="0.3s"
            _hover={{ borderColor: "#F76B1C" }}
          >
            <Icon as={FaStar} boxSize={8} color="#A78BFA" mb={4} />
            <Text fontSize="xl" fontWeight="600" mb={2}>
              Build Community
            </Text>
            <Text color="#CFCFCF">
              Connect with like-minded individuals who care deeply about mental
              wellness.
            </Text>
          </Box>
        </SimpleGrid>

        {/* === Volunteer Application Form === */}
        <Box
          w="full"
          mt={16}
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.1)"
          borderRadius="xl"
          p={[6, 10]}
          backdropFilter="blur(10px)"
          textAlign="left"
        >
          <Heading
            as="h2"
            fontSize="2xl"
            mb={6}
            textAlign="center"
            color="#FFF8E7"
          >
            Volunteer Application
          </Heading>

          <VStack spacing={4} align="stretch">
            <Input
              name="name"
              placeholder="Full Name *"
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.1)"
              _focus={{ borderColor: "#F76B1C" }}
              color="white"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              name="email"
              placeholder="Email Address *"
              type="email"
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.1)"
              _focus={{ borderColor: "#F76B1C" }}
              color="white"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              name="skills"
              placeholder="Skills / Areas of Expertise"
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.1)"
              _focus={{ borderColor: "#F76B1C" }}
              color="white"
              value={form.skills}
              onChange={handleChange}
            />
            <Textarea
              name="message"
              placeholder="Tell us why you want to volunteer *"
              rows={5}
              bg="rgba(255,255,255,0.05)"
              border="1px solid rgba(255,255,255,0.1)"
              _focus={{ borderColor: "#F76B1C" }}
              color="white"
              value={form.message}
              onChange={handleChange}
            />
          </VStack>

          <Flex justify="center" mt={6}>
            <Button
              bgGradient="linear(to-r, #6750A4, #F76B1C)"
              _hover={{ bgGradient: "linear(to-r, #F76B1C, #6750A4)" }}
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

