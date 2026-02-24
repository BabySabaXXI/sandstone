/**
 * SVG Icon Component
 * 
 * Optimized inline SVG icon component with accessibility features.
 * Use this for custom SVG icons that aren't in Lucide.
 * 
 * @example
 * ```tsx
 * // Basic SVG icon
 * <SVGIcon path="M12 2L2 7l10 5 10-5-10-5z" />
 * 
 * // With multiple paths
 * <SVGIcon>
 *   <path d="M12 2L2 7l10 5 10-5-10-5z" />
 *   <path d="M2 17l10 5 10-5" />
 * </SVGIcon>
 * 
 * // Custom icon with accessibility
 * <SVGIcon 
 *   path="M12 2v20M2 12h20" 
 *   label="Plus icon"
 * />
 * ```
 */

"use client";

import React, { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SVGIconProps } from "./types";
import { ICON_SIZES, ICON_COLORS, ICON_ANIMATIONS, SVG_DEFAULTS } from "./constants";

// ============================================================================
// Props Interface
// ============================================================================

export interface SVGIconComponentProps extends SVGIconProps {
  /** SVG path data (d attribute) - can be a single path or array of paths */
  path?: string | string[];
  /** Children for complex SVGs (overrides path prop) */
  children?: React.ReactNode;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse path data into path elements
 */
function parsePaths(path: string | string[] | undefined): React.ReactNode {
  if (!path) return null;

  const paths = Array.isArray(path) ? path : [path];

  return paths.map((p, index) => <path key={index} d={p} />);
}

/**
 * Get the size class or pixel value
 */
function getSizeValue(size: string | number | undefined): string {
  if (typeof size === "number") {
    return `${size}px`;
  }
  return ICON_SIZES[(size as keyof typeof ICON_SIZES) || "md"].className;
}

/**
 * Get the color class
 */
function getColorClass(color: string | undefined): string {
  if (!color) return "";
  return ICON_COLORS[color as keyof typeof ICON_COLORS]?.className || color;
}

/**
 * Generate accessible attributes
 */
function generateAccessibleProps(
  decorative: boolean | undefined,
  label: string | undefined,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined,
  ariaDescribedBy: string | undefined
): Record<string, unknown> {
  if (decorative) {
    return {
      "aria-hidden": "true",
      role: "presentation",
    };
  }

  const props: Record<string, unknown> = {
    role: "img",
  };

  if (ariaLabel) {
    props["aria-label"] = ariaLabel;
  } else if (label) {
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
// SVG Icon Component
// ============================================================================

export const SVGIcon = forwardRef<SVGSVGElement, SVGIconComponentProps>(
  (
    {
      path,
      children,
      size = "md",
      color,
      viewBox = SVG_DEFAULTS.viewBox,
      fill = SVG_DEFAULTS.fill,
      stroke = SVG_DEFAULTS.stroke,
      strokeWidth = SVG_DEFAULTS.strokeWidth,
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
    // Memoize accessible props
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

    const isInteractive = !!onClick;

    // Combine all classes
    const combinedClasses = cn(
      typeof size === "number" ? "" : getSizeValue(size),
      getColorClass(color),
      ICON_ANIMATIONS[animation],
      isInteractive && "cursor-pointer",
      className
    );

    // Inline styles for numeric sizes
    const inlineStyles: React.CSSProperties = {};
    if (typeof size === "number") {
      inlineStyles.width = size;
      inlineStyles.height = size;
    }

    // Determine content
    const content = children || parsePaths(path);

    return (
      <svg
        ref={ref}
        xmlns={SVG_DEFAULTS.xmlns}
        viewBox={viewBox}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap={SVG_DEFAULTS.strokeLinecap}
        strokeLinejoin={SVG_DEFAULTS.strokeLinejoin}
        className={combinedClasses}
        style={inlineStyles}
        id={id}
        tabIndex={isInteractive ? tabIndex ?? 0 : tabIndex}
        onClick={onClick}
        {...accessibleProps}
        {...props}
      >
        {content}
      </svg>
    );
  }
);

SVGIcon.displayName = "SVGIcon";

export default SVGIcon;

// ============================================================================
// Pre-built Common SVG Icons
// ============================================================================

import { SVG_PATHS } from "./constants";

/**
 * Pre-built upload icon
 */
export const UploadIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.upload.path} />
);

/**
 * Pre-built file icon
 */
export const FileIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.file.path} />
);

/**
 * Pre-built close icon
 */
export const CloseIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.close.path} />
);

/**
 * Pre-built user icon
 */
export const UserIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.user.path} />
);

/**
 * Pre-built check icon
 */
export const CheckIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.check.path} />
);

/**
 * Pre-built chevron icons
 */
export const ChevronDownIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.chevronDown.path} />
);

export const ChevronUpIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.chevronUp.path} />
);

export const ChevronLeftIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.chevronLeft.path} />
);

export const ChevronRightIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.chevronRight.path} />
);

/**
 * Pre-built search icon
 */
export const SearchIcon = (props: Omit<SVGIconComponentProps, "path">) => (
  <SVGIcon {...props} path={SVG_PATHS.search.path} />
);

/**
 * Pre-built spinner icon
 */
export const SpinnerIcon = (props: Omit<SVGIconComponentProps, "path" | "animation">) => (
  <SVGIcon {...props} path={SVG_PATHS.spinner.path} animation="spin" />
);
