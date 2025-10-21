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
      toast({ title: t('volunteer.form.alertRequired', '⚠️ Please fill in all required fields (marked with *) 💜'), status: "warning", duration: 3000, isClosable: true });
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) {
      toast({ title: t('volunteer.form.alertInvalidEmail', '⚠️ Please enter a valid email address so we can reach you 💜'), status: "warning", duration: 3000, isClosable: true });
      return;
    }
    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/volunteer/apply`, form);
      setSubmitted(true);
      toast({ title: t('volunteer.form.alertThanks', '✅ Shukriya! Thank you for applying. We\'ll review your application and get back to you within 5-7 days. 💜'), status: "success", duration: 4000, isClosable: true });
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
      px={[6, 6, 12]}
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
          {t('volunteer.title', 'Kisi Ka Sahara Bano — Be Someone\'s Support 💜')}
        </Heading>

        <Text fontSize={["lg", "xl"]} color="var(--hm-color-text-secondary)" fontWeight="500" maxW="700px">
          {t('volunteer.subtitle', 'Join HearMe\'s mission to make mental wellness accessible across India. You don\'t need to be a therapist — just a kind, patient listener.')}
        </Text>

        <VStack spacing={3} maxW="700px">
          <Text fontSize="md" color="var(--hm-color-text-tertiary)" lineHeight="1.7">
            {t('volunteer.intro1', 'In India, mental health is still taboo. Families don\'t talk about it. Friends don\'t understand. But you can change that — one conversation at a time.')}
          </Text>
          <Text fontSize="md" color="var(--hm-color-text-tertiary)" lineHeight="1.7">
            {t('volunteer.intro2', 'We\'ll train you on how to listen with empathy, without judgment. You\'ll be part of a caring community supporting mental wellness in Hindi, English, and Hinglish.')}
          </Text>
        </VStack>

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
          onClick={() => {
            document.getElementById('volunteer-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {t('volunteer.apply', 'Apply to Volunteer 💜')}
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
            <Text fontSize="xl" fontWeight="600" mb={2} color="var(--hm-color-text-primary)">
              {t('volunteer.benefits.supportTitle', 'Dil Ko Sukoon Do — Bring Peace to Hearts')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
              {t('volunteer.benefits.supportDesc', 'Your listening can be the difference between someone feeling alone and feeling understood. In India, where mental health support is scarce, your time is priceless.')}
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
            <Text fontSize="xl" fontWeight="600" mb={2} color="var(--hm-color-text-primary)">
              {t('volunteer.benefits.experienceTitle', 'Khud Ko Bhi Samjho — Understand Yourself Too')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
              {t('volunteer.benefits.experienceDesc', 'Learn active listening, empathy, and emotional intelligence. These skills will transform your relationships, career, and self-awareness.')}
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
            <Text fontSize="xl" fontWeight="600" mb={2} color="var(--hm-color-text-primary)">
              {t('volunteer.benefits.communityTitle', 'Ek Parivaar Bano — Become Part of a Family')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" lineHeight="1.7">
              {t('volunteer.benefits.communityDesc', 'Connect with like-minded volunteers across India who believe mental wellness is a right, not a luxury. Together, we\'re breaking the stigma.')}
            </Text>
          </Box>
        </SimpleGrid>

        {/* What You'll Do Section */}
        <Box pt={12} w="full" maxW="700px">
          <Heading
            as="h2"
            fontSize={["2xl", "3xl"]}
            mb={6}
            textAlign="center"
            color="var(--hm-color-text-primary)"
            fontWeight="700"
          >
            {t('volunteer.whatYouDo.title', 'Aap Kya Karenge? (What You\'ll Do)')}
          </Heading>
          <VStack align="start" spacing={3}>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whatYouDo.point1', '🎧 Listen without judgment — let people share their truth')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whatYouDo.point2', '💬 Respond with empathy — validate their feelings')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whatYouDo.point3', '🔗 Guide gently — share resources when needed')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whatYouDo.point4', '🔒 Maintain confidentiality — their trust is sacred')}
            </Text>
          </VStack>
        </Box>

        {/* Who Can Volunteer Section */}
        <Box pt={12} w="full" maxW="700px">
          <Heading
            as="h2"
            fontSize={["2xl", "3xl"]}
            mb={6}
            textAlign="center"
            color="var(--hm-color-text-primary)"
            fontWeight="700"
          >
            {t('volunteer.whoCanVolunteer.title', 'Kaun Volunteer Kar Sakta Hai? (Who Can Volunteer?)')}
          </Heading>
          <VStack align="start" spacing={3}>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whoCanVolunteer.point1', '✅ You\'re 18+ years old')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whoCanVolunteer.point2', '✅ You can commit 2-4 hours per week')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whoCanVolunteer.point3', '✅ You\'re fluent in Hindi, English, or both')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whoCanVolunteer.point4', '✅ You\'re empathetic, patient, and non-judgmental')}
            </Text>
            <Text color="var(--hm-color-text-secondary)" fontSize="md">
              {t('volunteer.whoCanVolunteer.point5', '✅ You\'re willing to complete our training (free!)')}
            </Text>
          </VStack>
        </Box>

        {/* === Volunteer Application Form === */}
        <Box
          id="volunteer-form"
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
              <Text>{t('volunteer.form.alertThanks', '✅ Shukriya! Thank you for applying. We\'ll review your application and get back to you within 5-7 days. 💜')}</Text>
            </Alert>
          )}

          <Heading
            as="h2"
            fontSize={["2xl", "3xl"]}
            mb={2}
            textAlign="center"
            color="var(--hm-color-text-primary)"
            fontWeight="700"
          >
            {t('volunteer.form.title', 'Volunteer Application — Hum Aapka Intezaar Kar Rahe Hain 💜')}
          </Heading>
          <Text textAlign="center" color="var(--hm-color-text-secondary)" mb={6} fontSize="sm" fontWeight="600">
            {t('volunteer.form.note', '**Note:** This form is for volunteering. If you need emotional support, please visit our Chat page.')}
          </Text>

          <VStack spacing={4} align="stretch">
            <Input
              name="name"
              placeholder={t('volunteer.form.name', 'Aapka poora naam (Full name) *')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.name}
              onChange={handleChange}
            />
            <Input
              name="email"
              placeholder={t('volunteer.form.email', 'Aapka email (Email address) *')}
              type="email"
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              name="phone"
              placeholder={t('volunteer.form.phone', 'Phone number (optional)')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              name="availability"
              placeholder={t('volunteer.form.availability', 'Kab free ho? (When are you available?) — e.g., Weekends, evenings')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.availability}
              onChange={handleChange}
            />
            <Input
              name="location"
              placeholder={t('volunteer.form.location', 'Aap kahan rehte ho? (Your city)')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.location}
              onChange={handleChange}
            />
            <Input
              name="skills"
              placeholder={t('volunteer.form.skills', 'Aapki skills (Your skills/expertise) — e.g., Psychology, counseling, languages')}
              className="hm-input"
              _focus={{ borderColor: "var(--hm-color-brand)" }}
              value={form.skills}
              onChange={handleChange}
            />
            <Textarea
              name="message"
              placeholder={t('volunteer.form.message', 'Aap kyun volunteer karna chahte ho? (Why do you want to volunteer?) *')}
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
              loadingText={t('volunteer.form.submitting', 'Bhej rahe hain... (Submitting...)')}
              isDisabled={submitting}
            >
              {t('volunteer.form.submit', 'Apply Karo (Submit Application) 💜')}
            </Button>
          </Flex>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Volunteer;

