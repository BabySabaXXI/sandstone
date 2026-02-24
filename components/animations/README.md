# Sandstone Animation System

A comprehensive animation library for the Sandstone app built with Framer Motion. This system provides performant, accessible, and customizable animations for all UI interactions.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Animation Components](#animation-components)
- [Animation Hooks](#animation-hooks)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

## Installation

The animation system is already included in the Sandstone project. Ensure you have Framer Motion installed:

```bash
npm install framer-motion
```

## Quick Start

```tsx
import { 
  PageTransition, 
  AnimatedButton, 
  StaggerContainer,
  StaggerItem 
} from "@/components/animations";

export default function MyPage() {
  return (
    <PageTransition>
      <StaggerContainer>
        <StaggerItem>
          <h1>Welcome to Sandstone</h1>
        </StaggerItem>
        <StaggerItem>
          <AnimatedButton>
            Get Started
          </AnimatedButton>
        </StaggerItem>
      </StaggerContainer>
    </PageTransition>
  );
}
```

## Animation Components

### Page Transitions

#### PageTransition
Wraps page content with animated transitions between routes.

```tsx
import { PageTransition } from "@/components/animations";

<PageTransition type="fade" mode="wait">
  <YourPageContent />
</PageTransition>
```

**Props:**
- `type`: `"fade" | "slide" | "scale" | "none"` - Transition type
- `mode`: `"wait" | "sync" | "popLayout"` - AnimatePresence mode
- `duration`: `number` - Custom duration in seconds
- `customVariants`: `Variants` - Custom animation variants

#### AnimatedPage
Provides staggered entrance animation for page content.

```tsx
import { AnimatedPage } from "@/components/animations";

<AnimatedPage delay={0.2} staggerDelay={0.05}>
  <Header />
  <Content />
  <Footer />
</AnimatedPage>
```

### Micro-Interactions

#### AnimatedButton
Button with smooth hover, tap, and loading animations.

```tsx
import { AnimatedButton } from "@/components/animations";
import { Sparkles } from "lucide-react";

<AnimatedButton 
  variant="default"
  loading={isLoading}
  icon={<Sparkles className="w-4 h-4" />}
  iconPosition="left"
  pulse
>
  Click Me
</AnimatedButton>
```

**Props:**
- `variant`: `"default" | "ghost" | "outline" | "subtle"`
- `size`: `"sm" | "md" | "lg"`
- `loading`: `boolean`
- `icon`: `ReactNode`
- `iconPosition`: `"left" | "right"`
- `pulse`: `boolean` - Adds pulse effect on hover

#### AnimatedCard
Card with hover lift and glow effects.

```tsx
import { AnimatedCard } from "@/components/animations";

<AnimatedCard hover lift glow>
  <CardContent>Your content</CardContent>
</AnimatedCard>
```

#### AnimatedIcon
Icon with various animation effects.

```tsx
import { AnimatedIcon } from "@/components/animations";
import { Bell } from "lucide-react";

<AnimatedIcon animation="bounce" hoverAnimation="rotate">
  <Bell className="w-6 h-6" />
</AnimatedIcon>
```

**Animation types:** `bounce`, `pulse`, `spin`, `shake`, `none`
**Hover animations:** `scale`, `rotate`, `bounce`, `none`

### Loading Animations

#### LoadingSpinner
Classic spinning loader.

```tsx
import { LoadingSpinner } from "@/components/animations";

<LoadingSpinner size="lg" color="#3b82f6" />
```

#### LoadingDots
Bouncing dots loader.

```tsx
import { LoadingDots } from "@/components/animations";

<LoadingDots size="md" />
```

#### LoadingLogo
Sandstone branded loading animation.

```tsx
import { LoadingLogo } from "@/components/animations";

<LoadingLogo size="lg" text="Loading..." />
```

#### Skeleton
Content placeholder with shimmer effect.

```tsx
import { Skeleton, CardSkeleton } from "@/components/animations";

// Simple skeleton
<Skeleton className="h-4 w-full" />

// Card skeleton
<CardSkeleton hasImage lines={3} />

// Multiple lines
<Skeleton lines count={5} />
```

### Gesture Handling

#### Swipeable
Detects swipe gestures in any direction.

```tsx
import { Swipeable } from "@/components/animations";

<Swipeable
  onSwipeLeft={() => console.log('swiped left')}
  onSwipeRight={() => console.log('swiped right')}
  threshold={50}
>
  <Card>Swipe me</Card>
</Swipeable>
```

#### Draggable
Makes any element draggable with constraints.

```tsx
import { Draggable } from "@/components/animations";

<Draggable
  constraints="parent"
  snapToOrigin
  onDragEnd={(info) => console.log('dropped at', info.point)}
>
  <div className="w-20 h-20 bg-primary rounded-lg" />
</Draggable>
```

#### SwipeableItem
List item with swipe-to-reveal actions.

```tsx
import { SwipeableItem } from "@/components/animations";

<SwipeableItem
  onDelete={() => deleteItem(id)}
  onEdit={() => editItem(id)}
>
  <Card>Item content</Card>
</SwipeableItem>
```

#### MagneticButton
Button that follows cursor on hover.

```tsx
import { MagneticButton } from "@/components/animations";

<MagneticButton strength={0.3}>
  Hover me
</MagneticButton>
```

#### TiltCard
Card that tilts based on mouse position.

```tsx
import { TiltCard } from "@/components/animations";

<TiltCard maxTilt={15} scale={1.02}>
  <Card>Hover to tilt</Card>
</TiltCard>
```

### Stagger Animations

#### StaggerContainer & StaggerItem
Container that staggers children animations.

```tsx
import { StaggerContainer, StaggerItem } from "@/components/animations";

<StaggerContainer staggerDelay={0.1} direction="up">
  <StaggerItem><Card>Item 1</Card></StaggerItem>
  <StaggerItem><Card>Item 2</Card></StaggerItem>
  <StaggerItem><Card>Item 3</Card></StaggerItem>
</StaggerContainer>
```

#### AnimatedList
List with staggered item animations.

```tsx
import { AnimatedList } from "@/components/animations";

<AnimatedList staggerDelay={0.05} direction="left">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</AnimatedList>
```

#### AnimatedGrid
Grid with staggered item animations.

```tsx
import { AnimatedGrid } from "@/components/animations";

<AnimatedGrid columns={3} staggerDelay={0.08}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</AnimatedGrid>
```

### Performance Optimizations

#### ViewportAnimation
Only animates when element enters viewport.

```tsx
import { ViewportAnimation } from "@/components/animations";

<ViewportAnimation threshold={0.3} delay={0.2}>
  <Card>Content</Card>
</ViewportAnimation>
```

#### LazyMotion
Only renders/animates when in viewport.

```tsx
import { LazyMotion } from "@/components/animations";

<LazyMotion threshold={0.2} fallback={<Skeleton />}>
  <HeavyComponent />
</LazyMotion>
```

#### ReducedMotionWrapper
Respects user's motion preferences.

```tsx
import { ReducedMotionWrapper } from "@/components/animations";

<ReducedMotionWrapper>
  <motion.div animate={{ scale: 1.1 }}>
    Content
  </motion.div>
</ReducedMotionWrapper>
```

## Animation Hooks

### useAnimatedState
State with animated transitions.

```tsx
import { useAnimatedState } from "@/hooks";

const [isOpen, toggle] = useAnimatedState(false, { duration: 300 });
```

### useScrollAnimation
Triggers animation on scroll into view.

```tsx
import { useScrollAnimation } from "@/hooks";

const { ref, isInView } = useScrollAnimation({ threshold: 0.5 });
```

### useCounterAnimation
Animates a number counting up.

```tsx
import { useCounterAnimation } from "@/hooks";

const count = useCounterAnimation(1000, { duration: 2000 });
// Use: Math.round(count)
```

### useStaggerAnimation
Controls staggered animations programmatically.

```tsx
import { useStaggerAnimation } from "@/hooks";

const { controls, start } = useStaggerAnimation(5, 0.1);

useEffect(() => {
  start();
}, []);
```

### useLoadingState
Manages loading state with minimum duration.

```tsx
import { useLoadingState } from "@/hooks";

const { isLoading, startLoading, stopLoading } = useLoadingState({ 
  minDuration: 1000 
});
```

### useAnimatedList
Manages list animations (add/remove/reorder).

```tsx
import { useAnimatedList } from "@/hooks";

const { items, addItem, removeItem } = useAnimatedList(initialItems);
```

## Animation Configuration

### Predefined Variants

```tsx
import { 
  fadeVariants, 
  fadeUpVariants, 
  scaleVariants,
  pageTransitionVariants,
  staggerContainerVariants 
} from "@/components/animations";

<motion.div
  variants={fadeUpVariants}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

### Easing Functions

```tsx
import { easings } from "@/components/animations";

// Available easings:
// - smooth: [0.4, 0, 0.2, 1]
// - bouncy: [0.68, -0.55, 0.265, 1.55]
// - snappy: [0.25, 0.46, 0.45, 0.94]
// - dramatic: [0.87, 0, 0.13, 1]
// - gentle: [0.0, 0, 0.2, 1]
```

### Duration Constants

```tsx
import { durations } from "@/components/animations";

// Available durations:
// - instant: 0.1s
// - fast: 0.15s
// - normal: 0.3s
// - slow: 0.5s
// - slower: 0.8s
// - dramatic: 1.2s
```

## Performance Optimizations

### GPU Acceleration
All animation components use GPU-accelerated properties:
- `transform` instead of `top/left`
- `opacity` for fade effects
- `will-change` hints for the browser

### Reduced Motion Support
All components respect `prefers-reduced-motion`:
```tsx
const shouldReduceMotion = useReducedMotion();
```

### Lazy Loading
Use `LazyMotion` or `ViewportAnimation` to only animate visible elements.

### Composite Layers
Elements are promoted to composite layers for smooth animations.

## Accessibility

### Reduced Motion
The system automatically detects and respects `prefers-reduced-motion` settings.

### Focus Management
Interactive elements maintain proper focus states during animations.

### Screen Readers
Animations don't interfere with screen reader announcements.

## Best Practices

### 1. Use Stagger for Lists
```tsx
<StaggerContainer staggerDelay={0.05}>
  {items.map(item => (
    <StaggerItem key={item.id}>{item.content}</StaggerItem>
  ))}
</StaggerContainer>
```

### 2. Animate Only Necessary Properties
- ✅ `transform`, `opacity`
- ❌ `width`, `height`, `top`, `left`

### 3. Use Viewport Animation for Below-Fold Content
```tsx
<ViewportAnimation threshold={0.2}>
  <HeavyComponent />
</ViewportAnimation>
```

### 4. Provide Loading States
```tsx
<DataLoadingWrapper 
  isLoading={isLoading}
  loadingComponent={<StaggeredCardLoading />}
>
  <Content />
</DataLoadingWrapper>
```

### 5. Test with Reduced Motion
Always test your animations with `prefers-reduced-motion: reduce`.

## Examples

See the `/components/examples` directory for complete implementation examples:

- `animated-dashboard.tsx` - Dashboard with staggered animations
- `animated-loading.tsx` - Various loading states
- `gesture-examples.tsx` - Gesture handling demonstrations

## License

Part of the Sandstone project.
