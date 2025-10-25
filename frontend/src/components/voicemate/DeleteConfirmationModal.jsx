import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Button,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

/**
 * DeleteConfirmationModal
 * Extracted from VoiceMate.jsx to reduce file size and improve modularity.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - voice: { name?: string } | null
 * - onConfirm: function
 * - isDeleting: boolean
 */
export default function DeleteConfirmationModal({ isOpen, onClose, voice, onConfirm, isDeleting }) {
  const { t } = useTranslation('common');

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        bg="var(--hm-bg-glass)"
        borderColor="var(--hm-border-glass)"
        border="1px solid"
        backdropFilter="blur(10px)"
      >
        <ModalHeader color="var(--hm-color-text-primary)">
          {t('voicemate.confirmDelete', 'Delete Voice?')}
        </ModalHeader>
        <ModalCloseButton color="var(--hm-color-text-muted)" />
        <ModalBody>
          <VStack align="start" spacing={3}>
            <Text color="var(--hm-color-text-secondary)">
              {t('voicemate.deleteWarning', 'Are you sure you want to delete this voice? This action cannot be undone.')}
            </Text>
            {voice && (
              <HStack
                p={3}
                bg="var(--hm-bg-glass)"
                borderRadius="md"
                border="1px solid var(--hm-border-glass)"
                w="full"
              >
                <Icon as={FiStar} color="var(--hm-color-brand)" />
                <Text fontWeight="600" color="var(--hm-color-text-primary)">
                  {voice.name}
                </Text>
              </HStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              color="var(--hm-color-text-muted)"
              _hover={{ color: 'var(--hm-color-text-primary)', bg: 'var(--hm-bg-glass)' }}
            >
              {t('voicemate.cancel', 'Cancel')}
            </Button>
            <Button
              bgGradient="linear(to-r, red.500, red.600)"
              color="white"
              _hover={{ bgGradient: 'linear(to-r, red.600, red.700)' }}
              onClick={onConfirm}
              isLoading={!!isDeleting}
            >
              {t('voicemate.deleteConfirm', 'Delete')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

