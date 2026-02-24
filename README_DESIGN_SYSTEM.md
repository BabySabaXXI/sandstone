# Sandstone Design System - Complete Package

## Overview

This package contains a comprehensive design system for the Sandstone AI-powered learning platform. It provides a cohesive visual language, reusable components, and implementation guidelines to ensure consistency across the application.

---

## Package Contents

### 📚 Documentation

| File | Description |
|------|-------------|
| `DESIGN_SYSTEM.md` | Complete design system specification with colors, typography, spacing, and component specs |
| `COMPONENT_SPECS.md` | Detailed component design specifications with usage examples |
| `VISUAL_CONSISTENCY_GUIDE.md` | Patterns and best practices for maintaining visual consistency |
| `MIGRATION_GUIDE.md` | Step-by-step guide for migrating existing code to the new design system |
| `README_DESIGN_SYSTEM.md` | This file - overview and quick start guide |

### ⚙️ Configuration Files

| File | Description |
|------|-------------|
| `tailwind.config.ts` | Extended Tailwind CSS configuration with custom theme |
| `globals.css` | Global CSS with design system variables and utilities |

### 🧩 UI Components

| File | Description |
|------|-------------|
| `components/ui/button.tsx` | Button component with variants (primary, secondary, ghost, destructive) |
| `components/ui/card.tsx` | Card component with variants (default, feature, interactive) |
| `components/ui/input.tsx` | Input, Textarea, and Select components with validation |
| `components/ui/badge.tsx` | Badge component with status indicators and score badges |
| `components/ui/loading.tsx` | Loading indicators (Spinner, Skeleton, Shimmer) |
| `components/ui/empty-state.tsx` | Empty state component with specialized variants |

---

## Quick Start

### 1. Install Dependencies

```bash
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### 2. Update Configuration

Replace your existing `tailwind.config.ts` and `app/globals.css` with the new files:

```bash
# Backup existing files
cp tailwind.config.ts tailwind.config.ts.backup
cp app/globals.css app/globals.css.backup

# Copy new files
cp tailwind.config.ts.new tailwind.config.ts
cp globals.css.new app/globals.css
```

### 3. Create Utility Function

Ensure `lib/utils.ts` exists with the `cn` function:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4. Copy UI Components

Copy all UI components to your project:

```bash
mkdir -p components/ui
cp components/ui/*.tsx components/ui/
```

### 5. Start Using Components

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function MyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Sandstone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Email" placeholder="Enter your email" />
          <Button variant="primary">Get Started</Button>
          <Badge variant="success">Active</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Design Tokens

### Colors

#### Primary Palette
- `--sand-50` to `--sand-900` - Neutral sand tones
- `--peach-100` to `--peach-500` - Warm accent colors
- `--sage-100` to `--sage-300` - Success/green tones
- `--blue-100` to `--blue-300` - Info/blue tones
- `--amber-100` to `--amber-200` - Warning tones
- `--rose-100` to `--rose-200` - Error tones

#### Semantic Colors
- `--background` - Page background
- `--foreground` - Primary text
- `--card` - Card background
- `--primary` - Primary actions
- `--secondary` - Secondary elements
- `--muted` - Muted backgrounds
- `--accent` - Accent elements
- `--border` - Borders and dividers

### Typography

| Token | Size | Line Height | Weight |
|-------|------|-------------|--------|
| `text-display` | 3rem | 1.1 | 700 |
| `text-h1` | 2.25rem | 1.2 | 600 |
| `text-h2` | 1.75rem | 1.3 | 600 |
| `text-h3` | 1.375rem | 1.4 | 600 |
| `text-h4` | 1.125rem | 1.4 | 500 |
| `text-body-lg` | 1.125rem | 1.7 | 400 |
| `text-body` | 1rem | 1.6 | 400 |
| `text-body-sm` | 0.875rem | 1.5 | 400 |
| `text-caption` | 0.75rem | 1.4 | 500 |

### Spacing

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

### Border Radius

| Token | Value |
|-------|-------|
| `rounded-sm` | 6px |
| `rounded-md` | 10px |
| `rounded-lg` | 14px |
| `rounded-xl` | 18px |
| `rounded-2xl` | 24px |
| `rounded-full` | 9999px |

### Shadows

| Token | Value |
|-------|-------|
| `shadow-soft-xs` | Subtle shadow |
| `shadow-soft-sm` | Card shadow |
| `shadow-soft-md` | Elevated shadow |
| `shadow-soft-lg` | Modal shadow |
| `shadow-soft-xl` | Feature shadow |

---

## Component API Reference

### Button

```tsx
<Button
  variant="primary"    // "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link"
  size="md"            // "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"
  loading={false}      // boolean
  disabled={false}     // boolean
  leftIcon={<Icon />}  // ReactNode
  rightIcon={<Icon />} // ReactNode
  onClick={() => {}}   // () => void
>
  Button Text
</Button>
```

### Card

```tsx
<Card
  variant="default"    // "default" | "feature" | "interactive" | "flat" | "ghost"
  padding="md"         // "none" | "sm" | "md" | "lg" | "xl"
>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input

```tsx
<Input
  label="Label"           // string
  placeholder="..."       // string
  helper="Helper text"    // string
  error="Error message"   // string
  state="default"         // "default" | "error" | "success"
  size="md"               // "sm" | "md" | "lg"
  icon={<Icon />}         // ReactNode
  iconPosition="left"     // "left" | "right"
  required={false}        // boolean
/>
```

### Badge

```tsx
<Badge
  variant="default"    // "default" | "primary" | "success" | "warning" | "error" | "info"
  size="md"            // "sm" | "md" | "lg"
  dot={false}          // boolean
>
  Badge Text
</Badge>

// Specialized badges
<ScoreBadge score={85} maxScore={100} size="md" />
<StatusBadge status="completed" />
<CountBadge count={5} />
```

---

## Best Practices

### 1. Use Design Tokens

Always use design tokens instead of hardcoded values:

```tsx
// ❌ Bad
<div className="bg-[#FAFAF8] text-[#2D2D2D] p-[16px]">

// ✅ Good
<div className="bg-background text-foreground p-4">
```

### 2. Maintain Consistency

Use consistent patterns across the application:

```tsx
// ❌ Inconsistent
<div className="p-4 mb-5">
<div className="p-5 mb-4">

// ✅ Consistent
<div className="p-4 mb-4">
<div className="p-4 mb-4">
```

### 3. Support Dark Mode

All components should work in both light and dark modes:

```tsx
// ✅ Uses CSS variables that adapt to dark mode
<div className="bg-card text-foreground border-border">
```

### 4. Include Interactive States

Always include hover, focus, and active states:

```tsx
// ✅ Complete interactive states
<button className="bg-primary hover:bg-primary-hover active:scale-[0.98] focus:ring-2">
```

### 5. Ensure Accessibility

Include proper ARIA labels and focus management:

```tsx
// ✅ Accessible
<button aria-label="Close dialog" className="focus-visible:ring-2">
  <X className="w-4 h-4" />
</button>
```

---

## Browser Support

The design system supports:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Contributing

When adding new components or modifying existing ones:

1. Follow the existing patterns and conventions
2. Update the documentation
3. Test in both light and dark modes
4. Ensure accessibility compliance
5. Add TypeScript types

---

## License

This design system is part of the Sandstone project and follows the same license terms.

---

## Support

For questions or issues related to the design system:

1. Check the documentation files
2. Review the component specifications
3. Refer to the migration guide
4. Consult the visual consistency guide
