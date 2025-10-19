import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Button, useToast, FormControl, FormLabel, Input, Select, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MotionBox = motion(Box);



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
  // Theme tokens
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.600', 'gray.300');
  const brandColor = useColorModeValue('blue.600', 'blue.300');
  const ctaGradient = useColorModeValue('linear(to-r, blue.500, pink.500)', 'linear(to-r, blue.400, pink.400)');
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
      toast({ title: t('account.nameRequired', 'Name is required'), status: 'warning', duration: 2500, isClosable: true });
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
      toast({ title: t('account.profileUpdated', 'Profile updated'), status: 'success', duration: 2500, isClosable: true });
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
          toast({ title: t('errors.sessionExpired','Session expired, please login again'), status: 'warning', duration: 3000, isClosable: true });
          try { localStorage.removeItem('hm-token'); window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
          navigate('/login');
        } else {
          toast({ title: t('errors.loadProfileFailed','Failed to load profile'), status: 'error', duration: 3000, isClosable: true });
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
        <Box maxW="700px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <HStack justify="space-between" mb={4}>
            <Heading size="lg" color={textPrimary}>{t('account.profile', 'Your Profile')}</Heading>
            <HStack>
              {!loading && user && !editMode && (
                <Button variant="outline" onClick={handleStartEdit}>{t('common.edit', 'Edit')}</Button>
              )}
              <Button variant="outline" onClick={logout}>{t('nav.logout', 'Logout')}</Button>
            </HStack>
          </HStack>
          {loading && <Text color={textSecondary}>{t('common.loading', 'Loading...')}</Text>}
          {!loading && user && !editMode && (
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between"><Text color={textSecondary}>{t('account.username', 'Username')}</Text><Text>{user.username}</Text></HStack>
              <HStack justify="space-between"><Text color={textSecondary}>{t('account.name', 'Name')}</Text><Text>{user.name}</Text></HStack>
              <HStack justify="space-between"><Text color={textSecondary}>{t('account.email', 'Email')}</Text><Text>{user.email}</Text></HStack>
              <HStack justify="space-between"><Text color={textSecondary}>{t('account.phone', 'Phone')}</Text><Text>{user.phone || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color={textSecondary}>{t('account.language', 'Language')}</Text><Text>{user.language}</Text></HStack>
              <HStack justify="space-between"><Text color={textSecondary}>{t('account.memberSince', 'Member since')}</Text><Text>{new Date(user.createdAt).toLocaleString()}</Text></HStack>
              <HStack pt={2} spacing={3} justify="flex-end">
                <Button as={RouterLink} to="/change-email" size="sm" variant="ghost" color={brandColor}>{t('account.changeEmail', 'Change email')}</Button>
                <Button as={RouterLink} to="/change-password" size="sm" variant="ghost" color={brandColor}>{t('account.changePassword', 'Change password')}</Button>
              </HStack>
            </VStack>
          )}
          {!loading && user && editMode && (
            <Box as="form" onSubmit={updateProfile}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>{t('account.username', 'Username')}</FormLabel>
                  <Input value={user.username} isReadOnly />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>{t('account.name', 'Name')}</FormLabel>
                  <Input value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>{t('account.phone', 'Phone')}</FormLabel>
                  <Input value={form.phone} onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>{t('account.language', 'Language')}</FormLabel>
                  <Select value={form.language} onChange={(e) => setForm(s => ({ ...s, language: e.target.value }))}>
                    <option value="en">{t('language.en','English')}</option>
                    <option value="hi">{t('language.hi','हिंदी')}</option>
                  </Select>
                </FormControl>
                <HStack justify="flex-end">
                  <Button variant="ghost" onClick={handleCancelEdit}>{t('common.cancel', 'Cancel')}</Button>
                  <Button type="submit" isLoading={saving} bgGradient={ctaGradient} color="white">{t('common.update', 'Update')}</Button>
                </HStack>
              </VStack>
            </Box>
          )}
        </Box>
      </VStack>
    </Flex>
  );
};

export default Profile;

