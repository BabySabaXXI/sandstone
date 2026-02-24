# Sandstone Tailwind CSS Optimization Guide

## Overview

This document describes the optimized Tailwind CSS configuration for the Sandstone application. The configuration has been enhanced for performance, accessibility, design consistency, and developer experience.

---

## Table of Contents

1. [Configuration Structure](#configuration-structure)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Spacing System](#spacing-system)
5. [Shadow System](#shadow-system)
6. [Animation System](#animation-system)
7. [Dark Mode](#dark-mode)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Custom Plugins](#custom-plugins)
10. [Utility Classes](#utility-classes)
11. [Usage Examples](#usage-examples)

---

## Configuration Structure

### File Location
```
/mnt/okcomputer/tailwind.config.ts
```

### Key Features
- **TypeScript Configuration**: Full type safety and IntelliSense
- **Custom Plugins**: Sandstone-specific component utilities
- **Extended Theme**: Comprehensive design token system
- **Safelist**: Dynamic class generation support
- **Performance Optimized**: Minimal CSS output

---

## Color System

### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FAFAF8` | `#0A0A0A` | Page background |
| `--foreground` | `#1F1F1C` | `#F5F5F5` | Primary text |
| `--primary` | `#E8D5C4` | `#D4C4B0` | Primary actions |
| `--secondary` | `#F5F5F0` | `#242424` | Secondary surfaces |
| `--muted` | `#F5F5F0` | `#242424` | Muted backgrounds |

### Sand Palette (Extended)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--sand-50` | `#FAFAF8` | `#141414` | Lightest surface |
| `--sand-100` | `#F5F5F0` | `#1A1A1A` | Card backgrounds |
| `--sand-200` | `#EBEBE5` | `#242424` | Elevated surfaces |
| `--sand-300` | `#DEDED5` | `#333333` | Borders, dividers |
| `--sand-400` | `#B8B8B0` | `#525252` | Disabled states |
| `--sand-500` | `#8A8A82` | `#737373` | Muted text |
| `--sand-600` | `#6A6A62` | `#A3A3A3` | Secondary text |
| `--sand-700` | `#4A4A42` | `#D4D4D4` | Primary text (dark) |
| `--sand-800` | `#2D2D2D` | `#E8E8E8` | Headings |
| `--sand-900` | `#1A1A1A` | `#F5F5F5` | Strong emphasis |
| `--sand-950` | `#0D0D0D` | `#FAFAFA` | Maximum contrast |

### Accent Colors

#### Peach Palette
```
--peach-50:  #FDFAF7  →  #1A1815 (dark)
--peach-100: #FDF6F0  →  #2A2520
--peach-200: #F5E6D3  →  #3D3530
--peach-300: #E8D5C4  →  #5A4D42 (primary)
--peach-400: #D4C4B0  →  #6A5D52
--peach-500: #B8A894  →  #8A7D72
--peach-600: #A09080  →  #A89A8A
```

#### Sage Palette
```
--sage-50:   #F5F8F5  →  #181A18
--sage-100:  #E8F0E8  →  #1F241F
--sage-200:  #A8C5A8  →  #4A5A4A
--sage-300:  #6A9A6A  →  #7A9A7A (success)
--sage-400:  #4A7A4A  →  #9ABA9A
```

#### Blue Palette
```
--blue-50:   #F5F8FA  →  #181A1C
--blue-100:  #E8F0F5  →  #1F2429
--blue-200:  #A8C5D4  →  #4A5A6A
--blue-300:  #6A9AB8  →  #7A9AB8 (info)
--blue-400:  #4A7A98  →  #9ABAD8
```

#### Amber Palette
```
--amber-50:  #FAF8F5  →  #1C1A15
--amber-100: #F5F0E8  →  #29241F
--amber-200: #E5D4A8  →  #6A5A4A (warning)
--amber-300: #D4B870  →  #A09070
```

#### Rose Palette
```
--rose-50:   #FAF5F5  →  #1C1515
--rose-100:  #F5E8E8  →  #291F1F
--rose-200:  #D4A8A8  →  #6A4A4A (error)
--rose-300:  #C08080  →  #B08080
```

### Semantic Colors

| State | Light | Dark | Usage |
|-------|-------|------|-------|
| Success | `#6A9A6A` | `#7A9A7A` | Success states |
| Warning | `#E5D4A8` | `#9A8A7A` | Warning states |
| Error | `#D4A8A8` | `#9A7A7A` | Error states |
| Info | `#6A9AB8` | `#7A9AB8` | Info states |

### Subject Colors (Dynamic)

```typescript
// For subject-specific theming
economics: { DEFAULT: '#E8D5C4', secondary: '#D4C4B0', bg: '#FDF6F0' }
history:   { DEFAULT: '#A8C5D4', secondary: '#8BA8C4', bg: '#E8F0F5' }
literature:{ DEFAULT: '#D4A8B8', secondary: '#C498A8', bg: '#F5E8EC' }
science:   { DEFAULT: '#A8D4A8', secondary: '#8BC48B', bg: '#E8F5E8' }
```

---

## Typography System

### Font Families

```typescript
fontFamily: {
  sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono:    ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
  display: ['Inter', 'sans-serif'],
  system:  ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
}
```

### Type Scale

| Style | Size | Line Height | Weight | Letter Spacing |
|-------|------|-------------|--------|----------------|
| `text-display-xl` | 4rem | 1.05 | 800 | -0.03em |
| `text-display-lg` | 3rem | 1.1 | 700 | -0.02em |
| `text-display` | 2.5rem | 1.15 | 700 | -0.02em |
| `text-display-sm` | 2rem | 1.2 | 700 | -0.01em |
| `text-h1` | 2.25rem | 1.2 | 600 | -0.01em |
| `text-h2` | 1.75rem | 1.3 | 600 | -0.01em |
| `text-h3` | 1.375rem | 1.4 | 600 | 0 |
| `text-h4` | 1.125rem | 1.4 | 500 | 0 |
| `text-h5` | 1rem | 1.4 | 500 | 0 |
| `text-h6` | 0.875rem | 1.4 | 500 | 0.01em |
| `text-body-xl` | 1.25rem | 1.7 | 400 | 0 |
| `text-body-lg` | 1.125rem | 1.7 | 400 | 0 |
| `text-body` | 1rem | 1.6 | 400 | 0 |
| `text-body-sm` | 0.875rem | 1.5 | 400 | 0 |
| `text-body-xs` | 0.75rem | 1.5 | 400 | 0 |
| `text-caption` | 0.75rem | 1.4 | 500 | 0.01em |
| `text-overline` | 0.75rem | 1.4 | 600 | 0.08em |

### Font Weights

```typescript
fontWeight: {
  thin:       '100',
  extralight: '200',
  light:      '300',
  normal:     '400',
  medium:     '500',
  semibold:   '600',
  bold:       '700',
  extrabold:  '800',
  black:      '900',
}
```

### Line Heights

```typescript
lineHeight: {
  none:         '1',
  tight:        '1.2',
  snug:         '1.375',
  normal:       '1.5',
  relaxed:      '1.625',
  loose:        '2',
  'extra-loose': '2.5',
}
```

---

## Spacing System

### Base Unit: 4px

| Token | Value | Common Usage |
|-------|-------|--------------|
| `space-0` | 0 | Reset |
| `space-0.5` | 2px | Micro spacing |
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Compact elements |
| `space-3` | 12px | Default padding |
| `space-4` | 16px | Standard padding |
| `space-5` | 20px | Medium padding |
| `space-6` | 24px | Large padding |
| `space-8` | 32px | Section padding |
| `space-10` | 40px | Large sections |
| `space-12` | 48px | Extra large |
| `space-16` | 64px | Major sections |
| `space-20` | 80px | Page sections |
| `space-24` | 96px | Hero spacing |

---

## Shadow System

### Light Mode Shadows

| Token | Value |
|-------|-------|
| `shadow-none` | none |
| `shadow-xs` | 0 1px 2px 0 rgb(0 0 0 / 0.03) |
| `shadow-sm` | 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04) |
| `shadow` | 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05) |
| `shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) |
| `shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06) |
| `shadow-xl` | 0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07) |
| `shadow-2xl` | 0 25px 50px -12px rgb(0 0 0 / 0.12) |

### Soft Shadows (Manus/Claude Inspired)

| Token | Value |
|-------|-------|
| `shadow-soft-xs` | 0 1px 2px 0 rgb(0 0 0 / 0.03) |
| `shadow-soft-sm` | 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04) |
| `shadow-soft` | 0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05) |
| `shadow-soft-md` | 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) |
| `shadow-soft-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06) |
| `shadow-soft-xl` | 0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07) |

### Dark Mode Shadows

| Token | Value |
|-------|-------|
| `shadow-dark-xs` | 0 1px 2px 0 rgb(0 0 0 / 0.2) |
| `shadow-dark-sm` | 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3) |
| `shadow-dark-md` | 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4) |
| `shadow-dark-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5) |

### Colored Shadows

| Token | Value |
|-------|-------|
| `shadow-peach` | 0 4px 14px 0 hsl(var(--peach-300) / 0.25) |
| `shadow-sage` | 0 4px 14px 0 hsl(var(--sage-200) / 0.25) |
| `shadow-blue` | 0 4px 14px 0 hsl(var(--blue-200) / 0.25) |

---

## Animation System

### Keyframe Animations

| Animation | Description | Duration | Easing |
|-----------|-------------|----------|--------|
| `animate-fade-in` | Fade in | 0.4s | ease-out |
| `animate-fade-out` | Fade out | 0.3s | ease-out |
| `animate-slide-up` | Slide up + fade | 0.4s | spring |
| `animate-slide-down` | Slide down + fade | 0.4s | spring |
| `animate-slide-in-right` | Slide from right | 0.4s | spring |
| `animate-slide-in-left` | Slide from left | 0.4s | spring |
| `animate-scale-in` | Scale up + fade | 0.3s | spring |
| `animate-scale-out` | Scale down + fade | 0.2s | ease-out |
| `animate-pulse` | Opacity pulse | 2s | infinite |
| `animate-bounce-subtle` | Subtle bounce | 2s | infinite |
| `animate-shimmer` | Shimmer effect | 2s | infinite |
| `animate-spin` | Full rotation | 1s | infinite |
| `animate-spin-slow` | Slow rotation | 3s | infinite |
| `animate-wiggle` | Wiggle | 1s | infinite |
| `animate-float` | Floating | 3s | infinite |

### Animation Delays

```css
.animate-delay-100 { animation-delay: 100ms; }
.animate-delay-200 { animation-delay: 200ms; }
.animate-delay-300 { animation-delay: 300ms; }
.animate-delay-400 { animation-delay: 400ms; }
.animate-delay-500 { animation-delay: 500ms; }
```

### Transition Timing Functions

```typescript
transitionTimingFunction: {
  DEFAULT:      'cubic-bezier(0.4, 0, 0.2, 1)',
  linear:       'linear',
  in:           'cubic-bezier(0.4, 0, 1, 1)',
  out:          'cubic-bezier(0, 0, 0.2, 1)',
  'in-out':     'cubic-bezier(0.4, 0, 0.2, 1)',
  spring:       'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce:       'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'manus-out':  'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'ease-in-expo':  'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
}
```

---

## Dark Mode

### Configuration

```typescript
darkMode: ["class", "[data-theme='dark']"],
```

### Usage

```tsx
// Method 1: Using class
<html className="dark">

// Method 2: Using data attribute
<html data-theme="dark">

// Method 3: Using media query (system preference)
@media (prefers-color-scheme: dark) { ... }
```

### Dark Mode Variants

| Variant | Description |
|---------|-------------|
| `dark` | Standard dark mode |
| `dark-hover` | Dark mode + hover state |
| `dark-focus` | Dark mode + focus state |
| `dark-active` | Dark mode + active state |
| `dark-scheme` | System preference dark |

### Example Usage

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  Content adapts to theme
</div>

<button className="bg-primary dark:bg-primary-hover hover:bg-primary-hover dark:hover:bg-primary-active">
  Themed button
</button>
```

---

## Responsive Breakpoints

### Default Breakpoints

| Name | Value | Description |
|------|-------|-------------|
| `xs` | 475px | Extra small devices |
| `sm` | 640px | Small devices |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Custom Breakpoints

| Name | Value | Description |
|------|-------|-------------|
| `tablet` | 768px | Tablet breakpoint |
| `desktop` | 1024px | Desktop breakpoint |
| `wide` | 1440px | Wide screens |

### Usage Examples

```tsx
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive visibility
<div className="hidden md:block">
```

---

## Custom Plugins

### Sandstone Plugin

The custom Sandstone plugin provides:

#### Component Classes

| Class | Description |
|-------|-------------|
| `.btn` | Base button styles |
| `.btn-primary` | Primary button |
| `.btn-secondary` | Secondary button |
| `.btn-ghost` | Ghost button |
| `.btn-icon` | Icon button |
| `.card` | Standard card |
| `.card-hover` | Card with hover effect |
| `.card-feature` | Feature card |
| `.card-interactive` | Interactive card |
| `.input-field` | Text input |
| `.textarea-field` | Textarea |
| `.badge` | Base badge |
| `.nav-item` | Navigation item |
| `.divider` | Horizontal divider |

#### Utility Classes

| Class | Description |
|-------|-------------|
| `.text-balance` | Balanced text wrapping |
| `.text-gradient` | Gradient text |
| `.bg-glass` | Glass morphism background |
| `.scrollbar-thin` | Thin scrollbar |
| `.scrollbar-hide` | Hidden scrollbar |
| `.focus-ring` | Focus ring style |
| `.container-tight` | Tight container |
| `.container-wide` | Wide container |
| `.line-clamp-{1-4}` | Line clamping |
| `.shimmer` | Shimmer loading effect |

#### Custom Variants

| Variant | Description |
|---------|-------------|
| `hocus` | Hover + focus |
| `group-hocus` | Group hover + focus |
| `data-active` | Data state active |
| `data-open` | Data state open |
| `data-selected` | Data selected true |
| `aria-expanded` | ARIA expanded |
| `aria-disabled` | ARIA disabled |
| `motion-safe` | Prefers reduced motion: no-preference |
| `motion-reduce` | Prefers reduced motion: reduce |
| `contrast-more` | Prefers contrast: more |
| `contrast-less` | Prefers contrast: less |

---

## Utility Classes

### Layout Utilities

```css
.container-tight     /* Max-width 768px, centered */
.container-wide      /* Max-width 1280px, centered */
.container-full      /* Full width with padding */
```

### Text Utilities

```css
.text-balance        /* Balanced text wrapping */
.text-gradient       /* Peach gradient text */
.text-gradient-sage  /* Sage gradient text */
.text-gradient-blue  /* Blue gradient text */
```

### Background Utilities

```css
.bg-glass            /* Glass morphism (80% opacity) */
.bg-glass-strong     /* Glass morphism (95% opacity) */
```

### Scrollbar Utilities

```css
.scrollbar-thin      /* Thin scrollbar styling */
.scrollbar-hide      /* Hide scrollbar */
```

### Animation Utilities

```css
.animate-in          /* Fade in animation */
.animate-slide-up    /* Slide up animation */
.animate-delay-{100-500} /* Animation delays */
```

### Focus Utilities

```css
.focus-ring          /* Standard focus ring */
.focus-ring-inset    /* Inset focus ring */
```

### Line Clamp Utilities

```css
.line-clamp-1        /* Clamp to 1 line */
.line-clamp-2        /* Clamp to 2 lines */
.line-clamp-3        /* Clamp to 3 lines */
.line-clamp-4        /* Clamp to 4 lines */
.line-clamp-none     /* Remove clamp */
```

### Elevation Utilities

```css
.elevation-0         /* No shadow */
.elevation-1         /* XS shadow */
.elevation-2         /* SM shadow */
.elevation-3         /* MD shadow */
.elevation-4         /* LG shadow */
```

### GPU Acceleration

```css
.gpu                 /* GPU acceleration */
.will-change-transform
.will-change-opacity
```

### Print Utilities

```css
.print-hidden        /* Hide when printing */
.print-visible       /* Show when printing */
.print-break-before  /* Page break before */
.print-break-after   /* Page break after */
```

---

## Usage Examples

### Button Examples

```tsx
// Primary button
<button className="btn-primary">Click me</button>

// Secondary button
<button className="btn-secondary">Cancel</button>

// Ghost button
<button className="btn-ghost">Learn more</button>

// Icon button
<button className="btn-icon">
  <Icon name="settings" />
</button>

// Button sizes
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary btn-lg">Large</button>
```

### Card Examples

```tsx
// Standard card
<div className="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Card with hover
<div className="card card-hover">
  <h3>Hoverable Card</h3>
</div>

// Feature card
<div className="card-feature">
  <h3>Feature Card</h3>
  <p>With enhanced styling</p>
</div>

// Interactive card
<div className="card-interactive" onClick={handleClick}>
  <h3>Clickable Card</h3>
</div>
```

### Form Examples

```tsx
// Text input
<input className="input-field" placeholder="Enter text..." />

// Input with error
<input className="input-field input-error" />

// Input sizes
<input className="input-field input-sm" />
<input className="input-field input-lg" />

// Textarea
<textarea className="textarea-field" />

// Select
<select className="select-field">
  <option>Option 1</option>
</select>

// Checkbox
<input type="checkbox" className="checkbox" />

// Radio
<input type="radio" className="radio" />
```

### Badge Examples

```tsx
<span className="badge-default">Default</span>
<span className="badge-primary">Primary</span>
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-error">Error</span>
<span className="badge-info">Info</span>
```

### Navigation Examples

```tsx
// Nav item
<a className="nav-item" href="/dashboard">
  <Icon name="home" />
  Dashboard
</a>

// Active nav item
<a className="nav-item-active" href="/settings">
  <Icon name="settings" />
  Settings
</a>
```

### Animation Examples

```tsx
// Fade in on mount
<div className="animate-fade-in">Content</div>

// Slide up with delay
<div className="animate-slide-up animate-delay-200">Content</div>

// Staggered animations
<div className="space-y-4">
  <div className="animate-slide-up">Item 1</div>
  <div className="animate-slide-up animate-delay-100">Item 2</div>
  <div className="animate-slide-up animate-delay-200">Item 3</div>
</div>
```

### Responsive Examples

```tsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Responsive typography
<h1 className="text-display-sm md:text-display lg:text-display-lg">
  Responsive Heading
</h1>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
  Content
</div>

// Responsive visibility
<div className="hidden md:block">
  Desktop only content
</div>
<div className="md:hidden">
  Mobile only content
</div>
```

### Dark Mode Examples

```tsx
// Basic dark mode
<div className="bg-white dark:bg-black text-black dark:text-white">
  Themed content
</div>

// Component with dark mode
<button className="
  bg-primary dark:bg-primary-hover
  text-primary-foreground
  hover:bg-primary-hover dark:hover:bg-primary-active
">
  Themed Button
</button>

// Dark mode with transitions
<div className="
  bg-background text-foreground
  transition-colors duration-200
">
  Smooth theme transition
</div>
```

---

## Performance Considerations

### CSS Output Optimization

1. **Content Configuration**: Only scan necessary files
2. **Safelist**: Pre-generate dynamic classes
3. **Purge Unused**: Remove unused styles in production

### Best Practices

```tsx
// ✅ Use semantic color tokens
<div className="bg-primary text-primary-foreground">

// ❌ Avoid hardcoded colors
<div className="bg-[#E8D5C4]">

// ✅ Use component classes
<button className="btn-primary">

// ❌ Avoid repetitive utility combinations
<button className="inline-flex items-center justify-center px-6 py-3...">

// ✅ Use GPU acceleration for animations
<div className="gpu will-change-transform">

// ✅ Respect reduced motion
<div className="motion-safe:animate-slide-up">
```

---

## Migration Guide

### From Old Config

1. Update color references:
   ```tsx
   // Before
   className="bg-manus-sand"
   
   // After
   className="bg-primary"
   ```

2. Update shadow references:
   ```tsx
   // Before
   className="shadow-card"
   
   // After
   className="shadow-soft-sm"
   ```

3. Update animation references:
   ```tsx
   // Before
   className="animate-fade"
   
   // After
   className="animate-fade-in"
   ```

---

## File References

| File | Description |
|------|-------------|
| `/mnt/okcomputer/tailwind.config.ts` | Main Tailwind configuration |
| `/mnt/okcomputer/globals.css` | Global CSS with CSS variables |
| `/mnt/okcomputer/DESIGN_SYSTEM.md` | Design system documentation |

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS Plugins](https://tailwindcss.com/docs/plugins)
