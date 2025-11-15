import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
  Portal,
  useDisclosure,
  Box,
} from '@chakra-ui/react';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { LANGUAGES } from '../../constants/languages';

/**
 * Language selector dropdown component
 * @param {Object} props
 * @param {Object} props.selectedLanguage - Currently selected language object
 * @param {Function} props.onLanguageChange - Callback when language changes
 * @param {string} props.tooltip - Tooltip text
 */
const LanguageSelector = ({ selectedLanguage, onLanguageChange, tooltip }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Menu placement="bottom-end" strategy="fixed" isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <MenuButton
        as={Button}
        variant="outline"
        size="sm"
        leftIcon={<FiGlobe />}
        rightIcon={<FiChevronDown />}
        title={tooltip}
        color="var(--vl-color-text-primary)"
        bg="var(--vl-bg-glass)"
        borderColor="var(--vl-border-glass)"
        _hover={{ color: 'var(--vl-color-brand)', bg: 'var(--vl-bg-glass-strong)' }}
      >
        <HStack spacing={2}>
          <Text>{selectedLanguage.flag}</Text>
          <Text display={{ base: 'none', md: 'block' }}>
            {selectedLanguage.name}
          </Text>
        </HStack>
      </MenuButton>
      {isOpen && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.6)"
            backdropFilter="blur(2px)"
            zIndex={9995}
            onClick={onClose}
          />
        </Portal>
      )}
      {isOpen && (
        <Portal>
          <MenuList
            maxH="400px"
            overflowY="auto"
            bg="var(--vl-bg-glass-strong)"
            color="var(--vl-color-text-primary)"
            borderColor="var(--vl-border-glass)"
            backdropFilter="blur(12px)"
            borderWidth="1px"
            zIndex={10010}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => onLanguageChange(lang)}
                color={selectedLanguage.code === lang.code ? 'white' : 'var(--vl-color-text-primary)'}
                fontWeight={selectedLanguage.code === lang.code ? '700' : '500'}
                bg={selectedLanguage.code === lang.code ? 'var(--vl-color-brand)' : 'transparent'}
                _hover={{ bg: selectedLanguage.code === lang.code ? 'var(--vl-color-brand)' : 'var(--vl-hover-bg)', color: 'var(--vl-color-brand)' }}
              >
                <HStack spacing={3}>
                  <Text fontSize="lg">{lang.flag}</Text>
                  <Text>{lang.name}</Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Portal>
      )}
    </Menu>
  );
};

export default LanguageSelector;

