/**
 * Animation Components for Sandstone App
 * 
 * This module provides a comprehensive set of animation components,
 * hooks, and utilities for creating smooth, performant animations.
 * 
 * @example
 * ```tsx
 * import { 
 *   PageTransition, 
 *   AnimatedButton, 
 *   LoadingSpinner,
 *   StaggerContainer 
 * } from "@/components/animations";
 * ```
 */

// ============================================
// Animation Configuration & Utilities
// ============================================

export {
  // Easing functions
  easings,
  // Duration constants
  durations,
  // Transition presets
  transitions,
  // Variants
  fadeVariants,
  fadeUpVariants,
  fadeDownVariants,
  fadeLeftVariants,
  fadeRightVariants,
  scaleVariants,
  scaleUpVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  pageTransitionVariants,
  pageSlideVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardHoverVariants,
  cardVariants,
  buttonVariants,
  buttonPulseVariants,
  listContainerVariants,
  listItemVariants,
  modalOverlayVariants,
  modalContentVariants,
  loadingSpinnerVariants,
  loadingPulseVariants,
  loadingDotsVariants,
  loadingDotVariants,
  toastVariants,
  accordionContentVariants,
  accordionIconVariants,
  tabIndicatorVariants,
  skeletonShimmerVariants,
  scrollRevealVariants,
  scrollRevealLeftVariants,
  scrollRevealRightVariants,
  scrollRevealScaleVariants,
  swipeVariants,
  // Performance helpers
  willChange,
  gpuOptimized,
  dragConstraints,
  dragElastic,
} from "./animation-config";

// ============================================
// Page Transitions
// ============================================

export {
  PageTransition,
  AnimatedPage,
  AnimatedSection,
  RouteTransitionProvider,
  DirectionalPageTransition,
} from "./page-transition";

// ============================================
// Micro-Interactions
// ============================================

export {
  AnimatedButton,
  AnimatedCard,
  AnimatedIcon,
  AnimatedLink,
  AnimatedBadge,
  AnimatedInput,
  AnimatedCheckbox,
  AnimatedSwitch,
  AnimatedTooltip,
  AnimatedProgress,
  AnimatedCounter,
} from "./micro-interactions";

// ============================================
// Loading Animations
// ============================================

export {
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  LoadingRing,
  LoadingWave,
  LoadingOrbit,
  LoadingLogo,
  Skeleton,
  CardSkeleton,
  FullPageLoading,
  InlineLoading,
  ProgressLoading,
  ContentLoader,
} from "./loading-animations";

// ============================================
// Gesture Handling
// ============================================

export {
  Swipeable,
  Draggable,
  PullToRefresh,
  SwipeableItem,
  MagneticButton,
  TiltCard,
  GestureCarousel,
  PinchZoom,
  LongPressButton,
} from "./gesture-handling";

// ============================================
// Stagger Animations
// ============================================

export {
  StaggerContainer,
  StaggerItem,
  AnimatedList,
  AnimatedGrid,
  FadeInStagger,
  Cascade,
  RevealStagger,
  Typewriter,
  BlurInStagger,
} from "./stagger-animations";

// ============================================
// Performance Optimizations
// ============================================

export {
  ReducedMotionWrapper,
  GPUOptimizedMotion,
  LazyMotion,
  ViewportAnimation,
  OptimizedList,
  MemoizedMotion,
  AnimationScheduler,
  WillChangeOptimizer,
  RAFThrottledAnimation,
  ContentVisibilityWrapper,
  PauseOnInteraction,
  PerformanceMonitor,
  CompositeLayerOptimizer,
} from "./performance-optimizations";

// ============================================
// Template Wrappers
// ============================================

export {
  TemplateWrapper,
  PageWrapper,
  FadeWrapper,
  SlideWrapper,
  ScaleWrapper,
} from "./template-wrapper";
