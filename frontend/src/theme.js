import { extendTheme } from '@chakra-ui/react';

// Custom Chakra UI theme that completely disables color mode
const theme = extendTheme({
  config: {
    // Completely disable Chakra's color mode system
    useSystemColorMode: false,
    initialColorMode: 'light',
    disableTransitionOnChange: false,
  },
  styles: {
    global: () => ({
      // Force body to use our CSS variables
      'html, body': {
        bg: 'transparent !important',
        color: 'inherit !important',
      },
      // Prevent Chakra from adding any background colors
      '#root': {
        bg: 'transparent !important',
      },
    }),
  },
  // Override ALL Chakra color tokens to be transparent or inherit
  colors: {
    // Override Chakra's default color scheme
  },
  components: {
    Input: {
      defaultProps: { variant: 'outline' },
      variants: {
        outline: {
          field: {
            bg: 'var(--vl-bg-glass)',
            border: '1px solid var(--vl-border-outline)',
            color: 'var(--vl-color-text-primary)',
            _placeholder: { color: 'var(--vl-color-placeholder)' },
            _hover: { borderColor: 'var(--vl-border-outline)' },
            _focus: { borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' },
          },
        },
      },
    },
    Select: {
      defaultProps: { variant: 'outline' },
      variants: {
        outline: {
          field: {
            bg: 'var(--vl-bg-glass)',
            border: '1px solid var(--vl-border-outline)',
            color: 'var(--vl-color-text-primary)',
            _hover: { borderColor: 'var(--vl-border-outline)' },
            _focus: { borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' },
          },
          icon: { color: 'var(--vl-color-text-secondary)' },
        },
      },
    },
    Textarea: {
      defaultProps: { variant: 'outline' },
      variants: {
        outline: {
          bg: 'var(--vl-bg-glass)',
          border: '1px solid var(--vl-border-outline)',
          color: 'var(--vl-color-text-primary)',
          _placeholder: { color: 'var(--vl-color-placeholder)' },
          _hover: { borderColor: 'var(--vl-border-outline)' },
          _focus: { borderColor: 'var(--vl-color-brand)', boxShadow: '0 0 0 1px var(--vl-color-brand)' },
        },
      },
    },
  },
  semanticTokens: {
    colors: {
      // Disable all Chakra semantic tokens
      'chakra-body-bg': { _light: 'transparent', _dark: 'transparent' },
      'chakra-body-text': { _light: 'inherit', _dark: 'inherit' },
      'chakra-border-color': { _light: 'transparent', _dark: 'transparent' },
      'chakra-placeholder-color': { _light: 'inherit', _dark: 'inherit' },
    },
  },
});

export default theme;

