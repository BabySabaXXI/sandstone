"use client";

/**
 * Transition Animations Component
 * 
 * A collection of animated transition components for:
 * - Page transitions
 * - Element transitions
 * - List animations
 * - Stagger animations
 * - Scroll-triggered animations
 */

import * as React from "react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";

import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export type AnimationDirection = "up" | "down" | "left" | "right" | "none";
export type AnimationType = "fade" | "slide" | "scale" | "rotate" | "flip";

export interface TransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: number[];
}

// ============================================
// Animation Variants
// ============================================

const createFadeVariants = (delay: number = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
});

const createSlideVariants = (
  direction: AnimationDirection = "up",
  distance: number = 30,
  delay: number = 0
): Variants => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      ...directions[direction],
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
};

const createScaleVariants = (delay: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
});

const createRotateVariants = (delay: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    rotate: -10,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    rotate: 10,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
});

const createFlipVariants = (delay: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    rotateX: 90,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
});

// ============================================
// Fade In Component
// ============================================

export const FadeIn: React.FC<TransitionProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.4,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// Slide In Component
// ============================================

export interface SlideInProps extends TransitionProps {
  direction?: AnimationDirection;
  distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  className,
  direction = "up",
  distance = 30,
  delay = 0,
  duration = 0.5,
}) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directions[direction] }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Scale In Component
// ============================================

export const ScaleIn: React.FC<TransitionProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.4,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration, delay, ease: [0.34, 1.56, 0.64, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// Animated Container Component
// ============================================

export interface AnimatedContainerProps extends TransitionProps {
  animation?: AnimationType;
  direction?: AnimationDirection;
  stagger?: boolean;
  staggerDelay?: number;
  show?: boolean;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  animation = "fade",
  direction = "up",
  delay = 0,
  duration = 0.5,
  stagger = false,
  staggerDelay = 0.1,
  show = true,
}) => {
  const getVariants = (): Variants => {
    switch (animation) {
      case "slide":
        return createSlideVariants(direction, 30, delay);
      case "scale":
        return createScaleVariants(delay);
      case "rotate":
        return createRotateVariants(delay);
      case "flip":
        return createFlipVariants(delay);
      case "fade":
      default:
        return createFadeVariants(delay);
    }
  };

  const containerVariants: Variants = stagger
    ? {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
        exit: {
          transition: {
            staggerChildren: staggerDelay * 0.5,
            staggerDirection: -1,
          },
        },
      }
    : getVariants();

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Animated Item Component (for stagger)
// ============================================

export interface AnimatedItemProps extends TransitionProps {
  animation?: AnimationType;
  direction?: AnimationDirection;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  className,
  animation = "fade",
  direction = "up",
}) => {
  const getVariants = (): Variants => {
    switch (animation) {
      case "slide":
        return createSlideVariants(direction, 20, 0);
      case "scale":
        return createScaleVariants(0);
      case "rotate":
        return createRotateVariants(0);
      case "flip":
        return createFlipVariants(0);
      case "fade":
      default:
        return createFadeVariants(0);
    }
  };

  return (
    <motion.div variants={getVariants()} className={className}>
      {children}
    </motion.div>
  );
};

// ============================================
// Stagger Container Component
// ============================================

export interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0,
  direction = "up",
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
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
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

// ============================================
// Scroll Reveal Component
// ============================================

export interface ScrollRevealProps extends TransitionProps {
  threshold?: number;
  once?: boolean;
  animation?: AnimationType;
  direction?: AnimationDirection;
  rootMargin?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  threshold = 0.1,
  once = true,
  animation = "fade",
  direction = "up",
  delay = 0,
  duration = 0.5,
  rootMargin = "0px",
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  const getVariants = (): Variants => {
    switch (animation) {
      case "slide":
        return createSlideVariants(direction, 30, delay);
      case "scale":
        return createScaleVariants(delay);
      case "rotate":
        return createRotateVariants(delay);
      case "flip":
        return createFlipVariants(delay);
      case "fade":
      default:
        return createFadeVariants(delay);
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Page Transition Component
// ============================================

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  mode?: "wait" | "sync" | "popLayout";
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  mode = "wait",
}) => {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={typeof children === "string" ? children : undefined}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// List Animation Component
// ============================================

export interface ListAnimationProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export const ListAnimation: React.FC<ListAnimationProps> = ({
  children,
  className,
  itemClassName,
  staggerDelay = 0.05,
  initialDelay = 0,
}) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
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
      <AnimatePresence>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={itemClassName}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// Collapse/Expand Component
// ============================================

export interface CollapseProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  duration?: number;
}

export const Collapse: React.FC<CollapseProps> = ({
  children,
  isOpen,
  className,
  duration = 0.3,
}) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          height: { duration, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: duration * 0.5 },
        }}
        className={cn("overflow-hidden", className)}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// ============================================
// Modal/Dialog Transition Component
// ============================================

export interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  overlayClassName?: string;
  onClose?: () => void;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({
  children,
  isOpen,
  className,
  overlayClassName,
  onClose,
}) => {
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm",
              overlayClassName
            )}
            onClick={onClose}
          />
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative z-10 bg-card rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto",
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Tab Panel Transition Component
// ============================================

export interface TabPanelProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  direction?: "horizontal" | "vertical";
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  isActive,
  className,
  direction = "horizontal",
}) => {
  const slideDirection = direction === "horizontal" ? "x" : "y";

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, [slideDirection]: 20 }}
          animate={{ opacity: 1, [slideDirection]: 0 }}
          exit={{ opacity: 0, [slideDirection]: -20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Hover Scale Component
// ============================================

export interface HoverScaleProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  className,
  scale = 1.05,
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// ============================================
// Magnetic Button Component
// ============================================

export interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className,
  strength = 0.3,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;

      setPosition({
        x: distanceX * strength,
        y: distanceY * strength,
      });
    },
    [strength]
  );

  const handleMouseLeave = React.useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Parallax Component
// ============================================

export interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  className,
  speed = 0.5,
  direction = "up",
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + window.innerHeight;
      const multiplier = direction === "up" ? -1 : 1;

      setOffset(relativeScroll * speed * multiplier);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return (
    <motion.div
      ref={ref}
      style={{ y: offset }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// Export all components
// ============================================

export const TransitionAnimations = {
  FadeIn,
  SlideIn,
  ScaleIn,
  AnimatedContainer,
  AnimatedItem,
  StaggerContainer,
  ScrollReveal,
  PageTransition,
  ListAnimation,
  Collapse,
  ModalTransition,
  TabPanel,
  HoverScale,
  Magnetic,
  Parallax,
};

export default TransitionAnimations;
