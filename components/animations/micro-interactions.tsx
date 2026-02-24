"use client";

import { ReactNode, useState } from "react";
import { motion, HTMLMotionProps, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  buttonVariants,
  cardHoverVariants,
  scaleVariants,
  gpuOptimized,
  transitions,
} from "./animation-config";

// ============================================
// Types
// ============================================

interface InteractiveProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

type HoverScale = "sm" | "md" | "lg" | "none";
type TapScale = "sm" | "md" | "lg" | "none";

// ============================================
// Animated Button
// ============================================

interface AnimatedButtonProps extends InteractiveProps {
  variant?: "default" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  pulse?: boolean;
}

/**
 * AnimatedButton - Button with smooth hover, tap, and loading animations
 * 
 * @example
 * ```tsx
 * <AnimatedButton 
 *   variant="default" 
 *   loading={isLoading}
 *   icon={<Sparkles className="w-4 h-4" />}
 * >
 *   Click Me
 * </AnimatedButton>
 * ```
 */
export function AnimatedButton({
  children,
  className = "",
  onClick,
  disabled = false,
  variant = "default",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  pulse = false,
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    ghost: "hover:bg-muted focus:ring-muted",
    outline: "border border-input bg-background hover:bg-muted focus:ring-muted",
    subtle: "bg-muted text-muted-foreground hover:bg-muted/80 focus:ring-muted",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : "tap"}
      animate={loading ? "disabled" : pulse && isHovered ? "pulse" : "rest"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={gpuOptimized}
    >
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
        </motion.span>
      )}
      {!loading && icon && iconPosition === "left" && (
        <motion.span
          initial={{ x: 0 }}
          animate={{ x: isHovered ? -2 : 0 }}
          transition={transitions.fast}
        >
          {icon}
        </motion.span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <motion.span
          initial={{ x: 0 }}
          animate={{ x: isHovered ? 2 : 0 }}
          transition={transitions.fast}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
}

// ============================================
// Animated Card
// ============================================

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  lift?: boolean;
  glow?: boolean;
}

/**
 * AnimatedCard - Card with hover lift and glow effects
 * 
 * @example
 * ```tsx
 * <AnimatedCard hover lift glow>
 *   <CardContent>Your content</CardContent>
 * </AnimatedCard>
 * ```
 */
export function AnimatedCard({
  children,
  className = "",
  onClick,
  hover = true,
  lift = true,
  glow = false,
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
      variants={cardHoverVariants}
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        ...gpuOptimized,
        boxShadow: glow && isHovered
          ? "0 0 30px rgba(251, 191, 36, 0.2)"
          : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Animated Icon
// ============================================

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  animation?: "bounce" | "pulse" | "spin" | "shake" | "none";
  hoverAnimation?: "scale" | "rotate" | "bounce" | "none";
}

/**
 * AnimatedIcon - Icon with various animation effects
 * 
 * @example
 * ```tsx
 * <AnimatedIcon animation="bounce" hoverAnimation="rotate">
 *   <Bell className="w-6 h-6" />
 * </AnimatedIcon>
 * ```
 */
export function AnimatedIcon({
  children,
  className = "",
  animation = "none",
  hoverAnimation = "scale",
}: AnimatedIconProps) {
  const animationVariants = {
    bounce: {
      y: [0, -5, 0],
      transition: { duration: 0.6, repeat: Infinity },
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 1.5, repeat: Infinity },
    },
    spin: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
    shake: {
      x: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.5, repeat: Infinity },
    },
    none: {},
  };

  const hoverVariants = {
    scale: { scale: 1.2 },
    rotate: { rotate: 15 },
    bounce: { y: -3 },
    none: {},
  };

  return (
    <motion.span
      className={cn("inline-flex", className)}
      animate={animation !== "none" ? animationVariants[animation] : undefined}
      whileHover={hoverAnimation !== "none" ? hoverVariants[hoverAnimation] : undefined}
      transition={transitions.spring}
      style={gpuOptimized}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// Animated Link
// ============================================

interface AnimatedLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
  underline?: boolean;
  external?: boolean;
}

/**
 * AnimatedLink - Link with underline and hover animations
 * 
 * @example
 * ```tsx
 * <AnimatedLink href="/about" underline>
 *   About Us
 * </AnimatedLink>
 * ```
 */
export function AnimatedLink({
  children,
  href,
  className = "",
  underline = true,
  external = false,
}: AnimatedLinkProps) {
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "relative inline-flex items-center text-primary hover:text-primary/80 transition-colors",
        className
      )}
      whileHover="hover"
      initial="rest"
    >
      <span>{children}</span>
      {underline && (
        <motion.span
          className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left"
          variants={{
            rest: { scaleX: 0 },
            hover: { scaleX: 1 },
          }}
          transition={transitions.fast}
        />
      )}
    </motion.a>
  );
}

// ============================================
// Animated Badge
// ============================================

interface AnimatedBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  pulse?: boolean;
}

/**
 * AnimatedBadge - Badge with optional pulse animation
 * 
 * @example
 * ```tsx
 * <AnimatedBadge variant="success" pulse>
 *   New
 * </AnimatedBadge>
 * ```
 */
export function AnimatedBadge({
  children,
  className = "",
  variant = "default",
  pulse = false,
}: AnimatedBadgeProps) {
  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
      animate={
        pulse
          ? {
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }
          : undefined
      }
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// Animated Input
// ============================================

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

/**
 * AnimatedInput - Input with focus animations and error states
 * 
 * @example
 * ```tsx
 * <AnimatedInput
 *   label="Email"
 *   icon={<Mail className="w-4 h-4" />}
 *   error={errors.email}
 * />
 * ```
 */
export function AnimatedInput({
  label,
  error,
  icon,
  className = "",
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <motion.label
          className="text-sm font-medium text-foreground"
          animate={{
            color: isFocused ? "hsl(var(--primary))" : "hsl(var(--foreground))",
          }}
        >
          {label}
        </motion.label>
      )}
      <motion.div
        className={cn(
          "relative flex items-center rounded-lg border bg-background transition-colors",
          error
            ? "border-rose-500 focus-within:ring-rose-500/20"
            : "border-input focus-within:border-primary focus-within:ring-primary/20",
          className
        )}
        animate={{
          borderColor: isFocused
            ? error
              ? "rgb(244, 63, 94)"
              : "hsl(var(--primary))"
            : undefined,
          boxShadow: isFocused
            ? error
              ? "0 0 0 3px rgba(244, 63, 94, 0.2)"
              : "0 0 0 3px hsl(var(--primary) / 0.2)"
            : "0 0 0 0px transparent",
        }}
        transition={transitions.fast}
      >
        {icon && (
          <span className="absolute left-3 text-muted-foreground">{icon}</span>
        )}
        <input
          className={cn(
            "flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground",
            icon && "pl-10"
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-rose-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================
// Animated Checkbox
// ============================================

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

/**
 * AnimatedCheckbox - Checkbox with smooth check animation
 * 
 * @example
 * ```tsx
 * <AnimatedCheckbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="I agree to terms"
 * />
 * ```
 */
export function AnimatedCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: AnimatedCheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <motion.div
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          checked
            ? "bg-primary border-primary"
            : "border-input bg-background hover:border-primary/50"
        )}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(!checked)}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 text-primary-foreground"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.path d="M5 12l5 5L20 7" />
        </motion.svg>
      </motion.div>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}

// ============================================
// Animated Switch
// ============================================

interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * AnimatedSwitch - Toggle switch with smooth animation
 * 
 * @example
 * ```tsx
 * <AnimatedSwitch checked={isOn} onChange={setIsOn} />
 * ```
 */
export function AnimatedSwitch({
  checked,
  onChange,
  className = "",
}: AnimatedSwitchProps) {
  return (
    <motion.button
      className={cn(
        "w-12 h-6 rounded-full relative transition-colors",
        checked ? "bg-primary" : "bg-muted",
        className
      )}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5"
        animate={{
          left: checked ? "26px" : "2px",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </motion.button>
  );
}

// ============================================
// Animated Tooltip
// ============================================

interface AnimatedTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

/**
 * AnimatedTooltip - Tooltip with smooth entrance/exit
 * 
 * @example
 * ```tsx
 * <AnimatedTooltip content="More info" position="top">
 *   <Button>Hover me</Button>
 * </AnimatedTooltip>
 * ```
 */
export function AnimatedTooltip({
  children,
  content,
  position = "top",
  delay = 0.3,
}: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          className={cn(
            "absolute z-50 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border whitespace-nowrap",
            positionStyles[position]
          )}
          initial={{ opacity: 0, scale: 0.9, y: position === "top" ? 5 : position === "bottom" ? -5 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15, delay }}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Animated Progress Bar
// ============================================

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  animated?: boolean;
}

/**
 * AnimatedProgress - Progress bar with smooth fill animation
 * 
 * @example
 * ```tsx
 * <AnimatedProgress value={75} animated />
 * ```
 */
export function AnimatedProgress({
  value,
  max = 100,
  className = "",
  barClassName = "",
  animated = true,
}: AnimatedProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-primary", barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={animated ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
      />
    </div>
  );
}

// ============================================
// Animated Counter
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedCounter - Number that animates to its value
 * 
 * @example
 * ```tsx
 * <AnimatedCounter value={1000} prefix="$" suffix="+" />
 * ```
 */
export function AnimatedCounter({
  value,
  duration = 1,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  return (
    <motion.span className={className}>
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CountUp end={value} duration={duration} />
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// Simple count-up component
function CountUp({ end, duration }: { end: number; duration: number }) {
  const controls = useAnimation();

  // Trigger animation on mount
  useState(() => {
    controls.start({
      opacity: 1,
      transition: { duration },
    });
  });

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 1 }}
        animate={controls}
        onViewportEnter={() => {
          controls.start({
            opacity: 1,
            transition: { duration },
          });
        }}
      >
        {end}
      </motion.span>
    </motion.span>
  );
}
