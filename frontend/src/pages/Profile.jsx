import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, VStack, HStack, Stack, Button, useToast, FormControl, FormLabel, Input, Select, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton } from '@chakra-ui/react';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

import { useNavigate, Link as RouterLink } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';



const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const logout = () => {
    try { localStorage.removeItem('hm-token'); window.dispatchEvent(new Event('hm-auth-changed')); } catch {}

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
    const token = localStorage.getItem('hm-token');
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
          localStorage.setItem('hm-ui-language', payload.language);
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
          toast({ title: t('profile.messages.sessionExpired','⚠️ Session expired. Please login again to continue. 💜'), status: 'warning', duration: 3000, isClosable: true });
          try { localStorage.removeItem('hm-token'); window.dispatchEvent(new Event('hm-auth-changed')); } catch {}
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
    const token = localStorage.getItem('hm-token');
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
    window.addEventListener('hm-subscription-changed', handler);
    return () => window.removeEventListener('hm-subscription-changed', handler);
  }, []);



  async function handleCancelMembership() {
    const token = localStorage.getItem('hm-token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setSubLoading(true);
      await axios.patch(`${API_URL}/api/subscriptions/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: t('profile.subscription.cancelled', 'Membership cancelled'), status: 'success', duration: 2000 });
      window.dispatchEvent(new Event('hm-subscription-changed'));
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
        <VStack spacing={2} textAlign="center">
          <Heading
            as="h1"
            fontSize={["3xl", "4xl", "5xl"]}
            fontWeight="800"
            color="var(--hm-color-text-primary)"
            lineHeight="1.2"
          >
            {t('profile.title', 'Aapki Profile — Your Safe Space 💜')}
          </Heading>
          <Text fontSize="md" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('profile.intro', 'Yahan aap apni details dekh aur update kar sakte ho. Aapki privacy humari zimmedari hai. 💜')}
          </Text>
        </VStack>

        <Box mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
          <Stack direction={["column", "column", "row"]} justify="space-between" align={["stretch", "stretch", "center"]} mb={4} spacing={3}>
            <Heading size="md" color="var(--hm-color-text-primary)">{t('account.profile', 'Your Profile')}</Heading>
            <Stack direction={["column", "column", "row"]} spacing={2} w={["full", "full", "auto"]}>
              {!loading && user && !editMode && (
                <Button variant="outline" borderColor="var(--hm-border-outline)" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }} onClick={handleStartEdit} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.edit', 'Edit Karo (Edit)')}</Button>
              )}
              <Button variant="outline" borderColor="var(--hm-border-outline)" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }} onClick={logout} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.logout', 'Logout Karo (Sign Out)')}</Button>
            </Stack>
          </Stack>
          {loading && <Text color="var(--hm-color-text-secondary)">{t('common.loading', 'Loading...')}</Text>}
          {!loading && user && !editMode && (
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.username', 'Username (Aapka unique naam)')}</Text><Text color="var(--hm-color-text-primary)">{user.username}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.name', 'Naam (Your name)')}</Text><Text color="var(--hm-color-text-primary)">{user.name}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.email', 'Email address')}</Text><Text color="var(--hm-color-text-primary)">{user.email}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.phone', 'Phone number (optional)')}</Text><Text color="var(--hm-color-text-primary)">{user.phone || '-'}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.language', 'Pasandida bhasha (Preferred language)')}</Text><Text color="var(--hm-color-text-primary)">{user.language}</Text></HStack>
              <HStack justify="space-between"><Text color="var(--hm-color-text-secondary)">{t('profile.fields.memberSince', 'Member since (Aap kab se saath ho)')}</Text><Text color="var(--hm-color-text-primary)">{new Date(user.createdAt).toLocaleString()}</Text></HStack>
              <Stack direction={["column", "column", "row"]} pt={2} spacing={3} justify={["stretch", "stretch", "flex-end"]} w="full">
                <Button
                  as={RouterLink}
                  to="/change-email"
                  size="sm"
                  variant="outline"
                  borderColor="var(--hm-color-brand)"
                  color="var(--hm-color-brand)"
                  _hover={{ bg: 'var(--hm-color-brand)', color: 'white' }}
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
                  borderColor="var(--hm-color-brand)"
                  color="var(--hm-color-brand)"
                  _hover={{ bg: 'var(--hm-color-brand)', color: 'white' }}
                  w={["full", "full", "auto"]}
                  minH="48px"
                >
                  {t('profile.buttons.changePassword', 'Change Password')}
                </Button>
              </Stack>
            </VStack>
          )}
          {!loading && user && editMode && (
            <Box as="form" onSubmit={updateProfile}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.username', 'Username (Aapka unique naam)')}</FormLabel>
                  <Input
                    value={user.username}
                    isReadOnly
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.name', 'Naam (Your name)')}</FormLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                    placeholder={t('profile.placeholders.name', 'Aapka poora naam (Your full name)')}
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                    _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.phone', 'Phone number (optional)')}</FormLabel>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))}
                    placeholder={t('profile.placeholders.phone', 'Phone number (optional) — e.g., +91 98765 43210')}
                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _placeholder={{ color: 'var(--hm-color-placeholder)' }}
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                    _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="var(--hm-color-text-primary)">{t('profile.fields.language', 'Pasandida bhasha (Preferred language)')}</FormLabel>
                  <Select
                    value={form.language}
                    onChange={(e) => setForm(s => ({ ...s, language: e.target.value }))}

                    bg="var(--hm-bg-glass)"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _hover={{ borderColor: 'var(--hm-border-outline)' }}
                    _focus={{ borderColor: 'var(--hm-color-brand)', boxShadow: '0 0 0 1px var(--hm-color-brand)' }}
                  >
                    <option value="en" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.en','English')}</option>
                    <option value="hi" style={{ background: 'var(--hm-color-bg)', color: 'var(--hm-color-text-primary)' }}>{t('language.hi','हिंदी')}</option>
                  </Select>
                </FormControl>
                <Stack direction={["column", "column", "row"]} justify={["stretch", "stretch", "flex-end"]} spacing={3} w="full">
                  <Button variant="ghost" color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }} onClick={handleCancelEdit} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.cancel', 'Cancel Karo (Cancel)')}</Button>
                  <Button type="submit" isLoading={saving} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }} borderRadius="full" px={8} w={["full", "full", "auto"]} minH="48px">{t('profile.buttons.update', 'Update Karo (Save Changes) 💜')}</Button>
                </Stack>
              </VStack>
            </Box>
          )}
        </Box>

        {/* Subscription Section */}
        {!loading && user && (
          <Box mx="auto" w="full" p={6} className="hm-glass-card" borderRadius="2xl">
            <Stack direction={["column", "column", "row"]} justify="space-between" align={["stretch", "stretch", "center"]} mb={4} spacing={3}>
              <Heading size="md" color="var(--hm-color-text-primary)">{t('profile.subscription.title', 'Your Subscription')}</Heading>
              <Stack direction={["column", "column", "row"]} spacing={2} w={["full", "full", "auto"]}>
                <Button as={RouterLink} to="/pricing" className="hm-button-primary" w={["full", "full", "auto"]} minH="48px">
                  {t('profile.subscription.manage', 'Manage Subscription')}
                </Button>
                {subscription && subscription.status === 'active' && (
                  <Button
                    variant="outline"
                    borderColor="var(--hm-border-outline)"
                    color="var(--hm-color-text-primary)"
                    _hover={{ bg: 'var(--hm-bg-glass)' }}
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
              <Text className="hm-text-tertiary">{t('pricing.disclaimer.anonymous','Connect anonymously — choose what you share and how you show up.')}</Text>
              <Text className="hm-text-tertiary">{t('pricing.disclaimer.storageChoice','You decide whether to store your chats/messages.')}</Text>
            </VStack>

            {subscription ? (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between"><Text className="hm-text-secondary">{t('payment.labels.plan','Plan')}</Text><Text color="var(--hm-color-text-primary)" fontWeight="600">{t(`pricing.plans.${subscription.plan}`, subscription.plan)}</Text></HStack>
                <HStack justify="space-between"><Text className="hm-text-secondary">{t('payment.labels.billing','Billing')}</Text><Text color="var(--hm-color-text-primary)" fontWeight="600">{t(`pricing.${subscription.billing}`, subscription.billing)}</Text></HStack>
                <HStack justify="space-between"><Text className="hm-text-secondary">{t('payment.labels.amount','Amount')}</Text><Text color="var(--hm-color-text-primary)" fontWeight="700">₹{subscription.price}</Text></HStack>
                <HStack justify="space-between"><Text className="hm-text-secondary">{t('profile.subscription.status','Status')}</Text><Text color="var(--hm-color-text-primary)" fontWeight="600">{subscription.status}</Text></HStack>
                <HStack justify="space-between"><Text className="hm-text-secondary">{t('profile.subscription.nextBilling','Next billing')}</Text><Text color="var(--hm-color-text-primary)">{(() => { const d = computeNextBilling(subscription.activatedAt, subscription.billing); return d ? d.toLocaleString() : '-'; })()}</Text></HStack>

                <HStack justify="space-between"><Text className="hm-text-secondary">{t('profile.subscription.since','Active since')}</Text><Text color="var(--hm-color-text-primary)">{new Date(subscription.activatedAt).toLocaleString()}</Text></HStack>

                {usage && planConfig && (
                  <Box mt={4} p={4} bg="var(--hm-bg-glass)" borderRadius="lg">
                    <Text className="hm-text-secondary" mb={2}>{t('profile.subscription.usageTitle', 'Your usage')}</Text>

                    {/* Voice Twins usage */}
                    <HStack justify="space-between">
                      <Text className="hm-text-secondary">{planConfig.features?.voiceTwins?.label || 'Custom voices'}</Text>
                      <Text color="var(--hm-color-text-primary)" fontWeight="700">
                        {(usage.voiceTwins?.used ?? 0)} / {(usage.voiceTwins?.limit ?? planConfig.features?.voiceTwins?.limit ?? 0)}
                      </Text>
                    </HStack>
                    <Progress
                      value={(() => { const u = usage?.voiceTwins?.used ?? 0; const l = usage?.voiceTwins?.limit ?? planConfig?.features?.voiceTwins?.limit ?? 0; return l > 0 ? Math.min(100, (u / l) * 100) : 0; })()}
                      size="sm"
                      mt={2}
                      bg="var(--hm-bg-glass)"
                      sx={{ '& > div': { background: 'var(--hm-color-brand)' } }}
                    />

                    {/* Chat minutes usage */}
                    <HStack justify="space-between" mt={4}>
                      <Text className="hm-text-secondary">
                        {(planConfig.features?.chatMinutes?.label || 'Chat minutes')} {(() => { const p = usage?.chatMinutes?.period || planConfig?.features?.chatMinutes?.period; return p && p !== 'unlimited' ? `(${p})` : ''; })()}
                      </Text>
                      <Text color="var(--hm-color-text-primary)" fontWeight="700">
                        {(() => { const l = usage?.chatMinutes?.limit ?? planConfig?.features?.chatMinutes?.limit ?? 0; const u = usage?.chatMinutes?.used ?? 0; return l === -1 ? t('profile.subscription.unlimited','Unlimited') : `${u} / ${l}`; })()}
                      </Text>
                    </HStack>
                    {(() => { const l = usage?.chatMinutes?.limit ?? planConfig?.features?.chatMinutes?.limit ?? 0; const u = usage?.chatMinutes?.used ?? 0; return l > 0 ? (
                      <Progress value={Math.min(100, (u / l) * 100)} size="sm" mt={2} bg="var(--hm-bg-glass)" sx={{ '& > div': { background: 'var(--hm-color-brand)' } }} />
                    ) : null; })()}

                    {/* Reset info for monthly */}
                    <Text className="hm-text-tertiary" mt={2}>
                      {(() => { const p = usage?.chatMinutes?.period || planConfig?.features?.chatMinutes?.period; if (p === 'month') { const d = firstOfNextMonth(); return t('profile.subscription.resetsOn','Resets on') + ' ' + d.toLocaleDateString(); } if (p === 'week') { return t('profile.subscription.resetsWeekly','Resets on a rolling weekly window'); } return ''; })()}
                    </Text>
                  </Box>
                )}
              </VStack>
            ) : (
              <Box>
                <Text className="hm-text-secondary">
                  {t('profile.subscription.none', 'You are on the Free plan. Upgrade anytime from Pricing.')}
                </Text>
              </Box>
            )}
          </Box>
        )}


        {/* Security Note */}
        <Box  mx="auto" w="full" p={4} bg="var(--hm-bg-glass)" borderRadius="lg" borderLeft="4px solid var(--hm-color-brand)">
          <Text fontSize="sm" color="var(--hm-color-text-secondary)" lineHeight="1.7">
            {t('profile.securityNote', '🔒 **Aapki Privacy Humari Zimmedari Hai:** Your data is encrypted and never shared with anyone. You\'re in control.')}
          </Text>
        </Box>

        {/* Cancel Membership Confirmation Modal */}
        <Modal isOpen={isCancelOpen} onClose={onCancelClose} isCentered>
          <ModalOverlay bg="rgba(0,0,0,0.72)" backdropFilter="blur(2px)" />
          <ModalContent bg="var(--hm-color-bg)" color="var(--hm-color-text-primary)" border="1px solid var(--hm-border-outline)">
            <ModalHeader>{t('profile.subscription.cancel', 'Cancel Membership')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text className="hm-text-secondary">
                {t('profile.subscription.cancelConfirm', 'Are you sure you want to cancel your membership?')}
              </Text>
            </ModalBody>
            <ModalFooter>
              <Stack direction="row" spacing={3}>
                <Button variant="ghost" onClick={onCancelClose} color="var(--hm-color-text-primary)" _hover={{ bg: 'var(--hm-bg-glass)' }}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={async () => { await handleCancelMembership(); onCancelClose(); }} isLoading={subLoading} bgGradient="var(--hm-gradient-cta)" color="white" _hover={{ opacity: 0.9 }}>
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

