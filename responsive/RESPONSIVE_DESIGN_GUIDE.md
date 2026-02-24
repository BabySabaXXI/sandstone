# Sandstone Responsive Design Guide

## Overview

This guide documents the responsive design implementation for the Sandstone app, following a mobile-first approach with comprehensive breakpoint support.

## Breakpoints

The responsive design uses the following breakpoints (defined in `tailwind.config.ts`):

| Breakpoint | Width | Description |
|------------|-------|-------------|
| `xs` | 375px | Small phones (iPhone SE, etc.) |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets (iPad mini, etc.) |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

### Special Breakpoints

- `touch`: Touch devices (no hover, coarse pointer)
- `mouse`: Mouse devices (hover, fine pointer)
- `landscape`: Landscape orientation
- `portrait`: Portrait orientation
- `short`: Short viewport (max-height: 600px)
- `tall`: Tall viewport (min-height: 800px)

## Mobile-First Approach

All styles are written for mobile first, then enhanced for larger screens:

```tsx
// Mobile-first example
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

## Touch Targets

All interactive elements meet WCAG 2.1 AA standards:

- **Minimum touch target**: 44x44px (2.75rem)
- **Small touch target**: 36x36px (2.25rem) for dense UIs
- **Large touch target**: 48x48px (3rem) for primary actions

Use the touch target utilities:

```tsx
<button className="touch-target">Large Button</button>
<button className="touch-target-sm">Small Button</button>
```

## Responsive Components

### 1. ResponsiveSidebar

A collapsible sidebar that:
- Shows as a drawer on mobile (< 1024px)
- Collapses to icons on desktop (64px width)
- Can expand to full width (280px) on mobile drawer

```tsx
import { ResponsiveSidebar } from "@/components/layout/ResponsiveSidebar";

<ResponsiveSidebar />
```

### 2. MobileNavigation

Bottom navigation bar for mobile devices:
- Fixed at bottom of viewport
- Includes safe area insets for notched devices
- Shows 5 primary navigation items
- Hidden on desktop (lg and above)

```tsx
import { MobileNavigation } from "@/components/layout/MobileNavigation";

<MobileNavigation />
```

### 3. ResponsiveThreePanel

Main layout wrapper that combines:
- ResponsiveSidebar for navigation
- Main content area with proper margins
- MobileNavigation for mobile devices

```tsx
import { ResponsiveThreePanel } from "@/components/layout/ResponsiveThreePanel";

<ResponsiveThreePanel>
  {/* Your content */}
</ResponsiveThreePanel>
```

### 4. ResponsiveAIChat

AI chat interface that adapts:
- Full-screen modal on mobile/tablet
- Floating widget on desktop
- Slide-in sidebar for chat list
- Bottom sheet style on mobile

```tsx
import { ResponsiveAIChat } from "@/components/layout/ResponsiveAIChat";

<ResponsiveAIChat isOpen={isOpen} onClose={handleClose} />
```

### 5. ResponsiveSubjectSwitcher

Subject selector that:
- Shows as bottom sheet on mobile
- Shows as dropdown on desktop
- Includes smooth animations

```tsx
import { ResponsiveSubjectSwitcher } from "@/components/layout/ResponsiveSubjectSwitcher";

<ResponsiveSubjectSwitcher />
```

## Responsive Hooks

### useResponsive

Provides comprehensive responsive state:

```tsx
import { useResponsive } from "@/hooks/useResponsive";

function MyComponent() {
  const { 
    isMobile,      // < 768px
    isTablet,      // 768px - 1023px
    isDesktop,     // >= 1024px
    isTouch,       // Touch device
    isLandscape,   // Landscape orientation
    width,         // Current viewport width
    height,        // Current viewport height
    isAbove,       // Check if above breakpoint
    isBelow,       // Check if below breakpoint
    isBetween,     // Check if between breakpoints
  } = useResponsive();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### useMediaQuery

Listen to custom media queries:

```tsx
import { useMediaQuery } from "@/hooks/useResponsive";

const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
```

### usePrefersReducedMotion

Check for reduced motion preference:

```tsx
import { usePrefersReducedMotion } from "@/hooks/useResponsive";

const prefersReducedMotion = usePrefersReducedMotion();
```

## Responsive Utilities

### Container

```tsx
<div className="container-responsive">Content</div>
```

### Grid

```tsx
<div className="grid-responsive-2">2 columns on sm+</div>
<div className="grid-responsive-3">3 columns on lg+</div>
<div className="grid-responsive-4">4 columns on lg+</div>
```

### Flex

```tsx
<div className="flex-responsive">Column on mobile, row on sm+</div>
<div className="flex-responsive-reverse">Reversed flex direction</div>
```

### Text

```tsx
<h1 className="text-responsive-hero">Scales from mobile to desktop</h1>
<h2 className="text-responsive-h1">H1 that scales</h2>
<p className="text-responsive-body">Body text that scales</p>
```

### Visibility

```tsx
<div className="hide-mobile">Hidden on mobile, visible on md+</div>
<div className="show-mobile">Visible on mobile, hidden on md+</div>
```

### Padding

```tsx
<div className="p-responsive">Responsive padding</div>
<div className="px-responsive">Responsive horizontal padding</div>
<div className="py-responsive">Responsive vertical padding</div>
```

## Safe Area Support

The app supports notched devices with safe area insets:

```css
/* In globals.css */
.safe-area-inset {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

## PWA Support

The app includes PWA manifest and icons for installable web app experience:

- `/public/manifest.json` - PWA manifest
- `/public/icon-*.png` - App icons in various sizes

## Best Practices

### 1. Always Use Mobile-First

```tsx
// Good: Mobile-first
<div className="text-sm md:text-base lg:text-lg">

// Bad: Desktop-first
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Test Touch Targets

All interactive elements should be at least 44x44px:

```tsx
// Good
<button className="touch-target">Click me</button>

// Bad
<button className="p-1">Too small</button>
```

### 3. Use Responsive Typography

```tsx
// Good
<h1 className="text-responsive-hero">Title</h1>

// Bad
<h1 className="text-4xl">Fixed size</h1>
```

### 4. Handle Orientation Changes

```tsx
const { isLandscape, isPortrait } = useResponsive();

return (
  <div className={isLandscape ? "flex-row" : "flex-col"}>
    {/* Content */}
  </div>
);
```

### 5. Respect User Preferences

```tsx
const prefersReducedMotion = usePrefersReducedMotion();

<motion.div
  animate={prefersReducedMotion ? {} : { opacity: 1 }}
>
  {/* Content */}
</motion.div>
```

## Testing Checklist

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 14 Pro (393px width)
- [ ] Test on iPad mini (768px width)
- [ ] Test on iPad Pro (1024px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Test in landscape orientation
- [ ] Test with increased font size (accessibility)
- [ ] Test with reduced motion preference
- [ ] Test touch targets (44x44px minimum)
- [ ] Test with keyboard navigation

## Migration Guide

To migrate existing components to responsive design:

1. Replace `ThreePanel` with `ResponsiveThreePanel`
2. Replace `Sidebar` with `ResponsiveSidebar`
3. Replace `AIChat` with `ResponsiveAIChat`
4. Replace `SubjectSwitcher` with `ResponsiveSubjectSwitcher`
5. Update `tailwind.config.ts` with new breakpoints
6. Update `globals.css` with responsive utilities
7. Add `useResponsive` hook where needed
8. Test on various device sizes

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+
- iOS Safari 13.4+
- Chrome Android 80+
