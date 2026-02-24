# Sandstone Design System Migration Guide

## Overview

This guide helps you migrate the Sandstone codebase to use the new design system consistently.

## Quick Start

1. **Install the design tokens**
   ```bash
   # Copy tokens.css to your styles directory
   cp design-system/tokens.css app/styles/tokens.css
   ```

2. **Import tokens in globals.css**
   ```css
   @import './styles/tokens.css';
   ```

3. **Run the consistency checker**
   ```bash
   node design-system/consistency-check.js
   ```

## Migration Steps

### Phase 1: Foundation (Week 1)

#### 1.1 Update globals.css

Replace the existing CSS variables with design tokens:

```css
/* Before */
:root {
  --background: 40 20% 98%;
  --foreground: 240 10% 3.9%;
}

/* After */
@import './styles/tokens.css';

:root {
  --background: var(--color-background);
  --foreground: var(--color-text-primary);
}
```

#### 1.2 Update tailwind.config.ts

Extend the Tailwind config with design tokens:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS custom properties for theming
        background: "var(--color-background)",
        foreground: "var(--color-text-primary)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
          hover: "var(--color-surface-hover)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        border: "var(--color-border)",
        sand: {
          50: "var(--color-sand-50)",
          100: "var(--color-sand-100)",
          200: "var(--color-sand-200)",
          300: "var(--color-sand-300)",
          400: "var(--color-sand-400)",
          500: "var(--color-sand-500)",
          600: "var(--color-sand-600)",
          700: "var(--color-sand-700)",
          800: "var(--color-sand-800)",
          900: "var(--color-sand-900)",
        },
      },
      spacing: {
        // Add custom spacing if needed
      },
      borderRadius: {
        // Add custom border radius if needed
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        hero: ["var(--text-4xl)", { lineHeight: "var(--leading-tight)", fontWeight: "var(--font-semibold)" }],
        h1: ["var(--text-3xl)", { lineHeight: "var(--leading-snug)", fontWeight: "var(--font-semibold)" }],
        h2: ["var(--text-2xl)", { lineHeight: "var(--leading-snug)", fontWeight: "var(--font-semibold)" }],
        h3: ["var(--text-xl)", { lineHeight: "var(--leading-snug)", fontWeight: "var(--font-medium)" }],
      },
      transitionTimingFunction: {
        "manus-out": "var(--ease-manus)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Phase 2: Component Migration (Week 2-3)

#### 2.1 Create UI Primitives

Create a `components/ui` directory with primitive components:

```bash
mkdir -p components/ui
touch components/ui/Button.tsx
touch components/ui/Input.tsx
touch components/ui/Card.tsx
touch components/ui/index.ts
```

#### 2.2 Migrate Button Component

```tsx
// components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-sand-500 text-white hover:bg-sand-600 active:bg-sand-700',
        secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-hover',
        ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        danger: 'bg-rose text-white hover:bg-rose-dark',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="animate-spin">⟳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

#### 2.3 Create Barrel Export

```tsx
// components/ui/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
// Add other exports as you create components
```

### Phase 3: Page Migration (Week 3-4)

#### 3.1 Update Page Components

Replace hardcoded values with design tokens:

```tsx
// Before
<div className="bg-white p-4 rounded-md shadow-sm">
  <h1 className="text-2xl font-bold text-gray-800">Title</h1>
</div>

// After
<div className="bg-surface p-6 rounded-lg shadow-card">
  <h1 className="text-h1 text-text-primary">Title</h1>
</div>
```

#### 3.2 Common Migration Patterns

| Before | After |
|--------|-------|
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-background` |
| `text-gray-800` | `text-text-primary` |
| `text-gray-600` | `text-text-secondary` |
| `text-gray-400` | `text-text-tertiary` |
| `border-gray-200` | `border-border` |
| `rounded-md` | `rounded-lg` |
| `shadow-sm` | `shadow-card` |
| `p-4` | `p-6` (for cards) |

### Phase 4: Dark Mode (Week 4)

#### 4.1 Ensure Dark Mode Classes

Add `dark:` prefixes to all color-related classes:

```tsx
// Before
<div className="bg-white text-gray-800">

// After
<div className="bg-surface text-text-primary">
  {/* These automatically work with dark mode via CSS variables */}
</div>
```

#### 4.2 Test Dark Mode

```bash
# Build and test
npm run build
npm run dev

# Toggle dark mode in browser and verify all components
```

## Common Issues & Solutions

### Issue: Colors not updating

**Cause**: Hardcoded values in CSS

**Solution**: Replace with CSS variables

```css
/* Before */
.custom-class {
  background-color: #ffffff;
}

/* After */
.custom-class {
  background-color: var(--color-surface);
}
```

### Issue: Inconsistent spacing

**Cause**: Mixed spacing values

**Solution**: Use spacing tokens

```tsx
// Before
<div className="p-3 m-5 gap-2">

// After
<div className="p-4 m-6 gap-2">
```

### Issue: Missing focus states

**Cause**: No focus-visible styles

**Solution**: Add focus ring

```tsx
<button className="focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2">
```

## Verification Checklist

- [ ] All colors use design tokens
- [ ] All spacing uses consistent values
- [ ] All interactive elements have focus states
- [ ] Dark mode works correctly
- [ ] No console errors
- [ ] All tests pass
- [ ] Accessibility audit passes

## Running the Consistency Checker

```bash
# Basic check
node design-system/consistency-check.js

# Generate JSON report
node design-system/consistency-check.js --json > report.json

# With auto-fix (where possible)
node design-system/consistency-check.js --fix
```

## Post-Migration

After migration is complete:

1. **Update documentation**
   - Add component usage examples
   - Update README with design system info

2. **Set up CI checks**
   ```yaml
   # .github/workflows/design-check.yml
   - name: Run Design Consistency Check
     run: node design-system/consistency-check.js
   ```

3. **Train the team**
   - Share the style guide
   - Review component standards
   - Establish code review checklist

## Support

For questions or issues:

1. Check the [Style Guide](./style-guide.md)
2. Review [Component Standards](./component-standards.md)
3. Run the consistency checker for specific issues
