import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const ChangeEmail = () => {
  const { t } = useTranslation('common');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('hm-token');
    if (!token) navigate('/login');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('hm-token');
      const { data } = await axios.post(`${API_URL}/api/users/change-email`, { newEmail, currentPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: t('account.emailUpdated', 'Email updated'), status: 'success', duration: 2500, isClosable: true });
      setNewEmail('');
      setCurrentPassword('');
      navigate('/profile');
    } catch (err) {
      const msg = err?.response?.data?.error || t('account.failedToChangeEmail', 'Failed to change email');
      toast({ title: t('common.error', 'Error'), description: msg, status: 'error', duration: 4000, isClosable: true });
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
          <Heading size="lg" mb={6} color="var(--hm-color-text-primary)">{t('account.changeEmail', 'Change Email Address')}</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('account.newEmail', 'New Email Address')}</FormLabel>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t('placeholders.email','you@example.com')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('account.currentPassword', 'Current Password')}</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-glass)"
                  color="var(--hm-color-text-primary)"
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }}>
                {t('account.updateEmail', 'Update email')}
              </Button>
              <Text color="var(--hm-color-text-secondary)" fontSize="sm">
                {t('account.securityNoteEmail', 'For your security, please confirm your current password to change your email.')}
              </Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default ChangeEmail;

