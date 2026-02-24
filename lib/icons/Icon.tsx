/**
 * Icon Component
 * 
 * A comprehensive, accessible icon component that wraps Lucide icons
 * with consistent styling, animations, and accessibility features.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Icon icon={Home} />
 * 
 * // With size and color
 * <Icon icon={Settings} size="lg" color="primary" />
 * 
 * // With animation
 * <Icon icon={Loader2} animation="spin" />
 * 
 * // Accessible icon with label
 * <Icon icon={Info} label="Information" />
 * 
 * // Decorative icon (hidden from screen readers)
 * <Icon icon={Sparkles} decorative />
 * ```
 */

"use client";

import React, { forwardRef, useMemo } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BaseIconProps, IconSize } from "./types";
import { ICON_SIZES, ICON_COLORS, ICON_ANIMATIONS } from "./constants";

// ============================================================================
// Props Interface
// ============================================================================

export interface IconProps extends BaseIconProps {
  /** Lucide icon component to render */
  icon: LucideIcon;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the size class or pixel value for an icon
 */
function getSizeValue(size: IconSize | number | undefined): string {
  if (typeof size === "number") {
    return `${size}px`;
  }
  return ICON_SIZES[size || "md"].className;
}

/**
 * Get the color class for an icon
 */
function getColorClass(color: string | undefined): string {
  if (!color) return "";
  return ICON_COLORS[color as keyof typeof ICON_COLORS]?.className || color;
}

/**
 * Generate accessible attributes for the icon
 */
function generateAccessibleProps(
  decorative: boolean | undefined,
  label: string | undefined,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined,
  ariaDescribedBy: string | undefined
): Record<string, unknown> {
  // Decorative icons are hidden from screen readers
  if (decorative) {
    return {
      "aria-hidden": true,
      focusable: false,
      role: "presentation",
    };
  }

  const props: Record<string, unknown> = {
    role: "img",
  };

  // Use explicit aria-label if provided
  if (ariaLabel) {
    props["aria-label"] = ariaLabel;
  }
  // Otherwise use the label prop
  else if (label) {
    props["aria-label"] = label;
  }

  if (ariaLabelledBy) {
    props["aria-labelledby"] = ariaLabelledBy;
  }

  if (ariaDescribedBy) {
    props["aria-describedby"] = ariaDescribedBy;
  }

  return props;
}

// ============================================================================
// Icon Component
// ============================================================================

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: IconComponent,
      size = "md",
      color,
      className,
      animation = "none",
      decorative = false,
      label,
      ariaHidden,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      tabIndex,
      onClick,
      id,
      ...props
    },
    ref
  ) => {
    // Memoize accessible props to prevent unnecessary recalculations
    const accessibleProps = useMemo(
      () =>
        generateAccessibleProps(
          decorative,
          label,
          ariaLabel,
          ariaLabelledBy,
          ariaDescribedBy
        ),
      [decorative, label, ariaLabel, ariaLabelledBy, ariaDescribedBy]
    );

    // Determine if the icon is interactive
    const isInteractive = !!onClick;

    // Combine all classes
    const combinedClasses = cn(
      // Size
      typeof size === "number" ? "" : getSizeValue(size),
      // Color
      getColorClass(color),
      // Animation
      ICON_ANIMATIONS[animation],
      // Interactive cursor
      isInteractive && "cursor-pointer",
      // Custom classes
      className
    );

    // Inline styles for numeric sizes
    const inlineStyles: React.CSSProperties = {};
    if (typeof size === "number") {
      inlineStyles.width = size;
      inlineStyles.height = size;
    }

    return (
      <IconComponent
        ref={ref}
        className={combinedClasses}
        style={inlineStyles}
        id={id}
        tabIndex={isInteractive ? tabIndex ?? 0 : tabIndex}
        onClick={onClick}
        {...accessibleProps}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";

export default Icon;

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Pre-sized icon components for common use cases
 */
export const IconXs = (props: Omit<IconProps, "size">) => (
  <Icon {...props} size="xs" />
);
export const IconSm = (props: Omit<IconProps, "size">) => (
  <Icon {...props} size="sm" />
);
export const IconMd = (props: Omit<IconProps, "size">) => (
  <Icon {...props} size="md" />
);
export const IconLg = (props: Omit<IconProps, "size">) => (
  <Icon {...props} size="lg" />
);
export const IconXl = (props: Omit<IconProps, "size">) => (
  <Icon {...props} size="xl" />
);

/**
 * Pre-colored icon components for common use cases
 */
export const IconPrimary = (props: Omit<IconProps, "color">) => (
  <Icon {...props} color="primary" />
);
export const IconMuted = (props: Omit<IconProps, "color">) => (
  <Icon {...props} color="muted" />
);
export const IconSuccess = (props: Omit<IconProps, "color">) => (
  <Icon {...props} color="success" />
);
export const IconWarning = (props: Omit<IconProps, "color">) => (
  <Icon {...props} color="warning" />
);
export const IconError = (props: Omit<IconProps, "color">) => (
  <Icon {...props} color="error" />
);
export const IconInfo = (props: Omit<IconProps, "color">) => (
  <Icon {...props} color="info" />
);

/**
 * Animated icon components for common use cases
 */
export const IconSpin = (props: Omit<IconProps, "animation">) => (
  <Icon {...props} animation="spin" />
);
export const IconPulse = (props: Omit<IconProps, "animation">) => (
  <Icon {...props} animation="pulse" />
);
export const IconBounce = (props: Omit<IconProps, "animation">) => (
  <Icon {...props} animation="bounce" />
);
