/**
 * Main Utilities File
 * 
 * This file contains the core utility functions used throughout the Sandstone app.
 * For more specialized utilities, import from the specific modules in @/lib/utils/
 * 
 * @example
 * ```typescript
 * // Core utilities (from this file)
 * import { cn } from '@/lib/utils';
 * 
 * // Specialized utilities
 * import { formatDate } from '@/lib/utils/date';
 * import { truncate } from '@/lib/utils/string';
 * 
 * // Or import everything from the barrel
 * import { formatDate, truncate, clamp } from '@/lib/utils';
 * ```
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// Tailwind Class Utilities
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper precedence handling.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 * 
 * @example
 * ```tsx
 * <div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create a conditional class string based on breakpoints
 */
export function responsive(
  classes: {
    base?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
): string {
  const { base = '', sm = '', md = '', lg = '', xl = '', '2xl': xxl = '' } = classes;
  return cn(base, sm && `sm:${sm}`, md && `md:${md}`, lg && `lg:${lg}`, xl && `xl:${xl}`, xxl && `2xl:${xxl}`);
}

/**
 * Create hover/focus/active state classes
 */
export function states(
  classes: {
    base: string;
    hover?: string;
    focus?: string;
    active?: string;
    disabled?: string;
  }
): string {
  const { base, hover, focus, active, disabled } = classes;
  return cn(
    base,
    hover && `hover:${hover}`,
    focus && `focus:${focus}`,
    active && `active:${active}`,
    disabled && `disabled:${disabled}`
  );
}

/**
 * Create a variant-based class mapping
 */
export function variants<T extends string>(
  base: string,
  variantMap: Record<T, string>,
  defaultVariant?: T
): (variant?: T) => string {
  return (variant?: T) => {
    const selectedVariant = variant || defaultVariant;
    return cn(base, selectedVariant && variantMap[selectedVariant]);
  };
}

// ============================================================================
// Re-export all utilities from the utils directory
// ============================================================================

export * from './utils/index';

// ============================================================================
// Default export for convenience
// ============================================================================

export { cn as default };
