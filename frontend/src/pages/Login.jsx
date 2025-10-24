import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text, Link, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const Login = () => {
  const { t } = useTranslation('common');
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/login`, form);
      localStorage.setItem('hm-token', data.token);
      try { window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
      toast({ title: t('login.messages.welcomeBack', '✅ Khush aamdeed! Welcome back to your safe space. 💜'), status: 'success', duration: 2000, isClosable: true });
      // Post-login return logic
      try {
        const params = new URLSearchParams(location.search);
        let redirect = params.get('redirect') || localStorage.getItem('hm-last-route') || '/';
        // Basic sanitization: only allow in-app paths
        if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
          redirect = '/';
        }
        navigate(redirect, { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || t('login.messages.loginFailed', '❌ Oops! Login failed. Please check your username/email and password and try again. 💜');
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
        {/* Page Intro */}
        <VStack spacing={2} textAlign="center" maxW="600px">
          <Heading
            as="h1"
            fontSize={["3xl", "4xl", "5xl"]}
            fontWeight="800"
            color="var(--hm-color-text-primary)"
            lineHeight="1.2"
          >
            {t('login.pageTitle', 'Phir Se Swagat Hai! — Welcome Back 💜')}
          </Heading>
          <Text fontSize="md" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('login.pageIntro', 'Your safe space awaits. Login karo aur apni journey continue karo. We\'re here for you, always. 💜')}
          </Text>
        </VStack>

        <Box mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="md" mb={6} color="var(--hm-color-text-primary)">{t('login.formTitle','Login Karo — Sign In 💜')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('login.fields.usernameOrEmail','Username ya Email (Your username or email)')}</FormLabel>
                <Input
                  name="usernameOrEmail"
                  value={form.usernameOrEmail}
                  onChange={onChange}
                  placeholder={t('login.placeholders.usernameOrEmail','yourusername or you@example.com')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('login.fields.password','Password (Aapka password)')}</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder={t('login.placeholders.password','Enter your password')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }} borderRadius="full" py={6}>
                {t('login.button','Login Karo (Sign In) 💜')}
              </Button>
              <Text fontSize="sm" color="var(--hm-color-text-primary)" textAlign="center">
                <Link as={RouterLink} to="/forgot-password" color="var(--hm-color-brand)" _hover={{ textDecoration: 'underline' }}>
                  {t('login.forgotPassword','Password bhool gaye? (Forgot password?)')}
                </Link>
              </Text>
              <Text fontSize="sm" color="var(--hm-color-text-secondary)" textAlign="center" pt={2}>
                {t('login.newUser','Naye ho? (New here?)')}{' '}
                <Link as={RouterLink} to="/register" color="var(--hm-color-brand)" fontWeight="600" _hover={{ textDecoration: 'underline' }}>
                  {t('login.signupLink','Sign Up Karo (Create Account)')}
                </Link>
              </Text>
            </VStack>
          </form>

          {/* Security Note */}
          <Box mt={6} p={3} bg="var(--hm-bg-glass)" borderRadius="md" borderLeft="4px solid var(--hm-color-brand)">
            <Text fontSize="xs" color="var(--hm-color-text-secondary)" lineHeight="1.7">
              {t('login.securityNote', '🔒 **Your Privacy Is Our Promise:** Your data is encrypted end-to-end. We never share your information with anyone. You\'re safe here. 💜')}
            </Text>
          </Box>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Login;

