"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip Component
 * 
 * A tooltip component built on Radix UI Tooltip primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Tooltip text</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */

// ============================================
// Tooltip Provider
// ============================================

const TooltipProvider = TooltipPrimitive.Provider;

// ============================================
// Tooltip Root
// ============================================

const Tooltip = TooltipPrimitive.Root;

// ============================================
// Tooltip Trigger
// ============================================

const TooltipTrigger = TooltipPrimitive.Trigger;

// ============================================
// Tooltip Content Variants
// ============================================

const tooltipContentVariants = cva(
  "z-tooltip overflow-hidden rounded-lg border border-border bg-popover px-3 py-1.5 " +
  "text-sm text-popover-foreground shadow-soft-md " +
  "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 " +
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "",
        primary: "bg-primary text-primary-foreground border-primary",
        dark: "bg-sand-900 text-white border-sand-800",
        light: "bg-white text-sand-900 border-sand-200",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ============================================
// Tooltip Content
// ============================================

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    { className, sideOffset = 4, variant, size, ...props },
    ref
  ) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(tooltipContentVariants({ variant, size }), className)}
      {...props}
    />
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// ============================================
// Tooltip Arrow
// ============================================

const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn("fill-popover", className)}
    {...props}
  />
));
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;

// ============================================
// Simple Tooltip - Quick Usage Component
// ============================================

interface SimpleTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  variant?: "default" | "primary" | "dark" | "light";
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  variant = "default",
}) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} variant={variant}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// Icon Tooltip - For Icon Buttons
// ============================================

interface IconTooltipProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const IconTooltip: React.FC<IconTooltipProps> = ({
  icon,
  label,
  onClick,
  disabled,
  className,
  side = "top",
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "p-2 rounded-lg text-sand-600 hover:bg-sand-100 hover:text-sand-800",
              "focus:outline-none focus:ring-2 focus:ring-peach-100",
              "disabled:opacity-50 disabled:pointer-events-none",
              "transition-colors duration-150",
              className
            )}
            aria-label={label}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side={side}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// Info Tooltip - With Info Icon
// ============================================

interface InfoTooltipProps {
  content: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  className,
  side = "top",
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 rounded-full",
              "bg-sand-200 text-sand-600 hover:bg-sand-300 hover:text-sand-700",
              "focus:outline-none focus:ring-2 focus:ring-peach-100",
              "transition-colors duration-150",
              className
            )}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  SimpleTooltip,
  IconTooltip,
  InfoTooltip,
  tooltipContentVariants,
};

export type {
  TooltipContentProps,
  SimpleTooltipProps,
  IconTooltipProps,
  InfoTooltipProps,
};
