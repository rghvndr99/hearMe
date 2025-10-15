import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Text,
  HStack,
} from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { FaWater, FaTree, FaPalette } from 'react-icons/fa';
import { MdColorLens } from 'react-icons/md';

const themes = [
  {
    id: 'dark',
    name: 'Dark Mode',
    icon: FiMoon,
    description: 'Neo Expressionist',
  },
  {
    id: 'light',
    name: 'Light Mode',
    icon: FiSun,
    description: 'Soft & Warm',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: FaWater,
    description: 'Cool & Calming',
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: FaTree,
    description: 'Natural & Grounding',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: FaPalette,
    description: 'Warm & Energetic',
  },
];

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('hm-theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Sync color-scheme
    const colorScheme = (savedTheme === 'light') ? 'light' : 'dark';
    document.documentElement.style.colorScheme = colorScheme;
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('hm-theme', themeId);
    // Sync color-scheme
    const colorScheme = (themeId === 'light') ? 'light' : 'dark';
    document.documentElement.style.colorScheme = colorScheme;
  };

  const activeTheme = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        color="var(--hm-color-text-muted)"
        _hover={{ bg: 'var(--hm-hover-bg)' }}
        _active={{ bg: 'var(--hm-bg-glass)' }}
        leftIcon={<Icon as={activeTheme.icon} />}
        size="sm"
      >
        <Text display={{ base: 'none', md: 'inline' }}>{activeTheme.name}</Text>
      </MenuButton>
      <MenuList
        bg="var(--hm-color-bg)"
        borderColor="var(--hm-border-glass)"
        className="hm-glass-card"
      >
        {themes.map((theme) => (
          <MenuItem
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            bg={currentTheme === theme.id ? 'var(--hm-bg-glass-strong)' : 'transparent'}
            _hover={{ bg: 'var(--hm-hover-bg)' }}
            color="var(--hm-color-text-primary)"
          >
            <HStack spacing={3} w="full">
              <Icon as={theme.icon} color="var(--hm-color-brand)" />
              <Box flex="1">
                <Text fontWeight="600" fontSize="sm">
                  {theme.name}
                </Text>
                <Text fontSize="xs" color="var(--hm-color-text-secondary)">
                  {theme.description}
                </Text>
              </Box>
              {currentTheme === theme.id && (
                <Icon as={MdColorLens} color="var(--hm-color-brand)" />
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeToggle;

