# Icon System Migration Guide

This guide helps you migrate from direct `lucide-react` imports to the new centralized icon system.

## Quick Start

### Before (Old Way)

```tsx
import { Home, Settings, User, Loader2 } from "lucide-react";

function MyComponent() {
  return (
    <div>
      <Home className="w-5 h-5" />
      <Settings className="w-6 h-6 text-primary" />
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}
```

### After (New Way)

```tsx
import { Home, Settings, Icon, IconSpin } from "@/lib/icons";

function MyComponent() {
  return (
    <div>
      <Icon icon={Home} size="md" />
      <Icon icon={Settings} size="lg" color="primary" />
      <IconSpin icon={Loader2} size="md" />
    </div>
  );
}
```

## Migration Steps

### 1. Update Imports

Replace `lucide-react` imports with `@/lib/icons`:

```tsx
// Before
import { Home, Settings, User } from "lucide-react";

// After
import { Home, Settings, User } from "@/lib/icons";
```

### 2. Replace Direct Icon Usage with Icon Component

```tsx
// Before
<Home className="w-5 h-5" />

// After
<Icon icon={Home} size="md" />
```

### 3. Update Size Classes

| Old Class | New Size Prop |
|-----------|--------------|
| `w-3 h-3` | `size="xs"` |
| `w-4 h-4` | `size="sm"` |
| `w-5 h-5` | `size="md"` |
| `w-6 h-6` | `size="lg"` |
| `w-8 h-8` | `size="xl"` |
| `w-10 h-10` | `size="2xl"` |
| `w-12 h-12` | `size="3xl"` |

### 4. Update Color Classes

```tsx
// Before
<Settings className="w-5 h-5 text-primary" />
<Check className="w-5 h-5 text-emerald-500" />

// After
<Icon icon={Settings} size="md" color="primary" />
<Icon icon={Check} size="md" color="success" />
```

### 5. Update Animations

```tsx
// Before
<Loader2 className="w-5 h-5 animate-spin" />
<Bell className="w-5 h-5 animate-pulse" />

// After
<Icon icon={Loader2} size="md" animation="spin" />
<Icon icon={Bell} size="md" animation="pulse" />

// Or use convenience components
<IconSpin icon={Loader2} size="md" />
<IconPulse icon={Bell} size="md" />
```

### 6. Add Accessibility

```tsx
// Decorative icon (hidden from screen readers)
<Icon icon={Sparkles} decorative size="sm" />

// Icon with accessible label
<Icon icon={CheckCircle2} label="Success" color="success" size="md" />

// Interactive icon
<button onClick={handleClick}>
  <Icon icon={Settings} label="Open settings" size="md" />
</button>
```

## Component-Specific Patterns

### Buttons with Icons

```tsx
// Before
<Button>
  <Home className="w-4 h-4 mr-2" />
  Home
</Button>

// After
<Button>
  <Icon icon={Home} size="sm" className="mr-2" />
  Home
</Button>
```

### Loading States

```tsx
// Before
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>

// After
<Button disabled={isLoading}>
  {isLoading && <IconSpin icon={Loader2} size="sm" className="mr-2" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Navigation Items

```tsx
// Before
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];

// After (same structure, just import from @/lib/icons)
import { Home, Settings } from "@/lib/icons";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];
```

### Form Inputs with Icons

```tsx
// Before
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
  <Input className="pl-10" />
</div>

// After
<div className="relative">
  <Icon 
    icon={Search} 
    size="md" 
    color="muted" 
    className="absolute left-3 top-1/2 -translate-y-1/2" 
  />
  <Input className="pl-10" />
</div>
```

## Advanced Usage

### Lazy Loading Icons

For icons that are below the fold or not immediately visible:

```tsx
import { LazyIcon } from "@/lib/icons";

function MyComponent() {
  return (
    <LazyIcon
      icon={HeavyIcon}
      size="lg"
      fallback={<Skeleton className="w-8 h-8" />}
    />
  );
}
```

### SVG Icons for Custom Icons

```tsx
import { SVGIcon, UploadIcon } from "@/lib/icons";

// Use pre-built SVG icons
<UploadIcon size="lg" color="primary" />

// Or create custom SVG icons
<SVGIcon
  path="M12 2L2 7l10 5 10-5-10-5z"
  size="lg"
  label="Custom icon"
/>
```

### Icon Categories

```tsx
import { navigationIcons, actionIcons, statusIcons } from "@/lib/icons";

// Use categorized icons
<navigationIcons.Home className="w-5 h-5" />
<actionIcons.Edit className="w-5 h-5" />
<statusIcons.AlertCircle className="w-5 h-5" />
```

## Benefits of the New System

1. **Tree Shaking**: Only import the icons you need
2. **Consistency**: Standardized sizes, colors, and animations
3. **Accessibility**: Built-in ARIA attributes and screen reader support
4. **Performance**: Lazy loading support for better initial load times
5. **Type Safety**: Full TypeScript support with proper types
6. **Maintainability**: Centralized icon configuration

## File Structure

```
lib/
  icons/
    index.ts       # Main exports
    types.ts       # TypeScript types
    constants.ts   # Size, color, animation configs
    registry.ts    # All icon exports from lucide-react
    Icon.tsx       # Main Icon component
    SVGIcon.tsx    # SVG icon component
    LazyIcon.tsx   # Lazy loading component
```

## Migration Checklist

- [ ] Update all `lucide-react` imports to `@/lib/icons`
- [ ] Replace direct icon usage with `<Icon icon={...} />`
- [ ] Update size classes to size props
- [ ] Update color classes to color props
- [ ] Update animations to animation props
- [ ] Add accessibility attributes (label/decorative)
- [ ] Test all icon usage for visual consistency
- [ ] Verify screen reader compatibility

## Troubleshooting

### Icon not found

Make sure the icon is exported from `registry.ts`. If it's missing, add it:

```tsx
// In lib/icons/registry.ts
export { MissingIcon } from "lucide-react";
```

### Custom sizes

Use numeric values for custom sizes:

```tsx
<Icon icon={Home} size={32} />
```

### Custom colors

Pass Tailwind classes directly:

```tsx
<Icon icon={Home} className="text-purple-500" />
```

## Need Help?

See the example component at `components/examples/IconExamples.tsx` for comprehensive usage patterns.
