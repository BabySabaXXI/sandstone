# Sandstone Animation Enhancement Summary

## Overview

This document summarizes the animation enhancements made to the Sandstone app using Framer Motion. The animation system provides a comprehensive set of components, hooks, and utilities for creating smooth, performant, and accessible animations.

## Files Created

### Core Animation Components

| File | Description |
|------|-------------|
| `/components/animations/animation-config.ts` | Centralized animation presets, variants, easing functions, and duration constants |
| `/components/animations/page-transition.tsx` | Page transition wrappers (PageTransition, AnimatedPage, AnimatedSection, RouteTransitionProvider) |
| `/components/animations/micro-interactions.tsx` | Interactive components (AnimatedButton, AnimatedCard, AnimatedIcon, AnimatedBadge, AnimatedInput, etc.) |
| `/components/animations/loading-animations.tsx` | Loading states (LoadingSpinner, LoadingDots, LoadingLogo, Skeleton, CardSkeleton, ProgressLoading) |
| `/components/animations/gesture-handling.tsx` | Gesture components (Swipeable, Draggable, SwipeableItem, MagneticButton, TiltCard, LongPressButton) |
| `/components/animations/stagger-animations.tsx` | Stagger effects (StaggerContainer, AnimatedList, AnimatedGrid, Cascade, Typewriter) |
| `/components/animations/performance-optimizations.tsx` | Performance utilities (ViewportAnimation, LazyMotion, OptimizedList, ReducedMotionWrapper) |
| `/components/animations/template-wrapper.tsx` | Template wrappers for page transitions (TemplateWrapper, PageWrapper, FadeWrapper, SlideWrapper, ScaleWrapper) |
| `/components/animations/index.ts` | Main exports for all animation components |
| `/components/animations/README.md` | Comprehensive documentation |

### Animation Hooks

| File | Description |
|------|-------------|
| `/hooks/use-animation.ts` | Animation hooks (useAnimatedState, useScrollAnimation, useCounterAnimation, useStaggerAnimation, useLoadingState, useAnimatedList, etc.) |

### Example Implementations

| File | Description |
|------|-------------|
| `/components/examples/animated-dashboard.tsx` | Enhanced dashboard with staggered animations, hover effects, and viewport animations |
| `/components/examples/animated-loading.tsx` | Various loading state examples |
| `/components/examples/gesture-examples.tsx` | Gesture handling demonstrations |
| `/components/examples/index.ts` | Example exports |

### Updated Files

| File | Changes |
|------|---------|
| `/app/loading.tsx` | Updated to use LoadingLogo component |
| `/app/(app)/loading.tsx` | Updated to use LoadingLogo component |
| `/hooks/index.ts` | Added exports for animation hooks |

## Key Features

### 1. Page Transitions
- **TemplateWrapper**: Smooth fade transitions between pages
- **PageWrapper**: More dramatic slide + scale transitions
- **FadeWrapper**: Simple fade-only transitions
- **SlideWrapper**: Directional slide transitions
- **ScaleWrapper**: Scale-based transitions

### 2. Micro-Interactions
- **AnimatedButton**: Hover, tap, and loading states with icon animations
- **AnimatedCard**: Lift and glow effects on hover
- **AnimatedIcon**: Bounce, pulse, spin, and shake animations
- **AnimatedBadge**: Pulsing badges for notifications
- **AnimatedInput**: Focus animations with error states
- **AnimatedCheckbox**: Smooth check animations
- **AnimatedSwitch**: Toggle switch animations
- **AnimatedTooltip**: Smooth tooltip entrance/exit
- **AnimatedProgress**: Animated progress bars

### 3. Loading Animations
- **LoadingSpinner**: Classic spinning loader
- **LoadingDots**: Bouncing dots
- **LoadingPulse**: Pulsing circle
- **LoadingRing**: Rotating rings
- **LoadingWave**: Wave bars
- **LoadingOrbit**: Orbiting dots
- **LoadingLogo**: Sandstone-branded loading animation
- **Skeleton**: Shimmer effect placeholders
- **CardSkeleton**: Card-shaped skeletons
- **FullPageLoading**: Full-screen loading overlay
- **InlineLoading**: Compact inline loading
- **ProgressLoading**: Loading with progress bar
- **ContentLoader**: Wrapper for async content

### 4. Gesture Handling
- **Swipeable**: Detects swipe gestures in any direction
- **Draggable**: Draggable elements with constraints
- **SwipeableItem**: List items with swipe-to-reveal actions
- **MagneticButton**: Buttons that follow cursor
- **TiltCard**: Cards that tilt based on mouse position
- **GestureCarousel**: Touch-friendly carousel
- **PinchZoom**: Pinch-to-zoom support
- **LongPressButton**: Long press detection

### 5. Stagger Animations
- **StaggerContainer**: Staggers children animations
- **StaggerItem**: Individual stagger item
- **AnimatedList**: List with staggered items
- **AnimatedGrid**: Grid with staggered items
- **FadeInStagger**: Simple fade-in stagger
- **Cascade**: Items cascade in from one direction
- **RevealStagger**: Sliding mask reveal effect
- **Typewriter**: Character-by-character typing
- **BlurInStagger**: Fade in with blur effect

### 6. Performance Optimizations
- **ReducedMotionWrapper**: Respects user's motion preferences
- **GPUOptimizedMotion**: GPU-accelerated animations
- **LazyMotion**: Only animates when in viewport
- **ViewportAnimation**: Scroll-triggered animations
- **OptimizedList**: Virtualized list for performance
- **MemoizedMotion**: Prevents unnecessary re-renders
- **AnimationScheduler**: Batches animations
- **WillChangeOptimizer**: Browser optimization hints
- **RAFThrottledAnimation**: Throttles with requestAnimationFrame
- **ContentVisibilityWrapper**: CSS content-visibility
- **PauseOnInteraction**: Pauses animations on hover/focus
- **CompositeLayerOptimizer**: Promotes to composite layer

### 7. Animation Hooks
- **useAnimatedState**: State with animated transitions
- **useScrollAnimation**: Scroll-into-view detection
- **useCounterAnimation**: Animated number counting
- **useStaggerAnimation**: Programmatic stagger control
- **useAnimationSequence**: Chained animations
- **useGestureState**: Tracks gesture states
- **useParallax**: Parallax scrolling effect
- **useReducedMotionPreference**: Enhanced reduced motion hook
- **useLoadingState**: Loading state with minimum duration
- **useHoverIntent**: Detects intentional hover
- **useSpringAnimation**: Spring-based animation values
- **useAnimatedList**: List animation management

## Usage Examples

### Basic Page Transition
```tsx
import { TemplateWrapper } from "@/components/animations";

export default function Page() {
  return (
    <TemplateWrapper>
      <YourContent />
    </TemplateWrapper>
  );
}
```

### Staggered List
```tsx
import { StaggerContainer, StaggerItem } from "@/components/animations";

<StaggerContainer staggerDelay={0.1}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Loading State
```tsx
import { LoadingLogo, Skeleton } from "@/components/animations";

// Full page loading
<LoadingLogo size="lg" text="Loading..." />

// Skeleton placeholder
<CardSkeleton hasImage lines={3} />
```

### Gesture Handling
```tsx
import { SwipeableItem, TiltCard } from "@/components/animations";

<SwipeableItem onDelete={handleDelete} onEdit={handleEdit}>
  <Card>Swipeable content</Card>
</SwipeableItem>

<TiltCard maxTilt={15}>
  <Card>3D tilt effect</Card>
</TiltCard>
```

### Viewport Animation
```tsx
import { ViewportAnimation } from "@/components/animations";

<ViewportAnimation threshold={0.3} delay={0.2}>
  <Card>Animates when scrolled into view</Card>
</ViewportAnimation>
```

## Performance Considerations

1. **GPU Acceleration**: All animations use `transform` and `opacity` for GPU acceleration
2. **Reduced Motion**: Automatic detection and respect for `prefers-reduced-motion`
3. **Lazy Loading**: Viewport-triggered animations for below-fold content
4. **Composite Layers**: Elements promoted to composite layers
5. **Throttling**: RAF-throttled animations for smooth performance
6. **Memoization**: Prevents unnecessary re-renders

## Accessibility

1. **Reduced Motion Support**: All components respect user preferences
2. **Focus Management**: Maintains proper focus states
3. **Screen Readers**: Animations don't interfere with announcements

## Animation Configuration

### Predefined Variants
- `fadeVariants`, `fadeUpVariants`, `fadeDownVariants`
- `scaleVariants`, `scaleUpVariants`
- `slideUpVariants`, `slideDownVariants`, `slideLeftVariants`, `slideRightVariants`
- `pageTransitionVariants`, `pageSlideVariants`
- `staggerContainerVariants`, `staggerItemVariants`
- `cardHoverVariants`, `cardVariants`
- `buttonVariants`, `buttonPulseVariants`

### Easing Functions
- `smooth`: [0.4, 0, 0.2, 1]
- `bouncy`: [0.68, -0.55, 0.265, 1.55]
- `snappy`: [0.25, 0.46, 0.45, 0.94]
- `dramatic`: [0.87, 0, 0.13, 1]
- `gentle`: [0.0, 0, 0.2, 1]

### Duration Constants
- `instant`: 0.1s
- `fast`: 0.15s
- `normal`: 0.3s
- `slow`: 0.5s
- `slower`: 0.8s
- `dramatic`: 1.2s

## Next Steps

1. **Apply TemplateWrapper** to all page components for consistent transitions
2. **Replace existing loading states** with new LoadingLogo component
3. **Add stagger animations** to lists and grids
4. **Implement gesture handling** for mobile interactions
5. **Use ViewportAnimation** for below-fold content
6. **Test with reduced motion** enabled

## Integration with Existing Components

The animation system is designed to work seamlessly with existing Sandstone components:

```tsx
// With existing Card component
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCard } from "@/components/animations";

<AnimatedCard hover lift>
  <Card>
    <CardContent>Content</CardContent>
  </Card>
</AnimatedCard>

// With existing Button component
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/animations";

<AnimatedButton variant="default" loading={isLoading}>
  Submit
</AnimatedButton>
```

## License

Part of the Sandstone project.
