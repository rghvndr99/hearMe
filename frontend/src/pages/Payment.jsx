import React, { useEffect, useMemo, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Button, RadioGroup, Radio, Stack, Divider, Icon, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Center, Spinner, Image } from '@chakra-ui/react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiUser, FiMessageCircle, FiHome, FiArrowRight, FiTrendingUp, FiRotateCcw } from 'react-icons/fi';
import axios from 'axios';

const currency = (n) => `₹${n}`;

export default function Payment() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const upiModal = useDisclosure();
  const UPI_ID = 'voicelap@ybl';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('vl-token');
    if (!token) {
      const current = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/login?redirect=${encodeURIComponent(current)}`);
    }
  }, []);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialStatus = params.get('status') || 'pending';
  const plan = params.get('plan') || 'care';
  const billing = params.get('billing') || 'monthly';
  const initialPrice = Number(
    params.get('price') ?? (billing === 'annual' ? (plan === 'care' ? 209 : plan === 'companion' ? 349 : 0) : (plan === 'care' ? 299 : plan === 'companion' ? 499 : 0))
  );

  const [status, setStatus] = useState(initialStatus); // pending | success | failed | cancelled
  const [method, setMethod] = useState(params.get('method') || 'upi');
  const [countdown, setCountdown] = useState(8);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [price, setPrice] = useState(initialPrice);


  const upiPayUrl = useMemo(() => {
    const amt = Math.max(0, Number(price) || 0).toFixed(2);
    const tn = `VoiceLap ${t(`pricing.plans.${plan}`, plan)} (${t(`pricing.${billing}`, billing)})`;
    return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('VoiceLap')}&am=${encodeURIComponent(amt)}&cu=INR&tn=${encodeURIComponent(tn)}`;
  }, [UPI_ID, price, plan, billing, t]);

  // Prefer PhonePe app when available
  const phonePePayUrl = useMemo(() => {
    const amt = Math.max(0, Number(price) || 0).toFixed(2);
    const tn = `VoiceLap ${t(`pricing.plans.${plan}`, plan)} (${t(`pricing.${billing}`, billing)})`;
    return `phonepe://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent('VoiceLap')}&am=${encodeURIComponent(amt)}&cu=INR&tn=${encodeURIComponent(tn)}`;
  }, [UPI_ID, price, plan, billing, t]);

  const upiQrUrl = useMemo(() => {
    // Primary generator (no dependency install needed)
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayUrl)}`;
  }, [upiPayUrl]);

  const handleOpenUpi = () => {
    const ua = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
    if (isMobile) {
      // Try PhonePe first; fallback to generic UPI link
      const fallback = setTimeout(() => {
        window.location.href = upiPayUrl;
      }, 800);
      try {
        window.location.href = phonePePayUrl;
      } finally {
        setTimeout(() => clearTimeout(fallback), 2000);
      }
    } else {
      // Desktop: open PhonePe web
      window.open('https://www.phonepe.com/', '_blank', 'noopener');
    }
  };

  const isSuccess = status === 'success';
  const isPending = status === 'pending';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  useEffect(() => {
    if (isSuccess) {
      const id = setInterval(() => setCountdown((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(id);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess && countdown === 0) {
      // Redirect after success
      if (plan === 'free') navigate('/chat');
      else navigate('/profile');
    }
  }, [isSuccess, countdown]);

  // Fallback: if deep-linked without price param, fetch authoritative price from API
  useEffect(() => {
    const hasPriceParam = params.get('price');
    if (!hasPriceParam) {
      fetch(`${API_URL}/api/plans/${plan}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          let p = Number(data?.price ?? 0);
          const enableAnnual = import.meta.env.VITE_ENABLE_ANNUAL_PLANS === 'true';
          const disc = Number(import.meta.env.VITE_ANNUAL_DISCOUNT || '0.2');
          if (billing === 'annual' && enableAnnual) {
            p = Math.round(p * (1 - disc));
          }
          setPrice(p);
        })
        .catch(() => {});
    }
  }, [plan, billing, location.search]);

  const planLabel = t(`pricing.plans.${plan}`, plan);
  const billingLabel = t(`pricing.${billing}`, billing.charAt(0).toUpperCase() + billing.slice(1));

  const handleConfirm = () => {
    if (method === 'upi') {
      upiModal.onOpen();
    } else {
      toast({ title: t('payment.methods.unavailable', 'This method is currently unavailable'), status: 'warning', duration: 2000 });
    }
  };

  const handleMarkPaid = async () => {
    const token = localStorage.getItem('vl-token');
    try {
      const payload = { plan, billing, price: price, method: 'upi', upiId: UPI_ID };
      if (token) {
        await axios.post(`${API_URL}/api/subscriptions`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // Fallback to local storage if somehow not logged in
        localStorage.setItem('vl-subscription', JSON.stringify({ ...payload, activatedAt: new Date().toISOString() }));
      }
      window.dispatchEvent(new Event('vl-subscription-changed'));
      upiModal.onClose();
      setStatus('success');
      toast({ title: t('payment.toast.success', 'Payment successful'), status: 'success', duration: 1500 });
    } catch (err) {
      console.error('Save subscription error', err);
      toast({ title: t('errors.updateFailed', 'Failed to update profile'), status: 'error', duration: 2000 });
    }
  };

  const handleRetry = () => setStatus('pending');

  return (
    <Box className="vl-page-container vl-cid-payment-root" data-cid="payment-root">
      <Box className="vl-section" maxW="720px" mx="auto">
        <VStack spacing={4} align="stretch">
          <Heading as="h1" className="vl-heading-primary">{t('payment.title', 'Payment')}</Heading>
          <VStack align="stretch" spacing={1}>
            <Text className="vl-text-tertiary">
              {t('payment.subtitle.more1','Your payment unlocks premium features like extra voice minutes, custom VoiceTwins, and emotion-aware responses.')}
            </Text>
            <Text className="vl-text-tertiary">
              {t('payment.subtitle.more2','It helps us keep your conversations private and secure, and improve our AI for more natural, multilingual chats.')}
            </Text>
            <Text className="vl-text-tertiary">
              {t('payment.subtitle.more3','You can cancel anytime and get a refund for the remaining period, or upgrade anytime with credit adjusted towards the higher plan.')}
            </Text>
            <Text className="vl-text-tertiary">
              {t('pricing.disclaimer.anonymous','Connect anonymously — choose what you share and how you show up.')}
            </Text>
            <Text className="vl-text-tertiary">
              {t('pricing.disclaimer.storageChoice','You decide whether to store your chats/messages.')}
            </Text>
          </VStack>

          <Box border="1px solid var(--vl-border-subtle)" borderRadius="0.75rem" overflow="hidden">
            <Image
              src="/images/payment.png"
              alt={t('payment.bannerAlt', 'Secure UPI payments with PhonePe')}
              w="100%"
              objectFit="cover"
            />
          </Box>


          <Box className="vl-card vl-cid-payment-card" data-cid="payment-card" p={5}>
            {/* Status header */}
            <HStack spacing={3} align="center">
              <Icon
                as={isSuccess ? FiCheckCircle : isFailed ? FiXCircle : isCancelled ? FiAlertTriangle : FiAlertTriangle}
                color={isSuccess ? 'var(--vl-color-success)' : 'var(--vl-color-brand)'}
                boxSize={6}
              />
              <Heading as="h2" size="md" color="var(--vl-color-text-primary)">
                {isSuccess
                  ? t('payment.status.success.title', 'Payment successful')
                  : isFailed
                  ? t('payment.status.failed.title', 'Payment failed')
                  : isCancelled
                  ? t('payment.status.cancelled.title', 'Payment cancelled')
                  : t('payment.status.pending.title', 'Confirm your payment')}
              </Heading>
            </HStack>
            <Text className="vl-text-tertiary" mt={2}>
              {isSuccess
                ? t('payment.status.success.desc', 'Your subscription to {{plan}} ({{billing}}) is active.', { plan: planLabel, billing: billingLabel })
                : isFailed
                ? t('payment.status.failed.desc', "We couldn't process your payment. Try again or choose a different method.")
                : isCancelled
                ? t('payment.status.cancelled.desc', 'You cancelled the payment. No charges were made.')
                : t('payment.status.pending.desc', 'Select a payment method and confirm to complete your purchase.')}
            </Text>

            <Divider my={4} borderColor="var(--vl-border-subtle)" />

            {/* Details */}
            <HStack justify="space-between" mb={2}>
              <Text className="vl-text-secondary">{t('payment.labels.plan', 'Plan')}</Text>
              <Text color="var(--vl-color-text-primary)" fontWeight="600">{planLabel}</Text>
            </HStack>
            <HStack justify="space-between" mb={2}>
              <Text className="vl-text-secondary">{t('payment.labels.billing', 'Billing')}</Text>
              <Text color="var(--vl-color-text-primary)" fontWeight="600">{billingLabel}</Text>
            </HStack>
            <HStack justify="space-between" mb={4}>
              <Text className="vl-text-secondary">{t('payment.labels.amount', 'Amount')}</Text>
              <Text color="var(--vl-color-text-primary)" fontWeight="700">{currency(price)}</Text>
            </HStack>

            {isPending && (
              <>
                <Box mt={3} p={3} border="1px solid var(--vl-border-subtle)" bg="var(--vl-bg-glass)" borderRadius="0.75rem">
                  <VStack align="stretch" spacing={2}>
                    <HStack align="start" spacing={3}>
                      <Icon as={FiRotateCcw} color="var(--vl-color-brand)" mt="3px" />
                      <Text className="vl-text-secondary">
                        {t('payment.assurance.cancelRefund','Cancel anytime — your remaining period will be refunded back to you.')}
                      </Text>
                    </HStack>
                    <HStack align="start" spacing={3}>
                      <Icon as={FiTrendingUp} color="var(--vl-color-brand)" mt="3px" />
                      <Text className="vl-text-secondary">
                        {t('payment.assurance.upgradeCredit','Upgrade anytime — what you\'ve already paid will be adjusted towards the higher plan.')}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Text mb={2} className="vl-text-secondary">{t('payment.methods.title', 'Choose a payment method')}</Text>
                <RadioGroup onChange={setMethod} value={method}>
                  <Stack direction="row" spacing={6}>
                    <Radio value="upi">{t('payment.methods.upi', 'UPI')}</Radio>
                    <Radio value="card" isDisabled>{t('payment.methods.card', 'Card')}</Radio>
                    <Radio value="netbanking" isDisabled>{t('payment.methods.netbanking', 'Netbanking')}</Radio>
                  </Stack>
                </RadioGroup>
            {/* UPI Modal */}
            <Modal isOpen={upiModal.isOpen} onClose={upiModal.onClose} isCentered>
              <ModalOverlay bg="rgba(0,0,0,0.72)" backdropFilter="blur(2px)" />
              <ModalContent bg="var(--vl-bg-glass-strong)" borderColor="var(--vl-border-glass)" borderWidth="1px">
                <ModalHeader color="var(--vl-color-text-primary)">{t('payment.upi.title','Pay via UPI')}</ModalHeader>
                <ModalBody>
                  <VStack spacing={4} align="center">
                    <Text className="vl-text-secondary" textAlign="center">{t('payment.upi.scan','Scan this QR in your UPI app')}</Text>
                    <Box p={3} border="1px solid var(--vl-border-outline)" borderRadius="md" bg="var(--vl-color-bg)">
                      <Box position="relative" w="240px" h="240px">
                        {!qrLoaded && (
                          <Center position="absolute" inset={0}>
                            <Spinner thickness="3px" speed="0.6s" color="var(--vl-color-brand)" size="lg" />
                          </Center>
                        )}
                        <img
                          src={upiQrUrl}
                          alt="UPI QR"
                          width={240}
                          height={240}
                          style={{ display: 'block', opacity: qrLoaded ? 1 : 0 }}
                          onLoad={() => setQrLoaded(true)}
                          onError={(e) => {
                            // Fallback QR generator if the primary fails
                            e.currentTarget.src = `https://quickchart.io/qr?size=240&text=${encodeURIComponent(upiPayUrl)}`;
                          }}
                        />
                      </Box>
                    </Box>
                    <HStack spacing={2}>
                      <Button size="sm" variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }} onClick={async () => {
                        try { await navigator.clipboard?.writeText(UPI_ID); toast({ title: t('payment.upi.copyId','Copy UPI ID') + ' ✓', status: 'success', duration: 1200 }); } catch {}
                      }}>{t('payment.upi.copyId','Copy UPI ID')}</Button>
                    </HStack>
                    <HStack spacing={3}>
                      <Button className="vl-button-primary" onClick={handleOpenUpi}>{t('payment.upi.openApp','Open in UPI app')}</Button>
                      <Button variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }} onClick={handleMarkPaid}>{t('payment.upi.markPaid',"I've completed the payment")}</Button>
                    </HStack>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }} onClick={upiModal.onClose}>{t('common.close','Close')}</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

                <HStack spacing={3} mt={4}>
                  <Button className="vl-button-primary" onClick={handleConfirm} rightIcon={<FiArrowRight />}>{t('payment.actions.confirm', 'Confirm Payment')}</Button>
                  <Button variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }} onClick={() => setStatus('cancelled')}>{t('payment.actions.cancel', 'Cancel')}</Button>
                </HStack>
              </>
            )}

            {isSuccess && (
              <VStack align="stretch" spacing={3} mt={2}>
                <Text className="vl-text-tertiary">{t('pricing.disclaimer.anonymous','Connect anonymously — choose what you share and how you show up.')}</Text>
                <Text className="vl-text-tertiary">{t('pricing.disclaimer.storageChoice','You decide whether to store your chats/messages.')}</Text>

                <Text className="vl-text-tertiary">{t('payment.redirect', 'Redirecting in {{s}}s...', { s: countdown })}</Text>
                <HStack spacing={3} flexWrap="wrap">
                  <Button as={RouterLink} to="/profile" className="vl-button-primary" leftIcon={<FiUser />}>{t('payment.actions.profile', 'Go to Profile')}</Button>
                  <Button as={RouterLink} to="/chat" variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }} leftIcon={<FiMessageCircle />}>{t('payment.actions.chat', 'Go to Chat')}</Button>
                  <Button as={RouterLink} to="/pricing" variant="ghost" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>{t('payment.actions.pricing', 'Back to Pricing')}</Button>
                </HStack>
              </VStack>
            )}

            {(isFailed || isCancelled) && (
              <HStack spacing={3} mt={2}>
                {isFailed && (
                  <Button className="vl-button-primary" onClick={handleRetry}>{t('payment.actions.tryAgain', 'Try Again')}</Button>
                )}
                <Button as={RouterLink} to="/pricing" variant="outline" borderColor="var(--vl-border-outline)" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}>{t('payment.actions.pricing', 'Back to Pricing')}</Button>
                <Button as={RouterLink} to="/" variant="ghost" color="var(--vl-color-text-primary)" _hover={{ bg: 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }} leftIcon={<FiHome />}>{t('payment.actions.home', 'Go Home')}</Button>
              </HStack>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

