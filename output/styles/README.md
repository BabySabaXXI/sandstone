# Sandstone CSS/Styles - Fixed & Organized

This directory contains the fixed and organized CSS styles for the Sandstone application.

## 📁 File Structure

```
styles/
├── index.css           # Main entry point - imports all styles
├── globals.css         # Global styles, CSS variables, base styles
├── tailwind.config.ts  # Tailwind CSS configuration
├── components.css      # Reusable component styles
├── animations.css      # Animation keyframes and utilities
├── dark-mode.css       # Dark mode specific styles
├── mobile.css          # Mobile-specific styles and optimizations
├── utilities.css       # Additional utility classes
└── README.md           # This file
```

## 🚀 Quick Start

Import the main styles in your application's entry point:

```css
/* In your main globals.css or layout file */
@import './styles/index.css';
```

Or import individual files as needed:

```css
@import './styles/globals.css';
@import './styles/components.css';
@import './styles/animations.css';
```

## 📋 What's Fixed

### 1. CSS Conflicts Resolved
- **Duplicate variable definitions** - Consolidated all CSS custom properties into `globals.css`
- **Conflicting shadow utilities** - Unified shadow naming and values
- **Animation keyframe duplicates** - Removed duplicate keyframes, kept single source of truth
- **Color palette inconsistencies** - Standardized sand, peach, sage, and blue palettes

### 2. Responsive Issues Fixed
- **Mobile-first approach** - All breakpoints follow mobile-first methodology
- **Viewport height fixes** - Added `dvh` support with fallbacks for mobile browsers
- **Touch target sizes** - Minimum 44px touch targets for accessibility
- **Safe area insets** - Support for notched devices (iPhone X+)
- **Fluid typography** - Responsive font sizing with `clamp()`

### 3. Dark Mode Issues Fixed
- **Consistent variable naming** - All dark mode variables follow consistent pattern
- **Proper contrast ratios** - Ensured WCAG compliant contrast in dark mode
- **Component dark mode styles** - Added dark mode styles for all components
- **Shadow adjustments** - Dark mode shadows are more visible
- **Image brightness** - Slight brightness reduction for images in dark mode

### 4. Animation Issues Fixed
- **Reduced motion support** - All animations respect `prefers-reduced-motion`
- **Consistent timing** - Standardized animation durations and easing functions
- **GPU acceleration** - Added `transform: translateZ(0)` for smooth animations
- **Animation fill modes** - Proper `forwards` fill mode for entrance animations

### 5. CSS Organization
- **Modular structure** - Each concern in its own file
- **Clear naming conventions** - BEM-like naming for component classes
- **Layer directives** - Proper use of `@layer` for cascade control
- **Documentation** - Comprehensive comments throughout

## 🎨 Design Tokens

### Colors

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `45 14% 97%` | `0 0% 8%` |
| `--foreground` | `0 0% 13%` | `0 0% 96%` |
| `--primary` | `22 51% 43%` | `22 70% 72%` |
| `--secondary` | `45 14% 95%` | `0 0% 14%` |
| `--muted` | `45 14% 93%` | `0 0% 14%` |
| `--border` | `45 14% 88%` | `0 0% 18%` |

### Spacing (4px base unit)

| Token | Value |
|-------|-------|
| `--space-1` | 0.25rem (4px) |
| `--space-2` | 0.5rem (8px) |
| `--space-4` | 1rem (16px) |
| `--space-6` | 1.5rem (24px) |
| `--space-8` | 2rem (32px) |

### Typography

| Token | Size | Line Height |
|-------|------|-------------|
| `--text-xs` | 0.75rem | 1rem |
| `--text-sm` | 0.875rem | 1.25rem |
| `--text-base` | 1rem | 1.5rem |
| `--text-lg` | 1.125rem | 1.75rem |
| `--text-xl` | 1.25rem | 1.75rem |

## 🧩 Component Classes

### Buttons

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-destructive">Destructive</button>
```

### Cards

```html
<div class="card card-default">Default card</div>
<div class="card card-elevated">Elevated card</div>
<div class="card card-interactive">Interactive card</div>
<div class="card card-flat">Flat card</div>
```

### Forms

```html
<div class="form-field">
  <label class="form-label">Label</label>
  <input class="input" placeholder="Enter text..." />
  <p class="form-description">Helper text</p>
</div>
```

## 🎬 Animation Classes

### Entrance Animations

```html
<div class="animate-fade-in">Fade in</div>
<div class="animate-fade-in-up">Fade in up</div>
<div class="animate-scale-in">Scale in</div>
<div class="animate-slide-up">Slide up</div>
```

### Continuous Animations

```html
<div class="animate-pulse">Pulse</div>
<div class="animate-bounce">Bounce</div>
<div class="animate-spin">Spin</div>
<div class="animate-shimmer">Shimmer</div>
```

### Hover Effects

```html
<div class="hover-lift">Lift on hover</div>
<div class="hover-scale">Scale on hover</div>
<div class="hover-glow">Glow on hover</div>
<div class="hover-underline">Underline on hover</div>
```

## 📱 Mobile Classes

### Safe Area

```html
<div class="safe-area-top">Top safe area</div>
<div class="safe-area-bottom">Bottom safe area</div>
<div class="safe-area-x">Horizontal safe area</div>
```

### Touch Targets

```html
<button class="touch-target">44px minimum</button>
<button class="touch-target-lg">48px minimum</button>
```

### Viewport Height

```html
<div class="h-screen-mobile">100dvh with fallback</div>
<div class="min-h-screen-mobile">Min 100dvh with fallback</div>
```

## 🌙 Dark Mode

Dark mode is automatically applied when the `.dark` class is present on the HTML element:

```html
<html class="dark">
  <!-- Dark mode styles applied -->
</html>
```

Or use the `data-theme` attribute:

```html
<html data-theme="dark">
  <!-- Dark mode styles applied -->
</html>
```

## ♿ Accessibility

### Reduced Motion

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

### High Contrast

Dark mode supports high contrast mode:

```css
@media (prefers-contrast: high) {
  /* High contrast styles */
}
```

### Touch Targets

All interactive elements have minimum 44px touch targets for accessibility.

## 🔧 Tailwind Configuration

The Tailwind config extends the default theme with:

- Custom color palette (sand, peach, sage, blue)
- Custom font sizes with line heights
- Custom spacing scale
- Custom animations
- Custom shadows
- Custom z-index scale

## 📝 Best Practices

1. **Use semantic class names** - Prefer `.btn-primary` over `.bg-blue-500`
2. **Mobile-first** - Design for mobile, enhance for desktop
3. **Respect user preferences** - Support `prefers-reduced-motion` and `prefers-color-scheme`
4. **Test in dark mode** - Always test components in both light and dark modes
5. **Use CSS variables** - Leverage design tokens for consistency

## 🐛 Troubleshooting

### Styles not applying

Ensure Tailwind directives are present:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Dark mode not working

Check that the `.dark` class is on the HTML element:

```html
<html class="dark">
```

### Animations not working

Ensure `tailwindcss-animate` plugin is installed:

```bash
npm install tailwindcss-animate
```

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Reduced Motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
