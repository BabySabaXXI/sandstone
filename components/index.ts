/**
 * Sandstone Components Library
 * 
 * Main entry point for all Sandstone components.
 * 
 * @example
 * ```tsx
 * import { ThemeProvider, ThemeToggle, Button, Card } from '@/components';
 * ```
 */

// ============================================
// Theme Components
// ============================================
export {
  ThemeProvider,
  useTheme,
  useResolvedTheme,
  useIsDarkMode,
  useSetTheme,
  useToggleTheme,
  getThemeScript,
} from "./theme-provider";
export type {
  Theme,
  ResolvedTheme,
  ThemeProviderProps,
  ThemeContextState,
} from "./theme-provider";

export { ThemeToggle } from "./theme-toggle";
export type { ThemeToggleProps } from "./theme-toggle";

export { ThemeScript } from "./theme-script";
export type { ThemeScriptProps } from "./theme-script";

export {
  ThemeAwareCard,
  ThemeAwareText,
  ThemeAwareButton,
  ThemeAwareInput,
  ThemeAwareDivider,
  ThemeAwareBadge,
  ThemeAwareSkeleton,
  ThemeAwareIconButton,
} from "./theme-aware";
export type {
  ThemeAwareCardProps,
  ThemeAwareTextProps,
  ThemeAwareButtonProps,
  ThemeAwareInputProps,
  ThemeAwareDividerProps,
  ThemeAwareBadgeProps,
  ThemeAwareSkeletonProps,
  ThemeAwareIconButtonProps,
} from "./theme-aware";

// Re-export UI components
export * from "./ui";

// ============================================
// Loading Components
// ============================================
export {
  // Spinners
  Spinner,
  DotsSpinner,
  PulseRingSpinner,
  spinnerVariants,

  // Progress
  ProgressBar,
  CircularProgress,
  progressBarVariants,

  // Skeletons & Shimmer
  Skeleton,
  Shimmer,
  ShimmerText,
  skeletonVariants,

  // Overlays
  LoadingOverlay,
  PageLoading,

  // Placeholders
  CardPlaceholder,
  ListPlaceholder,
  TablePlaceholder,
  FormPlaceholder,

  // Specialized Skeleton Screens
  DashboardSkeleton,
  DocumentSkeleton,
  FlashcardSkeleton,
  StudySessionSkeleton,
  LibrarySkeleton,
  QuizSkeleton,
  SettingsSkeleton,
  ProfileSkeleton,
  SearchSkeleton,
  AnalyticsSkeleton,
  SidebarSkeleton,
  ChatSkeleton,
  NotificationSkeleton,

  // Loading States
  LoadingState,
  ContentLoader,
} from "./loading";

export type {
  // Loading Types
  SpinnerProps,
  ProgressBarProps,
  CircularProgressProps,
  SkeletonProps,
  ShimmerProps,
  LoadingOverlayProps,
  PageLoadingProps,
  CardPlaceholderProps,
  ListPlaceholderProps,
  TablePlaceholderProps,
  FormPlaceholderProps,
  LoadingStateProps,
  ContentLoaderProps,
} from "./loading";

// ============================================
// Micro-Interactions
// ============================================
export {
  // Buttons
  InteractiveButton,
  IconButton,
  FloatingActionButton,
  ButtonGroup,
  interactiveButtonVariants,
  
  // Cards
  InteractiveCard,
  CardHeader,
  CardMedia,
  CardContent,
  CardFooter,
  CardActions,
  FeatureCard,
  StatCard,
  interactiveCardVariants,
  
  // Feedback Animations
  SuccessAnimation,
  ErrorAnimation,
  LoadingAnimation,
  WarningAnimation,
  InfoAnimation,
  ConfettiAnimation,
  Toast,
  Skeleton,
  FeedbackAnimations,
  
  // Transition Animations
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
} from "./micro-interactions";

export type {
  // Button Types
  InteractiveButtonProps,
  
  // Card Types
  InteractiveCardProps,
  
  // Feedback Types
  FeedbackAnimationProps,
  LoadingAnimationProps,
  ConfettiAnimationProps,
  ToastProps,
  SkeletonProps,
  
  // Transition Types
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
} from "./micro-interactions";

// ============================================
// Collaboration Components
// ============================================
export {
  ShareDialog,
  CommentsPanel,
  NotificationsPanel,
  NotificationsBell,
  StudyGroups,
  CollaborativeEditor,
} from "./collaboration";
