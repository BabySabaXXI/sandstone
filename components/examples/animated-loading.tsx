"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LoadingSpinner,
  LoadingDots,
  LoadingLogo,
  ProgressLoading,
  Skeleton,
  CardSkeleton,
} from "@/components/animations";

// ============================================
// Enhanced Page Loading
// ============================================

interface PageLoadingProps {
  text?: string;
  showProgress?: boolean;
  progress?: number;
}

/**
 * PageLoading - Full page loading with progress indicator
 * 
 * @example
 * ```tsx
 * <PageLoading text="Loading dashboard..." showProgress progress={45} />
 * ```
 */
export function PageLoading({
  text = "Loading...",
  showProgress = false,
  progress = 0,
}: PageLoadingProps) {
  return (
    <motion.div
      className="min-h-[60vh] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingLogo size="lg" text={text} />
      
      {showProgress && (
        <motion.div
          className="w-full max-w-xs mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProgressLoading progress={progress} />
        </motion.div>
      )}

      {/* Loading tips */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <LoadingTips />
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Loading Tips Component
// ============================================

const tips = [
  "Tip: Use AI Grading to get instant feedback on your essays",
  "Tip: Flashcards use spaced repetition for better retention",
  "Tip: Track your progress in the Study Progress section",
  "Tip: Save your graded responses to review later",
  "Tip: Try different question types to practice all skills",
];

function LoadingTips() {
  return (
    <AnimatePresence mode="wait">
      {tips.map((tip, index) => (
        <motion.p
          key={index}
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
          transition={{
            duration: 4,
            delay: index * 4,
            repeat: Infinity,
            repeatDelay: (tips.length - 1) * 4,
          }}
          style={{ display: index === 0 ? "block" : "none" }}
        >
          {tip}
        </motion.p>
      ))}
    </AnimatePresence>
  );
}

// ============================================
// Content Loading State
// ============================================

interface ContentLoadingProps {
  type?: "cards" | "list" | "text" | "mixed";
  count?: number;
  className?: string;
}

/**
 * ContentLoading - Skeleton loading for different content types
 * 
 * @example
 * ```tsx
 * <ContentLoading type="cards" count={6} />
 * ```
 */
export function ContentLoading({
  type = "mixed",
  count = 3,
  className = "",
}: ContentLoadingProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (type === "cards") {
    return (
      <motion.div
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <CardSkeleton hasImage lines={2} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "list") {
    return (
      <motion.div
        className={cn("space-y-3", className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="flex items-center gap-4 p-4 bg-card border rounded-lg"
          >
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "text") {
    return (
      <motion.div
        className={cn("space-y-4", className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Skeleton className="h-8 w-3/4 rounded" />
        <Skeleton lines count={count} />
      </motion.div>
    );
  }

  // Mixed type
  return (
    <motion.div
      className={cn("space-y-6", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <CardSkeleton hasImage={false} lines={2} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// Button Loading State
// ============================================

interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  spinnerSize?: "sm" | "md" | "lg";
}

/**
 * ButtonLoading - Button with loading state
 * 
 * @example
 * ```tsx
 * <ButtonLoading loading={isSubmitting}>
 *   Submit
 * </ButtonLoading>
 * ```
 */
export function ButtonLoading({
  loading = false,
  children,
  spinnerSize = "sm",
}: ButtonLoadingProps) {
  return (
    <div className="relative inline-flex items-center">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <LoadingSpinner size={spinnerSize} />
            <span>Loading...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Inline Loading
// ============================================

interface InlineLoadingProps {
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
  size?: "sm" | "md" | "lg";
}

/**
 * InlineLoading - Compact inline loading indicator
 * 
 * @example
 * ```tsx
 * <InlineLoading text="Saving..." variant="dots" size="sm" />
 * ```
 */
export function InlineLoading({
  text = "Loading...",
  variant = "spinner",
  size = "sm",
}: InlineLoadingProps) {
  const loaders = {
    spinner: <LoadingSpinner size={size} />,
    dots: <LoadingDots size={size} />,
    pulse: <LoadingPulse size={size} />,
  };

  return (
    <motion.div
      className="flex items-center gap-2 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {loaders[variant]}
      <span className="text-sm">{text}</span>
    </motion.div>
  );
}

// ============================================
// Loading Pulse (re-export with animation)
// ============================================

import { LoadingPulse } from "@/components/animations";

// ============================================
// Staggered Card Loading
// ============================================

interface StaggeredCardLoadingProps {
  count?: number;
  columns?: number;
}

/**
 * StaggeredCardLoading - Cards that load in with stagger effect
 * 
 * @example
 * ```tsx
 * <StaggeredCardLoading count={6} columns={3} />
 * ```
 */
export function StaggeredCardLoading({
  count = 6,
  columns = 3,
}: StaggeredCardLoadingProps) {
  return (
    <div
      className={cn("grid gap-4", {
        "grid-cols-1": columns === 1,
        "grid-cols-1 md:grid-cols-2": columns === 2,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
      })}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: i * 0.08,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <CardSkeleton hasImage lines={2} />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Data Loading Wrapper
// ============================================

interface DataLoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  error?: Error | null;
  errorComponent?: React.ReactNode;
}

/**
 * DataLoadingWrapper - Handles loading and error states
 * 
 * @example
 * ```tsx
 * <DataLoadingWrapper 
 *   isLoading={isLoading} 
 *   error={error}
 *   loadingComponent={<StaggeredCardLoading />}
 * >
 *   <YourData />
 * </DataLoadingWrapper>
 * ```
 */
export function DataLoadingWrapper({
  isLoading,
  children,
  loadingComponent,
  error,
  errorComponent,
}: DataLoadingWrapperProps) {
  if (error) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {errorComponent || (
            <div className="text-center py-12">
              <p className="text-rose-500">Something went wrong</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {loadingComponent || <ContentLoading type="mixed" />}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
