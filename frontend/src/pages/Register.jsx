import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Select, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const Register = () => {
  const { t } = useTranslation('common');
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    language: 'en-US',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast({ title: t('errors.passwordMismatch','Passwords do not match'), status: 'error', duration: 3000, isClosable: true });
    }
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/register`, form);
      localStorage.setItem('hm-token', data.token);
      try { window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
      toast({ title: t('auth.registrationSuccess','Registration successful'), status: 'success', duration: 2000, isClosable: true });
      navigate('/profile');
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.registrationFailed','Registration failed');
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
        <Box maxW="500px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="lg" mb={6} color="var(--hm-color-text-primary)">{t('auth.createAccount','Create your account')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('auth.username','Username')}</FormLabel>
                <Input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder={t('placeholders.username','yourusername')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('account.name','Name')}</FormLabel>
                <Input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder={t('placeholders.fullName','Full name')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('account.email','Email')}</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder={t('placeholders.email','you@example.com')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--hm-color-text-primary)">{t('account.phone','Phone')}</FormLabel>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder={t('placeholders.phone','+1 555 123 4567')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--hm-color-text-primary)">{t('account.language','Language')}</FormLabel>
                <Select
                  name="language"
                  value={form.language}
                  onChange={onChange}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                >
                  <option value="en-US" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.enUS','English (US)')}</option>
                  <option value="hi-IN" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.hiIN','Hindi')}</option>
                  <option value="es-ES" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.esES','Spanish')}</option>
                  <option value="fr-FR" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.frFR','French')}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('auth.password','Password')}</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder={t('placeholders.passwordHint','At least 8 characters')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('auth.confirmPassword','Confirm Password')}</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }}>{t('auth.register','Register')}</Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Register;

