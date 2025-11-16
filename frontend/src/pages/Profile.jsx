import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Stack, Button, useToast, FormControl, FormLabel, Input, Select, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Badge, Icon, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner } from '@chakra-ui/react';
import { FiVideo, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

import { useNavigate, Link as RouterLink } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import BookingCard from '../components/BookingCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';



const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const logout = () => {
    try {
      localStorage.removeItem('vl-token');
      sessionStorage.removeItem('vl-anon-token');
      window.dispatchEvent(new Event('vl-auth-changed'));
    } catch {}
    navigate('/login');
  };

  const { t, i18n } = useTranslation('common');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', language: '' });

  const [saving, setSaving] = useState(false);

  const [subscription, setSubscription] = useState(null);
  const [planConfig, setPlanConfig] = useState(null);
  const [usage, setUsage] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  // Booking state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('upcoming');
  const { isOpen: isBookingModalOpen, onOpen: onBookingModalOpen, onClose: onBookingModalClose } = useDisclosure();

  // Helpers for membership cycle/formatting
  const formatDateTime = (d) => {
    try { return new Date(d).toLocaleString(); } catch { return '-'; }
  };
  const addMonths = (date, n) => { const d = new Date(date); d.setMonth(d.getMonth() + n); return d; };
  const addYears = (date, n) => { const d = new Date(date); d.setFullYear(d.getFullYear() + n); return d; };
  const computeNextBilling = (activatedAt, billing) => {
    if (!activatedAt || !billing) return null;
    let next;
    if (billing === 'annual') next = addYears(activatedAt, 1);
    else next = addMonths(activatedAt, 1);
    const now = new Date();
    // If already past, roll forward until future (handles old activations)
    let guard = 0;
    while (next <= now && guard < 36) { next = billing === 'annual' ? addYears(next, 1) : addMonths(next, 1); guard++; }
    return next;
  };
  const firstOfNextMonth = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth()+1, 1, 0,0,0,0); };

  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();

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
      toast({ title: t('profile.messages.nameRequired', '⚠️ Please enter your name so we know what to call you 💜'), status: 'warning', duration: 2500, isClosable: true });
      return;
    }
    const token = localStorage.getItem('vl-token');
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
          localStorage.setItem('vl-ui-language', payload.language);
          await i18n.changeLanguage(payload.language);
        } catch {}
      }
      toast({ title: t('profile.messages.profileUpdated', '✅ Shabash! Profile updated successfully. 💜'), status: 'success', duration: 2500, isClosable: true });
      setEditMode(false);
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.updateFailed', 'Failed to update profile');
      toast({ title: msg, status: 'error', duration: 3000, isClosable: true });
    } finally {

      setSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('vl-token') || sessionStorage.getItem('vl-anon-token');

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
          toast({ title: t('profile.messages.sessionExpired','⚠️ Session expired. Please login again to continue. 💜'), status: 'warning', duration: 3000, isClosable: true });
          try { localStorage.removeItem('vl-token'); sessionStorage.removeItem('vl-anon-token'); window.dispatchEvent(new Event('vl-auth-changed')); } catch {}
          navigate('/login');
        } else {
          toast({ title: t('profile.messages.loadFailed','❌ Oops! Failed to load profile. Please try again. 💜'), status: 'error', duration: 3000, isClosable: true });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load subscription for the current user from API
  useEffect(() => {
    const token = localStorage.getItem('vl-token');
    if (!token) return;
    const load = async () => {
      try {
        setSubLoading(true);
        const { data } = await axios.get(`${API_URL}/api/subscriptions/me`, { headers: { Authorization: `Bearer ${token}` } });
        setSubscription(data.subscription || null);
        setPlanConfig(data.config || null);
        setUsage(data.usage || null);
      } catch (err) {
        // ignore; keep UI graceful
      } finally {
        setSubLoading(false);
      }
    };
    load();
    const handler = () => load();
    window.addEventListener('vl-subscription-changed', handler);
    return () => window.removeEventListener('vl-subscription-changed', handler);
  }, []);

  // Fetch bookings
  const fetchBookings = async (filter = 'upcoming') => {
    const token = localStorage.getItem('vl-token');
    if (!token) return;

    setBookingsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/bookings/my-history?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings(bookingFilter);
    }
  }, [user, bookingFilter]);

  async function handleCancelMembership() {
    const token = localStorage.getItem('vl-token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setSubLoading(true);
      await axios.patch(`${API_URL}/api/subscriptions/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: t('profile.subscription.cancelled', 'Membership cancelled'), status: 'success', duration: 2000 });
      window.dispatchEvent(new Event('vl-subscription-changed'));
    } catch (err) {
      const msg = err?.response?.data?.error || t('errors.updateFailed', 'Failed to update profile');
      toast({ title: msg, status: 'error', duration: 2500 });
    } finally {
      setSubLoading(false);
    }
  }

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
        <VStack spacing={2} textAlign="center">
          <Heading
            as="h1"
            fontSize={["3xl", "4xl", "5xl"]}
            fontWeight="800"
            color="var(--vl-color-text-primary)"
            lineHeight="1.2"
          >
            {t('profile.title', 'Aapki Profile — Your Safe Space 💜')}
          </Heading>
          <Text fontSize="md" color="var(--vl-color-text-secondary)" lineHeight="1.7">
            {t('profile.intro', 'Yahan aap apni details dekh aur update kar sakte ho. Aapki privacy humari zimmedari hai. 💜')}
          </Text>
        </VStack>

        <Box mx="auto" w="full" p={6} className="vl-glass-card vl-cid-profile-card" data-cid="profile-card" borderRadius="2xl">
          <Stack direction={["column", "column", "row"]} justify="space-between" align={["stretch", "stretch", "center"]} mb={4} spacing={3}>
            <Heading size="md" color="var(--vl-color-text-primary)">{t('account.profile', 'Your Profile')}</Heading>
            <Stack direction={["column", "column", "row"]} spacing={2} w={["full", "full", "auto"]}>
              {!loading && user && !editMode && !user.isAnonymous && (
                <Button variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-bg-glass)' }} onClick={handleStartEdit} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.edit', 'Edit Karo (Edit)')}</Button>
              )}
              <Button variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-bg-glass)' }} onClick={logout} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.logout', 'Logout Karo (Sign Out)')}</Button>
            </Stack>
          </Stack>
          {loading && <Text color="var(--vl-color-text-secondary)">{t('common.loading', 'Loading...')}</Text>}
          {!loading && user && !editMode && (
            <VStack align="stretch" spacing={3}>
              {user.isAnonymous && (
                <Box p={3} bg="var(--vl-bg-glass)" borderLeft="4px solid var(--vl-color-brand)" borderRadius="md">
                  <Text className="vl-text-secondary">
                    {t('profile.anon.notice', 'You are using VoiceLap anonymously. Some features are limited and profile edits are disabled. Create an account to save your progress and unlock more features.')}
                  </Text>
                </Box>
              )}
              <HStack justify="space-between"><Text color="var(--vl-color-text-secondary)">{t('profile.fields.username', 'Username (Aapka unique naam)')}</Text><Text color="var(--vl-color-text-primary)">{user.username || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--vl-color-text-secondary)">{t('profile.fields.name', 'Naam (Your name)')}</Text><Text color="var(--vl-color-text-primary)">{user.name || user.displayName || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--vl-color-text-secondary)">{t('profile.fields.email', 'Email address')}</Text><Text color="var(--vl-color-text-primary)">{user.email || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--vl-color-text-secondary)">{t('profile.fields.phone', 'Phone number (optional)')}</Text><Text color="var(--vl-color-text-primary)">{user.phone || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--vl-color-text-secondary)">{t('profile.fields.language', 'Pasandida bhasha (Preferred language)')}</Text><Text color="var(--vl-color-text-primary)">{user.language}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--vl-color-text-secondary)">{t('profile.fields.memberSince', 'Member since (Aap kab se saath ho)')}</Text><Text color="var(--vl-color-text-primary)">{new Date(user.createdAt).toLocaleString()}</Text></HStack>
              {!user.isAnonymous && (
                <Stack direction={["column", "column", "row"]} pt={2} spacing={3} justify={["stretch", "stretch", "flex-end"]} w="full">
                  <Button
                    as={RouterLink}
                    to="/change-email"
                    size="sm"
                    variant="outline"
                    borderColor="var(--vl-color-brand)"
                    color="var(--vl-color-brand)"
                    _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
                    w={["full", "full", "auto"]}
                    minH="48px"
                  >
                    {t('profile.buttons.changeEmail', 'Change Email')}
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/change-password"
                    size="sm"
                    variant="outline"
                    borderColor="var(--vl-color-brand)"
                    color="var(--vl-color-brand)"
                    _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
                    w={["full", "full", "auto"]}
                    minH="48px"
                  >
                    {t('profile.buttons.changePassword', 'Change Password')}
                  </Button>
                </Stack>
              )}
            </VStack>
          )}
          {!loading && user && editMode && (
            <Box as="form" onSubmit={updateProfile}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel color="var(--vl-color-text-primary)">{t('profile.fields.username', 'Username (Aapka unique naam)')}</FormLabel>
                  <Input
                    value={user.username}
                    isReadOnly
                    bg="var(--vl-bg-glass)"
                    borderColor="var(--vl-border-outline)"
                    color="var(--vl-color-text-primary)"
                    _hover={{ borderColor: 'var(--vl-border-outline)' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="var(--vl-color-text-primary)">{t('profile.fields.name', 'Naam (Your name)')}</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                    placeholder={t('profile.placeholders.name', 'Aapka poora naam (Your full name)')}
                    bg="var(--vl-bg-glass)"
                    borderColor="var(--vl-border-outline)"
                    color="var(--vl-color-text-primary)"
                    _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                    _hover={{ borderColor: 'var(--vl-border-outline)' }}
                    _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="var(--vl-color-text-primary)">{t('profile.fields.phone', 'Phone number (optional)')}</FormLabel>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))}
                    placeholder={t('profile.placeholders.phone', 'Phone number (optional) — e.g., +91 98765 43210')}
                    bg="var(--vl-bg-glass)"
                    borderColor="var(--vl-border-outline)"
                    color="var(--vl-color-text-primary)"
                    _placeholder={{ color: 'var(--vl-color-placeholder)' }}
                    _hover={{ borderColor: 'var(--vl-border-outline)' }}
                    _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="var(--vl-color-text-primary)">{t('profile.fields.language', 'Pasandida bhasha (Preferred language)')}</FormLabel>
                  <Select
                    value={form.language}
                    onChange={(e) => setForm(s => ({ ...s, language: e.target.value }))}

                    bg="var(--vl-bg-glass)"
                    borderColor="var(--vl-border-outline)"
                    color="var(--vl-color-text-primary)"
                    _hover={{ borderColor: 'var(--vl-border-outline)' }}
                    _focus={{ borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' }}
                  >
                    <option value="en" style={{ background: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>{t('language.en','English')}</option>
                    <option value="hi" style={{ background: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>{t('language.hi','हिंदी')}</option>
                  </Select>
                </FormControl>
                <Stack direction={["column", "column", "row"]} justify={["stretch", "stretch", "flex-end"]} spacing={3} w="full">
                  <Button variant="ghost" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-bg-glass)' }} onClick={handleCancelEdit} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.cancel', 'Cancel Karo (Cancel)')}</Button>
                  <Button type="submit" isLoading={saving} bgGradient="var(--vl-gradient-cta)" color="white" _hover={{ opacity: 0.9 }} borderRadius="full" px={8} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.update', 'Update Karo (Save Changes) 💜')}</Button>
                </Stack>
              </VStack>
            </Box>
          )}
        </Box>

        {/* Subscription Section */}
        {!loading && user && (
          <Box mx="auto" w="full" p={6} className="vl-glass-card vl-cid-profile-subscription-card" data-cid="profile-subscription-card" borderRadius="2xl">
            <Stack direction={["column", "column", "row"]} justify="space-between" align={["stretch", "stretch", "center"]} mb={4} spacing={3}>
              <Heading size="md" color="var(--vl-color-text-primary)">{t('profile.subscription.title', 'Your Subscription')}</Heading>
              <Stack direction={["column", "column", "row"]} spacing={2} w={["full", "full", "auto"]}>
                <Button as={RouterLink} to="/pricing" className="vl-button-primary" w={["full", "full", "auto"]} minH="48px">
                  {t('profile.subscription.manage', 'Manage Subscription')}
                </Button>
                {subscription && subscription.status === 'active' && (
                  <Button
                    variant="outline"
                    borderColor="var(--vl-border-outline)"
                    color="var(--vl-color-text-primary)"
                    _hover={{ bg: 'var(--vl-bg-glass)' }}
                    onClick={onCancelOpen}
                    isLoading={subLoading}
                    w={["full", "full", "auto"]}
                    minH="48px"
                  >
                    {t('profile.subscription.cancel', 'Cancel Membership')}
                  </Button>
                )}
              </Stack>
            </Stack>
            <VStack align="stretch" spacing={1} mb={3}>
              <Text className="vl-text-tertiary">{t('pricing.disclaimer.anonymous','Connect anonymously — choose what you share and how you show up.')}</Text>
              <Text className="vl-text-tertiary">{t('pricing.disclaimer.storageChoice','You decide whether to store your chats/messages.')}</Text>
            </VStack>

            {subscription ? (
              <VStack align="stretch" spacing={4}>
                {/* Permanent Verification Pending Banner */}
                {subscription.status === 'pending_verification' && (
                  <Box
                    p={5}
                    bg="linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%)"
                    borderWidth="2px"
                    borderColor="var(--vl-color-brand)"
                    borderRadius="xl"
                    position="relative"
                    overflow="hidden"
                  >
                    {/* Animated background effect */}
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bg="var(--vl-color-brand)"
                      opacity="0.05"
                      pointerEvents="none"
                    />

                    <VStack align="stretch" spacing={4} position="relative">
                      {/* Header */}
                      <HStack spacing={3}>
                        <Icon as={FiAlertCircle} color="var(--vl-color-brand)" boxSize={6} />
                        <VStack align="start" spacing={0} flex="1">
                          <Text color="var(--vl-color-text-primary)" fontSize="lg" fontWeight="700">
                            {t('profile.subscription.verificationPendingTitle', '⏳ Payment Verification in Progress')}
                          </Text>
                          <Text className="vl-text-secondary" fontSize="sm">
                            {t('profile.subscription.verificationSubtitle', 'Your payment is being verified by our team')}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Current Status */}
                      <Box p={4} bg="var(--vl-color-bg)" borderRadius="lg" borderWidth="1px" borderColor="var(--vl-border-outline)">
                        <HStack spacing={3} mb={3}>
                          <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                            {t('profile.subscription.currentPlan', 'Current Plan')}
                          </Badge>
                          <Text color="var(--vl-color-text-primary)" fontSize="lg" fontWeight="700">
                            {t('pricing.plans.free', 'Free Plan')}
                          </Text>
                        </HStack>
                        <Text className="vl-text-secondary" fontSize="sm">
                          {t('profile.subscription.freePlanMessage', 'You are currently on the Free plan. Once your payment is verified, you will be upgraded to your selected plan.')}
                        </Text>
                      </Box>

                      {/* Pending Upgrade Info */}
                      <Box p={4} bg="rgba(138, 43, 226, 0.1)" borderRadius="lg" borderWidth="1px" borderColor="var(--vl-color-brand)">
                        <HStack spacing={3} mb={3}>
                          <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                            {t('profile.subscription.pendingUpgrade', 'Pending Upgrade')}
                          </Badge>
                          <Text color="var(--vl-color-text-primary)" fontSize="lg" fontWeight="700">
                            {t(`pricing.plans.${subscription.plan}`, subscription.plan)} - ₹{subscription.price}/{t(`pricing.${subscription.billing}`, subscription.billing)}
                          </Text>
                        </HStack>
                        <Text className="vl-text-secondary" fontSize="sm" mb={3}>
                          {t('profile.subscription.verificationTimeframe', 'Verification usually takes 2-6 hours. You will receive an email once your subscription is activated.')}
                        </Text>

                        {/* Transaction ID */}
                        {subscription.transactionId && (
                          <Box mt={3} p={3} bg="var(--vl-color-bg)" borderRadius="md">
                            <Text className="vl-text-tertiary" fontSize="xs" mb={1} fontWeight="600">
                              {t('profile.subscription.transactionId', 'Transaction ID')}
                            </Text>
                            <Text color="var(--vl-color-text-primary)" fontWeight="600" fontFamily="monospace" fontSize="sm">
                              {subscription.transactionId}
                            </Text>
                          </Box>
                        )}
                      </Box>

                      {/* Help Text */}
                      <HStack spacing={2} p={3} bg="var(--vl-bg-glass)" borderRadius="md">
                        <Text className="vl-text-tertiary" fontSize="xs">
                          💡 {t('profile.subscription.helpText', 'Need help? Contact us if verification takes longer than 24 hours.')}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                )}

                {/* Only show subscription details if active */}
                {subscription.status === 'active' && (
                  <>
                    <HStack justify="space-between"><Text className="vl-text-secondary">{t('payment.labels.plan','Plan')}</Text><Text color="var(--vl-color-text-primary)" fontWeight="600">{t(`pricing.plans.${subscription.plan}`, subscription.plan)}</Text></HStack>
                <HStack justify="space-between"><Text className="vl-text-secondary">{t('payment.labels.billing','Billing')}</Text><Text color="var(--vl-color-text-primary)" fontWeight="600">{t(`pricing.${subscription.billing}`, subscription.billing)}</Text></HStack>
                <HStack justify="space-between"><Text className="vl-text-secondary">{t('payment.labels.amount','Amount')}</Text><Text color="var(--vl-color-text-primary)" fontWeight="700">₹{subscription.price}</Text></HStack>
                <HStack justify="space-between">
                  <Text className="vl-text-secondary">{t('profile.subscription.status','Status')}</Text>
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={
                        subscription.status === 'active' ? 'green' :
                        subscription.status === 'pending_verification' ? 'orange' :
                        subscription.status === 'cancelled' ? 'red' :
                        'gray'
                      }
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {subscription.status === 'pending_verification'
                        ? t('profile.subscription.statusPendingVerification', 'Pending Verification')
                        : subscription.status === 'active'
                        ? t('profile.subscription.statusActive', 'Active')
                        : subscription.status === 'cancelled'
                        ? t('profile.subscription.statusCancelled', 'Cancelled')
                        : subscription.status
                      }
                    </Badge>
                  </HStack>
                </HStack>
                <HStack justify="space-between"><Text className="vl-text-secondary">{t('profile.subscription.nextBilling','Next billing')}</Text><Text color="var(--vl-color-text-primary)">{(() => { const d = computeNextBilling(subscription.activatedAt, subscription.billing); return d ? d.toLocaleString() : '-'; })()}</Text></HStack>

                <HStack justify="space-between"><Text className="vl-text-secondary">{t('profile.subscription.since','Active since')}</Text><Text color="var(--vl-color-text-primary)">{new Date(subscription.activatedAt).toLocaleString()}</Text></HStack>

                {usage && planConfig && (
                  <Box mt={4} p={4} bg="var(--vl-bg-glass)" borderRadius="lg">
                    <Text className="vl-text-secondary" mb={2}>{t('profile.subscription.usageTitle', 'Your usage')}</Text>

                    {/* Voice Twins usage */}
                    <HStack justify="space-between">
                      <Text className="vl-text-secondary">{planConfig.features?.voiceTwins?.label || 'Custom voices'}</Text>
                      <Text color="var(--vl-color-text-primary)" fontWeight="700">
                        {(usage.voiceTwins?.used ?? 0)} / {(usage.voiceTwins?.limit ?? planConfig.features?.voiceTwins?.limit ?? 0)}
                      </Text>
                    </HStack>
                    <Progress
                      value={(() => { const u = usage?.voiceTwins?.used ?? 0; const l = usage?.voiceTwins?.limit ?? planConfig?.features?.voiceTwins?.limit ?? 0; return l > 0 ? Math.min(100, (u / l) * 100) : 0; })()}
                      size="sm"
                      mt={2}
                      bg="var(--vl-bg-glass)"
                      sx={{ '& > div': { background: 'var(--vl-color-brand)' } }}
                    />

                    {/* Chat minutes usage */}
                    <HStack justify="space-between" mt={4}>
                      <Text className="vl-text-secondary">
                        {(planConfig.features?.chatMinutes?.label || 'Chat minutes')} {(() => { const p = usage?.chatMinutes?.period || planConfig?.features?.chatMinutes?.period; return p && p !== 'unlimited' ? `(${p})` : ''; })()}
                      </Text>
                      <Text color="var(--vl-color-text-primary)" fontWeight="700">
                        {(() => { const l = usage?.chatMinutes?.limit ?? planConfig?.features?.chatMinutes?.limit ?? 0; const u = usage?.chatMinutes?.used ?? 0; return l === -1 ? t('profile.subscription.unlimited','Unlimited') : `${u} / ${l}`; })()}
                      </Text>
                    </HStack>
                    {(() => { const l = usage?.chatMinutes?.limit ?? planConfig?.features?.chatMinutes?.limit ?? 0; const u = usage?.chatMinutes?.used ?? 0; return l > 0 ? (
                      <Progress value={Math.min(100, (u / l) * 100)} size="sm" mt={2} bg="var(--vl-bg-glass)" sx={{ '& > div': { background: 'var(--vl-color-brand)' } }} />
                    ) : null; })()}

                    {/* Reset info for monthly */}
                    <Text className="vl-text-tertiary" mt={2}>
                      {(() => { const p = usage?.chatMinutes?.period || planConfig?.features?.chatMinutes?.period; if (p === 'month') { const d = firstOfNextMonth(); return t('profile.subscription.resetsOn','Resets on') + ' ' + d.toLocaleDateString(); } if (p === 'week') { return t('profile.subscription.resetsWeekly','Resets on a rolling weekly window'); } return ''; })()}
                    </Text>

                    {/* In-Person Sessions (Human Care) */}
                    {usage?.inPersonSessions && (
                      <>
                        <HStack justify="space-between" mt={4}>
                          <Text className="vl-text-secondary">
                            {t('profile.subscription.inPersonSessions', 'In-person sessions')} {t('profile.subscription.thisMonth', '(this month)')}
                          </Text>
                          <Text color="var(--vl-color-text-primary)" fontWeight="700">
                            {(() => {
                              const used = usage.inPersonSessions.used ?? 0;
                              const limit = usage.inPersonSessions.limit ?? 0;
                              const trial = usage.inPersonSessions.trialRemaining ?? 0;

                              // If user has no subscription but has trial slots
                              if (limit === 0 && trial > 0) {
                                return `${trial} ${t('profile.subscription.trialRemaining', 'trial slots remaining')}`;
                              }
                              // If user has subscription
                              if (limit > 0) {
                                return `${used} / ${limit}`;
                              }
                              return t('profile.subscription.noSessions', 'Not available');
                            })()}
                          </Text>
                        </HStack>
                        {(() => {
                          const used = usage.inPersonSessions.used ?? 0;
                          const limit = usage.inPersonSessions.limit ?? 0;
                          const trial = usage.inPersonSessions.trialRemaining ?? 0;

                          if (limit > 0) {
                            return (
                              <Progress
                                value={Math.min(100, (used / limit) * 100)}
                                size="sm"
                                mt={2}
                                bg="var(--vl-bg-glass)"
                                sx={{ '& > div': { background: 'var(--vl-color-brand)' } }}
                              />
                            );
                          }
                          return null;
                        })()}
                      </>
                    )}
                  </Box>
                )}
                  </>
                )}
              </VStack>
            ) : (
              <Box>
                <Text className="vl-text-secondary">
                  {t('profile.subscription.none', 'You are on the Free plan. Upgrade anytime from Pricing.')}
                </Text>
              </Box>
            )}
          </Box>
        )}


        {/* Contact Information Section - Always Visible */}
        {!loading && user && (
          <Box mx="auto" w="full" p={6} className="vl-glass-card" borderRadius="2xl" borderLeft="4px solid var(--vl-color-brand)">
            <Heading size="md" color="var(--vl-color-text-primary)" mb={4}>
              📞 {t('profile.contact.title', 'Contact Information')}
            </Heading>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontSize="sm" color="var(--vl-color-text-secondary)" mb={2}>
                  {t('profile.contact.description', 'Your contact details for reaching out to our listeners. You can call us directly or schedule a Google Meet session.')}
                </Text>
              </Box>

              {/* Direct Call Option */}
              <Box p={4} bg="var(--vl-bg-glass)" borderRadius="lg" border="1px solid var(--vl-border-glass)">
                <Text fontWeight="600" color="var(--vl-color-text-primary)" mb={2}>
                  ☎️ {t('profile.contact.callUs', 'Call Us Directly')}
                </Text>
                <Text fontSize="lg" color="var(--vl-color-brand)" fontWeight="600">
                  +91 8105568665
                </Text>
                <Text fontSize="sm" color="var(--vl-color-text-secondary)" mt={1}>
                  {t('profile.contact.callHours', 'Available 8 AM - 8 PM IST')}
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Schedule Google Meet Section - Separate from Contact Info */}
        {!loading && user && (
          <Box mx="auto" w="full" p={6} className="vl-glass-card vl-cid-profile-inperson-card" data-cid="profile-inperson-card" borderRadius="2xl">
            <Heading size="md" color="var(--vl-color-text-primary)" mb={4}>
              {t('profile.inPerson.title', 'Schedule Google Meet Session 📅')}
            </Heading>

            <VStack align="stretch" spacing={4}>
              <Text className="vl-text-secondary" fontSize="sm">
                {(() => {
                  const trial = usage?.inPersonSessions?.trialRemaining ?? user?.trialHumanCallsRemaining ?? 3;
                  const limit = usage?.inPersonSessions?.limit ?? 0;
                  const used = usage?.inPersonSessions?.used ?? 0;

                  if (limit > 0) {
                    const remaining = Math.max(0, limit - used);
                    return t('profile.inPerson.descriptionPaid', {
                      count: remaining
                    });
                  } else if (trial > 0) {
                    return t('profile.inPerson.descriptionTrial', {
                      count: trial
                    });
                  } else {
                    return t('profile.inPerson.descriptionNone', 'Upgrade to a paid plan to unlock Google Meet sessions with our caring listeners.');
                  }
                })()}
              </Text>

              {(() => {
                const trial = usage?.inPersonSessions?.trialRemaining ?? user?.trialHumanCallsRemaining ?? 3;
                const limit = usage?.inPersonSessions?.limit ?? 0;
                const used = usage?.inPersonSessions?.used ?? 0;
                const hasAccess = (limit > 0 && used < limit) || trial > 0;

                if (hasAccess) {
                  return (
                    <Button
                      leftIcon={<FiVideo />}
                      variant="outline"
                      borderColor="var(--vl-color-brand)"
                      color="var(--vl-color-brand)"
                      _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
                      onClick={onBookingModalOpen}
                      w="full"
                      minH="48px"
                      size="sm"
                    >
                      {t('profile.inPerson.scheduleGoogleMeet', '📅 Schedule Session')}
                    </Button>
                  );
                } else {
                  return (
                    <Button
                      as={RouterLink}
                      to="/pricing"
                      variant="outline"
                      borderColor="var(--vl-color-brand)"
                      color="var(--vl-color-brand)"
                      _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
                      w="full"
                      minH="48px"
                      size="sm"
                    >
                      {t('profile.inPerson.upgradeToPlan', 'Upgrade to Unlock')}
                    </Button>
                  );
                }
              })()}

              <Box p={3} bg="var(--vl-bg-glass)" borderRadius="md" borderLeft="3px solid var(--vl-color-brand)">
                <Text fontSize="xs" color="var(--vl-color-text-secondary)">
                  {t('profile.inPerson.note', '💡 Note: In-person sessions are with trained listeners who provide a safe, judgment-free space. All conversations are confidential.')}
                </Text>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Booking History Section */}
        {!loading && user && (
          <Box mx="auto" w="full" p={6} className="vl-glass-card" borderRadius="2xl">
            <Heading size="md" color="var(--vl-color-text-primary)" mb={4}>
              {t('profile.bookings.title', '📅 My Bookings')}
            </Heading>

            <Tabs variant="unstyled" onChange={(index) => {
              const filters = ['upcoming', 'past', 'cancelled'];
              setBookingFilter(filters[index]);
            }}>
              <TabList mb={4} flexWrap="wrap" gap={2}>
                <Tab
                  _selected={{
                    borderColor: 'var(--vl-color-brand)',
                    color: 'var(--vl-color-brand)',
                    bg: 'transparent',
                    borderBottomWidth: '2px'
                  }}
                  color="var(--vl-color-text-secondary)"
                  borderBottomWidth="2px"
                  borderColor="transparent"
                  _hover={{ color: 'var(--vl-color-brand)' }}
                  pb={2}
                >
                  {t('profile.bookings.upcoming', 'Upcoming')}
                </Tab>
                <Tab
                  _selected={{
                    borderColor: 'var(--vl-color-brand)',
                    color: 'var(--vl-color-brand)',
                    bg: 'transparent',
                    borderBottomWidth: '2px'
                  }}
                  color="var(--vl-color-text-secondary)"
                  borderBottomWidth="2px"
                  borderColor="transparent"
                  _hover={{ color: 'var(--vl-color-brand)' }}
                  pb={2}
                >
                  {t('profile.bookings.past', 'Past')}
                </Tab>
                <Tab
                  _selected={{
                    borderColor: 'var(--vl-color-brand)',
                    color: 'var(--vl-color-brand)',
                    bg: 'transparent',
                    borderBottomWidth: '2px'
                  }}
                  color="var(--vl-color-text-secondary)"
                  borderBottomWidth="2px"
                  borderColor="transparent"
                  _hover={{ color: 'var(--vl-color-brand)' }}
                  pb={2}
                >
                  {t('profile.bookings.cancelled', 'Cancelled')}
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  {bookingsLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner color="var(--vl-color-brand)" />
                    </Flex>
                  ) : bookings.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Text color="var(--vl-color-text-secondary)">
                        {t('profile.bookings.noUpcoming', 'No upcoming bookings')}
                      </Text>
                      <Button
                        mt={4}
                        size="sm"
                        bg="var(--vl-color-brand)"
                        color="white"
                        _hover={{ opacity: 0.9 }}
                        onClick={onBookingModalOpen}
                      >
                        {t('profile.bookings.scheduleFirst', 'Schedule Your First Session')}
                      </Button>
                    </Box>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onUpdate={() => fetchBookings(bookingFilter)} />
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                <TabPanel px={0}>
                  {bookingsLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner color="var(--vl-color-brand)" />
                    </Flex>
                  ) : bookings.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Text color="var(--vl-color-text-secondary)">
                        {t('profile.bookings.noPast', 'No past bookings')}
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onUpdate={() => fetchBookings(bookingFilter)} />
                      ))}
                    </VStack>
                  )}
                </TabPanel>

                <TabPanel px={0}>
                  {bookingsLoading ? (
                    <Flex justify="center" py={8}>
                      <Spinner color="var(--vl-color-brand)" />
                    </Flex>
                  ) : bookings.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Text color="var(--vl-color-text-secondary)">
                        {t('profile.bookings.noCancelled', 'No cancelled bookings')}
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onUpdate={() => fetchBookings(bookingFilter)} />
                      ))}
                    </VStack>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}

        {/* Security Note */}
        <Box  mx="auto" w="full" p={4} bg="var(--vl-bg-glass)" borderRadius="lg" borderLeft="4px solid var(--vl-color-brand)" className="vl-cid-profile-security-note" data-cid="profile-security-note">
          <Text fontSize="sm" color="var(--vl-color-text-secondary)" lineHeight="1.7">
            {t('profile.securityNote', '🔒 **Aapki Privacy Humari Zimmedari Hai:** Your data is encrypted and never shared with anyone. You\'re in control.')}
          </Text>
        </Box>

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={onBookingModalClose}
          onSuccess={() => {
            fetchBookings('upcoming');
            // Refresh usage data
            window.dispatchEvent(new Event('vl-subscription-changed'));
          }}
        />

        {/* Cancel Membership Confirmation Modal */}
        <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered>
          <ModalOverlay bg="rgba(0,0,0,0.72)" backdropFilter="blur(2px)" />
          <ModalContent bg="var(--vl-color-bg)" color="var(--vl-color-text-primary)" border="1px solid var(--vl-border-outline)">
            <ModalHeader>{t('profile.subscription.cancel', 'Cancel Membership')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text className="vl-text-secondary">
                {t('profile.subscription.cancelConfirm', 'Are you sure you want to cancel your membership?')}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Stack direction="row" spacing={3}>
                <Button variant="ghost" onClick={onCancelClose} color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-bg-glass)' }}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={async () => { await handleCancelMembership(); onCancelClose(); }} isLoading={subLoading} bgGradient="var(--vl-gradient-cta)" color="white" _hover={{ opacity: 0.9 }}>
                  {t('profile.subscription.cancel', 'Cancel Membership')}
                </Button>
              </Stack>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </VStack>
    </Flex>
  );
};

export default Profile;

