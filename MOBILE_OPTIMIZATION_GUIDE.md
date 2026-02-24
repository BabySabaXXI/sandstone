# Sandstone Mobile UX Optimization Guide

## Overview

This guide documents the mobile UX optimizations implemented for the Sandstone app, focusing on touch targets, mobile navigation, gestures, and mobile-specific patterns.

## Key Optimizations

### 1. Touch Targets (44px+ Minimum)

All interactive elements now meet or exceed the 44px minimum touch target size recommended by Apple and Google:

- **Navigation items**: 44px × 44px minimum
- **Buttons**: 48px height minimum (TouchButton component)
- **Cards**: Full-width pressable areas with visual feedback
- **Form inputs**: 16px font size to prevent iOS zoom

#### Usage:

```tsx
import { TouchButton } from "@/components/ui/TouchButton";

// Standard button with proper touch target
<TouchButton variant="primary" size="md">
  Click Me
</TouchButton>

// Icon button
<TouchButton variant="ghost" size="icon">
  <Settings className="w-5 h-5" />
</TouchButton>
```

### 2. Mobile Navigation

Implemented a responsive navigation system:

- **Desktop**: Collapsible sidebar (64px width)
- **Mobile**: Bottom navigation bar with 5 primary actions
- **Tablet**: Sidebar with expanded labels

#### Components:

- `Sidebar.tsx` - Responsive sidebar with mobile drawer
- `MobileNavigation.tsx` - Bottom navigation bar
- `ResponsiveLayout.tsx` - Layout that adapts to screen size

#### Usage:

```tsx
import { ThreePanel } from "@/components/layout/ThreePanel";

// Automatically handles mobile/desktop layouts
<ThreePanel>
  <YourContent />
</ThreePanel>
```

### 3. Gesture Support

Implemented custom hooks for touch gestures:

#### useSwipe Hook

```tsx
import { useSwipe } from "@/hooks/useSwipe";

function MyComponent() {
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => console.log("Swiped left"),
    onSwipeRight: () => console.log("Swiped right"),
    onSwipeUp: () => console.log("Swiped up"),
    onSwipeDown: () => console.log("Swiped down"),
    threshold: 50, // Minimum swipe distance
  });

  return <div {...swipeHandlers}>Swipeable content</div>;
}
```

#### usePullToRefresh Hook

```tsx
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

function MyComponent() {
  const { pullDistance, isRefreshing, ...handlers } = usePullToRefresh({
    onRefresh: async () => {
      await fetchData();
    },
    threshold: 80,
  });

  return (
    <div {...handlers}>
      {isRefreshing && <LoadingIndicator />}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        Content
      </div>
    </div>
  );
}
```

### 4. Mobile-Specific Patterns

#### Safe Area Support

CSS utilities for iPhone X+ notch and home indicator:

```css
.safe-area-top    /* padding-top: env(safe-area-inset-top) */
.safe-area-bottom /* padding-bottom: env(safe-area-inset-bottom) */
.safe-area-pb     /* padding-bottom with safe area */
```

#### Viewport Height Fix

Handles mobile browser dynamic viewport height:

```css
.h-screen-mobile      /* Uses 100dvh when available */
.min-h-screen-mobile  /* Minimum height with fallback */
```

#### Touch Optimizations

```css
.touch-manipulation   /* Prevents double-tap zoom, text selection */
.no-tap-highlight     /* Removes tap highlight on mobile */
.scroll-smooth        /* Smooth scrolling with momentum */
```

### 5. Responsive Typography

Fluid typography that scales with viewport:

```css
.text-fluid-xs   /* 12px → 14px */
.text-fluid-sm   /* 14px → 16px */
.text-fluid-base /* 16px → 18px */
.text-fluid-lg   /* 18px → 24px */
.text-fluid-xl   /* 24px → 36px */
```

### 6. Mobile Detection Hook

```tsx
import { useMobile } from "@/hooks/useMobile";

function MyComponent() {
  const { isMobile, isTablet, isDesktop, isTouch, viewportWidth } = useMobile();

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

## Components Reference

### TouchButton

A button component optimized for touch with proper sizing and feedback:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'primary' \| 'secondary' \| 'ghost' \| 'destructive' | 'default' | Button style |
| size | 'sm' \| 'md' \| 'lg' \| 'icon' | 'md' | Button size |
| isLoading | boolean | false | Show loading state |
| fullWidth | boolean | false | Full width button |

### MobileCard

A card component with mobile-optimized interactions:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'elevated' \| 'outlined' \| 'interactive' | 'default' | Card style |
| padding | 'none' \| 'sm' \| 'md' \| 'lg' | 'md' | Card padding |
| isPressable | boolean | false | Enable press animation |
| onPress | () => void | - | Press handler |

### MobileNavigation

Bottom navigation bar for mobile devices. Automatically hidden on desktop.

## CSS Utilities

### Touch Targets

```css
.touch-target      /* min 44px × 44px */
.touch-target-sm   /* min 36px × 36px */
.touch-target-lg   /* min 48px × 48px */
.touch-target-xl   /* min 56px × 56px */
```

### Bottom Sheet

```css
.bottom-sheet         /* Fixed bottom sheet styling */
.bottom-sheet-handle  /* Drag handle indicator */
.bottom-sheet-backdrop /* Backdrop overlay */
```

### Scrollbar

```css
.scrollbar-hide       /* Hide scrollbar */
.scrollbar-responsive /* Hidden on mobile, visible on desktop */
```

## PWA Support

The app includes a `manifest.json` for Progressive Web App support:

- Installable on home screen
- Offline capability ready
- App shortcuts for quick actions
- Custom icons for all sizes

## Testing on Mobile Devices

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Click Toggle Device Toolbar (Ctrl+Shift+M)
3. Select a mobile device preset
4. Test touch interactions

### Real Device Testing

#### iOS (Safari)

1. Connect iPhone to Mac
2. Open Safari on Mac
3. Develop → [Your Device] → localhost:3000
4. Use Web Inspector for debugging

#### Android (Chrome)

1. Enable USB debugging on Android
2. Connect to computer
3. Open Chrome on desktop
4. chrome://inspect → Devices
5. Click "Inspect" on your device

### Remote Debugging

Use ngrok for testing on real devices:

```bash
npx ngrok http 3000
```

## Performance Considerations

### Touch Event Optimization

- Use `touch-action: manipulation` to prevent double-tap zoom
- Implement passive event listeners where possible
- Debounce scroll handlers

### Animation Performance

- Use `transform` and `opacity` for animations
- Add `will-change` for frequently animated elements
- Respect `prefers-reduced-motion`

### Memory Management

- Clean up gesture listeners on unmount
- Use virtual scrolling for long lists
- Lazy load images and components

## Accessibility

### Touch Target Requirements

- Minimum 44px × 44px for all interactive elements
- 8px spacing between adjacent touch targets
- Visual feedback on touch

### Screen Reader Support

- All buttons have aria-labels
- Navigation has aria-current for active state
- Focus indicators visible on all interactive elements

### Keyboard Navigation

- All interactive elements keyboard accessible
- Focus trap in modals and drawers
- Escape key closes overlays

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Touch Events | ✓ | ✓ | ✓ | ✓ |
| CSS Touch Action | ✓ | ✓ | ✓ | ✓ |
| Viewport Units | ✓ | ✓ | ✓ | ✓ |
| dvh units | ✓ 108+ | ✓ 15.4+ | ✓ 101+ | ✓ 108+ |
| Safe Area | ✓ | ✓ 11.2+ | ✓ | ✓ |

## Migration Guide

### From Original Components

1. Replace `Button` with `TouchButton` for touch-optimized buttons
2. Replace `Card` with `MobileCard` for pressable cards
3. Wrap layouts with `ThreePanel` for responsive behavior
4. Add `useMobile` hook for conditional rendering

### CSS Updates

Import mobile styles in your layout:

```tsx
import "./globals-mobile.css";
```

## Future Enhancements

- [ ] Haptic feedback API integration
- [ ] Biometric authentication
- [ ] Background sync for offline support
- [ ] Push notifications
- [ ] Share API integration
- [ ] File System Access API for document uploads

## Resources

- [Apple Human Interface Guidelines - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [Web.dev - Touch Actions](https://web.dev/touch-action/)
- [CSS-Tricks - The Trick to Viewport Units on Mobile](https://css-tricks.com/the-trick-to-viewport-units-on-mobile/)
