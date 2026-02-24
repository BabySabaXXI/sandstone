"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { gpuOptimized } from "./animation-config";

// ============================================
// Types
// ============================================

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
}

interface LoadingTextProps extends LoadingProps {
  text?: string;
  showDots?: boolean;
}

// ============================================
// Spinner Loading
// ============================================

/**
 * LoadingSpinner - Classic spinning loader
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" />
 * ```
 */
export function LoadingSpinner({
  className = "",
  size = "md",
  color = "hsl(var(--primary))",
}: LoadingProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const strokeWidthMap = {
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
  };

  return (
    <motion.div
      className={cn("relative", sizeMap[size], className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      style={gpuOptimized}
    >
      <svg
        viewBox="0 0 50 50"
        className="w-full h-full"
        style={{ color }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidthMap[size]}
          strokeLinecap="round"
          strokeDasharray="80"
          strokeDashoffset="60"
          className="opacity-100"
        />
      </svg>
    </motion.div>
  );
}

// ============================================
// Dots Loading
// ============================================

/**
 * LoadingDots - Bouncing dots loader
 * 
 * @example
 * ```tsx
 * <LoadingDots size="md" />
 * ```
 */
export function LoadingDots({
  className = "",
  size = "md",
  color = "hsl(var(--primary))",
}: LoadingProps) {
  const sizeMap = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
    xl: "w-5 h-5",
  };

  const gapMap = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
    xl: "gap-3",
  };

  const containerVariants: Variants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dotVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className={cn("flex items-center", gapMap[size], className)}
      variants={containerVariants}
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", sizeMap[size])}
          style={{ backgroundColor: color }}
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
}

// ============================================
// Pulse Loading
// ============================================

/**
 * LoadingPulse - Pulsing circle loader
 * 
 * @example
 * ```tsx
 * <LoadingPulse size="lg" />
 * ```
 */
export function LoadingPulse({
  className = "",
  size = "md",
  color = "hsl(var(--primary))",
}: LoadingProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={cn("relative", sizeMap[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// ============================================
// Ring Loading
// ============================================

/**
 * LoadingRing - Rotating rings loader
 * 
 * @example
 * ```tsx
 * <LoadingRing size="lg" />
 * ```
 */
export function LoadingRing({
  className = "",
  size = "md",
  color = "hsl(var(--primary))",
}: LoadingProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div className={cn("relative", sizeMap[size], className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: i > 0 ? color : "transparent",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1 + i * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// Wave Loading
// ============================================

/**
 * LoadingWave - Wave bars loader
 * 
 * @example
 * ```tsx
 * <LoadingWave size="md" />
 * ```
 */
export function LoadingWave({
  className = "",
  size = "md",
  color = "hsl(var(--primary))",
}: LoadingProps) {
  const sizeMap = {
    sm: "w-1 h-4",
    md: "w-1.5 h-6",
    lg: "w-2 h-8",
    xl: "w-3 h-12",
  };

  const gapMap = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
    xl: "gap-2",
  };

  return (
    <div className={cn("flex items-center", gapMap[size], className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", sizeMap[size])}
          style={{ backgroundColor: color }}
          animate={{
            scaleY: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// Orbit Loading
// ============================================

/**
 * LoadingOrbit - Orbiting dots loader
 * 
 * @example
 * ```tsx
 * <LoadingOrbit size="lg" />
 * ```
 */
export function LoadingOrbit({
  className = "",
  size = "md",
  color = "hsl(var(--primary))",
}: LoadingProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const dotSizeMap = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className={cn("relative", sizeMap[size], className)}>
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn("absolute rounded-full", dotSizeMap[size])}
            style={{
              backgroundColor: color,
              top: "50%",
              left: "50%",
              marginTop: `-${parseInt(dotSizeMap[size].split("-")[1]) / 2}px`,
              marginLeft: `-${parseInt(dotSizeMap[size].split("-")[1]) / 2}px`,
            }}
            animate={{
              x: [
                Math.cos((i * 2 * Math.PI) / 3) * 40,
                Math.cos((i * 2 * Math.PI) / 3) * 40,
              ],
              y: [
                Math.sin((i * 2 * Math.PI) / 3) * 40,
                Math.sin((i * 2 * Math.PI) / 3) * 40,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ============================================
// Logo Loading (Sandstone branded)
// ============================================

/**
 * LoadingLogo - Sandstone branded loading animation
 * 
 * @example
 * ```tsx
 * <LoadingLogo size="lg" text="Loading..." />
 * ```
 */
export function LoadingLogo({
  className = "",
  size = "md",
  text = "Loading...",
}: LoadingTextProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className={cn("relative", sizeMap[size])}>
        {/* Outer rotating square */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Inner counter-rotating square */}
        <motion.div
          className="absolute inset-[15%] rounded-lg bg-background"
          animate={{
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Center S */}
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
          style={{ color: "hsl(var(--foreground))" }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          S
        </motion.span>
      </div>
      {text && (
        <motion.p
          className={cn("text-muted-foreground", textSizeMap[size])}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// ============================================
// Skeleton Loading
// ============================================

interface SkeletonProps {
  className?: string;
  count?: number;
  lines?: boolean;
}

/**
 * Skeleton - Content placeholder with shimmer effect
 * 
 * @example
 * ```tsx
 * <Skeleton count={3} lines />
 * ```
 */
export function Skeleton({
  className = "",
  count = 1,
  lines = false,
}: SkeletonProps) {
  const shimmerVariants: Variants = {
    animate: {
      x: ["-100%", "100%"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  if (lines) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded overflow-hidden relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
              variants={shimmerVariants}
              animate="animate"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("bg-muted rounded-lg overflow-hidden relative", className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
        variants={shimmerVariants}
        animate="animate"
      />
    </div>
  );
}

// ============================================
// Card Skeleton
// ============================================

interface CardSkeletonProps {
  className?: string;
  hasImage?: boolean;
  lines?: number;
}

/**
 * CardSkeleton - Card placeholder with shimmer
 * 
 * @example
 * ```tsx
 * <CardSkeleton hasImage lines={3} />
 * ```
 */
export function CardSkeleton({
  className = "",
  hasImage = true,
  lines = 2,
}: CardSkeletonProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-4 space-y-4", className)}>
      {hasImage && <Skeleton className="h-40 w-full rounded-lg" />}
      <Skeleton className="h-6 w-3/4 rounded" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Full Page Loading
// ============================================

interface FullPageLoadingProps {
  text?: string;
  showLogo?: boolean;
}

/**
 * FullPageLoading - Full-screen loading overlay
 * 
 * @example
 * ```tsx
 * <FullPageLoading text="Loading your content..." showLogo />
 * ```
 */
export function FullPageLoading({
  text = "Loading...",
  showLogo = true,
}: FullPageLoadingProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {showLogo ? (
        <LoadingLogo size="lg" text={text} />
      ) : (
        <LoadingSpinner size="lg" />
      )}
    </motion.div>
  );
}

// ============================================
// Inline Loading
// ============================================

interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * InlineLoading - Small inline loading indicator
 * 
 * @example
 * ```tsx
 * <InlineLoading text="Saving..." size="sm" />
 * ```
 */
export function InlineLoading({
  text = "Loading...",
  size = "sm",
}: InlineLoadingProps) {
  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={cn("border-2 border-primary border-t-transparent rounded-full", sizeMap[size])}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <span className={cn("text-muted-foreground", textSizeMap[size])}>{text}</span>
    </div>
  );
}

// ============================================
// Progress Loading
// ============================================

interface ProgressLoadingProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

/**
 * ProgressLoading - Loading with progress bar
 * 
 * @example
 * ```tsx
 * <ProgressLoading progress={75} showPercentage />
 * ```
 */
export function ProgressLoading({
  progress,
  className = "",
  showPercentage = true,
}: ProgressLoadingProps) {
  return (
    <div className={cn("w-full max-w-md space-y-2", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Loading...</span>
          <motion.span
            key={progress}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Content Loader (for async content)
// ============================================

interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

/**
 * ContentLoader - Wrapper for async content with loading state
 * 
 * @example
 * ```tsx
 * <ContentLoader isLoading={isLoading} fallback={<CardSkeleton />}>
 *   <YourContent />
 * </ContentLoader>
 * ```
 */
export function ContentLoader({
  isLoading,
  children,
  fallback,
  delay = 0,
}: ContentLoaderProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay }}
      >
        {fallback || <LoadingSpinner />}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
