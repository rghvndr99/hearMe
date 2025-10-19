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
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        leftIcon={<FiGlobe />}
        rightIcon={<FiChevronDown />}
        title={tooltip}
        className="hm-language-selector"
      >
        <HStack spacing={2}>
          <Text>{selectedLanguage.flag}</Text>
          <Text display={{ base: 'none', md: 'block' }}>
            {selectedLanguage.name}
          </Text>
        </HStack>
      </MenuButton>
      <MenuList maxH="400px" overflowY="auto" className="hm-menu-list">
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang)}
            className={selectedLanguage.code === lang.code ? 'hm-menu-item-active' : 'hm-menu-item'}
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

