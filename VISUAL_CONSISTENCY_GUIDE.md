# Sandstone Visual Consistency Guide

## Overview

This guide ensures visual consistency across the entire Sandstone application by establishing patterns, standards, and best practices.

---

## 1. Color Usage Patterns

### Primary Actions
- **Buttons**: Use `btn-primary` class or `variant="primary"`
- **Links**: Use `text-primary` with underline on hover
- **Active States**: Use `bg-peach-100` for navigation items

### Background Colors

| Context | Light Mode | Dark Mode | CSS Class |
|---------|------------|-----------|-----------|
| Page Background | `#FAFAF8` | `#0A0A0A` | `bg-background` |
| Card Background | `#FCFCFA` | `#141414` | `bg-card` |
| Elevated Surface | `#FFFFFF` | `#1A1A1A` | `bg-surface-elevated` |
| Hover Surface | `#F8F8F5` | `#1F1F1F` | `bg-surface-hover` |

### Text Colors

| Context | Light Mode | Dark Mode | CSS Class |
|---------|------------|-----------|-----------|
| Primary Text | `#1A1A1A` | `#F5F5F5` | `text-foreground` |
| Secondary Text | `#4A4A4A` | `#A3A3A3` | `text-sand-700` / `text-sand-600` |
| Muted Text | `#6A6A6A` | `#707070` | `text-muted-foreground` |
| Disabled Text | `#8A8A8A` | `#525252` | `text-sand-500` |

### Border Colors

| Context | Light Mode | Dark Mode | CSS Class |
|---------|------------|-----------|-----------|
| Default Border | `#E5E5E0` | `#2E2E2E` | `border-border` |
| Subtle Border | `#EBEBE5` | `#242424` | `border-sand-200` |
| Hover Border | `#DEDED5` | `#333333` | `border-sand-300` |

---

## 2. Spacing Patterns

### Page Layout

```tsx
// Standard page container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  {/* Content */}
</div>

// Tight container (for forms, focused content)
<div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
  {/* Content */}
</div>
```

### Section Spacing

```tsx
// Major sections
<section className="py-12 md:py-16">
  {/* Content */}
</section>

// Minor sections
<div className="py-6 md:py-8">
  {/* Content */}
</div>
```

### Component Spacing

```tsx
// Card internal spacing
<Card className="p-5 md:p-6">
  <CardHeader className="mb-4">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content with 16px gaps */}
  </CardContent>
  <CardFooter className="mt-6 pt-4 border-t">
    {/* Footer content */}
  </CardFooter>
</Card>

// Form spacing
<form className="space-y-4">
  <Input label="Field 1" />
  <Input label="Field 2" />
  <div className="flex gap-3 pt-2">
    <Button>Submit</Button>
    <Button variant="secondary">Cancel</Button>
  </div>
</form>
```

---

## 3. Typography Patterns

### Heading Hierarchy

```tsx
// Page title
<h1 className="text-h1 font-semibold text-foreground">
  Page Title
</h1>

// Section heading
<h2 className="text-h2 font-semibold text-foreground">
  Section Heading
</h2>

// Subsection heading
<h3 className="text-h3 font-semibold text-foreground">
  Subsection Heading
</h3>

// Card title
<h4 className="text-h4 font-medium text-foreground">
  Card Title
</h4>
```

### Body Text

```tsx
// Lead paragraph
<p className="text-body-lg text-sand-700">
  Introductory text that sets the context...
</p>

// Standard paragraph
<p className="text-body text-muted-foreground">
  Regular body text with comfortable reading line height...
</p>

// Secondary text
<p className="text-body-sm text-sand-600">
  Supporting information and metadata...
</p>
```

### Text Utilities

```tsx
// Truncate long text
<p className="truncate">Long text that should be truncated...</p>

// Multi-line clamp
<p className="line-clamp-2">
  Text that should be limited to 2 lines and then truncated...
</p>

// Balance text (for headings)
<h2 className="text-balance">Heading with balanced line breaks</h2>
```

---

## 4. Component Patterns

### Buttons

```tsx
// Primary action (single per view)
<Button variant="primary" size="md">
  Save Changes
</Button>

// Secondary action
<Button variant="secondary" size="md">
  Cancel
</Button>

// Destructive action
<Button variant="destructive" size="md">
  Delete
</Button>

// Icon button
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="w-4 h-4" />
</Button>

// Loading state
<Button loading disabled>
  Processing...
</Button>
```

### Cards

```tsx
// Standard card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button variant="secondary">Action</Button>
  </CardFooter>
</Card>

// Feature card
<FeatureCard
  title="Feature Name"
  description="Feature description"
  icon={IconComponent}
  href="/path"
  color="#E8D5C4"
/>

// Interactive card
<Card variant="interactive" onClick={handleClick}>
  <CardContent className="p-4">
    {/* Clickable content */}
  </CardContent>
</Card>
```

### Forms

```tsx
// Standard form field
<div className="space-y-4">
  <Input
    label="Email Address"
    type="email"
    placeholder="you@example.com"
    helper="We'll never share your email"
  />
  
  <Input
    label="Password"
    type="password"
    error="Password must be at least 8 characters"
  />
  
  <Textarea
    label="Bio"
    placeholder="Tell us about yourself..."
    minRows={4}
  />
</div>
```

---

## 5. Responsive Patterns

### Breakpoint Usage

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// Responsive padding
<div className="p-4 sm:p-6 lg:p-8">
  {/* Content */}
</div>

// Responsive typography
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
  Responsive Heading
</h1>

// Hide/show elements
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

### Container Patterns

```tsx
// Full-width with max-width
<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Sidebar layout
<div className="flex gap-6">
  <aside className="hidden lg:block w-64 flex-shrink-0">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 min-w-0">
    {/* Main content */}
  </main>
</div>
```

---

## 6. Animation Patterns

### Page Transitions

```tsx
// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
  {/* Content */}
</motion.div>

// Slide up on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
  {/* Content */}
</motion.div>
```

### Stagger Animations

```tsx
// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover Effects

```tsx
// Card hover lift
<div className="transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-soft-lg">
  {/* Card content */}
</div>

// Button hover scale
<button className="transition-transform duration-200 active:scale-[0.98]">
  Click me
</button>

// Link hover underline
<a className="hover:underline underline-offset-4 transition-all">
  Link text
</a>
```

---

## 7. Dark Mode Patterns

### Color Adaptation

```tsx
// Automatic dark mode (uses CSS variables)
<div className="bg-card text-foreground border-border">
  {/* Automatically adapts to dark mode */}
</div>

// Manual dark mode override
<div className="bg-white dark:bg-black text-black dark:text-white">
  {/* Explicit dark mode colors */}
</div>
```

### Dark Mode Shadows

```tsx
// Shadows that work in both modes
<div className="shadow-soft-sm dark:shadow-soft-md">
  {/* Content */}
</div>
```

---

## 8. Accessibility Patterns

### Focus Management

```tsx
// Visible focus ring
<button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Focusable Button
</button>

// Skip to content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### ARIA Labels

```tsx
// Icon-only button
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>

// Loading state
<button aria-busy="true" aria-label="Loading, please wait">
  <Spinner />
</button>
```

### Reduced Motion

```tsx
// Respect user preferences
<div className="motion-safe:animate-fade-in">
  {/* Only animates if user prefers motion */}
</div>
```

---

## 9. Common Mistakes to Avoid

### ❌ Don't

```tsx
// Hardcoded colors
<div className="bg-gray-100 text-gray-800">
  {/* Won't adapt to dark mode */}
</div>

// Inconsistent spacing
<div className="p-3 mb-5">
  {/* Use spacing scale */}
</div>

// Missing hover states
<button className="bg-blue-500">
  {/* No hover feedback */}
</button>

// Inconsistent border radius
<div className="rounded-lg">
  <div className="rounded-xl">
    {/* Use consistent radius */}
  </div>
</div>
```

### ✅ Do

```tsx
// Use CSS variables
<div className="bg-card text-foreground">
  {/* Adapts to dark mode */}
</div>

// Consistent spacing
<div className="p-4 mb-4">
  {/* Uses spacing scale */}
</div>

// Proper hover states
<button className="bg-primary hover:bg-primary-hover transition-colors">
  {/* Clear hover feedback */}
</button>

// Consistent border radius
<div className="rounded-xl">
  <div className="rounded-xl">
    {/* Consistent radius */}
  </div>
</div>
```

---

## 10. Checklist for New Components

Before adding a new component, ensure:

- [ ] Uses design system colors (not hardcoded)
- [ ] Follows spacing scale
- [ ] Has proper hover/focus states
- [ ] Works in dark mode
- [ ] Has loading state (if applicable)
- [ ] Has error state (if applicable)
- [ ] Is accessible (ARIA labels, focus management)
- [ ] Has proper TypeScript types
- [ ] Follows naming conventions
- [ ] Has documentation/comments
