// Booking Card component for displaying individual bookings with actions
import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  useToast,
  IconButton,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { FiVideo, FiCalendar, FiClock, FiTrash2, FiEdit2, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function BookingCard({ booking, onUpdate }) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { isOpen, onToggle } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const slotTime = new Date(booking.slotTime);
  const isPast = slotTime < new Date();
  const canModify = booking.canModify && !isPast;

  // Get locale for date formatting
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

  const statusColors = {
    pending: 'yellow',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'blue',
  };

  const handleCancel = async () => {
    if (!window.confirm(t('booking.card.confirmCancel', 'Are you sure you want to cancel this booking?'))) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('vl-token');
      await axios.delete(`${API_URL}/api/bookings/${booking.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason: 'User cancelled' },
      });

      toast({
        title: t('booking.card.cancelSuccess', 'Booking Cancelled'),
        description: t('booking.card.cancelSuccessDesc', 'Your booking has been cancelled and removed from your calendar.'),
        status: 'success',
        duration: 4000,
      });

      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Cancel booking error:', err);
      toast({
        title: t('booking.card.cancelError', 'Cancellation Failed'),
        description: err.response?.data?.error || t('booking.card.cancelErrorDesc', 'Failed to cancel booking'),
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    // This would open a reschedule modal (to be implemented)
    toast({
      title: t('booking.card.rescheduleInfo', 'Reschedule Feature'),
      description: t('booking.card.rescheduleInfoDesc', 'Please cancel this booking and create a new one.'),
      status: 'info',
      duration: 4000,
    });
  };

  return (
    <Box
      p={4}
      bg="var(--vl-bg-glass)"
      borderRadius="lg"
      border="1px solid var(--vl-border-glass)"
      _hover={{ borderColor: 'var(--vl-color-brand)' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={1} flex={1}>
            <HStack>
              <FiCalendar color="var(--vl-color-brand)" />
              <Text color="var(--vl-color-text-primary)" fontWeight="600">
                {slotTime.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </HStack>
            <HStack>
              <FiClock color="var(--vl-color-text-secondary)" size={14} />
              <Text color="var(--vl-color-text-secondary)" fontSize="sm">
                {slotTime.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })} • {booking.duration} {t('booking.card.minutes', 'min')}
              </Text>
            </HStack>
          </VStack>

          <Badge colorScheme={statusColors[booking.status]} fontSize="xs" px={2} py={1} borderRadius="md">
            {booking.status.toUpperCase()}
          </Badge>
        </HStack>

        {/* Actions */}
        {booking.status === 'confirmed' && (
          <HStack spacing={2} flexWrap="wrap">
            {booking.meetLink && (
              <Button
                as="a"
                href={booking.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                leftIcon={<FiVideo />}
                variant="outline"
                borderColor="var(--vl-color-brand)"
                color="var(--vl-color-brand)"
                _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
                flex={1}
                minW="120px"
              >
                {t('booking.card.joinMeet', 'Join Meet')}
              </Button>
            )}
            {booking.calendarLink && (
              <IconButton
                as="a"
                href={booking.calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                icon={<FiExternalLink />}
                variant="outline"
                borderColor="var(--vl-color-brand)"
                color="var(--vl-color-brand)"
                _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
                aria-label="View in Calendar"
                title={t('booking.card.viewCalendar', 'View in Calendar')}
              />
            )}
          </HStack>
        )}

        {/* Modify/Cancel Buttons */}
        {canModify && (
          <HStack spacing={2} flexWrap="wrap">
            <Button
              size="sm"
              leftIcon={<FiEdit2 />}
              variant="outline"
              borderColor="var(--vl-color-brand)"
              color="var(--vl-color-brand)"
              _hover={{ bg: 'var(--vl-color-brand)', color: 'white' }}
              onClick={handleReschedule}
              flex={1}
              minW="100px"
            >
              {t('booking.card.reschedule', 'Reschedule')}
            </Button>
            <Button
              size="sm"
              leftIcon={<FiTrash2 />}
              variant="outline"
              borderColor="red.400"
              color="red.400"
              _hover={{ bg: 'red.400', color: 'white' }}
              onClick={handleCancel}
              isLoading={loading}
              flex={1}
              minW="100px"
            >
              {t('booking.card.cancel', 'Cancel')}
            </Button>
          </HStack>
        )}

        {/* Expandable Details */}
        {(booking.notes || booking.rescheduledFrom || booking.cancellationReason) && (
          <>
            <Button
              size="xs"
              variant="ghost"
              rightIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
              onClick={onToggle}
              color="var(--vl-color-text-secondary)"
            >
              {isOpen ? t('booking.card.hideDetails', 'Hide Details') : t('booking.card.showDetails', 'Show Details')}
            </Button>

            <Collapse in={isOpen}>
              <VStack align="stretch" spacing={2} pt={2} borderTop="1px solid var(--vl-border-glass)">
                {booking.notes && (
                  <Box>
                    <Text fontSize="xs" color="var(--vl-color-text-secondary)" fontWeight="600">
                      {t('booking.card.notes', 'Notes')}:
                    </Text>
                    <Text fontSize="sm" color="var(--vl-color-text-primary)">
                      {booking.notes}
                    </Text>
                  </Box>
                )}
                {booking.rescheduledFrom && (
                  <Text fontSize="xs" color="var(--vl-color-text-secondary)">
                    {t('booking.card.rescheduled', 'Rescheduled from')}: {new Date(booking.rescheduledFrom).toLocaleString('en-IN')}
                  </Text>
                )}
                {booking.cancellationReason && (
                  <Text fontSize="xs" color="var(--vl-color-text-secondary)">
                    {t('booking.card.cancelReason', 'Cancellation reason')}: {booking.cancellationReason}
                  </Text>
                )}
              </VStack>
            </Collapse>
          </>
        )}

        {!canModify && booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <Text fontSize="xs" color="var(--vl-color-text-secondary)" fontStyle="italic">
            {t('booking.card.cannotModify', '⚠️ Cannot modify within 24 hours of scheduled time')}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
