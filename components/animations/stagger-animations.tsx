"use client";

import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  staggerContainerVariants,
  staggerItemVariants,
  listContainerVariants,
  listItemVariants,
  gpuOptimized,
} from "./animation-config";

// ============================================
// Types
// ============================================

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

// ============================================
// Stagger Container
// ============================================

/**
 * StaggerContainer - Container that staggers children animations
 * 
 * @example
 * ```tsx
 * <StaggerContainer staggerDelay={0.1} direction="up">
 *   <StaggerItem><Card>Item 1</Card></StaggerItem>
 *   <StaggerItem><Card>Item 2</Card></StaggerItem>
 *   <StaggerItem><Card>Item 3</Card></StaggerItem>
 * </StaggerContainer>
 * ```
 */
export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
  initialDelay = 0.1,
  direction = "up",
}: StaggerContainerProps) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  const customVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={customVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      style={gpuOptimized}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger Item
// ============================================

/**
 * StaggerItem - Individual item within a stagger container
 * 
 * @example
 * ```tsx
 * <StaggerItem className="mb-4">
 *   <Card>Content</Card>
 * </StaggerItem>
 * ```
 */
export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
          },
        },
        exit: {
          opacity: 0,
          y: -10,
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
// Animated List
// ============================================

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  direction?: "left" | "right" | "up" | "down";
}

/**
 * AnimatedList - List with staggered item animations
 * 
 * @example
 * ```tsx
 * <AnimatedList staggerDelay={0.05} direction="left">
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </AnimatedList>
 * ```
 */
export function AnimatedList({
  children,
  className = "",
  itemClassName = "",
  staggerDelay = 0.05,
  direction = "left",
}: AnimatedListProps) {
  const directionOffset = {
    left: { x: -20 },
    right: { x: 20 },
    up: { y: 20 },
    down: { y: -20 },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...directionOffset[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: direction === "left" ? 20 : direction === "right" ? -20 : 0,
      y: direction === "up" ? -20 : direction === "down" ? 20 : 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={itemClassName}
              style={gpuOptimized}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

// ============================================
// Animated Grid
// ============================================

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  columns?: number;
  staggerDelay?: number;
}

/**
 * AnimatedGrid - Grid with staggered item animations
 * 
 * @example
 * ```tsx
 * <AnimatedGrid columns={3} staggerDelay={0.08}>
 *   {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 * </AnimatedGrid>
 * ```
 */
export function AnimatedGrid({
  children,
  className = "",
  columns = 3,
  staggerDelay = 0.08,
}: AnimatedGridProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        columns === 5 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              style={gpuOptimized}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

// ============================================
// Fade In Stagger
// ============================================

interface FadeInStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

/**
 * FadeInStagger - Simple fade-in stagger effect
 * 
 * @example
 * ```tsx
 * <FadeInStagger staggerDelay={0.1}>
 *   <p>Line 1</p>
 *   <p>Line 2</p>
 *   <p>Line 3</p>
 * </FadeInStagger>
 * ```
 */
export function FadeInStagger({
  children,
  className = "",
  staggerDelay = 0.1,
  initialDelay = 0,
}: FadeInStaggerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>}
    </motion.div>
  );
}

// ============================================
// Cascade Animation
// ============================================

interface CascadeProps {
  children: ReactNode;
  className?: string;
  cascadeDelay?: number;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Cascade - Items cascade in from one direction
 * 
 * @example
 * ```tsx
 * <Cascade cascadeDelay={0.1} direction="right">
 *   {items.map(item => <Card key={item.id}>{item.content}</Card>)}
 * </Cascade>
 * ```
 */
export function Cascade({
  children,
  className = "",
  cascadeDelay = 0.1,
  direction = "up",
}: CascadeProps) {
  const directionOffset = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  const offset = directionOffset[direction];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: cascadeDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...offset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              style={gpuOptimized}
            >
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>}
    </motion.div>
  );
}

// ============================================
// Reveal Stagger
// ============================================

interface RevealStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  revealDirection?: "top" | "bottom" | "left" | "right";
}

/**
 * RevealStagger - Items reveal with a sliding mask effect
 * 
 * @example
 * ```tsx
 * <RevealStagger staggerDelay={0.15} revealDirection="left">
 *   {items.map(item => <div key={item.id}>{item.content}</div>)}
 * </RevealStagger>
 * ```
 */
export function RevealStagger({
  children,
  className = "",
  staggerDelay = 0.15,
  revealDirection = "left",
}: RevealStaggerProps) {
  const clipPathStart = {
    top: "inset(100% 0 0 0)",
    bottom: "inset(0 0 100% 0)",
    left: "inset(0 100% 0 0)",
    right: "inset(0 0 0 100%)",
  };

  const clipPathEnd = "inset(0 0 0 0)";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      clipPath: clipPathStart[revealDirection],
    },
    visible: {
      opacity: 1,
      clipPath: clipPathEnd,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              style={gpuOptimized}
            >
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>}
    </motion.div>
  );
}

// ============================================
// Typewriter Effect
// ============================================

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

/**
 * Typewriter - Text that types out character by character
 * 
 * @example
 * ```tsx
 * <Typewriter text="Hello, World!" speed={50} cursor />
 * ```
 */
export function Typewriter({
  text,
  className = "",
  speed = 50,
  delay = 0,
  cursor = true,
}: TypewriterProps) {
  const characters = text.split("");

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed / 1000,
        delayChildren: delay,
      },
    },
  };

  const characterVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.01 },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={characterVariants}>
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.span>
  );
}

// ============================================
// Blur In Stagger
// ============================================

interface BlurInStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * BlurInStagger - Items fade in with blur effect
 * 
 * @example
 * ```tsx
 * <BlurInStagger staggerDelay={0.1}>
 *   {items.map(item => <div key={item.id}>{item.content}</div>)}
 * </BlurInStagger>
 * ```
 */
export function BlurInStagger({
  children,
  className = "",
  staggerDelay = 0.1,
}: BlurInStaggerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>}
    </motion.div>
  );
}
