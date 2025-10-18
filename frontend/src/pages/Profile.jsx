import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

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
          toast({ title: 'Session expired, please login again', status: 'warning', duration: 3000, isClosable: true });
          try { localStorage.removeItem('hm-token'); window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
          navigate('/login');
        } else {
          toast({ title: 'Failed to load profile', status: 'error', duration: 3000, isClosable: true });
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
            <Heading size="lg" color="var(--hm-color-text-primary)">Your Profile</Heading>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </HStack>
          {loading && <Text color="var(--hm-color-text-secondary)">Loading...</Text>}
          {!loading && user && (
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">Username</Text><Text>{user.username}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">Name</Text><Text>{user.name}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">Email</Text><Text>{user.email}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">Phone</Text><Text>{user.phone || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">Language</Text><Text>{user.language}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">Member since</Text><Text>{new Date(user.createdAt).toLocaleString()}</Text></HStack>
            </VStack>
          )}
        </Box>
      </VStack>
    </Flex>
  );
};

export default Profile;

