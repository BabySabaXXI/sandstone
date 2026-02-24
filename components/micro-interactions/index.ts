"use client";

/**
 * Micro-Interactions Library
 * 
 * A comprehensive collection of micro-interactions for the Sandstone Design System.
 * 
 * @example
 * ```tsx
 * import { InteractiveButton, InteractiveCard, FeedbackAnimations } from '@/components/micro-interactions';
 * import { useRipple, useHoverAnimation } from '@/lib/micro-interactions/hooks';
 * ```
 */

// ============================================
// Components
// ============================================

export {
  InteractiveButton,
  IconButton,
  FloatingActionButton,
  ButtonGroup,
  interactiveButtonVariants,
} from "./interactive-button";

export type { InteractiveButtonProps } from "./interactive-button";

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
} from "./interactive-card";

export type { InteractiveCardProps } from "./interactive-card";

export {
  SuccessAnimation,
  ErrorAnimation,
  LoadingAnimation,
  WarningAnimation,
  InfoAnimation,
  ConfettiAnimation,
  Toast,
  Skeleton,
  FeedbackAnimations,
} from "./feedback-animations";

export type {
  FeedbackAnimationProps,
  LoadingAnimationProps,
  ConfettiAnimationProps,
  ToastProps,
  SkeletonProps,
} from "./feedback-animations";

export {
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
  TransitionAnimations,
} from "./transition-animations";

export type {
  TransitionProps,
  SlideInProps,
  AnimatedContainerProps,
  AnimatedItemProps,
  StaggerContainerProps,
  ScrollRevealProps,
  PageTransitionProps,
  ListAnimationProps,
  CollapseProps,
  ModalTransitionProps,
  TabPanelProps,
  HoverScaleProps,
  MagneticProps,
  ParallaxProps,
  AnimationDirection,
  AnimationType,
} from "./transition-animations";

// ============================================
// Re-export hooks from lib
// ============================================

export {
  useRipple,
  useHoverAnimation,
  usePressAnimation,
  useMagnetic,
  useStaggerAnimation,
  useCountUp,
  useTypewriter,
  useConfetti,
  useFocusRing,
  useLoadingState,
  useShake,
  useToastAnimation,
  useScrollProgress,
  useBounce,
  usePulse,
  microInteractionHooks,
} from "@/lib/micro-interactions/hooks";

export type {
  RippleOptions,
  HoverOptions,
  PressOptions,
  MagneticOptions,
  ParallaxOptions,
  StaggerOptions,
} from "@/lib/micro-interactions/hooks";

// ============================================
// Default export
// ============================================

import * as MicroInteractions from "./index";
export default MicroInteractions;
