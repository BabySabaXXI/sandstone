// =============================================================================
// SANDSTONE NAVIGATION SYSTEM
// =============================================================================
//
// A comprehensive navigation system for the Sandstone application providing:
// - Enhanced breadcrumbs with animations and SEO support
// - Improved sidebar with wayfinding indicators
// - Mobile navigation drawer and bottom navigation
// - Navigation patterns (stepper, pagination, tabs)
// - Wayfinding indicators (progress, status, milestones)
//
// =============================================================================

// -----------------------------------------------------------------------------
// BREADCRUMBS
// -----------------------------------------------------------------------------

export {
  EnhancedBreadcrumbs,
  BackButtonBreadcrumb,
  StructuredDataBreadcrumbs,
} from "./enhanced-breadcrumbs";

export type {
  BreadcrumbItem,
  RouteConfig,
  EnhancedBreadcrumbsProps,
} from "./enhanced-breadcrumbs";

// -----------------------------------------------------------------------------
// SIDEBAR
// -----------------------------------------------------------------------------

export {
  EnhancedSidebar,
} from "./enhanced-sidebar";

export type {
  NavItem,
  NavSection,
  NavSubItem,
  WayfindingState,
  EnhancedSidebarProps,
} from "./enhanced-sidebar";

// -----------------------------------------------------------------------------
// MOBILE NAVIGATION
// -----------------------------------------------------------------------------

export {
  MobileDrawer,
  BottomNavigation,
  MobileHeader,
  MobileNavigation,
} from "./mobile-navigation";

export type {
  MobileNavItem,
  MobileNavSection,
  MobileNavigationProps,
  BottomNavProps,
} from "./mobile-navigation";

// -----------------------------------------------------------------------------
// NAVIGATION PATTERNS
// -----------------------------------------------------------------------------

export {
  NavigationProvider,
  useNavigation,
  BrowserNavigation,
  QuickNav,
  Stepper,
  Pagination,
  TabsNavigation,
  RecentlyVisited,
  Bookmarks,
} from "./navigation-patterns";

export type {
  NavigationHistoryItem,
  NavigationContextType,
  QuickNavProps,
  StepperProps,
  PaginationProps,
  TabsProps,
} from "./navigation-patterns";

// -----------------------------------------------------------------------------
// WAYFINDING INDICATORS
// -----------------------------------------------------------------------------

export {
  LocationIndicator,
  ProgressIndicator,
  DirectionIndicator,
  StatusIndicator,
  MilestoneIndicator,
  ScrollIndicator,
  ReadingProgress,
  ContextualWayfinding,
  WayfindingComposite,
} from "./wayfinding-indicators";

export type {
  WayfindingIndicatorProps,
  LocationIndicatorProps,
  ProgressIndicatorProps,
  DirectionIndicatorProps,
  StatusIndicatorProps,
  MilestoneIndicatorProps,
  ScrollIndicatorProps,
  ReadingProgressProps,
} from "./wayfinding-indicators";

// -----------------------------------------------------------------------------
// LEGACY EXPORTS (for backwards compatibility)
// -----------------------------------------------------------------------------

export { Breadcrumbs } from "../breadcrumbs/breadcrumbs";
export { AppSidebar } from "./app-sidebar";

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

import { EnhancedBreadcrumbs } from "./enhanced-breadcrumbs";
import { EnhancedSidebar } from "./enhanced-sidebar";
import { MobileNavigation } from "./mobile-navigation";
import { NavigationProvider } from "./navigation-patterns";

export default {
  EnhancedBreadcrumbs,
  EnhancedSidebar,
  MobileNavigation,
  NavigationProvider,
};
