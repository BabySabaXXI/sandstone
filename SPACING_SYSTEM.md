# Sandstone Spacing System

A comprehensive, consistent spacing system for the Sandstone application based on a 4px base unit (0.25rem).

## Overview

The spacing system follows the **8-point grid system** with 4px increments, providing:
- **Predictable** - Consistent spacing throughout the application
- **Scalable** - Easy to extend with new values
- **Semantic** - Meaningful token names for different contexts
- **Responsive** - Adapts to different screen sizes

## Base Unit

```
1 unit = 4px = 0.25rem
```

All spacing values are multiples of this base unit.

## Spacing Scale

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `0` | 0 | 0px | No spacing |
| `px` | 1px | 1px | Border width |
| `0.5` | 0.125rem | 2px | Micro spacing |
| `1` | 0.25rem | **4px** | Base unit |
| `1.5` | 0.375rem | 6px | Tight spacing |
| `2` | 0.5rem | 8px | Small spacing |
| `2.5` | 0.625rem | 10px | Compact spacing |
| `3` | 0.75rem | 12px | Default small |
| `3.5` | 0.875rem | 14px | Relaxed small |
| `4` | 1rem | **16px** | Default spacing |
| `5` | 1.25rem | 20px | Medium spacing |
| `6` | 1.5rem | **24px** | Large spacing |
| `8` | 2rem | **32px** | Extra large |
| `10` | 2.5rem | 40px | Section small |
| `12` | 3rem | **48px** | Section medium |
| `16` | 4rem | **64px** | Section large |
| `20` | 5rem | 80px | Hero small |
| `24` | 6rem | **96px** | Hero medium |
| `32` | 8rem | **128px** | Hero large |
| `40` | 10rem | 160px | Section XL |
| `48` | 12rem | **192px** | Section 2XL |
| `64` | 16rem | 256px | Maximum spacing |
| `80` | 20rem | **320px** | Ultra spacing |

## Semantic Tokens

### Component Spacing
```css
--space-component-xs: 4px   /* Tight component padding */
--space-component-sm: 8px   /* Compact component padding */
--space-component-md: 12px  /* Default component padding */
--space-component-lg: 16px  /* Relaxed component padding */
--space-component-xl: 24px  /* Spacious component padding */
```

### Content Spacing
```css
--space-content-xs: 8px    /* Tight content gaps */
--space-content-sm: 12px   /* Compact content gaps */
--space-content-md: 16px   /* Default content gaps */
--space-content-lg: 24px   /* Relaxed content gaps */
--space-content-xl: 32px   /* Spacious content gaps */
--space-content-2xl: 40px  /* Section content gaps */
```

### Layout Spacing
```css
--space-layout-xs: 16px   /* Minimal layout padding */
--space-layout-sm: 24px   /* Compact layout padding */
--space-layout-md: 32px   /* Default layout padding */
--space-layout-lg: 48px   /* Relaxed layout padding */
--space-layout-xl: 64px   /* Spacious layout padding */
--space-layout-2xl: 80px  /* Hero layout padding */
```

### Section Spacing (Vertical Rhythm)
```css
--space-section-xs: 32px    /* Minimal section spacing */
--space-section-sm: 48px    /* Compact section spacing */
--space-section-md: 64px    /* Default section spacing */
--space-section-lg: 80px    /* Relaxed section spacing */
--space-section-xl: 96px    /* Spacious section spacing */
--space-section-2xl: 128px  /* Hero section spacing */
```

### Grid Gaps
```css
--space-grid-xs: 4px   /* Micro grid gaps */
--space-grid-sm: 8px   /* Compact grid gaps */
--space-grid-md: 12px  /* Default grid gaps */
--space-grid-lg: 16px  /* Relaxed grid gaps */
--space-grid-xl: 24px  /* Spacious grid gaps */
--space-grid-2xl: 32px /* Large grid gaps */
```

### Card Spacing
```css
--space-card-xs: 8px   /* Micro card padding */
--space-card-sm: 12px  /* Compact card padding */
--space-card-md: 16px  /* Default card padding */
--space-card-lg: 20px  /* Relaxed card padding */
--space-card-xl: 24px  /* Spacious card padding */
```

### Form Spacing
```css
--space-form-label: 6px   /* Label to input */
--space-form-field: 16px  /* Between form fields */
--space-form-group: 24px  /* Between form groups */
--space-form-section: 32px /* Between form sections */
```

## Responsive Container Spacing

Container padding adapts to screen size:

| Breakpoint | Padding | Pixels |
|------------|---------|--------|
| Default (<640px) | `--space-4` | 16px |
| `sm` (640px+) | `--space-6` | 24px |
| `md` (768px+) | `--space-8` | 32px |
| `lg` (1024px+) | `--space-12` | 48px |
| `xl` (1280px+) | `--space-16` | 64px |

## Usage

### Tailwind Classes

```jsx
// Padding
<div className="p-4">16px padding</div>
<div className="px-6 py-8">24px horizontal, 32px vertical</div>
<div className="pt-4 pb-2">16px top, 8px bottom</div>

// Margin
<div className="m-4">16px margin</div>
<div className="mx-auto">Center horizontally</div>
<div className="mb-6">24px bottom margin</div>

// Gap
<div className="grid grid-cols-3 gap-4">16px grid gap</div>
<div className="flex gap-6">24px flex gap</div>

// Stack (vertical spacing)
<div className="space-y-4">
  <Item />
  <Item />
  <Item />
</div>
```

### React Components

```jsx
import { Stack, Inline, Grid, Container, Section, Box } from '@/components/ui/spacing';

// Vertical stack
<Stack space="4">
  <Item1 />
  <Item2 />
  <Item3 />
</Stack>

// Horizontal inline
<Inline space="4" align="center">
  <Button>Cancel</Button>
  <Button>Save</Button>
</Inline>

// Grid layout
<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="6">
  {items.map(item => <Card key={item.id} {...item} />)}
</Grid>

// Container
<Container size="default" padding>
  <PageContent />
</Container>

// Section
<Section size="lg" paddingX>
  <h2>Section Title</h2>
  <p>Section content...</p>
</Section>

// Box with spacing
<Box padding="4" marginY="2">
  <Content />
</Box>
```

### CSS Variables

```css
.my-component {
  padding: var(--space-component-md);
  margin-bottom: var(--space-content-lg);
  gap: var(--space-grid-md);
}
```

### TypeScript

```typescript
import { spacing, semanticSpacing, getSpacing } from '@/lib/spacing';

// Get spacing value
const padding = getSpacing('4'); // '1rem'

// Semantic spacing
const cardPadding = semanticSpacing.card.md; // '1rem'
const sectionGap = semanticSpacing.section.lg; // '5rem'
```

## Visual Rhythm

### Stack Pattern (Vertical)
```jsx
<Stack space="4">
  <Heading />
  <Paragraph />
  <ButtonGroup />
</Stack>
```

### Inline Pattern (Horizontal)
```jsx
<Inline space="4" align="center">
  <Icon />
  <Text />
  <Badge />
</Inline>
```

### Cluster Pattern (Flex Wrap)
```jsx
<Cluster space="4" justify="between" align="center">
  <Logo />
  <Navigation />
  <Actions />
</Cluster>
```

## File Structure

```
lib/
  spacing.ts              # Spacing tokens and utilities
  
app/
  spacing.css             # Complete spacing CSS
  globals.spacing.css     # Global spacing styles
  
components/ui/
  spacing.tsx             # React spacing components
  
tailwind.config.spacing.ts # Extended Tailwind config
```

## Integration

### 1. Import CSS

Add to your `globals.css` or layout:

```css
@import './spacing.css';
/* OR */
@import './globals.spacing.css';
```

### 2. Update Tailwind Config

Replace or merge with `tailwind.config.spacing.ts`:

```typescript
// tailwind.config.ts
import config from './tailwind.config.spacing';
export default config;
```

### 3. Use Components

Import and use spacing components throughout your app:

```tsx
import { Stack, Container, Section } from '@/components/ui/spacing';
```

## Best Practices

1. **Use semantic tokens** when possible (`space-component-md` vs `space-3`)
2. **Stick to the scale** - Don't use arbitrary values
3. **Use components** for complex layouts (Stack, Grid, etc.)
4. **Responsive first** - Consider mobile spacing
5. **Consistent rhythm** - Maintain 4px/8px alignment

## Debugging

Enable visual debugging during development:

```tsx
import { RhythmDebugger } from '@/components/ui/spacing';

<RhythmDebugger enabled={process.env.NODE_ENV === 'development'}>
  <YourApp />
</RhythmDebugger>
```

Or use CSS classes:

```css
.debug-spacing * {
  outline: 1px solid rgba(255, 0, 0, 0.2);
}

.baseline-overlay {
  /* Shows 8px grid overlay */
}
```
