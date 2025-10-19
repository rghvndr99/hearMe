import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Select, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const Register = () => {
  const { t } = useTranslation('common');
  // Theme tokens
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const ctaGradient = useColorModeValue('linear(to-r, blue.500, pink.500)', 'linear(to-r, blue.400, pink.400)');
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
      bg={pageBg}
      color={textPrimary}
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
    >
      <VStack spacing={8} zIndex={1} w="full" maxW="900px">
        <Box maxW="500px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="lg" mb={6} color={textPrimary}>{t('auth.createAccount','Create your account')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>{t('auth.username','Username')}</FormLabel>
                <Input name="username" value={form.username} onChange={onChange} placeholder={t('placeholders.username','yourusername')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('account.name','Name')}</FormLabel>
                <Input name="name" value={form.name} onChange={onChange} placeholder={t('placeholders.fullName','Full name')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('account.email','Email')}</FormLabel>
                <Input type="email" name="email" value={form.email} onChange={onChange} placeholder={t('placeholders.email','you@example.com')} />
              </FormControl>
              <FormControl>
                <FormLabel>{t('account.phone','Phone')}</FormLabel>
                <Input name="phone" value={form.phone} onChange={onChange} placeholder={t('placeholders.phone','+1 555 123 4567')} />
              </FormControl>
              <FormControl>
                <FormLabel>{t('account.language','Language')}</FormLabel>
                <Select name="language" value={form.language} onChange={onChange}>
                  <option value="en-US">{t('language.enUS','English (US)')}</option>
                  <option value="hi-IN">{t('language.hiIN','Hindi')}</option>
                  <option value="es-ES">{t('language.esES','Spanish')}</option>
                  <option value="fr-FR">{t('language.frFR','French')}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('auth.password','Password')}</FormLabel>
                <Input type="password" name="password" value={form.password} onChange={onChange} placeholder={t('placeholders.passwordHint','At least 8 characters')} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('auth.confirmPassword','Confirm Password')}</FormLabel>
                <Input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient={ctaGradient} color="white">{t('auth.register','Register')}</Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Register;

