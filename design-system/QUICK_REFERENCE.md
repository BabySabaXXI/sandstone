# Sandstone Design System - Quick Reference

## 🎨 Color Tokens

```tsx
// Backgrounds
bg-background        // Page background
bg-surface           // Card/elevated background
bg-surface-hover     // Hover state

// Text
text-text-primary    // Headings, important text
text-text-secondary  // Body text
text-text-tertiary   // Captions, hints
text-text-muted      // Disabled text

// Brand
text-sand-500        // Primary accent
bg-sand-500          // Primary buttons
border-sand-500      // Focus rings

// Status
bg-success / text-success
bg-warning / text-warning
bg-error / text-error
bg-info / text-info
```

## 📐 Spacing Scale

```tsx
// Use these spacing values consistently
space-1  // 4px   - Tight
space-2  // 8px   - Compact
space-3  // 12px  - Default
space-4  // 16px  - Standard
space-6  // 24px  - Section
space-8  // 32px  - Large
space-12 // 48px  - Page

// Common patterns
p-6      // Card padding
gap-4    // Grid gaps
space-y-2 // Form field spacing
```

## 🔤 Typography

```tsx
// Headings
text-hero    // 36px - Page titles
text-h1      // 30px - Section headings
text-h2      // 24px - Subsection headings
text-h3      // 20px - Card titles

// Body
text-body    // 16px - Paragraphs
text-small   // 14px - Labels, captions
text-caption // 12px - Metadata

// Usage
<h1 className="text-hero text-text-primary">Title</h1>
<p className="text-body text-text-secondary">Content</p>
```

## 🎯 Common Components

### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">Submit</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost" size="icon">🗑️</Button>
<Button isLoading>Saving...</Button>
```

### Card

```tsx
<div className="bg-surface rounded-lg shadow-card p-6">
  <h3 className="text-h3 text-text-primary">Title</h3>
  <p className="text-body text-text-secondary mt-2">Content</p>
</div>
```

### Input

```tsx
<div className="space-y-2">
  <label className="text-small font-medium text-text-primary">
    Label
  </label>
  <input
    className="w-full h-10 px-4 rounded-lg border border-border 
               bg-surface text-text-primary
               focus:outline-none focus:ring-2 focus:ring-sand-500
               placeholder:text-text-tertiary"
    placeholder="Placeholder..."
  />
</div>
```

### Modal

```tsx
<div className="fixed inset-0 z-modal flex items-center justify-center">
  <div className="absolute inset-0 bg-black/50" />
  <div className="relative bg-surface rounded-xl shadow-modal p-6 max-w-md w-full mx-4">
    {/* Modal content */}
  </div>
</div>
```

## 🌗 Dark Mode

All tokens automatically support dark mode:

```tsx
// Works in both light and dark mode
<div className="bg-surface text-text-primary">
  Content adapts automatically
</div>

// For manual dark mode overrides
dark:bg-surface-elevated
dark:text-text-primary
```

## ♿ Accessibility

### Required for all interactive elements:

```tsx
// Focus ring
<button className="focus-visible:ring-2 focus-visible:ring-sand-500 
                   focus-visible:ring-offset-2">

// ARIA labels for icon buttons
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Disabled state
<button disabled className="disabled:opacity-50 disabled:pointer-events-none">
```

## 📱 Responsive Patterns

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hide on mobile
<div className="hidden md:block">

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

## 🔄 Transitions

```tsx
// Standard transition
transition-colors duration-200

// Smooth easing
transition-transform duration-300 ease-manus-out

// Hover effects
hover:bg-surface-hover hover:shadow-card-hover
```

## 🛠️ Utility Classes

### Layout

```tsx
// Container
max-w-container mx-auto px-4 sm:px-6 lg:px-8

// Flex center
flex items-center justify-center

// Grid
grid grid-cols-1 md:grid-cols-2 gap-6
```

### Visual

```tsx
// Border
border border-border rounded-lg

// Shadow
shadow-card hover:shadow-card-hover

// Opacity
opacity-50 hover:opacity-100
```

## ⚠️ Common Mistakes

### ❌ Don't

```tsx
// Hardcoded colors
<div className="bg-white text-gray-800">

// Inconsistent spacing
<div className="p-3 m-5">

// Missing focus states
<button className="bg-blue-500">

// Random border radius
<div className="rounded-[10px]">
```

### ✅ Do

```tsx
// Use design tokens
<div className="bg-surface text-text-primary">

// Consistent spacing
<div className="p-6 m-6">

// Include focus states
<button className="bg-sand-500 focus-visible:ring-2 
                   focus-visible:ring-sand-500">

// Use token values
<div className="rounded-lg">
```

## 🧪 Testing Checklist

Before submitting a component:

- [ ] Uses design tokens for colors
- [ ] Uses design tokens for spacing
- [ ] Has proper focus states
- [ ] Works in dark mode
- [ ] Responsive on all breakpoints
- [ ] Has displayName (if using forwardRef)
- [ ] Follows naming conventions
- [ ] Has proper TypeScript types

## 📚 Resources

- [Full Style Guide](./style-guide.md)
- [Component Standards](./component-standards.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Design Tokens](./tokens.css)

## 🆘 Need Help?

1. Check the [Style Guide](./style-guide.md) for detailed patterns
2. Run the consistency checker: `node design-system/consistency-check.js`
3. Look at existing components in `components/ui/`
4. Ask in the team chat

---

*Keep this reference handy while developing!*
