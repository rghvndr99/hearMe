import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
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
  return (
    <Menu placement="bottom-end" strategy="fixed">
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        leftIcon={<FiGlobe />}
        rightIcon={<FiChevronDown />}
        title={tooltip}
        color="var(--hm-color-text-muted)"
        _hover={{ color: 'var(--hm-color-brand)' }}
      >
        <HStack spacing={2}>
          <Text>{selectedLanguage.flag}</Text>
          <Text display={{ base: 'none', md: 'block' }}>
            {selectedLanguage.name}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList
        maxH="400px"
        overflowY="auto"
        bg="var(--hm-bg-glass)"
        borderColor="var(--hm-border-glass)"
        backdropFilter="blur(10px)"
        zIndex={1000}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang)}
            color={selectedLanguage.code === lang.code ? 'var(--hm-color-brand)' : 'var(--hm-color-text-primary)'}
            fontWeight={selectedLanguage.code === lang.code ? '700' : '500'}
            bg={selectedLanguage.code === lang.code ? 'var(--hm-bg-glass)' : 'transparent'}
            _hover={{ bg: 'var(--hm-bg-glass)', color: 'var(--hm-color-brand)' }}
          >
            <HStack spacing={3}>
              <Text fontSize="lg">{lang.flag}</Text>
              <Text>{lang.name}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSelector;

