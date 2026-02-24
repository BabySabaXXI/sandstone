"use client";

/**
 * Interactive Button Component
 * 
 * A button component with enhanced micro-interactions including:
 * - Ripple effects
 * - Hover animations
 * - Press feedback
 * - Loading states
 * - Focus rings
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

// ============================================
// Button Variants
// ============================================

const interactiveButtonVariants = cva(
  // Base styles with GPU acceleration
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium overflow-hidden gpu-accelerated",
  {
    variants: {
      variant: {
        // Primary - Main call-to-action
        primary: [
          "bg-primary text-primary-foreground shadow-soft-sm",
          "hover:bg-primary-hover hover:shadow-soft-md hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0 active:bg-primary-active",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        
        // Secondary - Alternative actions
        secondary: [
          "bg-secondary text-secondary-foreground border border-border",
          "hover:bg-sand-200 hover:border-sand-400 hover:-translate-y-0.5",
          "active:bg-sand-300 active:scale-[0.98] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        
        // Outline - Bordered button
        outline: [
          "bg-transparent text-sand-700 border border-sand-300",
          "hover:bg-sand-100 hover:border-sand-400 hover:-translate-y-0.5",
          "active:bg-sand-200 active:scale-[0.98] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        
        // Ghost - Minimal button
        ghost: [
          "bg-transparent text-sand-700",
          "hover:bg-sand-100 hover:-translate-y-0.5",
          "active:bg-sand-200 active:scale-[0.98] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        
        // Destructive - Danger actions
        destructive: [
          "bg-rose-200 text-white shadow-soft-sm",
          "hover:bg-rose-200/90 hover:shadow-soft-md hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2",
        ],
        
        // Link - Text-only button
        link: [
          "bg-transparent text-primary underline-offset-4",
          "hover:underline",
          "active:opacity-80",
        ],
        
        // Gradient - Gradient background
        gradient: [
          "bg-gradient-to-r from-peach-300 to-peach-400 text-sand-900 shadow-soft-sm",
          "hover:shadow-soft-md hover:-translate-y-0.5 hover:brightness-105",
          "active:scale-[0.98] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-peach-300 focus-visible:ring-offset-2",
        ],
        
        // Glass - Glassmorphism effect
        glass: [
          "bg-white/80 backdrop-blur-md text-sand-800 border border-white/20 shadow-soft-sm",
          "hover:bg-white/90 hover:shadow-soft-md hover:-translate-y-0.5",
          "active:scale-[0.98] active:translate-y-0",
          "focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2",
        ],
      },
      size: {
        xs: "h-8 px-3 py-1.5 text-xs gap-1.5",
        sm: "h-9 px-4 py-2 text-xs gap-1.5",
        md: "h-11 px-6 py-3 gap-2",
        lg: "h-12 px-8 py-4 text-base gap-2.5",
        xl: "h-14 px-10 py-5 text-lg gap-3",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
        "icon-xl": "h-14 w-14 p-0",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-md",
        md: "rounded-[10px]",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      radius: "md",
    },
  }
);

// ============================================
// Types
// ============================================

export interface InteractiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof interactiveButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
  rippleColor?: string;
  magnetic?: boolean;
  magneticStrength?: number;
  success?: boolean;
  error?: boolean;
  successIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  loadingText?: string;
}

// ============================================
// Ripple Component
// ============================================

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const RippleEffect: React.FC<{
  ripples: Ripple[];
  color: string;
  onComplete: (id: number) => void;
}> = ({ ripples, color, onComplete }) => {
  return (
    <>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              borderRadius: "50%",
              backgroundColor: color,
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
              pointerEvents: "none",
            }}
            onAnimationComplete={() => onComplete(ripple.id)}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

// ============================================
// Main Component
// ============================================

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      ripple = true,
      rippleColor = "rgba(255, 255, 255, 0.3)",
      magnetic = false,
      magneticStrength = 0.2,
      success = false,
      error = false,
      successIcon,
      errorIcon,
      loadingText,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const [isHovered, setIsHovered] = React.useState(false);
    const [magneticOffset, setMagneticOffset] = React.useState({ x: 0, y: 0 });

    // Combine refs
    React.useImperativeHandle(ref, () => buttonRef.current!);

    // Handle ripple effect
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (ripple && !loading && !disabled) {
          const button = buttonRef.current;
          if (button) {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const newRipple = { id: Date.now(), x, y };
            setRipples((prev) => [...prev, newRipple]);
          }
        }
        onClick?.(event);
      },
      [ripple, loading, disabled, onClick]
    );

    // Remove ripple after animation
    const removeRipple = React.useCallback((id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, []);

    // Magnetic effect
    const handleMouseMove = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (magnetic && !disabled) {
          const button = buttonRef.current;
          if (button) {
            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distanceX = event.clientX - centerX;
            const distanceY = event.clientY - centerY;
            setMagneticOffset({
              x: distanceX * magneticStrength,
              y: distanceY * magneticStrength,
            });
          }
        }
      },
      [magnetic, magneticStrength, disabled]
    );

    const handleMouseLeave = React.useCallback(() => {
      setIsHovered(false);
      if (magnetic) {
        setMagneticOffset({ x: 0, y: 0 });
      }
    }, [magnetic]);

    // Determine icon to show
    const getIcon = () => {
      if (loading) return <Loader2 className="h-4 w-4 animate-spin" />;
      if (success && successIcon) return successIcon;
      if (error && errorIcon) return errorIcon;
      return null;
    };

    const icon = getIcon();
    const Comp = asChild ? Slot : "button";

    // Magnetic transform style
    const magneticStyle = magnetic
      ? {
          transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
        }
      : {};

    return (
      <motion.div
        className="inline-block"
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Comp
          className={cn(
            interactiveButtonVariants({ variant, size, radius }),
            "transition-all duration-200 ease-out",
            disabled && "opacity-50 cursor-not-allowed",
            loading && "cursor-wait",
            success && "animate-scale-bounce",
            error && "animate-shake",
            className
          )}
          ref={buttonRef}
          disabled={disabled || loading}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={magneticStyle}
          {...props}
        >
          {/* Ripple Effect */}
          {ripple && (
            <RippleEffect
              ripples={ripples}
              color={rippleColor}
              onComplete={removeRipple}
            />
          )}

          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            {(icon || leftIcon) && (
              <motion.span
                className="flex-shrink-0"
                initial={false}
                animate={{
                  rotate: loading ? 360 : 0,
                }}
                transition={{
                  rotate: { duration: 1, repeat: loading ? Infinity : 0, ease: "linear" },
                }}
              >
                {icon || leftIcon}
              </motion.span>
            )}
            
            <AnimatePresence mode="wait">
              {loading && loadingText ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {loadingText}
                </motion.span>
              ) : (
                <motion.span
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {children}
                </motion.span>
              )}
            </AnimatePresence>
            
            {rightIcon && !icon && (
              <motion.span
                className="flex-shrink-0"
                animate={{
                  x: isHovered ? 4 : 0,
                }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {rightIcon}
              </motion.span>
            )}
          </span>

          {/* Hover glow effect for gradient variant */}
          {variant === "gradient" && (
            <motion.div
              className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-peach-300/0 via-white/20 to-peach-300/0"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{
                x: isHovered ? "100%" : "-100%",
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </Comp>
      </motion.div>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";

// ============================================
// Icon Button Variant
// ============================================

interface IconButtonProps extends Omit<InteractiveButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode;
  label: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "icon", className, ...props }, ref) => (
    <InteractiveButton
      ref={ref}
      size={size}
      className={cn("rounded-xl", className)}
      aria-label={label}
      {...props}
    >
      {icon}
    </InteractiveButton>
  )
);

IconButton.displayName = "IconButton";

// ============================================
// Floating Action Button
// ============================================

interface FloatingActionButtonProps extends Omit<InteractiveButtonProps, "size"> {
  icon: React.ReactNode;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ icon, position = "bottom-right", className, ...props }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-6 right-6",
      "top-left": "fixed top-6 left-6",
    };

    return (
      <motion.div
        className={positionClasses[position]}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <InteractiveButton
          ref={ref}
          size="icon-lg"
          radius="full"
          className={cn(
            "shadow-soft-lg hover:shadow-soft-xl",
            className
          )}
          {...props}
        >
          {icon}
        </InteractiveButton>
      </motion.div>
    );
  }
);

FloatingActionButton.displayName = "FloatingActionButton";

// ============================================
// Button Group
// ============================================

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  attached?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, attached = false }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        attached ? "inline-flex" : "gap-2",
        className
      )}
    >
      {attached
        ? React.Children.map(children, (child, index) => (
            <div
              className={cn(
                index === 0 && "rounded-r-none",
                index === React.Children.count(children) - 1 && "rounded-l-none",
                index > 0 && index < React.Children.count(children) - 1 && "rounded-none",
                index > 0 && "-ml-px"
              )}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
);

ButtonGroup.displayName = "ButtonGroup";

// ============================================
// Exports
// ============================================

export {
  InteractiveButton,
  IconButton,
  FloatingActionButton,
  ButtonGroup,
  interactiveButtonVariants,
};

export default InteractiveButton;
