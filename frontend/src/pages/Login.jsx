import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text, Link, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const Login = () => {
  const { t } = useTranslation('common');
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
      bg="var(--hm-color-bg)"
      color="var(--hm-color-text-primary)"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
    >
      <VStack spacing={8} zIndex={1} w="full" maxW="900px">
        <Box maxW="480px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="lg" mb={6} color="var(--hm-color-text-primary)">{t('auth.signIn','Sign in')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('auth.usernameOrEmail','Username or Email')}</FormLabel>
                <Input
                  name="usernameOrEmail"
                  value={form.usernameOrEmail}
                  onChange={onChange}
                  placeholder={t('placeholders.usernameOrEmail','yourusername or you@example.com')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('auth.password','Password')}</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }}>{t('nav.login','Login')}</Button>
              <Text fontSize="sm" color="var(--hm-color-text-primary)">
                <Link as={RouterLink} to="/forgot-password" color="var(--hm-color-brand)" _hover={{ textDecoration: 'underline' }}>{t('auth.forgotPassword','Forgot password?')}</Link>
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Login;

