import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Text } from '@chakra-ui/react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';


const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      return toast({ title: 'Missing token', status: 'error', duration: 3000, isClosable: true });
    }
    if (password !== confirmPassword) {
      return toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/users/reset-password`, { token, password, confirmPassword });
      toast({ title: 'Password updated. Please log in.', status: 'success', duration: 2500, isClosable: true });
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to reset password';
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
    >
      <VStack spacing={8} zIndex={1} w="full" maxW="900px">
        <Box maxW="500px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="lg" mb={6} color="var(--hm-color-text-primary)">Reset Password</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white">Update password</Button>
              {!token && (
                <Text color="var(--hm-color-text-secondary)" fontSize="sm">No token found in URL. Please use the link from your email or request a new reset link.</Text>
              )}
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default ResetPassword;

