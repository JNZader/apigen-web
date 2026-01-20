import { createTheme, type MantineColorsTuple, virtualColor } from '@mantine/core';

/**
 * APiGen Studio Custom Theme
 * Brand colors inspired by Java's orange/red palette with modern tech aesthetics
 */

// Java-inspired orange palette (for accents and branding)
const javaOrange: MantineColorsTuple = [
  '#fff4e6',
  '#ffe8cc',
  '#ffd8a8',
  '#ffc078',
  '#ffa94d',
  '#ff922b', // Main Java orange
  '#fd7e14',
  '#f76707',
  '#e8590c',
  '#d9480f',
];

// Primary blue palette (for primary actions)
const techBlue: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#4dabf7',
  '#339af0', // Main tech blue
  '#228be6',
  '#1c7ed6',
  '#1971c2',
  '#1864ab',
];

export const theme = createTheme({
  // Primary color for buttons, links, focus states
  primaryColor: 'blue',

  // Custom colors
  colors: {
    java: javaOrange,
    tech: techBlue,
    // Virtual color that adapts to light/dark mode for surfaces
    surface: virtualColor({
      name: 'surface',
      dark: 'dark',
      light: 'gray',
    }),
  },

  // Typography
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Fira Code, Monaco, Consolas, monospace',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },

  // Border radius
  defaultRadius: 'md',

  // Component-specific customizations
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        overlayProps: {
          blur: 3,
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Notification: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        arrowSize: 6,
      },
    },
  },

  // Other settings
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,
});
