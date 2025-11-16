import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, Checkbox, Badge, Spinner, Center, Stack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const token = localStorage.getItem('vl-admin-token') || localStorage.getItem('vl-token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/subscriptions/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSubscriptions(subsRes.data.subscriptions || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Load data error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast({
          title: 'Access denied',
          description: 'Admin privileges required',
          status: 'error',
          duration: 3000
        });
        navigate('/admin/login');
      } else {
        toast({
          title: 'Failed to load data',
          status: 'error',
          duration: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === subscriptions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subscriptions.map(s => s._id)));
    }
  };

  const handleApprove = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No subscriptions selected',
        status: 'warning',
        duration: 2000
      });
      return;
    }

    setApproving(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/admin/subscriptions/approve`,
        { subscriptionIds: Array.from(selectedIds) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: data.message,
        status: 'success',
        duration: 3000
      });

      setSelectedIds(new Set());
      loadData();
    } catch (err) {
      console.error('Approve error:', err);
      toast({
        title: 'Failed to approve',
        description: err.response?.data?.error || 'An error occurred',
        status: 'error',
        duration: 4000
      });
    } finally {
      setApproving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vl-admin-token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <Center minH="100vh" bg="var(--vl-color-bg)">
        <Spinner size="xl" color="var(--vl-color-brand)" thickness="4px" />
      </Center>
    );
  }

  return (
    <Flex direction="column" minH="100vh" bg="var(--vl-color-bg)" p={6}>
      <VStack spacing={6} align="stretch" maxW="1400px" mx="auto" w="full">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="var(--vl-color-text-primary)">
              Admin Dashboard
            </Heading>
            <Text className="vl-text-secondary">
              Manage pending payment verifications
            </Text>
          </VStack>
          <Button
            variant="outline"
            borderColor="var(--vl-border-outline)"
            color="var(--vl-color-text-primary)"
            _hover={{ bg: 'var(--vl-bg-glass)' }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </HStack>

        {/* Stats */}
        {stats && (
          <HStack spacing={4} flexWrap="wrap">
            <Box p={4} className="vl-glass-card" borderRadius="lg" flex="1" minW="200px">
              <Text className="vl-text-secondary" fontSize="sm">Pending Verifications</Text>
              <Text color="var(--vl-color-text-primary)" fontSize="3xl" fontWeight="700">
                {stats.pendingVerifications}
              </Text>
            </Box>
            <Box p={4} className="vl-glass-card" borderRadius="lg" flex="1" minW="200px">
              <Text className="vl-text-secondary" fontSize="sm">Active Subscriptions</Text>
              <Text color="var(--vl-color-text-primary)" fontSize="3xl" fontWeight="700">
                {stats.activeSubscriptions}
              </Text>
            </Box>
            <Box p={4} className="vl-glass-card" borderRadius="lg" flex="1" minW="200px">
              <Text className="vl-text-secondary" fontSize="sm">Total Revenue</Text>
              <Text color="var(--vl-color-text-primary)" fontSize="3xl" fontWeight="700">
                ₹{stats.totalRevenue}
              </Text>
            </Box>
          </HStack>
        )}

        {/* Actions */}
        <HStack justify="space-between" align="center">
          <Text color="var(--vl-color-text-primary)" fontWeight="600">
            {selectedIds.size} selected
          </Text>
          <Button
            className="vl-button-primary"
            onClick={handleApprove}
            isLoading={approving}
            isDisabled={selectedIds.size === 0}
          >
            Approve Selected ({selectedIds.size})
          </Button>
        </HStack>

        {/* Table */}
        <Box className="vl-glass-card" borderRadius="xl" overflow="hidden">
          {subscriptions.length === 0 ? (
            <Center p={8}>
              <Text className="vl-text-secondary">No pending verifications</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="var(--vl-bg-glass)">
                  <Tr>
                    <Th>
                      <Checkbox
                        isChecked={selectedIds.size === subscriptions.length && subscriptions.length > 0}
                        onChange={toggleSelectAll}
                        colorScheme="purple"
                      />
                    </Th>
                    <Th color="var(--vl-color-text-secondary)">User</Th>
                    <Th color="var(--vl-color-text-secondary)">Plan</Th>
                    <Th color="var(--vl-color-text-secondary)">Amount</Th>
                    <Th color="var(--vl-color-text-secondary)">Transaction ID</Th>
                    <Th color="var(--vl-color-text-secondary)">Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {subscriptions.map((sub) => (
                    <Tr key={sub._id} _hover={{ bg: 'var(--vl-bg-glass)' }}>
                      <Td>
                        <Checkbox
                          isChecked={selectedIds.has(sub._id)}
                          onChange={() => toggleSelection(sub._id)}
                          colorScheme="purple"
                        />
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text color="var(--vl-color-text-primary)" fontWeight="600">
                            {sub.user?.name || sub.user?.username || 'Unknown'}
                          </Text>
                          <Text className="vl-text-tertiary" fontSize="xs">
                            {sub.user?.email || sub.user?.phone || '-'}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="md">
                          {sub.plan}
                        </Badge>
                      </Td>
                      <Td>
                        <Text color="var(--vl-color-text-primary)" fontWeight="700">
                          ₹{sub.price}
                        </Text>
                        <Text className="vl-text-tertiary" fontSize="xs">
                          {sub.billing}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="var(--vl-color-text-primary)" fontFamily="monospace" fontSize="sm">
                          {sub.transactionId || '-'}
                        </Text>
                      </Td>
                      <Td>
                        <Text className="vl-text-secondary" fontSize="sm">
                          {new Date(sub.createdAt).toLocaleString()}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Flex>
  );
}

