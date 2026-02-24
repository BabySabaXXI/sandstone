"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  pageTransitionVariants,
  pageSlideVariants,
  fadeVariants,
  gpuOptimized,
} from "./animation-config";

// ============================================
// Types
// ============================================

type TransitionType = "fade" | "slide" | "scale" | "none";

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  className?: string;
  mode?: "wait" | "sync" | "popLayout";
  customVariants?: Variants;
  duration?: number;
}

// ============================================
// Transition Variants Map
// ============================================

const transitionVariants: Record<TransitionType, Variants> = {
  fade: fadeVariants,
  slide: pageSlideVariants,
  scale: pageTransitionVariants,
  none: {
    hidden: {},
    visible: {},
    exit: {},
  },
};

// ============================================
// Page Transition Component
// ============================================

/**
 * PageTransition - Wraps page content with animated transitions
 * 
 * @example
 * ```tsx
 * <PageTransition type="slide">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  type = "fade",
  className = "",
  mode = "wait",
  customVariants,
  duration,
}: PageTransitionProps) {
  const pathname = usePathname();
  const variants = customVariants || transitionVariants[type];

  // Apply custom duration if provided
  const modifiedVariants = duration
    ? {
        ...variants,
        visible: {
          ...(variants.visible as object),
          transition: {
            ...(typeof variants.visible === "object" && "transition" in variants.visible
              ? variants.visible.transition
              : {}),
            duration,
          },
        },
        exit: {
          ...(variants.exit as object),
          transition: {
            ...(typeof variants.exit === "object" && "transition" in variants.exit
              ? variants.exit.transition
              : {}),
            duration: duration * 0.5,
          },
        },
      }
    : variants;

  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modifiedVariants}
        className={className}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Animated Page Wrapper
// ============================================

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

/**
 * AnimatedPage - Provides staggered entrance animation for page content
 * 
 * @example
 * ```tsx
 * <AnimatedPage delay={0.2}>
 *   <Header />
 *   <Content />
 *   <Footer />
 * </AnimatedPage>
 * ```
 */
export function AnimatedPage({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
}: AnimatedPageProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay,
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
        exit: {
          opacity: 0,
          transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
          },
        },
      }}
      className={className}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Animated Section
// ============================================

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

/**
 * AnimatedSection - Animates individual sections within a page
 * 
 * @example
 * ```tsx
 * <AnimatedSection delay={0.1} direction="up">
 *   <Card>Content</Card>
 * </AnimatedSection>
 * ```
 */
export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          ...directionOffset[direction],
        },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
            delay,
          },
        },
        exit: {
          opacity: 0,
          transition: { duration: 0.2 },
        },
      }}
      className={className}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Route Transition Provider
// ============================================

interface RouteTransitionProviderProps {
  children: ReactNode;
}

/**
 * RouteTransitionProvider - Wraps the entire app for route-based transitions
 * Should be used in the root layout
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <RouteTransitionProvider>
 *   {children}
 * </RouteTransitionProvider>
 * ```
 */
export function RouteTransitionProvider({
  children,
}: RouteTransitionProviderProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Directional Page Transition (for slide effects)
// ============================================

interface DirectionalPageTransitionProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}

export function DirectionalPageTransition({
  children,
  direction = "right",
  className = "",
}: DirectionalPageTransitionProps) {
  const pathname = usePathname();

  const directionOffset = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    up: { x: 0, y: -100 },
    down: { x: 0, y: 100 },
  };

  const offset = directionOffset[direction];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...offset }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={className}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
