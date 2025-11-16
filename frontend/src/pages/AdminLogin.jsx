import { useState } from 'react';
import { Box, Flex, Heading, Text, VStack, Input, Button, useToast, FormControl, FormLabel } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!usernameOrEmail || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both username/email and password',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, {
        usernameOrEmail,
        password
      });

      if (data.token) {
        localStorage.setItem('vl-admin-token', data.token);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 2000
        });
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const message = err.response?.data?.error || 'Login failed';
      toast({
        title: 'Login failed',
        description: message,
        status: 'error',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="var(--vl-color-bg)"
      p={4}
    >
      <Box
        w="full"
        maxW="400px"
        p={8}
        className="vl-glass-card"
        borderRadius="2xl"
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2}>
            <Heading size="lg" color="var(--vl-color-text-primary)">
              Admin Login
            </Heading>
            <Text className="vl-text-secondary" fontSize="sm">
              VoiceLap Administration Panel
            </Text>
          </VStack>

          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">Username or Email</FormLabel>
                <Input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter admin username or email"
                  bg="var(--vl-color-bg)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _hover={{ borderColor: 'var(--vl-color-brand)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="var(--vl-color-text-primary)">Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  bg="var(--vl-color-bg)"
                  borderColor="var(--vl-border-outline)"
                  color="var(--vl-color-text-primary)"
                  _hover={{ borderColor: 'var(--vl-color-brand)' }}
                  _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                />
              </FormControl>

              <Button
                type="submit"
                className="vl-button-primary"
                w="full"
                isLoading={loading}
                loadingText="Logging in..."
              >
                Login
              </Button>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
}

