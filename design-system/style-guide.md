# Sandstone Style Guide

## Brand Identity

Sandstone is an AI-powered learning platform with a warm, approachable aesthetic inspired by natural materials and modern minimalism.

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-sand-200` | `#E8D5C4` | Primary brand accent |
| `--color-sand-500` | `#B07D58` | Primary buttons, links |
| `--color-sand-700` | `#6E4D37` | Hover states, emphasis |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-sage` | `#A8C5A8` | Success states, positive actions |
| `--color-amber` | `#E5D4A8` | Warnings, highlights |
| `--color-rose` | `#D4A8A8` | Errors, destructive actions |
| `--color-sky` | `#A8C5D4` | Info, links |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cement` | `#F5F5F0` | Backgrounds, cards |
| `--color-charcoal` | `#2D2D2D` | Primary text |
| `--color-grey` | `#5A5A5A` | Secondary text |
| `--color-grey-light` | `#8A8A8A` | Tertiary text, icons |

### Semantic Colors

#### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#FAFAF8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals |
| `--color-text-primary` | `#2D2D2D` | Headings, primary text |
| `--color-text-secondary` | `#5A5A5A` | Body text |
| `--color-border` | `#E8E8E8` | Borders, dividers |

#### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#1A1A1A` | Page background |
| `--color-surface` | `#242424` | Cards, modals |
| `--color-text-primary` | `#F5F5F0` | Headings, primary text |
| `--color-text-secondary` | `#B8B8B8` | Body text |
| `--color-border` | `#3D3D3D` | Borders, dividers |

## Typography

### Font Families

- **Primary**: Inter (sans-serif)
- **Monospace**: JetBrains Mono (for code)

### Type Scale

| Style | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Hero | 2.25rem (36px) | 1.2 | 600 | Page titles |
| H1 | 1.75rem (28px) | 1.3 | 600 | Section headings |
| H2 | 1.375rem (22px) | 1.4 | 600 | Subsection headings |
| H3 | 1.125rem (18px) | 1.4 | 500 | Card titles |
| Body | 1rem (16px) | 1.6 | 400 | Paragraph text |
| Small | 0.875rem (14px) | 1.5 | 400 | Labels, captions |
| Caption | 0.75rem (12px) | 1.4 | 500 | Metadata, badges |

### Typography Patterns

```css
/* Page Title */
.text-hero {
  font-size: var(--text-4xl);
  line-height: var(--leading-tight);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

/* Section Heading */
.text-h1 {
  font-size: var(--text-3xl);
  line-height: var(--leading-snug);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

/* Body Text */
.text-body {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  font-weight: var(--font-normal);
  color: var(--color-text-secondary);
}
```

## Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 0.25rem (4px) | Tight spacing |
| `--space-2` | 0.5rem (8px) | Compact spacing |
| `--space-3` | 0.75rem (12px) | Default spacing |
| `--space-4` | 1rem (16px) | Standard spacing |
| `--space-6` | 1.5rem (24px) | Section spacing |
| `--space-8` | 2rem (32px) | Large spacing |
| `--space-12` | 3rem (48px) | Page spacing |

### Spacing Patterns

```css
/* Card Padding */
.card {
  padding: var(--space-6);
}

/* Section Gap */
.section {
  gap: var(--space-8);
}

/* Form Field Gap */
.form-group {
  gap: var(--space-2);
}
```

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.5rem (8px) | Inputs, buttons |
| `--radius-lg` | 0.75rem (12px) | Cards |
| `--radius-xl` | 1rem (16px) | Modals |
| `--radius-full` | 9999px | Pills, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04)` | Cards at rest |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.08)` | Cards on hover |
| `--shadow-dropdown` | `0 4px 16px rgba(0,0,0,0.12)` | Dropdowns |
| `--shadow-modal` | `0 24px 48px rgba(0,0,0,0.16)` | Modals |

## Components

### Buttons

#### Primary Button

```tsx
<Button variant="primary" size="md">
  Submit
</Button>
```

**Styles:**
- Background: `--color-sand-500`
- Text: White
- Padding: `0.625rem 1rem`
- Border Radius: `--radius-md`
- Hover: `--color-sand-600`

#### Secondary Button

```tsx
<Button variant="secondary" size="md">
  Cancel
</Button>
```

**Styles:**
- Background: `--color-surface`
- Border: 1px solid `--color-border`
- Text: `--color-text-primary`
- Hover: `--color-surface-hover`

#### Ghost Button

```tsx
<Button variant="ghost" size="sm">
  <Icon name="settings" />
</Button>
```

**Styles:**
- Background: Transparent
- Text: `--color-text-secondary`
- Hover: `--color-surface-hover`

### Cards

```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Styles:**
- Background: `--color-surface`
- Border Radius: `--radius-lg`
- Shadow: `--shadow-card`
- Padding: `--space-6`

### Inputs

```tsx
<Input
  placeholder="Enter your name"
  label="Name"
  error={errors.name}
/>
```

**Styles:**
- Background: `--color-surface`
- Border: 1px solid `--color-border`
- Border Radius: `--radius-md`
- Padding: `0.625rem 0.875rem`
- Focus: Border color `--color-sand-500`, ring

### Modals

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>
```

**Styles:**
- Background: `--color-surface`
- Border Radius: `--radius-xl`
- Shadow: `--shadow-modal`
- Max Width: 28rem (md), 32rem (lg)

## Layout

### Container

```tsx
<Container size="default">
  {/* Content */}
</Container>
```

| Size | Max Width |
|------|-----------|
| narrow | 768px |
| default | 1200px |
| wide | 1440px |
| full | 100% |

### Grid

```tsx
<Grid cols={3} gap={6}>
  <GridItem>Item 1</GridItem>
  <GridItem>Item 2</GridItem>
  <GridItem>Item 3</GridItem>
</Grid>
```

### Sidebar

- Width: 280px (expanded)
- Width: 72px (collapsed)
- Background: `--color-surface`
- Border Right: 1px solid `--color-border`

## Animations

### Transitions

| Token | Duration | Usage |
|-------|----------|-------|
| `--transition-fast` | 150ms | Hover states |
| `--transition-normal` | 250ms | UI changes |
| `--transition-slow` | 350ms | Page transitions |

### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard transitions |
| `--ease-manus` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth deceleration |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful animations |

### Common Animations

```css
/* Fade In */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slide-up {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Responsive Patterns

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hide on mobile
<div className="hidden md:block">

// Stack on mobile
<div className="flex flex-col md:flex-row">
```

## Dark Mode

### Implementation

```tsx
// Use dark: prefix for dark mode styles
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

### Color Mapping

| Light Mode | Dark Mode |
|------------|-----------|
| `--color-background` | `#1A1A1A` |
| `--color-surface` | `#242424` |
| `--color-text-primary` | `#F5F5F0` |
| `--color-border` | `#3D3D3D` |

## Accessibility

### Color Contrast

- Normal text: Minimum 4.5:1
- Large text: Minimum 3:1
- UI components: Minimum 3:1

### Focus Indicators

```css
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-sand-500);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

1. **Always use design tokens** - Never hardcode colors, spacing, or typography
2. **Maintain consistency** - Use the same patterns across the application
3. **Prioritize accessibility** - Ensure all users can use the interface
4. **Test in both modes** - Verify designs in light and dark mode
5. **Keep it simple** - Avoid unnecessary complexity
