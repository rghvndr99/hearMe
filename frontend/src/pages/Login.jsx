import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text, Link, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';
import { motion } from 'framer-motion';

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MotionBox = motion(Box);


const Login = () => {
  const { t } = useTranslation('common');
  // Theme tokens
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const brandColor = useColorModeValue('blue.600', 'blue.300');
  const ctaGradient = useColorModeValue('linear(to-r, blue.500, pink.500)', 'linear(to-r, blue.400, pink.400)');
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/login`, form);
      localStorage.setItem('hm-token', data.token);
      try { window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
      toast({ title: t('auth.welcomeBack', 'Welcome back'), status: 'success', duration: 2000, isClosable: true });
      navigate('/profile');
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.loginFailed', 'Login failed');
      toast({ title: t('common.error','Error'), description: msg, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg={pageBg}
      color={textPrimary}
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
    >
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
      <VStack spacing={8} zIndex={1} w="full" maxW="900px">
        <Box maxW="480px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="lg" mb={6} color={textPrimary}>{t('auth.signIn','Sign in')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>{t('auth.usernameOrEmail','Username or Email')}</FormLabel>
                <Input name="usernameOrEmail" value={form.usernameOrEmail} onChange={onChange} placeholder={t('placeholders.usernameOrEmail','yourusername or you@example.com')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('auth.password','Password')}</FormLabel>
                <Input type="password" name="password" value={form.password} onChange={onChange} />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient={ctaGradient} color="white">{t('nav.login','Login')}</Button>
              <Text fontSize="sm">
                <Link as={RouterLink} to="/forgot-password" color={brandColor}>{t('auth.forgotPassword','Forgot password?')}</Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Login;

