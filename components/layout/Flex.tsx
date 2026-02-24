"use client";

import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type AlignValue = "start" | "center" | "end" | "stretch" | "baseline";
type JustifyValue = "start" | "center" | "end" | "between" | "around" | "evenly";
type FlexDirection = "row" | "row-reverse" | "col" | "col-reverse";
type FlexWrap = "wrap" | "wrap-reverse" | "nowrap";
type FlexBasis = "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4";

interface FlexProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  // Direction
  direction?: FlexDirection;
  directionSm?: FlexDirection;
  directionMd?: FlexDirection;
  directionLg?: FlexDirection;

  // Gap
  gap?: GapValue;
  gapSm?: GapValue;
  gapMd?: GapValue;
  gapLg?: GapValue;

  // Alignment
  align?: AlignValue;
  alignSm?: AlignValue;
  alignMd?: AlignValue;
  alignLg?: AlignValue;

  // Justify
  justify?: JustifyValue;
  justifySm?: JustifyValue;
  justifyMd?: JustifyValue;
  justifyLg?: JustifyValue;

  // Wrap
  wrap?: FlexWrap;

  // Inline flex
  inline?: boolean;

  // Full width/height
  fullWidth?: boolean;
  fullHeight?: boolean;

  // Container query support
  asContainer?: boolean;
  containerName?: string;
}

interface FlexItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  // Grow/Shrink
  grow?: boolean | number;
  shrink?: boolean | number;

  // Basis
  basis?: FlexBasis | string;

  // Alignment
  alignSelf?: "auto" | "start" | "center" | "end" | "stretch";

  // Order
  order?: "first" | "last" | "none" | number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const directionToClass = (direction: FlexDirection | undefined, breakpoint?: string): string => {
  if (direction === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  const dirMap: Record<FlexDirection, string> = {
    row: "flex-row",
    "row-reverse": "flex-row-reverse",
    col: "flex-col",
    "col-reverse": "flex-col-reverse",
  };
  return `${prefix}${dirMap[direction]}`;
};

const gapToClass = (gap: GapValue | undefined, breakpoint?: string): string => {
  if (gap === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}gap-${gap}`;
};

const alignToClass = (align: AlignValue | undefined, breakpoint?: string): string => {
  if (align === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}items-${align}`;
};

const justifyToClass = (justify: JustifyValue | undefined, breakpoint?: string): string => {
  if (justify === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}justify-${justify}`;
};

const basisToClass = (basis: FlexBasis | string | undefined): string => {
  if (basis === undefined) return "";
  if (typeof basis === "string" && basis.startsWith("[")) {
    return "";
  }
  const basisMap: Record<string, string> = {
    auto: "basis-auto",
    full: "basis-full",
    "1/2": "basis-1/2",
    "1/3": "basis-1/3",
    "2/3": "basis-2/3",
    "1/4": "basis-1/4",
    "3/4": "basis-3/4",
  };
  return basisMap[basis as string] || "";
};

// ============================================================================
// FLEX COMPONENT
// ============================================================================

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      children,
      className,
      style,
      direction = "row",
      directionSm,
      directionMd,
      directionLg,
      gap,
      gapSm,
      gapMd,
      gapLg,
      align,
      alignSm,
      alignMd,
      alignLg,
      justify,
      justifySm,
      justifyMd,
      justifyLg,
      wrap,
      inline,
      fullWidth,
      fullHeight,
      asContainer,
      containerName,
    },
    ref
  ) => {
    const flexClasses = cn(
      // Display
      inline ? "inline-flex" : "flex",

      // Direction
      directionToClass(direction),
      directionToClass(directionSm, "sm"),
      directionToClass(directionMd, "md"),
      directionToClass(directionLg, "lg"),

      // Gap
      gapToClass(gap),
      gapToClass(gapSm, "sm"),
      gapToClass(gapMd, "md"),
      gapToClass(gapLg, "lg"),

      // Alignment
      alignToClass(align),
      alignToClass(alignSm, "sm"),
      alignToClass(alignMd, "md"),
      alignToClass(alignLg, "lg"),

      // Justify
      justifyToClass(justify),
      justifyToClass(justifySm, "sm"),
      justifyToClass(justifyMd, "md"),
      justifyToClass(justifyLg, "lg"),

      // Wrap
      wrap && `flex-${wrap}`,

      // Full width/height
      fullWidth && "w-full",
      fullHeight && "h-full",

      className
    );

    return (
      <div
        ref={ref}
        className={flexClasses}
        style={style}
        {...(asContainer && { "data-container": containerName || true })}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";

// ============================================================================
// FLEX ITEM COMPONENT
// ============================================================================

const FlexItem = forwardRef<HTMLDivElement, FlexItemProps>(
  (
    {
      children,
      className,
      style,
      grow,
      shrink,
      basis,
      alignSelf,
      order,
    },
    ref
  ) => {
    const itemClasses = cn(
      // Grow
      grow === true && "flex-grow",
      grow === false && "flex-grow-0",
      typeof grow === "number" && `flex-[${grow}]`,

      // Shrink
      shrink === true && "flex-shrink",
      shrink === false && "flex-shrink-0",
      typeof shrink === "number" && `flex-shrink-[${shrink}]`,

      // Basis
      basisToClass(basis),

      // Align self
      alignSelf && `self-${alignSelf}`,

      // Order
      order === "first" && "order-first",
      order === "last" && "order-last",
      order === "none" && "order-none",
      typeof order === "number" && `order-${order}`,

      className
    );

    const itemStyle: CSSProperties = {
      ...(basis && typeof basis === "string" && basis.startsWith("[") && {
        flexBasis: basis.slice(1, -1),
      }),
      ...(typeof grow === "number" && { flexGrow: grow }),
      ...(typeof shrink === "number" && { flexShrink: shrink }),
      ...style,
    };

    return (
      <div ref={ref} className={itemClasses} style={itemStyle}>
        {children}
      </div>
    );
  }
);

FlexItem.displayName = "FlexItem";

// ============================================================================
// CENTER COMPONENT (Convenience wrapper for centering)
// ============================================================================

interface CenterProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  inline?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
}

const Center = forwardRef<HTMLDivElement, CenterProps>(
  (
    { children, className, style, inline, fullWidth, fullHeight },
    ref
  ) => {
    return (
      <Flex
        ref={ref}
        direction="row"
        align="center"
        justify="center"
        inline={inline}
        fullWidth={fullWidth}
        fullHeight={fullHeight}
        className={className}
        style={style}
      >
        {children}
      </Flex>
    );
  }
);

Center.displayName = "Center";

// ============================================================================
// SPACER COMPONENT (Flexible space for flex layouts)
// ============================================================================

interface SpacerProps {
  className?: string;
  style?: CSSProperties;
  size?: GapValue;
}

const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, style, size }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1", size && `min-w-${size} min-h-${size}`, className)}
        style={style}
      />
    );
  }
);

Spacer.displayName = "Spacer";

// ============================================================================
// EXPORTS
// ============================================================================

export { Flex, FlexItem, Center, Spacer };
export type { FlexProps, FlexItemProps, CenterProps, SpacerProps, GapValue, FlexDirection, FlexBasis };
