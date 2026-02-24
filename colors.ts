/**
 * Sandstone Color System
 * A comprehensive, accessible color system for the Sandstone learning application
 * @version 1.0.0
 */

// Base color palettes
export const sand = {
  50: '#FAFAF8',
  100: '#F5F4F0',
  200: '#EBE9E3',
  300: '#DDDAD1',
  400: '#C4BFB3',
  500: '#A39E91',
  600: '#8A8579',
  700: '#706C62',
  800: '#57544C',
  900: '#3D3B36',
  950: '#242320',
} as const;

export const peach = {
  50: '#FDF8F5',
  100: '#FAF0EA',
  200: '#F5E0D4',
  300: '#EDC8B5',
  400: '#E2A88C',
  500: '#D48660',
  600: '#A65A36',
  700: '#8A4A2D',
  800: '#85462E',
  900: '#6D3C29',
  950: '#3A1E14',
} as const;

export const sage = {
  50: '#F6F8F6',
  100: '#E8F0E8',
  200: '#D2E2D2',
  300: '#AECBAE',
  400: '#82AD82',
  500: '#5E915E',
  600: '#3D6B3D',
  700: '#2F552F',
  800: '#2F4A2F',
  900: '#283D28',
  950: '#132113',
} as const;

export const blue = {
  50: '#F5F8FA',
  100: '#E8F1F7',
  200: '#D4E3EF',
  300: '#B5D0E5',
  400: '#8CB8D9',
  500: '#609CC8',
  600: '#3570A8',
  700: '#2A5A8A',
  800: '#2E5678',
  900: '#294864',
  950: '#142636',
} as const;

export const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EBEBEB',
  300: '#DDDDDD',
  400: '#C4C4C4',
  500: '#9E9E9E',
  600: '#6B6B6B',
  700: '#616161',
  800: '#444444',
  900: '#212121',
  950: '#0A0A0A',
} as const;

export const success = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  200: '#BBF7D0',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#15803D',
  700: '#14532D',
  800: '#166534',
  900: '#14532D',
  950: '#052E16',
} as const;

export const warning = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#A16207',
  700: '#854D0E',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
} as const;

export const error = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  300: '#FCA5A5',
  400: '#F87171',
  500: '#EF4444',
  600: '#B91C1C',
  700: '#991B1B',
  800: '#991B1B',
  900: '#7F1D1D',
  950: '#450A0A',
} as const;

export const info = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
  950: '#172554',
} as const;

// Semantic color tokens for Light theme
export const lightTheme = {
  background: {
    default: sand[50],
    primary: '#FFFFFF',
    secondary: sand[100],
    tertiary: sand[200],
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    inverse: neutral[900],
  },
  foreground: {
    default: neutral[900],
    primary: neutral[900],
    secondary: neutral[700],
    tertiary: neutral[500],
    quaternary: neutral[400],
    inverse: '#FFFFFF',
  },
  border: {
    default: sand[300],
    subtle: sand[200],
    strong: sand[400],
    focus: peach[400],
  },
  accent: {
    primary: peach[600],
    primaryHover: peach[700],
    primaryLight: peach[100],
    primaryLighter: peach[50],
    secondary: sage[600],
    secondaryHover: sage[700],
    secondaryLight: sage[100],
    secondaryLighter: sage[50],
    tertiary: blue[600],
    tertiaryHover: blue[700],
    tertiaryLight: blue[100],
    tertiaryLighter: blue[50],
  },
  status: {
    success: success[600],
    successLight: success[100],
    successLighter: success[50],
    warning: warning[600],
    warningLight: warning[100],
    warningLighter: warning[50],
    error: error[600],
    errorLight: error[100],
    errorLighter: error[50],
    info: info[600],
    infoLight: info[100],
    infoLighter: info[50],
  },
} as const;

// Semantic color tokens for Dark theme
export const darkTheme = {
  background: {
    default: '#0F0F0F',
    primary: '#141414',
    secondary: '#1A1A1A',
    tertiary: '#242424',
    elevated: '#1E1E1E',
    overlay: 'rgba(0, 0, 0, 0.8)',
    inverse: neutral[100],
  },
  foreground: {
    default: neutral[100],
    primary: neutral[100],
    secondary: neutral[300],
    tertiary: neutral[500],
    quaternary: neutral[600],
    inverse: neutral[900],
  },
  border: {
    default: '#2A2A2A',
    subtle: '#1F1F1F',
    strong: '#3A3A3A',
    focus: peach[400],
  },
  accent: {
    primary: peach[400],
    primaryHover: peach[300],
    primaryLight: '#2A2520',
    primaryLighter: '#1F1A16',
    secondary: sage[400],
    secondaryHover: sage[300],
    secondaryLight: '#1A251A',
    secondaryLighter: '#131F13',
    tertiary: blue[400],
    tertiaryHover: blue[300],
    tertiaryLight: '#1A2530',
    tertiaryLighter: '#131A24',
  },
  status: {
    success: success[400],
    successLight: '#0F2918',
    successLighter: '#0A1F12',
    warning: warning[400],
    warningLight: '#291E0A',
    warningLighter: '#1F1606',
    error: error[400],
    errorLight: '#290F0F',
    errorLighter: '#1F0A0A',
    info: info[400],
    infoLight: '#0F1A29',
    infoLighter: '#0A121F',
  },
} as const;

// Combined color system export
export const colors = {
  sand,
  peach,
  sage,
  blue,
  neutral,
  success,
  warning,
  error,
  info,
  light: lightTheme,
  dark: darkTheme,
} as const;

// Type exports for TypeScript
export type ColorScale = typeof sand;
export type SemanticColors = typeof lightTheme;
export type ThemeColors = typeof colors;

export default colors;
