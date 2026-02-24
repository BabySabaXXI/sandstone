# Sandstone Micro-Interactions Library

A comprehensive collection of micro-interactions for the Sandstone Design System.

## Overview

This library provides delightful, performant micro-interactions including:

- **Hover Effects** - Lift, scale, glow, and tilt animations
- **Focus States** - Enhanced focus rings and glow effects
- **Loading States** - Skeletons, spinners, dots, and pulse animations
- **Transition Animations** - Fade, slide, scale, and stagger effects
- **Feedback Animations** - Success, error, warning, and info states

## Installation

The micro-interactions are already integrated into the Sandstone project. Import components and hooks from:

```tsx
import { 
  InteractiveButton, 
  InteractiveCard,
  FeedbackAnimations,
  TransitionAnimations 
} from '@/components/micro-interactions';

import { 
  useRipple, 
  useHoverAnimation,
  usePressAnimation 
} from '@/lib/micro-interactions/hooks';
```

## Components

### InteractiveButton

A button component with ripple effects, hover animations, and loading states.

```tsx
<InteractiveButton 
  variant="primary"
  loading={isLoading}
  ripple={true}
  magnetic={true}
>
  Click Me
</InteractiveButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'glass'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg' | 'icon-xl'
- `loading`: boolean
- `ripple`: boolean
- `magnetic`: boolean
- `magneticStrength`: number
- `leftIcon` / `rightIcon`: ReactNode

### InteractiveCard

A card component with various hover effects and entrance animations.

```tsx
<InteractiveCard 
  hover="lift"
  entrance="fade"
  entranceDelay={0.2}
>
  Card Content
</InteractiveCard>
```

**Props:**
- `hover`: 'lift' | 'scale' | 'glow' | 'tilt' | 'none'
- `hoverIntensity`: number
- `entrance`: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'none'
- `entranceDelay`: number
- `loading`: boolean
- `clickable`: boolean

### Feedback Animations

Components for displaying feedback states:

```tsx
<SuccessAnimation show={success} message="Done!" />
<ErrorAnimation show={error} message="Oops!" />
<LoadingAnimation variant="spinner" message="Loading..." />
<Toast show={showToast} type="success" title="Success!" message="Saved." />
<ConfettiAnimation trigger={celebrate} />
```

### Transition Animations

Components for animating content transitions:

```tsx
<FadeIn delay={0.2}>
  <Content />
</FadeIn>

<SlideIn direction="up" distance={30}>
  <Content />
</SlideIn>

<StaggerContainer staggerDelay={0.1}>
  {items.map(item => <Item key={item.id} />)}
</StaggerContainer>

<ScrollReveal threshold={0.2}>
  <Content />
</ScrollReveal>
```

## Hooks

### useRipple

Creates a ripple effect on click.

```tsx
const { ref, createRipple } = useRipple({ 
  color: 'rgba(255,255,255,0.3)',
  duration: 600 
});

<button ref={ref} onClick={createRipple}>
  Click Me
</button>
```

### useHoverAnimation

Smooth hover animations with scale and lift.

```tsx
const { ref, style, isHovered } = useHoverAnimation({
  scale: 1.02,
  lift: -4,
  duration: 200
});

<div ref={ref} style={style}>
  Hover me
</div>
```

### usePressAnimation

Press/tap animations for buttons.

```tsx
const { ref, style, isPressed } = usePressAnimation({
  scale: 0.98,
  duration: 100
});

<button ref={ref} style={style}>
  Press me
</button>
```

### useMagnetic

Magnetic pull effect towards cursor.

```tsx
const { ref, style } = useMagnetic({
  strength: 0.3,
  radius: 100
});

<div ref={ref} style={style}>
  Magnetic
</div>
```

### useCountUp

Animates a number counting up.

```tsx
const { count, start } = useCountUp(1000, {
  duration: 2000,
  delay: 500,
  startOnMount: false
});

<span>{Math.round(count)}</span>
<button onClick={start}>Start</button>
```

### useConfetti

Trigger confetti explosion.

```tsx
const { trigger, pieces, isActive } = useConfetti({
  count: 50,
  colors: ['#E8D5C4', '#A8C5A8', '#A8C5D4']
});

<button onClick={() => trigger()}>Celebrate!</button>
```

### useShake

Shake animation for error feedback.

```tsx
const { ref, style, shake } = useShake({
  intensity: 8,
  duration: 500
});

<div ref={ref} style={style}>
  <input onInvalid={shake} />
</div>
```

## CSS Classes

### Animation Classes

```css
.animate-fade-in
.animate-fade-in-up
.animate-fade-in-down
.animate-scale-in
.animate-slide-up
.animate-slide-down
.animate-bounce-in
.animate-elastic-scale
.animate-pop
.animate-swing
.animate-rubber-band
.animate-jello
.animate-heartbeat
.animate-flip-in-x
.animate-flip-in-y
.animate-zoom-in
```

### Hover Classes

```css
.hover-lift-sm    /* -2px lift */
.hover-lift-md    /* -4px lift */
.hover-lift-lg    /* -6px lift */
.hover-scale-sm   /* 1.02x scale */
.hover-scale-md   /* 1.05x scale */
.hover-scale-lg   /* 1.1x scale */
.hover-glow-sm    /* Small glow */
.hover-glow-md    /* Medium glow */
.hover-glow-lg    /* Large glow */
```

### Focus Classes

```css
.focus-ring-sm    /* 2px ring */
.focus-ring-md    /* 3px ring */
.focus-ring-lg    /* 4px ring */
.focus-glow       /* Glow effect */
```

### Loading Classes

```css
.loading-pulse
.loading-shimmer
.skeleton-shimmer
```

## Performance Optimization

### GPU Acceleration

All animated elements use GPU acceleration:

```css
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}
```

### Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

### Best Practices

1. **Use `transform` and `opacity`** - These properties are GPU-accelerated
2. **Avoid animating `width`, `height`, `top`, `left`** - These trigger layout recalculations
3. **Use `will-change` sparingly** - Only on elements that will actually animate
4. **Clean up animations** - Remove event listeners and cancel animations on unmount
5. **Use `requestAnimationFrame`** - For smooth 60fps animations

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Examples

See `examples.tsx` for comprehensive usage examples.

## License

MIT License - Part of the Sandstone Design System
