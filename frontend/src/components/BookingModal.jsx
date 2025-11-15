// Booking Modal for scheduling in-person sessions with Google Meet
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Text,
  useToast,
  HStack,
  Box,
} from '@chakra-ui/react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function BookingModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Fixed values - no user selection needed
  const duration = 30; // Always 30 minutes
  const mode = 'voice_scheduled'; // Always voice call

  // Generate available dates (next 30 days, excluding past dates)
  useEffect(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    setAvailableDates(dates);
  }, []);

  // Generate time slots (8 AM - 8 PM, 30-min intervals)
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    const slots = [];
    const selectedDay = new Date(selectedDate + 'T00:00:00');
    const now = new Date();
    const minLeadTime = 30 * 60 * 1000; // 30 minutes

    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(selectedDay);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip if slot is in the past or within 30 min lead time
        if (slotTime.getTime() - now.getTime() < minLeadTime) {
          continue;
        }

        const timeStr = slotTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        slots.push({
          value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          label: timeStr,
          datetime: slotTime,
        });
      }
    }

    setAvailableTimeSlots(slots);
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: t('booking.error.selectDateTime', 'Please select date and time'),
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const slotDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

    setLoading(true);
    try {
      const token = localStorage.getItem('vl-token');
      const { data } = await axios.post(
        `${API_URL}/api/bookings/create`,
        {
          slotTime: slotDateTime.toISOString(),
          durationMinutes: duration,
          mode,
          notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: t('booking.success.title', '✅ Booking Confirmed!'),
        description: t('booking.success.description', 'Your Google Meet has been created. Check your calendar.'),
        status: 'success',
        duration: 5000,
      });

      if (onSuccess) onSuccess(data.booking);
      onClose();

      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (err) {
      console.error('Booking error:', err);
      
      if (err.response?.data?.needsAuth) {
        // User needs to connect Google Calendar
        toast({
          title: t('booking.error.needsAuth', 'Google Calendar Not Connected'),
          description: t('booking.error.needsAuthDesc', 'Please connect your Google Calendar first.'),
          status: 'warning',
          duration: 5000,
        });
      } else {
        toast({
          title: t('booking.error.title', 'Booking Failed'),
          description: err.response?.data?.error || t('booking.error.generic', 'Failed to create booking'),
          status: 'error',
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="var(--vl-overlay-bg-strong, rgba(0,0,0,0.7))" backdropFilter="blur(4px)" />
      <ModalContent bg="var(--vl-color-bg)" borderRadius="lg" border="1px solid var(--vl-border-glass)" mx={4}>
        <ModalHeader color="var(--vl-color-text-primary)" borderBottom="1px solid var(--vl-border-glass)">
          {t('booking.modal.title', '📅 Schedule In-Person Session')}
        </ModalHeader>
        <ModalCloseButton color="var(--vl-color-text-secondary)" />

        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            {/* Date Selector */}
            <FormControl isRequired>
              <FormLabel color="var(--vl-color-text-primary)" display="flex" alignItems="center" gap={2}>
                <FiCalendar /> {t('booking.modal.selectDate', 'Select Date')}
              </FormLabel>
              <Select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(''); // Reset time when date changes
                }}
                placeholder={t('booking.modal.chooseDatePlaceholder', 'Choose a date')}
                bg="var(--vl-bg-glass)"
                borderColor="var(--vl-border-glass)"
                color="var(--vl-color-text-primary)"
                _hover={{ borderColor: 'var(--vl-color-brand)' }}
                sx={{
                  '& option': {
                    bg: 'var(--vl-color-bg)',
                    color: 'var(--vl-color-text-primary)',
                  }
                }}
              >
                {availableDates.map((date) => (
                  <option key={date.value} value={date.value} style={{ backgroundColor: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>
                    {date.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Time Selector */}
            <FormControl isRequired isDisabled={!selectedDate}>
              <FormLabel color="var(--vl-color-text-primary)" display="flex" alignItems="center" gap={2}>
                <FiClock /> {t('booking.modal.selectTime', 'Select Time')}
              </FormLabel>
              <Select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                placeholder={t('booking.modal.chooseTimePlaceholder', 'Choose a time slot')}
                bg="var(--vl-bg-glass)"
                borderColor="var(--vl-border-glass)"
                color="var(--vl-color-text-primary)"
                _hover={{ borderColor: 'var(--vl-color-brand)' }}
                sx={{
                  '& option': {
                    bg: 'var(--vl-color-bg)',
                    color: 'var(--vl-color-text-primary)',
                  }
                }}
              >
                {availableTimeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value} style={{ backgroundColor: 'var(--vl-color-bg)', color: 'var(--vl-color-text-primary)' }}>
                    {slot.label}
                  </option>
                ))}
              </Select>
              {selectedDate && availableTimeSlots.length === 0 && (
                <Text fontSize="sm" color="var(--vl-color-text-secondary)" mt={2}>
                  {t('booking.modal.noSlotsAvailable', 'No available slots for this date')}
                </Text>
              )}
            </FormControl>

            {/* Session Info - Display only */}
            <Box p={3} bg="var(--vl-bg-glass)" borderRadius="md" borderLeft="3px solid var(--vl-color-brand)">
              <HStack spacing={4} fontSize="sm" color="var(--vl-color-text-secondary)">
                <Text>
                  ⏱️ {t('booking.modal.duration', 'Duration')}: <strong style={{ color: 'var(--vl-color-text-primary)' }}>30 {t('booking.modal.minutes', 'minutes')}</strong>
                </Text>
                <Text>
                  🎙️ {t('booking.modal.type', 'Type')}: <strong style={{ color: 'var(--vl-color-text-primary)' }}>{t('booking.modal.voice', 'Voice Call')}</strong>
                </Text>
              </HStack>
            </Box>

            {/* Notes */}
            <FormControl>
              <FormLabel color="var(--vl-color-text-primary)">
                {t('booking.modal.notes', 'Notes (Optional)')}
              </FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('booking.modal.notesPlaceholder', 'Any specific topics or concerns you\'d like to discuss...')}
                bg="var(--vl-bg-glass)"
                borderColor="var(--vl-border-glass)"
                color="var(--vl-color-text-primary)"
                rows={3}
                _hover={{ borderColor: 'var(--vl-color-brand)' }}
              />
            </FormControl>

            {/* Info Box */}
            <Box p={3} bg="var(--vl-bg-glass)" borderRadius="md" borderLeft="3px solid var(--vl-color-brand)">
              <Text fontSize="xs" color="var(--vl-color-text-secondary)">
                {t('booking.modal.info', '💡 A Google Meet link will be created and added to your calendar. You\'ll receive email reminders 24 hours and 30 minutes before the session.')}
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid var(--vl-border-glass)">
          <HStack spacing={3} w="full" justify="flex-end">
            <Button
              variant="ghost"
              onClick={onClose}
              color="var(--vl-color-text-secondary)"
              _hover={{ bg: 'var(--vl-bg-glass)' }}
            >
              {t('booking.modal.cancel', 'Cancel')}
            </Button>
            <Button
              bg="var(--vl-color-brand)"
              color="white"
              _hover={{ opacity: 0.9 }}
              onClick={handleSubmit}
              isLoading={loading}
              isDisabled={!selectedDate || !selectedTime}
            >
              {t('booking.modal.confirm', 'Confirm Booking')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

