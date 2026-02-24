"use client";

/**
 * Interactive Card Component
 * 
 * A card component with enhanced micro-interactions including:
 * - Hover lift and shadow effects
 * - Tilt effect on hover
 * - Glow effects
 * - Loading skeleton states
 * - Entrance animations
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

// ============================================
// Card Variants
// ============================================

const interactiveCardVariants = cva(
  "relative overflow-hidden rounded-xl border border-border bg-card gpu-accelerated",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-soft-md",
        outlined: "border-2",
        ghost: "border-transparent bg-transparent",
        glass: "bg-white/80 backdrop-blur-md border-white/20",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
        xl: "p-8",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      radius: "md",
    },
  }
);

// ============================================
// Types
// ============================================

export interface InteractiveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof interactiveCardVariants> {
  hover?: "lift" | "scale" | "glow" | "tilt" | "none";
  hoverIntensity?: number;
  clickable?: boolean;
  loading?: boolean;
  skeletonLines?: number;
  entrance?: "fade" | "slide-up" | "slide-down" | "scale" | "none";
  entranceDelay?: number;
  onClick?: () => void;
}

// ============================================
// Skeleton Component
// ============================================

const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-sand-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-sand-200 rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-sand-200 rounded animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 w-full bg-sand-200 rounded animate-pulse"
          style={{ width: i === lines - 1 ? "75%" : "100%" }}
        />
      ))}
    </div>
  </div>
);

// ============================================
// Tilt Card Component
// ============================================

const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  onClick?: () => void;
}> = ({ children, className, intensity = 10, onClick }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  
  const rotateX = useSpring(useTransform(y, [0, 1], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensity, intensity]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const xPos = (e.clientX - rect.left) / rect.width;
      const yPos = (e.clientY - rect.top) / rect.height;
      x.set(xPos);
      y.set(yPos);
    },
    [x, y]
  );

  const handleMouseLeave = React.useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Main Component
// ============================================

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  (
    {
      className,
      variant,
      padding,
      radius,
      hover = "lift",
      hoverIntensity = 1,
      clickable = false,
      loading = false,
      skeletonLines = 3,
      entrance = "fade",
      entranceDelay = 0,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Entrance animation variants
    const entranceVariants = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
      "slide-up": {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      },
      "slide-down": {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
      },
      scale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
      },
      none: {
        initial: {},
        animate: {},
      },
    };

    // Hover animation variants
    const hoverVariants = {
      lift: {
        whileHover: {
          y: -4 * hoverIntensity,
          boxShadow: "0 12px 32px -6px rgba(0, 0, 0, 0.12)",
        },
      },
      scale: {
        whileHover: {
          scale: 1.02 * hoverIntensity,
        },
      },
      glow: {
        whileHover: {
          boxShadow: "0 0 30px rgba(232, 213, 196, 0.4)",
        },
      },
      tilt: {
        // Handled by TiltCard component
        whileHover: {},
      },
      none: {
        whileHover: {},
      },
    };

    const selectedEntrance = entranceVariants[entrance];
    const selectedHover = hoverVariants[hover];

    const cardContent = loading ? (
      <CardSkeleton lines={skeletonLines} />
    ) : (
      children
    );

    // Use TiltCard for tilt hover effect
    if (hover === "tilt") {
      return (
        <TiltCard
          className={cn(
            interactiveCardVariants({ variant, padding, radius }),
            clickable && "cursor-pointer",
            className
          )}
          intensity={10 * hoverIntensity}
          onClick={onClick}
        >
          <motion.div
            initial={selectedEntrance.initial}
            animate={selectedEntrance.animate}
            transition={{
              duration: 0.4,
              delay: entranceDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {cardContent}
          </motion.div>
        </TiltCard>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          interactiveCardVariants({ variant, padding, radius }),
          clickable && "cursor-pointer",
          className
        )}
        initial={selectedEntrance.initial}
        animate={selectedEntrance.animate}
        whileHover={selectedHover.whileHover}
        whileTap={clickable ? { scale: 0.98 } : undefined}
        transition={{
          duration: 0.3,
          delay: entranceDelay,
          ease: [0.16, 1, 0.3, 1],
        }}
        onClick={onClick}
        {...props}
      >
        {/* Hover gradient overlay for elevated variant */}
        {variant === "elevated" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-inherit"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Glow effect for glow hover */}
        {hover === "glow" && (
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-peach-300/30 to-peach-400/30 rounded-xl blur-xl pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {cardContent}
      </motion.div>
    );
  }
);

InteractiveCard.displayName = "InteractiveCard";

// ============================================
// Card Header
// ============================================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, avatar, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-start justify-between gap-4 mb-4", className)}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {avatar && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {avatar}
          </motion.div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold text-foreground truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action}
        </motion.div>
      )}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

// ============================================
// Card Media
// ============================================

interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  overlay?: React.ReactNode;
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, src, alt, aspectRatio = "video", overlay, children, ...props }, ref) => {
    const aspectClasses = {
      video: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]",
      wide: "aspect-[21/9]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg mb-4",
          aspectClasses[aspectRatio],
          className
        )}
        {...props}
      >
        {src && (
          <motion.img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            {overlay}
          </div>
        )}
        {children}
      </div>
    );
  }
);

CardMedia.displayName = "CardMedia";

// ============================================
// Card Content
// ============================================

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));

CardContent.displayName = "CardContent";

// ============================================
// Card Footer
// ============================================

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

// ============================================
// Card Actions
// ============================================

interface CardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right";
}

const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(
  ({ className, align = "right", ...props }, ref) => {
    const alignClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", alignClasses[align], className)}
        {...props}
      />
    );
  }
);

CardActions.displayName = "CardActions";

// ============================================
// Feature Card
// ============================================

interface FeatureCardProps extends Omit<InteractiveCardProps, "children"> {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <InteractiveCard
      ref={ref}
      hover="lift"
      className={cn("group", className)}
      {...props}
    >
      <motion.div
        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {icon}
      </motion.div>
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {action}
        </motion.div>
      )}
    </InteractiveCard>
  )
);

FeatureCard.displayName = "FeatureCard";

// ============================================
// Stat Card
// ============================================

interface StatCardProps extends Omit<InteractiveCardProps, "children"> {
  value: string | number;
  label: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ value, label, trend, icon, prefix = "", suffix = "", className, ...props }, ref) => (
    <InteractiveCard
      ref={ref}
      hover="lift"
      className={cn("group", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <motion.p
            className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {prefix}{value}{suffix}
          </motion.p>
          {trend && (
            <motion.div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                trend.positive ? "text-sage-300" : "text-rose-200"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>
        {icon && (
          <motion.div
            className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </InteractiveCard>
  )
);

StatCard.displayName = "StatCard";

// ============================================
// Exports
// ============================================

export {
  InteractiveCard,
  CardHeader,
  CardMedia,
  CardContent,
  CardFooter,
  CardActions,
  FeatureCard,
  StatCard,
  interactiveCardVariants,
};

export default InteractiveCard;
