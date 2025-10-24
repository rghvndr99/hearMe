import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Stack, Button, useToast, FormControl, FormLabel, Input, Select, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';



const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const logout = () => {
    try { localStorage.removeItem('hm-token'); window.dispatchEvent(new Event('hm-auth-changed')); } catch {}

    navigate('/login');
  };

  const { t, i18n } = useTranslation('common');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', language: '' });

  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      language: user.language || i18n.language || 'en',
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) {
      toast({ title: t('profile.messages.nameRequired', '⚠️ Please enter your name so we know what to call you 💜'), status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    const token = localStorage.getItem('hm-token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setSaving(true);
      const payload = { name: form.name.trim(), phone: form.phone, language: form.language };
      const { data } = await axios.patch(`${API_URL}/api/users/me`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setUser(data.user);
      // Apply language immediately if changed
      if (payload.language && payload.language !== i18n.language) {
        try {
          localStorage.setItem('hm-ui-language', payload.language);
          await i18n.changeLanguage(payload.language);
        } catch {}
      }
      toast({ title: t('profile.messages.profileUpdated', '✅ Shabash! Profile updated successfully. 💜'), status: 'success', duration: 2500, isClosable: true });
      setEditMode(false);
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.updateFailed', 'Failed to update profile');
      toast({ title: msg, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('hm-token');

    if (!token) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data.user);
      } catch (err) {
        const code = err?.response?.status;
        if (code === 401) {
          toast({ title: t('profile.messages.sessionExpired','⚠️ Session expired. Please login again to continue. 💜'), status: 'warning', duration: 3000, isClosable: true });
          try { localStorage.removeItem('hm-token'); window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
          navigate('/login');
        } else {
          toast({ title: t('profile.messages.loadFailed','❌ Oops! Failed to load profile. Please try again. 💜'), status: 'error', duration: 3000, isClosable: true });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <VStack spacing={2} textAlign="center" maxW="700px">
          <Heading
            as="h1"
            fontSize={["3xl", "4xl", "5xl"]}
            fontWeight="800"
            color="var(--hm-color-text-primary)"
            lineHeight="1.2"
          >
            {t('profile.title', 'Aapki Profile — Your Safe Space 💜')}
          </Heading>
          <Text fontSize="md" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('profile.intro', 'Yahan aap apni details dekh aur update kar sakte ho. Aapki privacy humari zimmedari hai. 💜')}
          </Text>
        </VStack>

        <Box maxW="700px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Stack direction={["column", "column", "row"]} justify="space-between" align={["stretch", "stretch", "center"]} mb={4} spacing={3}>
            <Heading size="md" color="var(--hm-color-text-primary)">{t('account.profile', 'Your Profile')}</Heading>
            <Stack direction={["column", "column", "row"]} spacing={2} w={["full", "full", "auto"]}>
              {!loading && user && !editMode && (
                <Button variant="outline" borderColor="var(--hm-border-outline)" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }} onClick={handleStartEdit} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.edit', 'Edit Karo (Edit)')}</Button>
              )}
              <Button variant="outline" borderColor="var(--hm-border-outline)" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }} onClick={logout} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.logout', 'Logout Karo (Sign Out)')}</Button>
            </Stack>
          </Stack>
          {loading && <Text color="var(--hm-color-text-secondary)">{t('common.loading', 'Loading...')}</Text>}
          {!loading && user && !editMode && (
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.username', 'Username (Aapka unique naam)')}</Text><Text color="var(--hm-color-text-primary)">{user.username}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.name', 'Naam (Your name)')}</Text><Text color="var(--hm-color-text-primary)">{user.name}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.email', 'Email address')}</Text><Text color="var(--hm-color-text-primary)">{user.email}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.phone', 'Phone number (optional)')}</Text><Text color="var(--hm-color-text-primary)">{user.phone || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.language', 'Pasandida bhasha (Preferred language)')}</Text><Text color="var(--hm-color-text-primary)">{user.language}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.memberSince', 'Member since (Aap kab se saath ho)')}</Text><Text color="var(--hm-color-text-primary)">{new Date(user.createdAt).toLocaleString()}</Text></HStack>
              <Stack direction={["column", "column", "row"]} pt={2} spacing={3} justify={["stretch", "stretch", "flex-end"]} w="full">
                <Button
                  as={RouterLink}
                  to="/change-email"
                  size="sm"
                  variant="outline"
                  borderColor="var(--hm-color-brand)"
                  color="var(--hm-color-brand)"
                  _hover={{ bg: 'var(--hm-color-brand)', color: 'white' }}
                  w={["full", "full", "auto"]}
                  minH="48px"
                >
                  {t('profile.buttons.changeEmail', 'Change Email')}
                </Button>
                <Button
                  as={RouterLink}
                  to="/change-password"
                  size="sm"
                  variant="outline"
                  borderColor="var(--hm-color-brand)"
                  color="var(--hm-color-brand)"
                  _hover={{ bg: 'var(--hm-color-brand)', color: 'white' }}
                  w={["full", "full", "auto"]}
                  minH="48px"
                >
                  {t('profile.buttons.changePassword', 'Change Password')}
                </Button>
              </Stack>
            </VStack>
          )}
          {!loading && user && editMode && (
            <Box as="form" onSubmit={updateProfile}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.username', 'Username (Aapka unique naam)')}</FormLabel>
                  <Input
                    value={user.username}
                    isReadOnly
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.name', 'Naam (Your name)')}</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                    placeholder={t('profile.placeholders.name', 'Aapka poora naam (Your full name)')}
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                    _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.phone', 'Phone number (optional)')}</FormLabel>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))}
                    placeholder={t('profile.placeholders.phone', 'Phone number (optional) — e.g., +91 98765 43210')}
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                    _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.language', 'Pasandida bhasha (Preferred language)')}</FormLabel>
                  <Select
                    value={form.language}
                    onChange={(e) => setForm(s => ({ ...s, language: e.target.value }))}
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                    _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                  >
                    <option value="en" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.en','English')}</option>
                    <option value="hi" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.hi','हिंदी')}</option>
                  </Select>
                </FormControl>
                <Stack direction={["column", "column", "row"]} justify={["stretch", "stretch", "flex-end"]} spacing={3} w="full">
                  <Button variant="ghost" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }} onClick={handleCancelEdit} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.cancel', 'Cancel Karo (Cancel)')}</Button>
                  <Button type="submit" isLoading={saving} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }} borderRadius="full" px={8} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.update', 'Update Karo (Save Changes) 💜')}</Button>
                </Stack>
              </VStack>
            </Box>
          )}
        </Box>

        {/* Security Note */}
        <Box maxW="700px" mx="auto" w="full" p={4} bg="var(--hm-bg-glass)" borderRadius="lg" borderLeft="4px solid var(--hm-color-brand)">
          <Text fontSize="sm" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('profile.securityNote', '🔒 **Aapki Privacy Humari Zimmedari Hai:** Your data is encrypted and never shared with anyone. You\'re in control.')}
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Profile;

