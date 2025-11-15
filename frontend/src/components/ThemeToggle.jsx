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
import { useTranslation } from 'react-i18next';


const THEME_DEFS = [
  { id: 'dark', icon: FiMoon, nameKey: 'themes.dark.name', nameFallback: 'Dark Mode', descKey: 'themes.dark.description', descFallback: 'Neo Expressionist' },
  { id: 'light', icon: FiSun, nameKey: 'themes.light.name', nameFallback: 'Light Mode', descKey: 'themes.light.description', descFallback: 'Soft & Warm' },
  { id: 'ocean', icon: FaWater, nameKey: 'themes.ocean.name', nameFallback: 'Ocean', descKey: 'themes.ocean.description', descFallback: 'Cool & Calming' },
  { id: 'forest', icon: FaTree, nameKey: 'themes.forest.name', nameFallback: 'Forest', descKey: 'themes.forest.description', descFallback: 'Natural & Grounding' },
  { id: 'sunset', icon: FaPalette, nameKey: 'themes.sunset.name', nameFallback: 'Sunset', descKey: 'themes.sunset.description', descFallback: 'Warm & Energetic' },
];

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('vl-theme') || 'dark';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    // Sync color-scheme
    const colorScheme = (savedTheme === 'light') ? 'light' : 'dark';
    document.documentElement.style.colorScheme = colorScheme;
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('vl-theme', themeId);
    // Sync color-scheme
    const colorScheme = (themeId === 'light') ? 'light' : 'dark';
    document.documentElement.style.colorScheme = colorScheme;
  };

  const { t } = useTranslation('common');
  const themes = THEME_DEFS.map(def => ({
    ...def,
    name: t(def.nameKey, def.nameFallback),
    description: t(def.descKey, def.descFallback),
  }));

  const activeTheme = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        color="var(--vl-color-text-muted)"
        _hover={{ bg: 'var(--vl-hover-bg)' }}
        _active={{ bg: 'var(--vl-bg-glass)' }}
        leftIcon={<Icon as={activeTheme.icon} />}
        size="sm"
      >
        <Text display={{ base: 'none', md: 'inline' }}>{activeTheme.name}</Text>
      </MenuButton>
      <MenuList
        bg="var(--vl-color-bg)"
        borderColor="var(--vl-border-glass)"
        className="vl-glass-card"
      >
        {themes.map((theme) => (
          <MenuItem
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            bg={currentTheme === theme.id ? 'var(--vl-bg-glass-strong)' : 'transparent'}
            _hover={{ bg: 'var(--vl-hover-bg)' }}
            color="var(--vl-color-text-primary)"
          >
            <HStack spacing={3} w="full">
              <Icon as={theme.icon} color="var(--vl-color-brand)" />
              <Box flex="1">
                <Text fontWeight="600" fontSize="sm">
                  {theme.name}
                </Text>
                <Text fontSize="xs" color="var(--vl-color-text-secondary)">
                  {theme.description}
                </Text>
              </Box>
              {currentTheme === theme.id && (
                <Icon as={MdColorLens} color="var(--vl-color-brand)" />
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ThemeToggle;

