# Sandstone Navigation System

A comprehensive navigation system for the Sandstone application providing enhanced user experience through breadcrumbs, sidebar navigation, mobile navigation, navigation patterns, and wayfinding indicators.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Components](#components)
  - [Breadcrumbs](#breadcrumbs)
  - [Sidebar](#sidebar)
  - [Mobile Navigation](#mobile-navigation)
  - [Navigation Patterns](#navigation-patterns)
  - [Wayfinding Indicators](#wayfinding-indicators)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Accessibility](#accessibility)

## Overview

The Sandstone Navigation System provides a complete set of navigation components designed to improve user orientation and wayfinding throughout the application.

### Key Features

- **Enhanced Breadcrumbs** - Animated breadcrumbs with truncation, dropdowns, and SEO support
- **Collapsible Sidebar** - Feature-rich sidebar with tooltips, shortcuts, and sub-navigation
- **Mobile-First Navigation** - Drawer, bottom navigation bar, and mobile header
- **Navigation Patterns** - Stepper, pagination, tabs, and browser-style navigation
- **Wayfinding Indicators** - Progress, status, milestones, and scroll indicators

## Installation

The navigation system is included in the Sandstone application. Import components from the navigation module:

```tsx
import {
  // Breadcrumbs
  EnhancedBreadcrumbs,
  BackButtonBreadcrumb,
  
  // Sidebar
  EnhancedSidebar,
  
  // Mobile Navigation
  MobileDrawer,
  BottomNavigation,
  MobileHeader,
  MobileNavigation,
  
  // Navigation Patterns
  NavigationProvider,
  useNavigation,
  BrowserNavigation,
  QuickNav,
  Stepper,
  Pagination,
  TabsNavigation,
  
  // Wayfinding Indicators
  LocationIndicator,
  ProgressIndicator,
  StatusIndicator,
  MilestoneIndicator,
  ScrollIndicator,
  ReadingProgress,
} from "@/components/navigation";
```

## Components

### Breadcrumbs

#### EnhancedBreadcrumbs

Animated breadcrumbs with truncation support and dropdown for hidden items.

```tsx
import { EnhancedBreadcrumbs } from "@/components/navigation";

// Basic usage
<EnhancedBreadcrumbs />

// With custom configuration
<EnhancedBreadcrumbs
  maxItems={4}
  separator="chevron" // "chevron" | "slash" | "arrow"
  showHome={true}
  onNavigate={(href) => console.log("Navigating to:", href)}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxItems` | `number` | `4` | Maximum items to show before truncating |
| `separator` | `"chevron" \| "slash" \| "arrow"` | `"chevron"` | Separator style |
| `showHome` | `boolean` | `true` | Show home link |
| `className` | `string` | - | Additional CSS classes |
| `items` | `BreadcrumbItem[]` | - | Custom breadcrumb items |
| `onNavigate` | `(href: string) => void` | - | Navigation callback |

#### BackButtonBreadcrumb

Simple back navigation with fallback.

```tsx
<BackButtonBreadcrumb
  fallbackHref="/dashboard"
  fallbackLabel="Back to Dashboard"
/>
```

#### StructuredDataBreadcrumbs

SEO-friendly structured data for breadcrumbs.

```tsx
<StructuredDataBreadcrumbs
  pathname="/documents/flashcards"
  baseUrl="https://sandstone.app"
/>
```

### Sidebar

#### EnhancedSidebar

Feature-rich sidebar with wayfinding indicators.

```tsx
import { EnhancedSidebar } from "@/components/navigation";

<EnhancedSidebar
  user={user}
  onNavigate={(path) => console.log("Navigating to:", path)}
  defaultCollapsed={false}
/>
```

**Features:**

- Collapsible with smooth animations
- Tooltip support when collapsed
- Keyboard shortcuts display
- Sub-navigation with collapsible sections
- Wayfinding indicators (active background, indicator line)
- Search input with command palette trigger
- User profile section

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `User` | required | Supabase user object |
| `onNavigate` | `(path: string) => void` | - | Navigation callback |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state |

### Mobile Navigation

#### MobileDrawer

Slide-out drawer navigation for mobile.

```tsx
import { MobileDrawer } from "@/components/navigation";

<MobileDrawer
  user={{ email: "user@example.com", name: "John Doe" }}
  notificationCount={3}
  onSearch={() => openCommandPalette()}
  onNavigate={(path) => console.log("Navigating to:", path)}
/>
```

#### BottomNavigation

Fixed bottom navigation bar for mobile.

```tsx
import { BottomNavigation } from "@/components/navigation";

<BottomNavigation
  items={[
    { href: "/", label: "Home", icon: Home },
    { href: "/grade", label: "Grade", icon: GraduationCap },
    { href: "/flashcards", label: "Cards", icon: Layers },
  ]}
  onItemClick={(index) => console.log("Item clicked:", index)}
/>
```

#### MobileHeader

Sticky header for mobile with navigation and actions.

```tsx
import { MobileHeader } from "@/components/navigation";

<MobileHeader
  user={{ email: "user@example.com" }}
  notificationCount={3}
  title="Documents"
  showBackButton={true}
  onBackClick={() => router.back()}
  onSearchClick={() => openCommandPalette()}
/>
```

#### MobileNavigation (Combined)

Complete mobile navigation solution.

```tsx
import { MobileNavigation } from "@/components/navigation";

<MobileNavigation
  user={{ email: "user@example.com" }}
  notificationCount={3}
  onSearch={() => openCommandPalette()}
  headerTitle="Documents"
  showBackButton={true}
  onBackClick={() => router.back()}
>
  {/* Your page content */}
</MobileNavigation>
```

### Navigation Patterns

#### NavigationProvider

Context provider for navigation history and state.

```tsx
import { NavigationProvider } from "@/components/navigation";

<NavigationProvider>
  <App />
</NavigationProvider>
```

#### useNavigation Hook

Access navigation state and methods.

```tsx
import { useNavigation } from "@/components/navigation";

function MyComponent() {
  const { 
    history, 
    canGoBack, 
    canGoForward, 
    goBack, 
    goForward,
    navigate 
  } = useNavigation();
  
  return (
    <button onClick={goBack} disabled={!canGoBack}>
      Go Back
    </button>
  );
}
```

#### BrowserNavigation

Browser-style back/forward navigation.

```tsx
import { BrowserNavigation } from "@/components/navigation";

<BrowserNavigation />
```

#### QuickNav

Horizontal quick navigation links.

```tsx
import { QuickNav } from "@/components/navigation";

<QuickNav
  items={[
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/grade", label: "Grade", icon: GraduationCap },
    { href: "/flashcards", label: "Cards", icon: Layers },
  ]}
/>
```

#### Stepper

Multi-step process indicator.

```tsx
import { Stepper } from "@/components/navigation";

<Stepper
  steps={[
    { label: "Upload", description: "Upload your document" },
    { label: "Review", description: "Review the content" },
    { label: "Grade", description: "Get AI feedback" },
  ]}
  currentStep={1}
  onStepClick={(index) => console.log("Step clicked:", index)}
/>
```

#### Pagination

Page navigation with ellipsis support.

```tsx
import { Pagination } from "@/components/navigation";

<Pagination
  currentPage={3}
  totalPages={10}
  onPageChange={(page) => console.log("Page:", page)}
  showFirstLast={true}
  maxVisible={5}
/>
```

#### TabsNavigation

Animated tab navigation.

```tsx
import { TabsNavigation } from "@/components/navigation";

<TabsNavigation
  tabs={[
    { id: "all", label: "All", content: <AllContent /> },
    { id: "active", label: "Active", badge: "3", content: <ActiveContent /> },
    { id: "completed", label: "Completed", content: <CompletedContent /> },
  ]}
  defaultTab="all"
  onChange={(tabId) => console.log("Tab changed:", tabId)}
/>
```

#### RecentlyVisited

Show recently visited pages.

```tsx
import { RecentlyVisited } from "@/components/navigation";

<RecentlyVisited maxItems={5} />
```

#### Bookmarks

Quick access bookmarks.

```tsx
import { Bookmarks } from "@/components/navigation";

<Bookmarks
  bookmarks={[
    { href: "/grade", label: "AI Grading", icon: GraduationCap },
    { href: "/flashcards", label: "Flashcards", icon: Layers },
  ]}
/>
```

### Wayfinding Indicators

#### LocationIndicator

Shows current location within a section hierarchy.

```tsx
import { LocationIndicator } from "@/components/navigation";

<LocationIndicator
  currentSection="documents"
  sections={[
    { id: "upload", label: "Upload" },
    { id: "documents", label: "Documents" },
    { id: "review", label: "Review" },
  ]}
  showProgress={true}
/>
```

#### ProgressIndicator

Visual progress bar with percentage.

```tsx
import { ProgressIndicator } from "@/components/navigation";

<ProgressIndicator
  current={7}
  total={10}
  label="Flashcards Reviewed"
  showPercentage={true}
/>
```

#### DirectionIndicator

Directional hint with optional pulse animation.

```tsx
import { DirectionIndicator } from "@/components/navigation";

<DirectionIndicator
  direction="down"
  label="Scroll for more"
  pulse={true}
/>
```

#### StatusIndicator

Status message with icon and animation.

```tsx
import { StatusIndicator } from "@/components/navigation";

<StatusIndicator
  status="loading"
  message="Grading your response..."
/>

<StatusIndicator
  status="success"
  message="Grading complete!"
/>
```

**Status Types:**

- `idle` - Default state
- `loading` - Animated spinner
- `success` - Checkmark icon
- `error` - Alert icon
- `warning` - Warning icon

#### MilestoneIndicator

Visual milestone tracker.

```tsx
import { MilestoneIndicator } from "@/components/navigation";

<MilestoneIndicator
  milestones={[
    { label: "Upload", completed: true },
    { label: "Process", completed: true },
    { label: "Grade", completed: false, current: true },
    { label: "Review", completed: false },
  ]}
  orientation="horizontal"
/>
```

#### ScrollIndicator

Floating scroll-to action button.

```tsx
import { ScrollIndicator } from "@/components/navigation";

<ScrollIndicator
  showOnScroll={true}
  threshold={100}
/>
```

#### ReadingProgress

Top progress bar for reading progress.

```tsx
import { ReadingProgress } from "@/components/navigation";

<ReadingProgress targetRef={contentRef} />
```

#### ContextualWayfinding

Combined wayfinding with scroll progress and breadcrumbs.

```tsx
import { ContextualWayfinding } from "@/components/navigation";

<ContextualWayfinding
  showBreadcrumbs={true}
  showProgress={true}
  showShortcuts={true}
>
  <EnhancedBreadcrumbs />
</ContextualWayfinding>
```

## Usage Examples

### Complete App Layout

```tsx
import { 
  EnhancedSidebar, 
  EnhancedBreadcrumbs,
  MobileNavigation,
  NavigationProvider 
} from "@/components/navigation";

export default function AppLayout({ children, user }) {
  return (
    <NavigationProvider>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <EnhancedSidebar user={user} />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
            <div className="container flex h-14 items-center">
              <EnhancedBreadcrumbs />
            </div>
          </header>
          <main className="flex-1 container py-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <MobileNavigation user={user}>
        {children}
      </MobileNavigation>
    </NavigationProvider>
  );
}
```

### Grading Flow with Stepper

```tsx
import { Stepper, ProgressIndicator, StatusIndicator } from "@/components/navigation";

export default function GradingPage() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("idle");

  return (
    <div className="space-y-6">
      <Stepper
        steps={[
          { label: "Upload", description: "Upload response" },
          { label: "Process", description: "AI processing" },
          { label: "Grade", description: "Get feedback" },
        ]}
        currentStep={step}
      />

      <StatusIndicator 
        status={status} 
        message={getStatusMessage(status)} 
      />

      {/* Content */}
    </div>
  );
}
```

### Document Review with Wayfinding

```tsx
import { 
  LocationIndicator, 
  ReadingProgress,
  ScrollIndicator 
} from "@/components/navigation";

export default function DocumentReview({ document }) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <ReadingProgress targetRef={contentRef} />
      
      <LocationIndicator
        currentSection="review"
        sections={[
          { id: "upload", label: "Upload" },
          { id: "process", label: "Process" },
          { id: "review", label: "Review" },
        ]}
      />

      <div ref={contentRef} className="prose max-w-none">
        {/* Document content */}
      </div>

      <ScrollIndicator />
    </div>
  );
}
```

## Best Practices

### 1. Use Semantic HTML

```tsx
// Good
<nav aria-label="Main">
  <Link href="/">Home</Link>
</nav>

// Avoid
<div>
  <a href="/">Home</a>
</div>
```

### 2. Provide Clear Labels

```tsx
// Good
<Button aria-label="Open navigation menu">
  <MenuIcon />
</Button>

// Avoid
<Button>
  <MenuIcon />
</Button>
```

### 3. Handle Loading States

```tsx
<StatusIndicator
  status={isLoading ? "loading" : "idle"}
  message={isLoading ? "Processing..." : "Ready"}
/>
```

### 4. Use Keyboard Shortcuts

```tsx
<EnhancedSidebar
  items={[
    { href: "/", label: "Dashboard", shortcut: "⌘D" },
    { href: "/grade", label: "Grade", shortcut: "⌘G" },
  ]}
/>
```

### 5. Show Progress for Multi-Step Flows

```tsx
<Stepper
  steps={[...]}
  currentStep={currentStep}
/>
```

## Accessibility

### Keyboard Navigation

All navigation components support keyboard navigation:

- `Tab` - Move between focusable elements
- `Enter` / `Space` - Activate links and buttons
- `Arrow keys` - Navigate within menus
- `Escape` - Close drawers and modals

### Screen Reader Support

Components include proper ARIA attributes:

```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li>
      <Link aria-current="page">Current Page</Link>
    </li>
  </ol>
</nav>
```

### Focus Management

- Focus is trapped within modals and drawers
- Focus returns to trigger element when closed
- Visible focus indicators on all interactive elements

### Reduced Motion

Components respect `prefers-reduced-motion`:

```tsx
const prefersReducedMotion = 
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

## License

Part of the Sandstone application.
