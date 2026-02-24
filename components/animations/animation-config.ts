/**
 * Animation Configuration for Sandstone App
 * Centralized animation presets for consistent motion design
 */

import { Variants, Transition } from "framer-motion";

// ============================================
// Easing Functions
// ============================================

export const easings = {
  // Smooth and natural
  smooth: [0.4, 0, 0.2, 1],
  // Bouncy and playful
  bouncy: [0.68, -0.55, 0.265, 1.55],
  // Snappy and responsive
  snappy: [0.25, 0.46, 0.45, 0.94],
  // Dramatic entrance
  dramatic: [0.87, 0, 0.13, 1],
  // Gentle deceleration
  gentle: [0.0, 0, 0.2, 1],
  // Spring-like
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

// ============================================
// Duration Constants
// ============================================

export const durations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  dramatic: 1.2,
} as const;

// ============================================
// Transition Presets
// ============================================

export const transitions = {
  default: {
    duration: durations.normal,
    ease: easings.smooth,
  } as Transition,
  fast: {
    duration: durations.fast,
    ease: easings.snappy,
  } as Transition,
  slow: {
    duration: durations.slow,
    ease: easings.gentle,
  } as Transition,
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } as Transition,
  bounce: {
    type: "spring",
    stiffness: 300,
    damping: 15,
  } as Transition,
  stagger: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  } as Transition,
} as const;

// ============================================
// Fade Variants
// ============================================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

export const fadeDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: transitions.fast,
  },
};

export const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: transitions.fast,
  },
};

export const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: transitions.fast,
  },
};

// ============================================
// Scale Variants
// ============================================

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.bounce,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.fast,
  },
};

// ============================================
// Slide Variants
// ============================================

export const slideUpVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    y: "100%",
    transition: transitions.default,
  },
};

export const slideDownVariants: Variants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    y: "-100%",
    transition: transitions.default,
  },
};

export const slideLeftVariants: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    x: "-100%",
    transition: transitions.default,
  },
};

export const slideRightVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    x: "100%",
    transition: transitions.default,
  },
};

// ============================================
// Page Transition Variants
// ============================================

export const pageTransitionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: durations.fast,
      ease: easings.snappy,
    },
  },
};

export const pageSlideVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: durations.fast,
      ease: easings.snappy,
    },
  },
};

// ============================================
// Stagger Container Variants
// ============================================

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

// ============================================
// Card Variants
// ============================================

export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: transitions.spring,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ============================================
// Button Variants
// ============================================

export const buttonVariants: Variants = {
  rest: {
    scale: 1,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.05,
    transition: transitions.spring,
  },
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
  disabled: {
    scale: 1,
    opacity: 0.5,
  },
};

export const buttonPulseVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(251, 191, 36, 0)",
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 20px 5px rgba(251, 191, 36, 0.3)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
  },
};

// ============================================
// List Variants
// ============================================

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast,
  },
};

// ============================================
// Modal/Dialog Variants
// ============================================

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 },
  },
};

export const modalContentVariants: Variants = {
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
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// ============================================
// Loading Animation Variants
// ============================================

export const loadingSpinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export const loadingPulseVariants: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const loadingDotsVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const loadingDotVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================
// Notification/Toast Variants
// ============================================

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: transitions.fast,
  },
};

// ============================================
// Accordion Variants
// ============================================

export const accordionContentVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: easings.smooth },
      opacity: { duration: 0.2 },
    },
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: easings.smooth },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};

export const accordionIconVariants: Variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
};

// ============================================
// Tab Variants
// ============================================

export const tabIndicatorVariants: Variants = {
  initial: false,
  animate: {
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 35,
    },
  },
};

// ============================================
// Skeleton Loading Variants
// ============================================

export const skeletonShimmerVariants: Variants = {
  animate: {
    x: ["-100%", "100%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ============================================
// Scroll-triggered Reveal Variants
// ============================================

export const scrollRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
};

export const scrollRevealLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
};

export const scrollRevealRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
};

export const scrollRevealScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },
};

// ============================================
// Gesture-based Variants
// ============================================

export const dragConstraints = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export const dragElastic = 0.2;

export const swipeVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: transitions.default,
  }),
};

// ============================================
// Performance Optimizations
// ============================================

export const willChange = {
  transform: "transform",
  opacity: "opacity",
  auto: "auto",
} as const;

export const gpuOptimized = {
  transform: "translateZ(0)",
  backfaceVisibility: "hidden" as const,
};
