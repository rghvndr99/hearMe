import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const ChangePassword = () => {
  const { t } = useTranslation('common');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('hm-token');
    if (!token) navigate('/login');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast({ title: t('changePassword.messages.passwordsDontMatch', '⚠️ Oops! New passwords don\'t match. Please check and try again. 💜'), status: 'error', duration: 3000, isClosable: true });
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('hm-token');
      await axios.post(`${API_URL}/api/users/change-password`, { currentPassword, newPassword, confirmPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: t('changePassword.messages.passwordUpdated', '✅ Shabash! Password updated successfully. Your account is now more secure. 💜'), status: 'success', duration: 2500, isClosable: true });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/profile');
    } catch (err) {
      const msg = err?.response?.data?.error || t('changePassword.messages.failed', '❌ Failed to change password. Please check your current password and try again. 💜');
      toast({ title: t('error', 'Error'), description: msg, status: 'error', duration: 4000, isClosable: true });
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
            fontSize={["3xl", "4xl"]}
            fontWeight="800"
            color="var(--hm-color-text-primary)"
            lineHeight="1.2"
          >
            {t('changePassword.title', 'Password Badlo — Update Your Password 💜')}
          </Heading>
          <Text fontSize="md" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('changePassword.intro', 'Apna password update karna chahte ho? Good practice! Bas apna current password confirm karo aur naya password choose karo. 💜')}
          </Text>
        </VStack>

        <Box maxW="500px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('changePassword.fields.currentPassword', 'Current password (purana password)')}</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('changePassword.placeholders.currentPassword', 'Enter your current password')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('changePassword.fields.newPassword', 'Naya password (New password)')}</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('changePassword.placeholders.newPassword', 'At least 8 characters — make it strong! 💪')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--hm-color-text-primary)">{t('changePassword.fields.confirmPassword', 'Naya password dobara (Confirm new password)')}</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('changePassword.placeholders.confirmPassword', 'Re-enter your new password')}
                  bg="var(--hm-bg-glass)"
                  borderColor="var(--hm-border-outline)"
                  color="var(--hm-color-text-primary)"
                  _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }} borderRadius="full" py={6} w="full" minH="48px">
                {t('changePassword.button', 'Password Update Karo (Update Password) 💜')}
              </Button>
              <Box p={3} bg="var(--hm-bg-glass)" borderRadius="md" borderLeft="4px solid var(--hm-color-brand)">
                <Text color="var(--hm-color-text-secondary)" fontSize="sm" lineHeight="1.7">
                  {t('changePassword.securityNote', '🔒 **Security Tips:** Use a strong password with letters, numbers, and symbols. Don\'t share it with anyone. We\'ll never ask for your password via email or phone. 💜')}
                </Text>
              </Box>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default ChangePassword;

