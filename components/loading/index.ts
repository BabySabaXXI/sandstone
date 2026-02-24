/**
 * Loading Components Index
 * 
 * Export all loading-related components for Sandstone.
 * 
 * @example
 * import { 
 *   Spinner, 
 *   ProgressBar, 
 *   DashboardSkeleton,
 *   useLoading 
 * } from "@/components/loading";
 */

// ============================================
// UI COMPONENTS (from loading-enhanced.tsx)
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

  // Skeletons
  Skeleton,
  skeletonVariants,

  // Shimmer
  Shimmer,
  ShimmerText,

  // Overlays
  LoadingOverlay,
  PageLoading,

  // Placeholders
  CardPlaceholder,
  ListPlaceholder,
  TablePlaceholder,
  FormPlaceholder,

  // Specialized Skeletons
  DashboardSkeleton,
  DocumentSkeleton,
  FlashcardSkeleton,
  StudySessionSkeleton,
  ProfileSkeleton,
  SidebarSkeleton,
  ChatSkeleton,

  // Loading States
  LoadingState,
  ContentLoader,
} from "@/components/ui/loading-enhanced";

// ============================================
// SKELETON SCREENS
// ============================================

export {
  // Page Skeletons
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
} from "./skeleton-screens";

// ============================================
// TYPES
// ============================================

export type {
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
} from "@/components/ui/loading-enhanced";

// ============================================
// HOOKS (re-exported from hooks/use-loading)
// ============================================

export {
  useLoading,
  useProgress,
  useSkeleton,
  useStaggeredLoading,
  useLoadingTimeout,
  useMultiLoading,
  useInfiniteLoading,
} from "@/hooks/use-loading";
