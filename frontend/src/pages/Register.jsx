import React, { useState } from 'react';
import { Box, Flex, Heading, VStack, FormControl, FormLabel, Input, Button, useToast, Select } from '@chakra-ui/react';
import axios from 'axios';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const MotionBox = motion(Box);


const Register = () => {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    language: 'en-US',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
    }
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/register`, form);
      localStorage.setItem('hm-token', data.token);
      try { window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
      toast({ title: 'Registration successful', status: 'success', duration: 2000, isClosable: true });
      navigate('/profile');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Registration failed';
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
        <Box maxW="500px" mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Heading size="lg" mb={6} color="var(--hm-color-text-primary)">Create your account</Heading>
          <form onSubmit={submit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input name="username" value={form.username} onChange={onChange} placeholder="yourusername" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={form.name} onChange={onChange} placeholder="Full name" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input name="phone" value={form.phone} onChange={onChange} placeholder="+1 555 123 4567" />
              </FormControl>
              <FormControl>
                <FormLabel>Language</FormLabel>
                <Select name="language" value={form.language} onChange={onChange}>
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" name="password" value={form.password} onChange={onChange} placeholder="At least 8 characters" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} />
              </FormControl>
              <Button type="submit" isLoading={loading} bgGradient="var(--hm-gradient-cta)" color="white">Register</Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Flex>
  );
};

export default Register;

