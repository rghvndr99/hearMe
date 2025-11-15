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
    const token = localStorage.getItem('vl-token');
    if (!token) navigate('/login');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('vl-token');
      const { data } = await axios.post(`${API_URL}/api/users/change-email`, { newEmail, currentPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: t('changeEmail.messages.emailUpdated', '✅ Shabash! Email updated successfully. Please check your new inbox for confirmation. 💜'), status: 'success', duration: 2500, isClosable: true });
      setNewEmail('');
      setCurrentPassword('');
      navigate('/profile');
    } catch (err) {
      const msg = err?.response?.data?.error || t('changeEmail.messages.failed', '❌ Oops! Failed to change email. Please check your password and try again. 💜');
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
      bg="var(--vl-color-bg)"
      color="var(--vl-color-text-primary)"
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
            color="var(--vl-color-text-primary)"
            lineHeight="1.2"
          >
            {t('changeEmail.title', 'Email Badlo — Update Your Email 💜')}
          </Heading>
          <Text fontSize="md" color="var(--vl-color-text-secondary)" lineHeight="1.7">
            {t('changeEmail.intro', 'Apna email address update karna chahte ho? No problem! Bas apna current password confirm karo for security. 💜')}
          </Text>
        </VStack>

        <Box maxW="500px" mx="auto" w="full" p={6} className="vl-glass-card vl-cid-change-email-form" data-cid="change-email-form" borderRadius="2xl">
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('changeEmail.fields.newEmail', 'Naya email address (New email)')}</FormLabel>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t('changeEmail.placeholders.newEmail','you@example.com')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">{t('changeEmail.fields.currentPassword', 'Current password (security ke liye)')}</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('changeEmail.placeholders.currentPassword', 'Enter your current password')}
                  bg="var(--vl-bg-glass)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                  _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--vl-gradient-cta)" color="white" _hover={{ opacity: 0.9 }} borderRadius="full" py={6} w="full" minH="48px">
                {t('changeEmail.button', 'Update Email 💜')}
              </Button>
              <Box p={3} bg="var(--vl-bg-glass)" borderRadius="md" borderLeft="4px solid var(--vl-color-brand)">
                <Text color="var(--vl-color-text-secondary)" fontSize="sm" lineHeight="1.7">
                  {t('changeEmail.securityNote', '🔒 **Security ke liye:** We need your current password to confirm it\'s really you. Your data is safe with us. 💜')}
                </Text>
              </Box>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default ChangeEmail;

