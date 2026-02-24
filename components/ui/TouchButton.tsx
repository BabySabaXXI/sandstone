"use client";

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  fullWidth?: boolean;
  ripple?: boolean;
}

const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      isLoading = false,
      fullWidth = false,
      ripple = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      // Minimum touch target of 44px
      "inline-flex items-center justify-center",
      "font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "touch-manipulation select-none",
      "active:scale-95",
      fullWidth && "w-full",
      className
    );

    const variants = {
      default: cn(
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90",
        "shadow-soft"
      ),
      primary: cn(
        "bg-accent text-accent-foreground",
        "hover:bg-accent/90",
        "shadow-soft"
      ),
      secondary: cn(
        "bg-secondary text-secondary-foreground",
        "hover:bg-secondary/80"
      ),
      ghost: cn(
        "hover:bg-accent hover:text-accent-foreground",
        "bg-transparent"
      ),
      destructive: cn(
        "bg-destructive text-destructive-foreground",
        "hover:bg-destructive/90",
        "shadow-soft"
      ),
    };

    const sizes = {
      sm: "h-10 min-w-[44px] px-3 py-2 text-sm rounded-lg gap-1.5",
      md: "h-12 min-w-[48px] px-4 py-2.5 text-base rounded-xl gap-2",
      lg: "h-14 min-w-[56px] px-6 py-3 text-lg rounded-xl gap-2.5",
      icon: "h-12 w-12 min-w-[48px] min-h-[48px] rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size])}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

TouchButton.displayName = "TouchButton";

export { TouchButton };
export default TouchButton;
