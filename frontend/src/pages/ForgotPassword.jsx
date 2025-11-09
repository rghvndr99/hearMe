import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text, Link } from '@chakra-ui/react';
import axios from 'axios';

import { Link as RouterLink } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const ForgotPassword = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/forgot-password`, { usernameOrEmail });
      setResetUrl(data.resetUrl || '');
      toast({ title: 'If an account exists, a reset link has been sent.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to request password reset';
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000, isClosable: true });
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
      className="hm-cid-forgot-password-root"
      data-cid="forgot-password-root"
    >
      <VStack spacing={8} zIndex={1} w="full" maxW="900px">
        <Box maxW="500px" mx="auto" w="full" p={6} className="hm-glass-card hm-cid-forgot-password-form" data-cid="forgot-password-form" borderRadius="2xl">
          <Heading size="lg" mb={6} color="var(--hm-color-text-primary)">Forgot Password</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Username or Email</FormLabel>
                <Input value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} placeholder="yourusername or you@example.com" />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white">Send reset link</Button>
              {resetUrl && (
                <Text fontSize="sm" color="var(--hm-color-text-secondary)">Dev: Reset link — <Link href={resetUrl} color="var(--hm-color-brand)">{resetUrl}</Link></Text>
              )}
              <Text fontSize="sm">Remembered your password? <Link as={RouterLink} to="/login" color="var(--hm-color-brand)">Login</Link></Text>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default ForgotPassword;

