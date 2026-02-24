# Sandstone Icon System

A comprehensive, accessible, and performant icon system for the Sandstone application.

## Features

- **Tree-shaking friendly**: Only import the icons you need
- **Centralized configuration**: Consistent sizes, colors, and animations
- **Full accessibility**: Built-in ARIA attributes and screen reader support
- **Performance optimized**: Lazy loading support for better initial load times
- **TypeScript support**: Full type safety with proper types
- **SVG optimization**: Pre-built SVG icons for common use cases

## Installation

The icon system is part of the Sandstone application. No additional installation required.

## Quick Start

```tsx
// Import icons
import { Home, Settings, User, Icon, IconSpin } from "@/lib/icons";

// Basic usage
<Icon icon={Home} size="md" />

// With color
<Icon icon={Settings} size="lg" color="primary" />

// With animation
<IconSpin icon={Loader2} size="md" />

// Accessible icon
<Icon icon={CheckCircle2} label="Success" color="success" />

// Decorative icon (hidden from screen readers)
<Icon icon={Sparkles} decorative size="sm" />
```

## Icon Sizes

| Size | Pixels | Class |
|------|--------|-------|
| `xs` | 12px | `w-3 h-3` |
| `sm` | 16px | `w-4 h-4` |
| `md` | 20px | `w-5 h-5` |
| `lg` | 24px | `w-6 h-6` |
| `xl` | 32px | `w-8 h-8` |
| `2xl` | 40px | `w-10 h-10` |
| `3xl` | 48px | `w-12 h-12` |

```tsx
<Icon icon={Home} size="sm" />
<Icon icon={Home} size="md" />
<Icon icon={Home} size="lg" />

// Custom numeric size
<Icon icon={Home} size={32} />
```

## Icon Colors

| Color | Description |
|-------|-------------|
| `default` | Current text color |
| `primary` | Primary theme color |
| `secondary` | Secondary theme color |
| `muted` | Muted foreground color |
| `accent` | Accent color |
| `success` | Success/emerald color |
| `warning` | Warning/amber color |
| `error` | Error/destructive color |
| `info` | Info/blue color |

```tsx
<Icon icon={CheckCircle2} color="success" />
<Icon icon={AlertCircle} color="warning" />
<Icon icon={XCircle} color="error" />
<Icon icon={Info} color="info" />
```

## Animations

| Animation | Description |
|-----------|-------------|
| `spin` | Continuous rotation |
| `pulse` | Pulsing opacity |
| `bounce` | Bouncing animation |
| `shake` | Shaking animation |
| `fade` | Fade in animation |

```tsx
<Icon icon={Loader2} animation="spin" />
<Icon icon={Bell} animation="pulse" />
<Icon icon={ArrowDown} animation="bounce" />
```

### Convenience Components

```tsx
import { IconSpin, IconPulse, IconBounce } from "@/lib/icons";

<IconSpin icon={Loader2} size="md" />
<IconPulse icon={Bell} size="md" />
<IconBounce icon={ArrowDown} size="md" />
```

## Accessibility

### Decorative Icons

Icons that are purely visual and don't convey meaning:

```tsx
<Icon icon={Sparkles} decorative size="sm" />
```

This sets `aria-hidden="true"` and `role="presentation"`.

### Icons with Labels

Icons that convey meaning:

```tsx
<Icon icon={CheckCircle2} label="Success" color="success" />
```

This sets `role="img"` and `aria-label="Success"`.

### Interactive Icons

Icons that are clickable:

```tsx
<button onClick={handleClick}>
  <Icon icon={Settings} label="Open settings" size="md" />
</button>
```

### Custom ARIA Attributes

```tsx
<Icon
  icon={Info}
  ariaLabel="Important information"
  ariaDescribedBy="info-description"
  size="md"
/>
```

## SVG Icons

For custom SVG icons not in Lucide:

```tsx
import { SVGIcon, UploadIcon, FileIcon, CloseIcon } from "@/lib/icons";

// Pre-built SVG icons
<UploadIcon size="lg" color="primary" />
<FileIcon size="md" />
<CloseIcon size="sm" />

// Custom SVG icon
<SVGIcon
  path="M12 2L2 7l10 5 10-5-10-5z"
  size="lg"
  label="Custom icon"
/>

// Multiple paths
<SVGIcon size="lg" label="Complex icon">
  <path d="M12 2L2 7l10 5 10-5-10-5z" />
  <path d="M2 17l10 5 10-5" />
</SVGIcon>
```

## Lazy Loading

For icons below the fold or not immediately visible:

```tsx
import { LazyIcon } from "@/lib/icons";

<LazyIcon
  icon={HeavyIcon}
  size="lg"
  fallback={<Skeleton className="w-8 h-8" />}
/>
```

### Lazy Icon Options

```tsx
<LazyIcon
  icon={HeavyIcon}
  size="lg"
  fallback={<CustomFallback />}
  rootMargin="100px"    // Load 100px before entering viewport
  threshold={0.5}       // Load when 50% visible
  loadDelay={200}       // Wait 200ms before loading
/>
```

## Icon Categories

Organized collections of icons:

```tsx
import { 
  navigationIcons, 
  actionIcons, 
  statusIcons,
  fileIcons,
  communicationIcons,
  mediaIcons,
  editorIcons,
  layoutIcons,
  dataIcons,
  timeIcons,
  userIcons,
  settingsIcons,
  educationIcons,
  developmentIcons 
} from "@/lib/icons";

// Usage
<navigationIcons.Home className="w-5 h-5" />
<actionIcons.Edit className="w-5 h-5" />
<statusIcons.AlertCircle className="w-5 h-5" />
```

## Common Patterns

### Buttons with Icons

```tsx
<Button>
  <Icon icon={Home} size="sm" className="mr-2" />
  Home
</Button>

<Button variant="ghost" size="icon">
  <Icon icon={Settings} size="sm" />
</Button>
```

### Loading States

```tsx
<Button disabled={isLoading}>
  {isLoading && <IconSpin icon={Loader2} size="sm" className="mr-2" />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Form Inputs

```tsx
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

### Navigation Items

```tsx
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/settings", label: "Settings", icon: Settings },
];

// In component
{navItems.map((item) => (
  <Link key={item.href} href={item.href}>
    <Icon icon={item.icon} size="md" />
    {item.label}
  </Link>
))}
```

## API Reference

### Icon Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon` | required | Lucide icon component |
| `size` | `IconSize \| number` | `"md"` | Icon size |
| `color` | `IconColor` | - | Icon color |
| `className` | `string` | - | Additional CSS classes |
| `animation` | `IconAnimation` | `"none"` | Animation type |
| `decorative` | `boolean` | `false` | Whether icon is decorative |
| `label` | `string` | - | Accessible label |
| `ariaLabel` | `string` | - | ARIA label |
| `ariaLabelledBy` | `string` | - | ARIA labelledby |
| `ariaDescribedBy` | `string` | - | ARIA describedby |
| `onClick` | `() => void` | - | Click handler |

### SVGIcon Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `string \| string[]` | - | SVG path data |
| `children` | `ReactNode` | - | Custom SVG content |
| `size` | `IconSize \| number` | `"md"` | Icon size |
| `color` | `IconColor` | - | Icon color |
| `viewBox` | `string` | `"0 0 24 24"` | SVG viewBox |
| `fill` | `string` | `"none"` | SVG fill |
| `stroke` | `string` | `"currentColor"` | SVG stroke |
| `strokeWidth` | `number` | `2` | SVG stroke width |

### LazyIcon Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon` | required | Icon to lazy load |
| `fallback` | `ReactNode` | - | Fallback component |
| `rootMargin` | `string` | `"50px"` | Intersection observer margin |
| `threshold` | `number` | `0.1` | Intersection threshold |
| `loadDelay` | `number` | `100` | Delay before loading |

## File Structure

```
lib/icons/
├── index.ts       # Main exports
├── types.ts       # TypeScript types
├── constants.ts   # Size, color, animation configs
├── registry.ts    # All icon exports from lucide-react
├── Icon.tsx       # Main Icon component
├── SVGIcon.tsx    # SVG icon component
├── LazyIcon.tsx   # Lazy loading component
└── README.md      # This file
```

## Migration from lucide-react

See [ICON_MIGRATION_GUIDE.md](../../ICON_MIGRATION_GUIDE.md) for detailed migration instructions.

## Performance Tips

1. **Use tree-shaking imports**: Import only the icons you need
2. **Lazy load below-fold icons**: Use `LazyIcon` for icons not immediately visible
3. **Prefer Icon component**: Use `<Icon icon={...} />` instead of direct usage for consistency
4. **Use decorative prop**: Mark purely visual icons as decorative
5. **Cache icon references**: Store icon components in constants to prevent re-renders

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- All modern browsers with Intersection Observer support

For older browsers, include the Intersection Observer polyfill:

```bash
npm install intersection-observer
```

```tsx
import 'intersection-observer';
```

## License

Part of the Sandstone application. Icons from [Lucide](https://lucide.dev/) (ISC License).
