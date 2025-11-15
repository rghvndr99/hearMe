import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Select, Checkbox, FormErrorMessage, Link } from '@chakra-ui/react';
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
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const PRIVACY_PDF_URL = '/legal/privacy-policy.pdf';
  const openPrivacyPdf = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(PRIVACY_PDF_URL, { method: 'HEAD' });
      const url = res.ok ? PRIVACY_PDF_URL : '/privacy';
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open('/privacy', '_blank', 'noopener,noreferrer');
    }
  };


  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast({ title: t('errors.passwordMismatch','Passwords do not match'), status: 'error', duration: 3000, isClosable: true });
    }
    if (!acceptedPrivacy) {
      setTriedSubmit(true);
      return toast({ title: t('auth.privacyRequired','Privacy Policy not accepted'), description: t('auth.privacyRequiredDesc','Please read and accept the Privacy Policy to continue.'), status: 'error', duration: 3000, isClosable: true });
    }
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/register`, form);
      localStorage.setItem('vl-token', data.token);
      try { window.dispatchEvent(new Event('vl-auth-changed')); } catch {}
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
      bg="var(--vl-color-bg)"
      color="var(--vl-color-text-primary)"
      position="relative"
      overflow="hidden"
      px={[6, 12]}
      pt="100px"
      pb={[12, 20]}
      className="vl-cid-register-root"
      data-cid="register-root"
    >
      <VStack spacing={8} zIndex={1} w="full" maxW="900px">
        <Heading size="xl" textAlign="center" color="var(--vl-color-text-primary)">
          {t('auth.registerPage.heading', 'Join VoiceLap — private, judgment-free support in your language')}
        </Heading>

        <Box mx="auto" w="full" p={6} className="vl-glass-card vl-cid-register-form" data-cid="register-form" borderRadius="2xl">
          <Heading size="lg" mb={6} color="var(--vl-color-text-primary)">{t('auth.createAccount','Create your account')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('auth.username','Username')}</FormLabel>
                <Input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  placeholder={t('placeholders.username','yourusername')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('account.name','Name')}</FormLabel>
                <Input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder={t('placeholders.fullName','Full name')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('account.email','Email')}</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder={t('placeholders.email','you@example.com')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--vl-color-text-primary)">{t('account.phone','Phone')}</FormLabel>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder={t('placeholders.phone','+1 555 123 4567')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--vl-color-text-primary)">{t('account.language','Language')}</FormLabel>
                <Select
                  name="language"
                  value={form.language}
                  onChange={onChange}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                >
                  <option value="en-US" style={{ background: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>{t('language.enUS','English (US)')}</option>
                  <option value="hi-IN" style={{ background: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>{t('language.hiIN','Hindi')}</option>
                  <option value="es-ES" style={{ background: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>{t('language.esES','Spanish')}</option>
                  <option value="fr-FR" style={{ background: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>{t('language.frFR','French')}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('auth.password','Password')}</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder={t('placeholders.passwordHint','At least 8 characters')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('auth.confirmPassword','Confirm Password')}</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                 color="var(--vl-color-text-primary)"
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>

              {/* Privacy acceptance */}
              <FormControl isRequired isInvalid={triedSubmit && !acceptedPrivacy}>
                <Checkbox
                  isChecked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  colorScheme="purple"
                >
                  {t('auth.acceptPrivacyPrefix','I have read and agree to the')}{' '}
                  <Link
                    href="#"
                    onClick={openPrivacyPdf}
                    color="var(--vl-color-brand)"
                    textDecoration="underline"
                  >
                    {t('footer.legal.privacy', 'Privacy Policy')}
                  </Link>
                </Checkbox>
                <FormErrorMessage>
                  {t('auth.privacyRequired','Privacy Policy not accepted')}
                </FormErrorMessage>
              </FormControl>

              <Button type="submit" isLoading={loading} bgGradient="var(--vl-gradient-cta)" color="white" _hover={{ opacity: 0.9 }}>{t('auth.register','Register')}</Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Register;

