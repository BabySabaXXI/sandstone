"use client";

import { ReactNode, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  PanInfo,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { gpuOptimized, dragConstraints, dragElastic } from "./animation-config";

// ============================================
// Types
// ============================================

interface SwipeableProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

interface DraggableProps {
  children: ReactNode;
  onDragEnd?: (info: PanInfo) => void;
  onDragStart?: (info: PanInfo) => void;
  constraints?: "parent" | { left: number; right: number; top: number; bottom: number };
  className?: string;
  snapToOrigin?: boolean;
}

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  pullDistance?: number;
}

interface SwipeableItemProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

// ============================================
// Swipeable Component
// ============================================

/**
 * Swipeable - Detects swipe gestures in any direction
 * 
 * @example
 * ```tsx
 * <Swipeable
 *   onSwipeLeft={() => console.log('swiped left')}
 *   onSwipeRight={() => console.log('swiped right')}
 *   threshold={50}
 * >
 *   <Card>Swipe me</Card>
 * </Swipeable>
 * ```
 */
export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = "",
}: SwipeableProps) {
  const controls = useAnimation();
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  const handleDragEnd = useCallback(
    async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipeThreshold = Math.abs(offset.x) > threshold || Math.abs(offset.y) > threshold;
      const velocityThreshold = Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500;

      if (swipeThreshold || velocityThreshold) {
        // Determine swipe direction
        if (Math.abs(offset.x) > Math.abs(offset.y)) {
          // Horizontal swipe
          if (offset.x > 0) {
            setSwipeDirection("right");
            onSwipeRight?.();
          } else {
            setSwipeDirection("left");
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (offset.y > 0) {
            setSwipeDirection("down");
            onSwipeDown?.();
          } else {
            setSwipeDirection("up");
            onSwipeUp?.();
          }
        }
      }

      // Reset position
      await controls.start({
        x: 0,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      });
      setSwipeDirection(null);
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, controls]
  );

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      dragElastic={dragElastic}
      onDragEnd={handleDragEnd}
      animate={controls}
      className={cn("touch-pan-y", className)}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Draggable Component
// ============================================

/**
 * Draggable - Makes any element draggable with constraints
 * 
 * @example
 * ```tsx
 * <Draggable
 *   constraints="parent"
 *   snapToOrigin
 *   onDragEnd={(info) => console.log('dropped at', info.point)}
 * >
 *   <div className="w-20 h-20 bg-primary rounded-lg" />
 * </Draggable>
 * ```
 */
export function Draggable({
  children,
  onDragEnd,
  onDragStart,
  constraints = "parent",
  className = "",
  snapToOrigin = false,
}: DraggableProps) {
  const controls = useAnimation();

  const handleDragEnd = useCallback(
    async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      onDragEnd?.(info);

      if (snapToOrigin) {
        await controls.start({
          x: 0,
          y: 0,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        });
      }
    },
    [onDragEnd, snapToOrigin, controls]
  );

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragElastic={0.1}
      dragMomentum={!snapToOrigin}
      onDragStart={(_, info) => onDragStart?.(info)}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      whileHover={{ cursor: "grab" }}
      className={className}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Pull to Refresh
// ============================================

/**
 * PullToRefresh - Pull down to refresh content
 * 
 * @example
 * ```tsx
 * <PullToRefresh onRefresh={async () => await refetch()}>
 *   <YourContent />
 * </PullToRefresh>
 * ```
 */
export function PullToRefresh({
  children,
  onRefresh,
  className = "",
  pullDistance = 80,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 0 && !isRefreshing) {
        const progress = Math.min(info.offset.y / pullDistance, 1);
        setPullProgress(progress);
      }
    },
    [isRefreshing, pullDistance]
  );

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > pullDistance && !isRefreshing) {
        setIsRefreshing(true);
        setPullProgress(1);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullProgress(0);
          await controls.start({ y: 0 });
        }
      } else {
        setPullProgress(0);
        await controls.start({ y: 0 });
      }
    },
    [isRefreshing, pullDistance, onRefresh, controls]
  );

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-4"
        style={{
          opacity: pullProgress,
          y: -pullDistance + pullProgress * pullDistance,
        }}
      >
        <motion.div
          animate={{ rotate: pullProgress * 180 }}
          className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          style={{
            borderTopColor: isRefreshing ? "transparent" : undefined,
          }}
        >
          {isRefreshing && (
            <motion.div
              className="w-full h-full border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          y: isRefreshing ? pullDistance : pullProgress * pullDistance,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// Swipeable List Item (with actions)
// ============================================

/**
 * SwipeableItem - List item with swipe-to-reveal actions
 * 
 * @example
 * ```tsx
 * <SwipeableItem
 *   onDelete={() => deleteItem(id)}
 *   onEdit={() => editItem(id)}
 * >
 *   <Card>Item content</Card>
 * </SwipeableItem>
 * ```
 */
export function SwipeableItem({
  children,
  onDelete,
  onEdit,
  className = "",
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isRevealed, setIsRevealed] = useState(false);

  // Transform x position to background color opacity
  const backgroundOpacity = useTransform(x, [-100, 0], [1, 0]);
  const deleteOpacity = useTransform(x, [-150, -100, -50], [1, 1, 0]);
  const editOpacity = useTransform(x, [50, 100, 150], [0, 1, 1]);

  const handleDragEnd = useCallback(
    async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 80;

      if (info.offset.x < -threshold && onDelete) {
        // Swiped left - show delete
        await controls.start({ x: -100 });
        setIsRevealed(true);
      } else if (info.offset.x > threshold && onEdit) {
        // Swiped right - show edit
        await controls.start({ x: 100 });
        setIsRevealed(true);
      } else {
        // Snap back
        await controls.start({ x: 0 });
        setIsRevealed(false);
      }
    },
    [onDelete, onEdit, controls]
  );

  const handleAction = useCallback(
    async (action: () => void) => {
      await controls.start({ x: 0, opacity: 0 });
      action();
    },
    [controls]
  );

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {/* Edit action (left side) */}
        {onEdit && (
          <motion.button
            style={{ opacity: editOpacity }}
            onClick={() => handleAction(onEdit)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </motion.button>
        )}

        {/* Delete action (right side) */}
        {onDelete && (
          <motion.button
            style={{ opacity: deleteOpacity }}
            onClick={() => handleAction(onDelete)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </motion.button>
        )}
      </div>

      {/* Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: onDelete ? -150 : 0, right: onEdit ? 150 : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// Magnetic Button
// ============================================

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

/**
 * MagneticButton - Button that follows cursor on hover
 * 
 * @example
 * ```tsx
 * <MagneticButton strength={0.3}>
 *   Hover me
 * </MagneticButton>
 * ```
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = (e.clientX - centerX) * strength;
      const distanceY = (e.clientY - centerY) * strength;

      x.set(distanceX);
      y.set(distanceY);
    },
    [strength, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
      }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// Tilt Card
// ============================================

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
}

/**
 * TiltCard - Card that tilts based on mouse position
 * 
 * @example
 * ```tsx
 * <TiltCard maxTilt={15} scale={1.05}>
 *   <Card>Hover to tilt</Card>
 * </TiltCard>
 * ```
 */
export function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  scale = 1.02,
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateXValue = (mouseY / (rect.height / 2)) * -maxTilt;
      const rotateYValue = (mouseX / (rect.width / 2)) * maxTilt;

      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
    },
    [maxTilt, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective,
      }}
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Gesture Carousel
// ============================================

interface GestureCarouselProps {
  children: ReactNode[];
  className?: string;
  itemWidth?: number;
  gap?: number;
}

/**
 * GestureCarousel - Touch-friendly carousel with gestures
 * 
 * @example
 * ```tsx
 * <GestureCarousel itemWidth={300} gap={16}>
 *   {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 * </GestureCarousel>
 * ```
 */
export function GestureCarousel({
  children,
  className = "",
  itemWidth = 300,
  gap = 16,
}: GestureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  const totalWidth = children.length * (itemWidth + gap);
  const maxScroll = Math.max(0, totalWidth - (containerRef.current?.clientWidth || 0));

  const handleDragEnd = useCallback(
    async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      let newIndex = currentIndex;

      if (Math.abs(velocity) > 500) {
        // Velocity-based navigation
        newIndex = velocity > 0
          ? Math.max(0, currentIndex - 1)
          : Math.min(children.length - 1, currentIndex + 1);
      } else if (Math.abs(offset) > itemWidth / 2) {
        // Distance-based navigation
        newIndex = offset > 0
          ? Math.max(0, currentIndex - 1)
          : Math.min(children.length - 1, currentIndex + 1);
      }

      setCurrentIndex(newIndex);
      await controls.start({
        x: -newIndex * (itemWidth + gap),
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    },
    [currentIndex, children.length, itemWidth, gap, controls]
  );

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -maxScroll, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="flex"
      >
        {children.map((child, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0"
            style={{ width: itemWidth, marginRight: gap }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={async () => {
              setCurrentIndex(index);
              await controls.start({
                x: -index * (itemWidth + gap),
                transition: { type: "spring", stiffness: 300, damping: 30 },
              });
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Pinch to Zoom
// ============================================

interface PinchZoomProps {
  children: ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
}

/**
 * PinchZoom - Container that supports pinch-to-zoom gesture
 * 
 * @example
 * ```tsx
 * <PinchZoom minScale={0.5} maxScale={3}>
 *   <img src="image.jpg" alt="Zoomable" />
 * </PinchZoom>
 * ```
 */
export function PinchZoom({
  children,
  className = "",
  minScale = 0.5,
  maxScale = 3,
}: PinchZoomProps) {
  const scale = useMotionValue(1);
  const controls = useAnimation();

  const handleDoubleClick = useCallback(async () => {
    const currentScale = scale.get();
    const newScale = currentScale > 1 ? 1 : 2;

    await controls.start({
      scale: newScale,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
    scale.set(newScale);
  }, [scale, controls]);

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      onDoubleClick={handleDoubleClick}
    >
      <motion.div
        drag
        dragConstraints="parent"
        dragElastic={0}
        whileTap={{ cursor: "grabbing" }}
        animate={controls}
        style={{ scale }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Long Press Button
// ============================================

interface LongPressButtonProps {
  children: ReactNode;
  onLongPress: () => void;
  onClick?: () => void;
  className?: string;
  duration?: number;
}

/**
 * LongPressButton - Button that triggers action on long press
 * 
 * @example
 * ```tsx
 * <LongPressButton
 *   onLongPress={() => console.log('long pressed!')}
 *   duration={800}
 * >
 *   Hold me
 * </LongPressButton>
 * ```
 */
export function LongPressButton({
  children,
  onLongPress,
  onClick,
  className = "",
  duration = 800,
}: LongPressButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = useCallback(() => {
    setIsPressing(true);
    setProgress(0);

    // Update progress
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / duration, 1));
    }, 16);

    // Trigger long press
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressing(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, duration);
  }, [duration, onLongPress]);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPressing && progress < 1) {
      onClick?.();
    }

    setIsPressing(false);
    setProgress(0);
  }, [isPressing, progress, onClick]);

  return (
    <motion.button
      className={cn("relative overflow-hidden", className)}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      whileTap={{ scale: 0.98 }}
    >
      {/* Progress indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-primary/30"
        style={{ width: `${progress * 100}%` }}
      />
      {children}
    </motion.button>
  );
}
