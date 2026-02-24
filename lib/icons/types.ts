/**
 * Icon System Types
 * 
 * Centralized type definitions for the icon system
 */

import { LucideIcon } from "lucide-react";

// ============================================================================
// Icon Types
// ============================================================================

/** Size variants for icons */
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

/** Color variants for icons */
export type IconColor =
  | "default"
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info";

/** Icon animation types */
export type IconAnimation =
  | "none"
  | "spin"
  | "pulse"
  | "bounce"
  | "shake"
  | "fade";

/** Base icon props */
export interface BaseIconProps {
  /** Icon size */
  size?: IconSize | number;
  /** Icon color */
  color?: IconColor;
  /** Custom CSS class */
  className?: string;
  /** Animation type */
  animation?: IconAnimation;
  /** Whether the icon is decorative (no semantic meaning) */
  decorative?: boolean;
  /** Accessible label for screen readers */
  label?: string;
  /** ARIA hidden attribute */
  ariaHidden?: boolean;
  /** ARIA label attribute */
  ariaLabel?: string;
  /** ARIA labelledby attribute */
  ariaLabelledBy?: string;
  /** ARIA describedby attribute */
  ariaDescribedBy?: string;
  /** Tab index for focusable icons */
  tabIndex?: number;
  /** Click handler */
  onClick?: () => void;
  /** ID for referencing */
  id?: string;
}

/** SVG icon props */
export interface SVGIconProps extends BaseIconProps {
  /** SVG viewBox */
  viewBox?: string;
  /** SVG fill color */
  fill?: string;
  /** SVG stroke color */
  stroke?: string;
  /** SVG stroke width */
  strokeWidth?: number;
}

/** Lucide icon wrapper props */
export interface LucideIconWrapperProps extends BaseIconProps {
  /** Lucide icon component */
  icon: LucideIcon;
}

/** Icon mapping for navigation */
export interface NavIcon {
  /** Icon identifier */
  id: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Default accessible label */
  defaultLabel: string;
  /** Category for grouping */
  category: "navigation" | "action" | "status" | "file" | "communication" | "media";
}

/** Icon library category */
export type IconCategory =
  | "navigation"
  | "action"
  | "status"
  | "file"
  | "communication"
  | "media"
  | "editor"
  | "social";

/** Size configuration */
export interface IconSizeConfig {
  /** Tailwind class for the size */
  className: string;
  /** Pixel value */
  px: number;
}

/** Color configuration */
export interface IconColorConfig {
  /** Tailwind class for the color */
  className: string;
  /** CSS color value */
  value: string;
}
