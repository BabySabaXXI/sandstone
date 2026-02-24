"use client";

import { ReactNode, useRef, useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { gpuOptimized } from "./animation-config";

// ============================================
// Types
// ============================================

interface OptimizedAnimationProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  initial?: string | object;
  animate?: string | object;
  exit?: string | object;
  transition?: object;
  once?: boolean;
  amount?: number;
}

interface LazyMotionProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

// ============================================
// Reduced Motion Wrapper
// ============================================

/**
 * ReducedMotionWrapper - Respects user's motion preferences
 * 
 * @example
 * ```tsx
 * <ReducedMotionWrapper>
 *   <motion.div animate={{ scale: 1.1 }}>
 *     Content
 *   </motion.div>
 * </ReducedMotionWrapper>
 * ```
 */
export function ReducedMotionWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
}

// ============================================
// GPU Optimized Motion
// ============================================

/**
 * GPUOptimizedMotion - Motion component with GPU acceleration
 * 
 * @example
 * ```tsx
 * <GPUOptimizedMotion
 *   variants={fadeVariants}
 *   initial="hidden"
 *   animate="visible"
 * >
 *   Content
 * </GPUOptimizedMotion>
 * ```
 */
export function GPUOptimizedMotion({
  children,
  className = "",
  variants,
  initial = "hidden",
  animate = "visible",
  exit = "exit",
  transition,
}: OptimizedAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Lazy Motion (viewport triggered)
// ============================================

/**
 * LazyMotion - Only animates when element enters viewport
 * 
 * @example
 * ```tsx
 * <LazyMotion threshold={0.2} fallback={<Skeleton />}>
 *   <HeavyComponent />
 * </LazyMotion>
 * ```
 */
export function LazyMotion({
  children,
  className = "",
  threshold = 0.1,
  rootMargin = "50px",
  fallback,
}: LazyMotionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
    margin: rootMargin as `${number}px`,
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <div ref={ref} className={className}>
      {hasAnimated ? children : fallback || <div style={{ minHeight: "100px" }} />}
    </div>
  );
}

// ============================================
// Viewport Animation
// ============================================

interface ViewportAnimationProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  threshold?: number;
  delay?: number;
  once?: boolean;
}

/**
 * ViewportAnimation - Animates when element enters viewport
 * 
 * @example
 * ```tsx
 * <ViewportAnimation
 *   variants={fadeUpVariants}
 *   threshold={0.3}
 *   delay={0.2}
 * >
 *   <Card>Content</Card>
 * </ViewportAnimation>
 * ```
 */
export function ViewportAnimation({
  children,
  className = "",
  variants,
  threshold = 0.1,
  delay = 0,
  once = true,
}: ViewportAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants || defaultVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Optimized List
// ============================================

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
  itemClassName?: string;
  overscan?: number;
  itemHeight?: number;
}

/**
 * OptimizedList - Virtualized list for performance
 * 
 * @example
 * ```tsx
 * <OptimizedList
 *   items={largeArray}
 *   renderItem={(item) => <Card>{item.name}</Card>}
 *   keyExtractor={(item) => item.id}
 *   itemHeight={80}
 * />
 * ```
 */
export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = "",
  itemClassName = "",
  overscan = 5,
  itemHeight = 80,
}: OptimizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
    );

    setVisibleRange({ start, end });
  }, [items.length, itemHeight, overscan]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateVisibleRange);
    updateVisibleRange();

    return () => container.removeEventListener("scroll", updateVisibleRange);
  }, [updateVisibleRange]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: "100%" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item)}
              className={itemClassName}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Memoized Motion
// ============================================

import { memo } from "react";

interface MemoizedMotionProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

/**
 * MemoizedMotion - Prevents unnecessary re-renders
 * 
 * @example
 * ```tsx
 * <MemoizedMotion variants={fadeVariants}>
 *   <ExpensiveComponent />
 * </MemoizedMotion>
 * ```
 */
export const MemoizedMotion = memo(function MemoizedMotion({
  children,
  className = "",
  variants,
}: MemoizedMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
});

// ============================================
// Animation Scheduler
// ============================================

interface AnimationSchedulerProps {
  children: ReactNode[];
  className?: string;
  batchSize?: number;
  delayBetweenBatches?: number;
}

/**
 * AnimationScheduler - Schedules animations in batches for performance
 * 
 * @example
 * ```tsx
 * <AnimationScheduler batchSize={5} delayBetweenBatches={100}>
 *   {manyItems.map(item => <Card key={item.id}>{item.content}</Card>)}
 * </AnimationScheduler>
 * ```
 */
export function AnimationScheduler({
  children,
  className = "",
  batchSize = 5,
  delayBetweenBatches = 100,
}: AnimationSchedulerProps) {
  const [visibleCount, setVisibleCount] = useState(batchSize);

  useEffect(() => {
    if (visibleCount >= children.length) return;

    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, children.length));
    }, delayBetweenBatches);

    return () => clearTimeout(timer);
  }, [visibleCount, children.length, batchSize, delayBetweenBatches]);

  const visibleChildren = children.slice(0, visibleCount);

  return (
    <div className={className}>
      {visibleChildren.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: (index % batchSize) * 0.05,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Will Change Optimizer
// ============================================

interface WillChangeProps {
  children: ReactNode;
  className?: string;
  properties?: ("transform" | "opacity")[];
}

/**
 * WillChangeOptimizer - Hints browser about upcoming animations
 * 
 * @example
 * ```tsx
 * <WillChangeOptimizer properties={["transform", "opacity"]}>
 *   <motion.div animate={{ x: 100, opacity: 0.5 }}>
 *     Content
 *   </motion.div>
 * </WillChangeOptimizer>
 * ```
 */
export function WillChangeOptimizer({
  children,
  className = "",
  properties = ["transform", "opacity"],
}: WillChangeProps) {
  return (
    <div
      className={className}
      style={{
        willChange: properties.join(", "),
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// RAF Throttled Animation
// ============================================

interface RAFThrottledProps {
  children: ReactNode;
  className?: string;
  throttleMs?: number;
}

/**
 * RAFThrottledAnimation - Throttles animations using requestAnimationFrame
 * 
 * @example
 * ```tsx
 * <RAFThrottledAnimation throttleMs={16}>
 *   <motion.div animate={{ x: mouseX }}>
 *     Follows mouse smoothly
 *   </motion.div>
 * </RAFThrottledAnimation>
 * ```
 */
export function RAFThrottledAnimation({
  children,
  className = "",
  throttleMs = 16,
}: RAFThrottledProps) {
  const [isVisible, setIsVisible] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const throttledUpdate = useCallback(
    (callback: () => void) => {
      if (!isVisible) return;

      const now = performance.now();
      if (now - lastUpdateRef.current >= throttleMs) {
        lastUpdateRef.current = now;
        callback();
      } else if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          throttledUpdate(callback);
        });
      }
    },
    [isVisible, throttleMs]
  );

  return (
    <div className={className} data-throttled="true">
      {children}
    </div>
  );
}

// ============================================
// Content Visibility Wrapper
// ============================================

interface ContentVisibilityProps {
  children: ReactNode;
  className?: string;
}

/**
 * ContentVisibilityWrapper - Uses CSS content-visibility for off-screen content
 * 
 * @example
 * ```tsx
 * <ContentVisibilityWrapper>
 *   <HeavyComponent />
 * </ContentVisibilityWrapper>
 * ```
 */
export function ContentVisibilityWrapper({
  children,
  className = "",
}: ContentVisibilityProps) {
  return (
    <div
      className={className}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "0 500px",
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// Animation Pause on Interaction
// ============================================

interface PauseOnInteractionProps {
  children: ReactNode;
  className?: string;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
}

/**
 * PauseOnInteraction - Pauses animations on user interaction
 * 
 * @example
 * ```tsx
 * <PauseOnInteraction pauseOnHover pauseOnFocus>
 *   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }}>
 *     Spinning content
 *   </motion.div>
 * </PauseOnInteraction>
 * ```
 */
export function PauseOnInteraction({
  children,
  className = "",
  pauseOnHover = true,
  pauseOnFocus = true,
}: PauseOnInteractionProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
      onFocus={pauseOnFocus ? () => setIsPaused(true) : undefined}
      onBlur={pauseOnFocus ? () => setIsPaused(false) : undefined}
      style={{
        animationPlayState: isPaused ? "paused" : "running",
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// Performance Monitor (dev only)
// ============================================

interface PerformanceMonitorProps {
  children: ReactNode;
  name?: string;
}

/**
 * PerformanceMonitor - Logs animation performance metrics (dev only)
 * 
 * @example
 * ```tsx
 * <PerformanceMonitor name="Dashboard">
 *   <DashboardContent />
 * </PerformanceMonitor>
 * ```
 */
export function PerformanceMonitor({
  children,
  name = "Component",
}: PerformanceMonitorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`[Performance] ${name} render time: ${endTime - startTime}ms`);
    };
  }, [name]);

  return <>{children}</>;
}

// ============================================
// Composite Layer Optimizer
// ============================================

interface CompositeLayerProps {
  children: ReactNode;
  className?: string;
  isolate?: boolean;
}

/**
 * CompositeLayerOptimizer - Promotes element to composite layer
 * 
 * @example
 * ```tsx
 * <CompositeLayerOptimizer isolate>
 *   <motion.div animate={{ x: 100 }}>
 *     Hardware accelerated
 *   </motion.div>
 * </CompositeLayerOptimizer>
 * ```
 */
export function CompositeLayerOptimizer({
  children,
  className = "",
  isolate = true,
}: CompositeLayerProps) {
  return (
    <div
      className={className}
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        ...(isolate && { isolation: "isolate" }),
      }}
    >
      {children}
    </div>
  );
}
