# Sandstone Design System Migration Guide

## Overview

This guide helps you migrate the existing Sandstone application to use the new design system.

---

## Step 1: Update Configuration Files

### 1.1 Replace `tailwind.config.ts`

Replace your existing `tailwind.config.ts` with the new one:

```bash
# Backup existing config
cp tailwind.config.ts tailwind.config.ts.backup

# Copy new config
cp /path/to/new/tailwind.config.ts tailwind.config.ts
```

### 1.2 Replace `app/globals.css`

Replace your existing `app/globals.css` with the new one:

```bash
# Backup existing CSS
cp app/globals.css app/globals.css.backup

# Copy new CSS
cp /path/to/new/globals.css app/globals.css
```

---

## Step 2: Install Dependencies

Ensure all required dependencies are installed:

```bash
# Install Radix UI Slot (for Button asChild)
npm install @radix-ui/react-slot

# Install class-variance-authority (for component variants)
npm install class-variance-authority

# Install clsx and tailwind-merge (for cn utility)
npm install clsx tailwind-merge
```

---

## Step 3: Create/Update UI Components

### 3.1 Create the `cn` Utility

Ensure you have a `cn` utility function in `lib/utils.ts`:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3.2 Copy New UI Components

Copy all new UI components to `components/ui/`:

```bash
# Create ui directory if it doesn't exist
mkdir -p components/ui

# Copy components
cp /path/to/new/components/ui/button.tsx components/ui/
cp /path/to/new/components/ui/card.tsx components/ui/
cp /path/to/new/components/ui/input.tsx components/ui/
cp /path/to/new/components/ui/badge.tsx components/ui/
cp /path/to/new/components/ui/loading.tsx components/ui/
cp /path/to/new/components/ui/empty-state.tsx components/ui/
```

---

## Step 4: Update Existing Components

### 4.1 Button Migration

**Before:**
```tsx
<button className="px-4 py-2 bg-[#E8D5C4] text-[#2D2D2D] rounded-lg hover:bg-[#D4C4B0]">
  Click me
</button>
```

**After:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md">
  Click me
</Button>
```

### 4.2 Card Migration

**Before:**
```tsx
<div className="bg-white dark:bg-[#141414] border border-[#E8E8E3] dark:border-[#2A2A2A] rounded-xl p-5 shadow-soft-sm">
  <h3 className="font-semibold text-lg mb-2">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

**After:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 4.3 Input Migration

**Before:**
```tsx
<input 
  className="w-full px-4 py-3 bg-sand-100 border border-sand-300 rounded-[10px]"
  placeholder="Enter text..."
/>
```

**After:**
```tsx
import { Input } from "@/components/ui/input";

<Input 
  label="Field Label"
  placeholder="Enter text..."
  helper="Helper text"
/>
```

### 4.4 Badge Migration

**Before:**
```tsx
<span className="px-2 py-1 bg-peach-100 text-sand-800 rounded-full text-xs">
  New
</span>
```

**After:**
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="primary">New</Badge>
```

---

## Step 5: Color Variable Migration

### 5.1 Update CSS Variables

The new design system uses HSL color values in CSS variables. Update any custom components:

**Before:**
```css
.custom-component {
  background-color: #E8D5C4;
  color: #2D2D2D;
}
```

**After:**
```css
.custom-component {
  background-color: hsl(var(--peach-300));
  color: hsl(var(--sand-900));
}
```

Or using Tailwind:

```tsx
<div className="bg-peach-300 text-sand-900">
  {/* Content */}
</div>
```

### 5.2 Color Mapping Reference

| Old Color | New Variable | Tailwind Class |
|-----------|--------------|----------------|
| `#FAFAF8` | `--sand-50` | `bg-sand-50` |
| `#F5F5F0` | `--sand-100` | `bg-sand-100` |
| `#E8D5C4` | `--peach-300` | `bg-peach-300` |
| `#2D2D2D` | `--sand-800` | `text-sand-800` |
| `#5A5A5A` | `--sand-600` | `text-sand-600` |
| `#A8C5A8` | `--sage-200` | `bg-sage-200` |
| `#A8C5D4` | `--blue-200` | `bg-blue-200` |
| `#D4A8A8` | `--rose-200` | `bg-rose-200` |

---

## Step 6: Typography Migration

### 6.1 Update Text Styles

**Before:**
```tsx
<h1 className="text-2xl font-semibold">Title</h1>
<p className="text-base text-gray-600">Body text</p>
```

**After:**
```tsx
<h1 className="text-h1">Title</h1>
<p className="text-body text-muted-foreground">Body text</p>
```

### 6.2 Typography Scale Reference

| Old Style | New Style | Usage |
|-----------|-----------|-------|
| `text-4xl font-bold` | `text-display` | Hero headlines |
| `text-3xl font-semibold` | `text-h1` | Page titles |
| `text-2xl font-semibold` | `text-h2` | Section headers |
| `text-xl font-semibold` | `text-h3` | Subsection headers |
| `text-lg font-medium` | `text-h4` | Card titles |
| `text-lg` | `text-body-lg` | Lead paragraphs |
| `text-base` | `text-body` | Default body text |
| `text-sm` | `text-body-sm` | Secondary text |
| `text-xs` | `text-caption` | Labels, metadata |

---

## Step 7: Spacing Migration

### 7.1 Update Spacing Values

**Before:**
```tsx
<div className="p-5 mb-6">
  <div className="space-y-3">
    {/* Content */}
  </div>
</div>
```

**After:**
```tsx
<div className="p-5 mb-6">
  <div className="space-y-4">
    {/* Content */}
  </div>
</div>
```

### 7.2 Spacing Scale Reference

| Old Value | New Value | Usage |
|-----------|-----------|-------|
| `4px` | `space-1` | Tight spacing |
| `8px` | `space-2` | Compact elements |
| `12px` | `space-3` | Default padding |
| `16px` | `space-4` | Standard padding |
| `20px` | `space-5` | Medium padding |
| `24px` | `space-6` | Large padding |
| `32px` | `space-8` | Section padding |
| `48px` | `space-12` | Large sections |
| `64px` | `space-16` | Major sections |

---

## Step 8: Shadow Migration

### 8.1 Update Shadow Classes

**Before:**
```tsx
<div className="shadow-soft-sm">
  {/* Content */}
</div>
```

**After:**
```tsx
<div className="shadow-soft-sm dark:shadow-soft-md">
  {/* Content */}
</div>
```

### 8.2 Shadow Scale Reference

| Old Shadow | New Shadow | Usage |
|------------|------------|-------|
| `shadow-sm` | `shadow-soft-xs` | Subtle elevation |
| `shadow-soft-sm` | `shadow-soft-sm` | Cards, buttons |
| `shadow-md` | `shadow-soft-md` | Elevated cards |
| `shadow-lg` | `shadow-soft-lg` | Modals, dialogs |
| `shadow-xl` | `shadow-soft-xl` | Feature cards |

---

## Step 9: Animation Migration

### 9.1 Update Animation Classes

**Before:**
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

**After:**
```tsx
<div className="animate-fade-in motion-safe:animate-fade-in">
  {/* Content */}
</div>
```

### 9.2 Animation Reference

| Animation | Class | Duration | Easing |
|-----------|-------|----------|--------|
| Fade In | `animate-fade-in` | 400ms | ease-out |
| Slide Up | `animate-slide-up` | 400ms | spring |
| Scale In | `animate-scale-in` | 300ms | spring |
| Pulse | `animate-pulse` | 2000ms | ease-in-out |

---

## Step 10: Testing Checklist

After migration, verify the following:

### Visual Testing
- [ ] Colors render correctly in light mode
- [ ] Colors render correctly in dark mode
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Shadows appear correctly
- [ ] Border radius is consistent

### Interactive Testing
- [ ] Buttons have hover states
- [ ] Buttons have active states
- [ ] Inputs have focus states
- [ ] Cards have hover effects
- [ ] Links are underlined on hover

### Accessibility Testing
- [ ] Focus rings are visible
- [ ] Color contrast meets WCAG standards
- [ ] ARIA labels are present
- [ ] Keyboard navigation works

### Responsive Testing
- [ ] Layout adapts to mobile screens
- [ ] Layout adapts to tablet screens
- [ ] Layout adapts to desktop screens
- [ ] Touch targets are large enough

---

## Common Issues & Solutions

### Issue: Colors not updating in dark mode

**Solution:** Ensure you're using CSS variables or Tailwind classes that reference variables:

```tsx
// ❌ Don't use hardcoded colors
<div className="bg-[#FAFAF8]">

// ✅ Use CSS variables
<div className="bg-background">
```

### Issue: Components look different after migration

**Solution:** Check that all styles are properly imported and that there are no conflicting styles:

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Issue: TypeScript errors after migration

**Solution:** Ensure all type definitions are correct and dependencies are installed:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

---

## Rollback Plan

If issues arise during migration:

```bash
# Restore backup configs
cp tailwind.config.ts.backup tailwind.config.ts
cp app/globals.css.backup app/globals.css

# Clear cache and restart
rm -rf .next
npm run dev
```
