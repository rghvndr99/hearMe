import { useState } from "react";
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
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FaHeart, FaUsers, FaStar } from "react-icons/fa";
import axios from "axios";

import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Volunteer = () => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    location: "",
    skills: "",
    message: "",
  });

  const handleChange = (e) => {
    setSubmitted(false);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      toast({ title: t('volunteer.form.alertRequired'), status: "warning", duration: 3000, isClosable: true });
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) {
      toast({ title: t('volunteer.form.alertInvalidEmail'), status: "warning", duration: 3000, isClosable: true });
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/volunteer/apply`, form);
      setSubmitted(true);
      toast({ title: t('volunteer.form.alertThanks'), status: "success", duration: 4000, isClosable: true });
      setForm({ name: "", email: "", phone: "", availability: "", location: "", skills: "", message: "" });
    } catch (err) {
      console.error('Volunteer apply failed:', err);
      const desc = err?.response?.data?.error || 'Failed to submit application. Please try again.';
      toast({ title: 'Error', description: desc, status: "error", duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
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
          {t('volunteer.title')}
        </Heading>


        <Text fontSize="lg" color="var(--hm-color-text-tertiary)" maxW="700px">
          {t('volunteer.intro1')}
        </Text>
        <Text fontSize="lg" color="var(--hm-color-text-tertiary)" maxW="700px">
          {t('volunteer.intro2')}
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
          {t('volunteer.apply')}
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
              {t('volunteer.benefits.supportTitle')}
            </Text>
            <Text color="var(--hm-color-text-secondary)">
              {t('volunteer.benefits.supportDesc')}
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
              {t('volunteer.benefits.experienceTitle')}
            </Text>
            <Text color="var(--hm-color-text-secondary)">
              {t('volunteer.benefits.experienceDesc')}
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
              {t('volunteer.benefits.communityTitle')}
            </Text>
            <Text color="var(--hm-color-text-secondary)">
              {t('volunteer.benefits.communityDesc')}
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
          {submitted && (
            <Alert status="success" borderRadius="md" mb={4}>
              <AlertIcon />
              <Text>{t('volunteer.form.alertThanks')}</Text>
            </Alert>
          )}

          <Heading
            as="h2"
            fontSize="2xl"
            mb={2}
            textAlign="center"
            color="var(--hm-color-text-primary)"
          >
            {t('volunteer.form.title')}
          </Heading>
          <Text textAlign="center" color="var(--hm-color-text-secondary)" mb={6}>
            {t('volunteer.form.note')}
          </Text>

          <VStack spacing={4} align="stretch">
            <Input
              name="phone"
              placeholder={t('volunteer.form.phone')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              name="availability"
              placeholder={t('volunteer.form.availability')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.availability}
              onChange={handleChange}
            />
            <Input
              name="location"
              placeholder={t('volunteer.form.location')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.location}
              onChange={handleChange}
            />

            <Input
              name="name"
              placeholder={t('volunteer.form.name')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.name}
              onChange={handleChange}
            />
            <Input
              name="email"
              placeholder={t('volunteer.form.email')}
              type="email"
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.email}
              onChange={handleChange}
            />
            <Input
              name="skills"
              placeholder={t('volunteer.form.skills')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}

              value={form.skills}
              onChange={handleChange}
            />
            <Textarea
              name="message"
              placeholder={t('volunteer.form.message')}
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
              isLoading={submitting}
              isDisabled={submitting}
            >
              {t('volunteer.form.submit')}
            </Button>
          </Flex>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Volunteer;

