"use client";

import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  isPressable?: boolean;
  onPress?: () => void;
}

const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(
  (
    {
      children,
      variant = "default",
      padding = "md",
      isPressable = false,
      onPress,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "rounded-2xl overflow-hidden",
      "transition-all duration-200",
      "touch-manipulation"
    );

    const variants = {
      default: cn(
        "bg-card border border-border",
        "shadow-soft"
      ),
      elevated: cn(
        "bg-card border border-border",
        "shadow-soft-md"
      ),
      outlined: cn(
        "bg-transparent border-2 border-border"
      ),
      interactive: cn(
        "bg-card border border-border",
        "shadow-soft",
        "active:scale-[0.98] active:shadow-soft-md",
        "cursor-pointer"
      ),
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-5",
    };

    const Component = isPressable ? motion.div : "div";

    return (
      <Component
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...(isPressable && {
          whileTap: { scale: 0.98 },
          transition: { type: "spring", stiffness: 400, damping: 25 },
          onClick: onPress,
        })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

MobileCard.displayName = "MobileCard";

export { MobileCard };
export default MobileCard;
