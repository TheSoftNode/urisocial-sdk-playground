// Brand colors - pink, white, dark, green, blue
export const colors = {
  // Primary colors
  pink: {
    50: '#fef1f7',
    100: '#fee5f0',
    200: '#ffcce3',
    300: '#ffa3cc',
    400: '#ff6ba9',
    500: '#f93a87',  // Main pink
    600: '#e71d6f',
    700: '#c9115a',
    800: '#a6134c',
    900: '#8a1342',
  },

  // Neutral (white to dark)
  gray: {
    50: '#fafafa',   // Near white
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',  // Dark
  },

  // Accent colors
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic colors
  white: '#ffffff',
  black: '#000000',

  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const brandColors = {
  primary: colors.pink[500],
  secondary: colors.blue[500],
  accent: colors.green[500],
  background: colors.white,
  surface: colors.gray[50],
  text: colors.gray[900],
  textLight: colors.gray[600],
  border: colors.gray[200],
  hover: colors.gray[100],
};
