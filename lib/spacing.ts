/**
 * Sandstone Spacing System
 * 
 * A comprehensive spacing system based on a 4px base unit (0.25rem)
 * following the 8-point grid system with additional 4px increments.
 * 
 * This ensures consistent visual rhythm throughout the application.
 */

// ============================================
// BASE SPACING SCALE (4px base unit)
// ============================================

export const spacing = {
  // Micro spacing (4px - 12px)
  '0': '0',
  'px': '1px',
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px - base unit
  '1.5': '0.375rem',  // 6px
  '2': '0.5rem',      // 8px
  '2.5': '0.625rem',  // 10px
  '3': '0.75rem',     // 12px

  // Small spacing (16px - 28px)
  '3.5': '0.875rem',  // 14px
  '4': '1rem',        // 16px
  '4.5': '1.125rem',  // 18px
  '5': '1.25rem',     // 20px
  '5.5': '1.375rem',  // 22px
  '6': '1.5rem',      // 24px
  '7': '1.75rem',     // 28px

  // Medium spacing (32px - 48px)
  '8': '2rem',        // 32px
  '9': '2.25rem',     // 36px
  '10': '2.5rem',     // 40px
  '11': '2.75rem',    // 44px
  '12': '3rem',       // 48px

  // Large spacing (56px - 80px)
  '14': '3.5rem',     // 56px
  '16': '4rem',       // 64px
  '18': '4.5rem',     // 72px
  '20': '5rem',       // 80px

  // Extra large spacing (96px - 160px)
  '24': '6rem',       // 96px
  '28': '7rem',       // 112px
  '32': '8rem',       // 128px
  '36': '9rem',       // 144px
  '40': '10rem',      // 160px

  // Section spacing (192px - 320px)
  '44': '11rem',      // 176px
  '48': '12rem',      // 192px
  '52': '13rem',      // 208px
  '56': '14rem',      // 224px
  '60': '15rem',      // 240px
  '64': '16rem',      // 256px
  '72': '18rem',      // 288px
  '80': '20rem',      // 320px
} as const;

// ============================================
// SEMANTIC SPACING TOKENS
// ============================================

export const semanticSpacing = {
  // Component-level spacing
  component: {
    xs: spacing['1'],    // 4px - tight component padding
    sm: spacing['2'],    // 8px - compact component padding
    md: spacing['3'],    // 12px - default component padding
    lg: spacing['4'],    // 16px - relaxed component padding
    xl: spacing['6'],    // 24px - spacious component padding
  },

  // Content spacing
  content: {
    xs: spacing['2'],    // 8px - tight content gaps
    sm: spacing['3'],    // 12px - compact content gaps
    md: spacing['4'],    // 16px - default content gaps
    lg: spacing['6'],    // 24px - relaxed content gaps
    xl: spacing['8'],    // 32px - spacious content gaps
    '2xl': spacing['10'], // 40px - section content gaps
  },

  // Layout spacing
  layout: {
    xs: spacing['4'],    // 16px - minimal layout padding
    sm: spacing['6'],    // 24px - compact layout padding
    md: spacing['8'],    // 32px - default layout padding
    lg: spacing['12'],   // 48px - relaxed layout padding
    xl: spacing['16'],   // 64px - spacious layout padding
    '2xl': spacing['20'], // 80px - hero layout padding
  },

  // Section spacing (vertical rhythm)
  section: {
    xs: spacing['8'],    // 32px - minimal section spacing
    sm: spacing['12'],   // 48px - compact section spacing
    md: spacing['16'],   // 64px - default section spacing
    lg: spacing['20'],   // 80px - relaxed section spacing
    xl: spacing['24'],   // 96px - spacious section spacing
    '2xl': spacing['32'], // 128px - hero section spacing
  },

  // Grid gaps
  grid: {
    xs: spacing['1'],    // 4px - micro grid gaps
    sm: spacing['2'],    // 8px - compact grid gaps
    md: spacing['3'],    // 12px - default grid gaps
    lg: spacing['4'],    // 16px - relaxed grid gaps
    xl: spacing['6'],    // 24px - spacious grid gaps
    '2xl': spacing['8'], // 32px - large grid gaps
  },

  // Card spacing
  card: {
    xs: spacing['2'],    // 8px - micro card padding
    sm: spacing['3'],    // 12px - compact card padding
    md: spacing['4'],    // 16px - default card padding
    lg: spacing['5'],    // 20px - relaxed card padding
    xl: spacing['6'],    // 24px - spacious card padding
  },

  // Form spacing
  form: {
    label: spacing['1.5'],    // 6px - label to input
    field: spacing['4'],      // 16px - between form fields
    group: spacing['6'],      // 24px - between form groups
    section: spacing['8'],    // 32px - between form sections
  },

  // Button spacing
  button: {
    xs: `${spacing['2']} ${spacing['3']}`,     // 8px 12px
    sm: `${spacing['2.5']} ${spacing['4']}`,   // 10px 16px
    md: `${spacing['3']} ${spacing['5']}`,     // 12px 20px
    lg: `${spacing['3.5']} ${spacing['6']}`,   // 14px 24px
    xl: `${spacing['4']} ${spacing['8']}`,     // 16px 32px
    icon: spacing['2'],                         // 8px - icon-only buttons
  },
} as const;

// ============================================
// SPACING TYPE HELPERS
// ============================================

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingCategory = keyof typeof semanticSpacing;

// Helper to get spacing value
export const getSpacing = (key: SpacingKey): string => spacing[key];

// Helper to get semantic spacing
export const getSemanticSpacing = (
  category: SemanticSpacingCategory,
  size: keyof typeof semanticSpacing[SemanticSpacingCategory]
): string => {
  const cat = semanticSpacing[category];
  return cat[size as keyof typeof cat] as string;
};

// ============================================
// RESPONSIVE SPACING
// ============================================

export const responsiveSpacing = {
  // Container padding that adapts to screen size
  container: {
    DEFAULT: spacing['4'],    // 16px mobile
    sm: spacing['6'],         // 24px tablet
    md: spacing['8'],         // 32px desktop
    lg: spacing['12'],        // 48px large desktop
    xl: spacing['16'],        // 64px extra large
  },

  // Section padding that adapts to screen size
  section: {
    DEFAULT: spacing['12'],   // 48px mobile
    sm: spacing['16'],        // 64px tablet
    md: spacing['20'],        // 80px desktop
    lg: spacing['24'],        // 96px large desktop
    xl: spacing['32'],        // 128px extra large
  },

  // Stack spacing (vertical rhythm)
  stack: {
    xs: spacing['1'],         // 4px
    sm: spacing['2'],         // 8px
    md: spacing['3'],         // 12px
    lg: spacing['4'],         // 16px
    xl: spacing['6'],         // 24px
    '2xl': spacing['8'],      // 32px
    '3xl': spacing['12'],     // 48px
  },

  // Inline spacing (horizontal rhythm)
  inline: {
    xs: spacing['1'],         // 4px
    sm: spacing['2'],         // 8px
    md: spacing['3'],         // 12px
    lg: spacing['4'],         // 16px
    xl: spacing['6'],         // 24px
    '2xl': spacing['8'],      // 32px
  },
} as const;

// ============================================
// VISUAL RHYTHM CONSTANTS
// ============================================

export const visualRhythm = {
  // Base unit for all spacing calculations
  baseUnit: 4, // px

  // Common ratios for visual harmony
  ratios: {
    golden: 1.618,      // Golden ratio
    majorThird: 1.25,   // Major third (5:4)
    minorThird: 1.2,    // Minor third (6:5)
    perfectFourth: 1.333, // Perfect fourth (4:3)
    perfectFifth: 1.5,  // Perfect fifth (3:2)
  },

  // Rhythm multipliers (based on 4px unit)
  multipliers: {
    '0.5': 0.5,   // 2px
    '1': 1,       // 4px
    '2': 2,       // 8px
    '3': 3,       // 12px
    '4': 4,       // 16px
    '6': 6,       // 24px
    '8': 8,       // 32px
    '12': 12,     // 48px
    '16': 16,     // 64px
    '24': 24,     // 96px
    '32': 32,     // 128px
  },
} as const;

// ============================================
// CSS CUSTOM PROPERTIES GENERATOR
// ============================================

export const generateSpacingCSS = (): string => {
  const lines: string[] = [':root {'];
  
  // Base spacing variables
  Object.entries(spacing).forEach(([key, value]) => {
    const varName = key.includes('.') ? key.replace('.', '-') : key;
    lines.push(`  --space-${varName}: ${value};`);
  });

  // Semantic spacing variables
  Object.entries(semanticSpacing).forEach(([category, sizes]) => {
    Object.entries(sizes).forEach(([size, value]) => {
      lines.push(`  --space-${category}-${size}: ${value};`);
    });
  });

  lines.push('}');
  return lines.join('\n');
};

// ============================================
// TAILWIND CONFIG EXTENSION
// ============================================

export const tailwindSpacingConfig = {
  ...spacing,
  // Additional custom spacing
  '18': '4.5rem',     // 72px
  '22': '5.5rem',     // 88px
  '26': '6.5rem',     // 104px
  '30': '7.5rem',     // 120px
  '34': '8.5rem',     // 136px
  '38': '9.5rem',     // 152px
  '42': '10.5rem',    // 168px
  '46': '11.5rem',    // 184px
  '50': '12.5rem',    // 200px
  '54': '13.5rem',    // 216px
  '58': '14.5rem',    // 232px
  '62': '15.5rem',    // 248px
  '66': '16.5rem',    // 264px
  '68': '17rem',      // 272px
  '70': '17.5rem',    // 280px
  '74': '18.5rem',    // 296px
  '76': '19rem',      // 304px
  '78': '19.5rem',    // 312px
  '82': '20.5rem',    // 328px
  '84': '21rem',      // 336px
  '88': '22rem',      // 352px
  '90': '22.5rem',    // 360px
  '92': '23rem',      // 368px
  '94': '23.5rem',    // 376px
  '96': '24rem',      // 384px
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate spacing based on multiplier
 */
export const calculateSpacing = (multiplier: number): string => {
  return `${multiplier * 0.25}rem`;
};

/**
 * Convert px to rem
 */
export const pxToRem = (px: number): string => {
  return `${px / 16}rem`;
};

/**
 * Convert rem to px
 */
export const remToPx = (rem: string): number => {
  const value = parseFloat(rem.replace('rem', ''));
  return value * 16;
};

/**
 * Clamp spacing value between min and max
 */
export const clampSpacing = (
  value: string,
  min: string,
  max: string
): string => {
  const valPx = remToPx(value);
  const minPx = remToPx(min);
  const maxPx = remToPx(max);
  
  const clamped = Math.min(Math.max(valPx, minPx), maxPx);
  return pxToRem(clamped);
};

// ============================================
// SPACING PRESETS FOR COMPONENTS
// ============================================

export const spacingPresets = {
  // Page layout
  page: {
    padding: responsiveSpacing.container,
    maxWidth: '80rem', // 1280px
    gap: spacing['6'],
  },

  // Card layouts
  card: {
    padding: semanticSpacing.card.md,
    gap: spacing['3'],
    borderRadius: '0.75rem',
  },

  // Form layouts
  form: {
    fieldGap: semanticSpacing.form.field,
    groupGap: semanticSpacing.form.group,
    sectionGap: semanticSpacing.form.section,
  },

  // List layouts
  list: {
    itemGap: spacing['2'],
    sectionGap: spacing['6'],
    padding: spacing['4'],
  },

  // Navigation
  nav: {
    itemGap: spacing['1'],
    padding: spacing['3'],
    height: spacing['14'],
  },

  // Modal/Dialog
  modal: {
    padding: spacing['6'],
    gap: spacing['4'],
    maxWidth: '28rem',
  },

  // Toast/Notification
  toast: {
    padding: spacing['4'],
    gap: spacing['3'],
    maxWidth: '24rem',
  },
} as const;

export default spacing;
