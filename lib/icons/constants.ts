/**
 * Icon System Constants
 * 
 * Centralized configuration for icon sizes, colors, and animations
 */

import { IconSizeConfig, IconColorConfig, IconSize, IconColor, IconAnimation } from "./types";

// ============================================================================
// Size Configurations
// ============================================================================

/**
 * Icon size configurations mapped to Tailwind classes and pixel values
 */
export const ICON_SIZES: Record<IconSize, IconSizeConfig> = {
  xs: { className: "w-3 h-3", px: 12 },
  sm: { className: "w-4 h-4", px: 16 },
  md: { className: "w-5 h-5", px: 20 },
  lg: { className: "w-6 h-6", px: 24 },
  xl: { className: "w-8 h-8", px: 32 },
  "2xl": { className: "w-10 h-10", px: 40 },
  "3xl": { className: "w-12 h-12", px: 48 },
};

// ============================================================================
// Color Configurations
// ============================================================================

/**
 * Icon color configurations mapped to Tailwind classes
 */
export const ICON_COLORS: Record<IconColor, IconColorConfig> = {
  default: { className: "text-foreground", value: "currentColor" },
  primary: { className: "text-primary", value: "hsl(var(--primary))" },
  secondary: { className: "text-secondary", value: "hsl(var(--secondary))" },
  muted: { className: "text-muted-foreground", value: "hsl(var(--muted-foreground))" },
  accent: { className: "text-accent", value: "hsl(var(--accent))" },
  success: { className: "text-emerald-500", value: "#10b981" },
  warning: { className: "text-amber-500", value: "#f59e0b" },
  error: { className: "text-destructive", value: "hsl(var(--destructive))" },
  info: { className: "text-blue-500", value: "#3b82f6" },
};

// ============================================================================
// Animation Configurations
// ============================================================================

/**
 * Animation CSS classes for icons
 */
export const ICON_ANIMATIONS: Record<IconAnimation, string> = {
  none: "",
  spin: "animate-spin",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  shake: "animate-[shake_0.5s_ease-in-out_infinite]",
  fade: "animate-[fadeIn_0.3s_ease-in-out]",
};

// ============================================================================
// Accessibility Constants
// ============================================================================

/**
 * Default ARIA attributes for different icon use cases
 */
export const ICON_ACCESSIBILITY = {
  /** Default attributes for decorative icons */
  decorative: {
    "aria-hidden": true,
    focusable: false,
    role: "presentation",
  },
  /** Default attributes for interactive icons */
  interactive: {
    role: "button",
    tabIndex: 0,
  },
  /** Default attributes for status icons */
  status: {
    role: "img",
    "aria-live": "polite",
  },
} as const;

// ============================================================================
// Common Icon Sizes for Components
// ============================================================================

/**
 * Standard icon sizes for common UI components
 */
export const COMPONENT_ICON_SIZES = {
  /** Button icon sizes */
  button: {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    icon: "w-4 h-4",
  },
  /** Input icon sizes */
  input: {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-5 h-5",
  },
  /** Navigation icon sizes */
  navigation: {
    collapsed: "w-5 h-5",
    expanded: "w-5 h-5",
  },
  /** Card icon sizes */
  card: {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  },
  /** Alert icon sizes */
  alert: {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  },
} as const;

// ============================================================================
// Lazy Loading Configuration
// ============================================================================

/**
 * Configuration for lazy loading icons
 */
export const LAZY_ICON_CONFIG = {
  /** Threshold for intersection observer */
  threshold: 0.1,
  /** Root margin for intersection observer */
  rootMargin: "50px",
  /** Delay before loading icon (ms) */
  loadDelay: 100,
} as const;

// ============================================================================
// SVG Optimization Constants
// ============================================================================

/**
 * Default SVG attributes for optimized icons
 */
export const SVG_DEFAULTS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg",
};

/**
 * Common SVG paths for inline icons
 */
export const SVG_PATHS = {
  upload: {
    path: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8 12 3 7 8 M12 3v12",
    viewBox: "0 0 24 24",
  },
  file: {
    path: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6",
    viewBox: "0 0 24 24",
  },
  close: {
    path: "M18 6 6 18 M6 6l12 12",
    viewBox: "0 0 24 24",
  },
  user: {
    path: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    viewBox: "0 0 24 24",
  },
  check: {
    path: "M20 6 9 17l-5-5",
    viewBox: "0 0 24 24",
  },
  chevronDown: {
    path: "m6 9 6 6 6-6",
    viewBox: "0 0 24 24",
  },
  chevronUp: {
    path: "m18 15-6-6-6 6",
    viewBox: "0 0 24 24",
  },
  chevronLeft: {
    path: "m15 18-6-6 6-6",
    viewBox: "0 0 24 24",
  },
  chevronRight: {
    path: "m9 18 6-6-6-6",
    viewBox: "0 0 24 24",
  },
  search: {
    path: "m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    viewBox: "0 0 24 24",
  },
  spinner: {
    path: "M21 12a9 9 0 1 1-6.219-8.56",
    viewBox: "0 0 24 24",
  },
} as const;
