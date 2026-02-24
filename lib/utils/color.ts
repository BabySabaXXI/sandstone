/**
 * Color Manipulation Utilities
 * 
 * Helper functions for working with colors, including conversion
 * between formats, generating palettes, and calculating contrast.
 */

// ============================================================================
// Types
// ============================================================================

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface ColorPalette {
  base: string;
  light: string[];
  dark: string[];
  complement: string;
  analogous: string[];
  triadic: string[];
}

// ============================================================================
// Hex Color Functions
// ============================================================================

/**
 * Parse a hex color string to RGB values
 */
export function hexToRgb(hex: string): RGB | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Convert RGB values to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Validate hex color format
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Normalize hex color to 6-digit format
 */
export function normalizeHex(hex: string): string | null {
  if (!isValidHex(hex)) return null;
  
  const cleanHex = hex.replace('#', '');
  
  if (cleanHex.length === 3) {
    return '#' + cleanHex.split('').map((c) => c + c).join('');
  }
  
  return '#' + cleanHex.toLowerCase();
}

// ============================================================================
// RGB Functions
// ============================================================================

/**
 * Parse RGB string to RGB object
 */
export function parseRgb(rgbString: string): RGB | null {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}

/**
 * Convert RGB to RGB string
 */
export function rgbToString(r: number, g: number, b: number): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/**
 * Convert RGB to RGBA string
 */
export function rgbaToString(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

// ============================================================================
// HSL Functions
// ============================================================================

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert HSL to HSL string
 */
export function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/**
 * Parse HSL string to HSL object
 */
export function parseHsl(hslString: string): HSL | null {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return null;
  
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10),
    l: parseInt(match[3], 10),
  };
}

// ============================================================================
// HSV Functions
// ============================================================================

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h /= 360;
  s /= 100;
  v /= 100;
  
  let r = 0, g = 0, b = 0;
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// ============================================================================
// Color Manipulation
// ============================================================================

/**
 * Lighten a color by a percentage
 */
export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Darken a color by a percentage
 */
export function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Saturate a color by a percentage
 */
export function saturate(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.min(100, hsl.s + amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Desaturate a color by a percentage
 */
export function desaturate(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.max(0, hsl.s - amount);
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Rotate the hue of a color
 */
export function rotateHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;
  
  const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Invert a color
 */
export function invert(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * Get grayscale version of a color
 */
export function grayscale(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return rgbToHex(gray, gray, gray);
}

/**
 * Mix two colors together
 */
export function mix(color1: string, color2: string, weight: number = 50): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;
  
  const w = weight / 100;
  const w1 = w;
  const w2 = 1 - w;
  
  const r = Math.round(rgb1.r * w1 + rgb2.r * w2);
  const g = Math.round(rgb1.g * w1 + rgb2.g * w2);
  const b = Math.round(rgb1.b * w1 + rgb2.b * w2);
  
  return rgbToHex(r, g, b);
}

/**
 * Get the complementary color
 */
export function complement(hex: string): string {
  return rotateHue(hex, 180);
}

/**
 * Get analogous colors
 */
export function analogous(hex: string): [string, string] {
  return [rotateHue(hex, -30), rotateHue(hex, 30)];
}

/**
 * Get triadic colors
 */
export function triadic(hex: string): [string, string] {
  return [rotateHue(hex, 120), rotateHue(hex, 240)];
}

// ============================================================================
// Contrast & Accessibility
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get appropriate text color (black or white) for a background
 */
export function getContrastText(backgroundColor: string): '#000000' | '#FFFFFF' {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Check if a color combination meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if a color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

// ============================================================================
// Palette Generation
// ============================================================================

/**
 * Generate a color palette from a base color
 */
export function generatePalette(baseColor: string): ColorPalette {
  const rgb = hexToRgb(baseColor);
  if (!rgb) {
    return {
      base: baseColor,
      light: [],
      dark: [],
      complement: baseColor,
      analogous: [baseColor, baseColor],
      triadic: [baseColor, baseColor],
    };
  }
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Generate light variants
  const light: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const newHsl = { ...hsl, l: Math.min(95, hsl.l + i * 15) };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    light.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  
  // Generate dark variants
  const dark: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const newHsl = { ...hsl, l: Math.max(5, hsl.l - i * 15) };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    dark.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }
  
  return {
    base: baseColor,
    light,
    dark,
    complement: complement(baseColor),
    analogous: analogous(baseColor),
    triadic: triadic(baseColor),
  };
}

/**
 * Generate a gradient between two colors
 */
export function generateGradient(
  color1: string,
  color2: string,
  steps: number
): string[] {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return [color1, color2];
  
  const gradient: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
    gradient.push(rgbToHex(r, g, b));
  }
  
  return gradient;
}

/**
 * Generate random color
 */
export function randomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

/**
 * Generate a random pastel color
 */
export function randomPastelColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 25 + Math.floor(Math.random() * 25); // 25-50%
  const l = 75 + Math.floor(Math.random() * 15); // 75-90%
  
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// ============================================================================
// Tailwind Integration
// ============================================================================

/**
 * Subject color configurations for Sandstone
 */
export const SUBJECT_COLORS = {
  economics: {
    primary: '#3B82F6', // blue-500
    light: '#93C5FD',   // blue-300
    dark: '#1E40AF',    // blue-800
    bg: '#EFF6FF',      // blue-50
  },
  geography: {
    primary: '#10B981', // emerald-500
    light: '#6EE7B7',   // emerald-300
    dark: '#065F46',    // emerald-800
    bg: '#ECFDF5',      // emerald-50
  },
} as const;

/**
 * Get color configuration for a subject
 */
export function getSubjectColors(subject: 'economics' | 'geography') {
  return SUBJECT_COLORS[subject];
}

/**
 * Grade color mapping
 */
export const GRADE_COLORS = {
  'A*': '#10B981', // green-500
  'A': '#22C55E',  // green-500
  'B': '#3B82F6',  // blue-500
  'C': '#F59E0B',  // amber-500
  'D': '#F97316',  // orange-500
  'E': '#EF4444',  // red-500
  'U': '#6B7280',  // gray-500
} as const;

/**
 * Get color for a grade
 */
export function getGradeColor(grade: string): string {
  return GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || '#6B7280';
}

/**
 * Score color gradient (0-100)
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // green-500
  if (score >= 80) return '#22C55E'; // green-500
  if (score >= 70) return '#3B82F6'; // blue-500
  if (score >= 60) return '#F59E0B'; // amber-500
  if (score >= 50) return '#F97316'; // orange-500
  if (score >= 40) return '#EF4444'; // red-500
  return '#DC2626'; // red-600
}

/**
 * Get Tailwind class for a score
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get background color class for a score
 */
export function getScoreBgClass(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-blue-100 text-blue-800';
  if (score >= 50) return 'bg-amber-100 text-amber-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}
