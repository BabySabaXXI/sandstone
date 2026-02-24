"use client";

import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
type AlignValue = "start" | "center" | "end" | "stretch" | "baseline";
type JustifyValue = "start" | "center" | "end" | "between" | "around" | "evenly" | "stretch";

interface StackProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  // Direction
  direction?: "vertical" | "horizontal";

  // Gap
  gap?: GapValue;
  gapSm?: GapValue;
  gapMd?: GapValue;
  gapLg?: GapValue;
  gapXl?: GapValue;

  // Alignment
  align?: AlignValue;
  justify?: JustifyValue;

  // Responsive alignment
  alignSm?: AlignValue;
  alignMd?: AlignValue;
  alignLg?: AlignValue;
  justifySm?: JustifyValue;
  justifyMd?: JustifyValue;
  justifyLg?: JustifyValue;

  // Wrap
  wrap?: boolean | "reverse";

  // Full width/height
  fullWidth?: boolean;
  fullHeight?: boolean;

  // Divider
  divider?: ReactNode;

  // As container
  asContainer?: boolean;
  containerName?: string;
}

interface VStackProps extends Omit<StackProps, "direction"> {}
interface HStackProps extends Omit<StackProps, "direction"> {}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

// ============================================================================
// STACK COMPONENT
// ============================================================================

const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      className,
      style,
      direction = "vertical",
      gap,
      gapSm,
      gapMd,
      gapLg,
      gapXl,
      align,
      justify,
      alignSm,
      alignMd,
      alignLg,
      justifySm,
      justifyMd,
      justifyLg,
      wrap,
      fullWidth,
      fullHeight,
      divider,
      asContainer,
      containerName,
    },
    ref
  ) => {
    const isHorizontal = direction === "horizontal";

    const stackClasses = cn(
      "flex",

      // Direction
      isHorizontal ? "flex-row" : "flex-col",

      // Gap
      gapToClass(gap),
      gapToClass(gapSm, "sm"),
      gapToClass(gapMd, "md"),
      gapToClass(gapLg, "lg"),
      gapToClass(gapXl, "xl"),

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
      wrap === true && "flex-wrap",
      wrap === "reverse" && "flex-wrap-reverse",
      wrap === false && "flex-nowrap",

      // Full width/height
      fullWidth && "w-full",
      fullHeight && "h-full",

      className
    );

    // Handle divider injection
    const renderChildren = () => {
      if (!divider) return children;

      const childArray = Array.isArray(children) ? children : [children];
      return childArray.reduce((acc: ReactNode[], child, index) => {
        if (index > 0) {
          acc.push(
            <div
              key={`divider-${index}`}
              className={cn(
                "flex-shrink-0",
                isHorizontal ? "self-stretch" : "self-stretch"
              )}
            >
              {divider}
            </div>
          );
        }
        acc.push(child);
        return acc;
      }, []);
    };

    return (
      <div
        ref={ref}
        className={stackClasses}
        style={style}
        {...(asContainer && { "data-container": containerName || true })}
      >
        {renderChildren()}
      </div>
    );
  }
);

Stack.displayName = "Stack";

// ============================================================================
// VSTACK COMPONENT (Vertical Stack)
// ============================================================================

const VStack = forwardRef<HTMLDivElement, VStackProps>(
  ({ children, ...props }, ref) => {
    return (
      <Stack ref={ref} direction="vertical" {...props}>
        {children}
      </Stack>
    );
  }
);

VStack.displayName = "VStack";

// ============================================================================
// HSTACK COMPONENT (Horizontal Stack)
// ============================================================================

const HStack = forwardRef<HTMLDivElement, HStackProps>(
  ({ children, ...props }, ref) => {
    return (
      <Stack ref={ref} direction="horizontal" {...props}>
        {children}
      </Stack>
    );
  }
);

HStack.displayName = "HStack";

// ============================================================================
// EXPORTS
// ============================================================================

export { Stack, VStack, HStack };
export type { StackProps, VStackProps, HStackProps, GapValue, AlignValue, JustifyValue };
