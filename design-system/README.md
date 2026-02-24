# Sandstone Design System

A comprehensive design system for the Sandstone AI-powered learning platform.

## 📁 File Structure

```
design-system/
├── README.md              # This file
├── tokens.css             # Design tokens (colors, spacing, typography)
├── style-guide.md         # Visual style guide
├── component-standards.md # Component development standards
├── MIGRATION_GUIDE.md     # Step-by-step migration instructions
├── consistency-check.js   # Automated consistency checker
└── components/            # Reference components (optional)
```

## 🚀 Quick Start

### 1. Install Design Tokens

```bash
# Copy tokens to your project
cp design-system/tokens.css app/styles/tokens.css
```

### 2. Import in globals.css

```css
/* app/globals.css */
@import './styles/tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Run Consistency Check

```bash
node design-system/consistency-check.js
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [tokens.css](./tokens.css) | CSS custom properties for all design values |
| [style-guide.md](./style-guide.md) | Visual design language and patterns |
| [component-standards.md](./component-standards.md) | Component development guidelines |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Migration instructions |

## 🎨 Design Tokens

### Colors

```css
/* Brand Colors */
--color-sand-200: #E8D5C4;
--color-sand-500: #B07D58;
--color-sage: #A8C5A8;
--color-rose: #D4A8A8;

/* Semantic Colors */
--color-background: #FAFAF8;
--color-surface: #FFFFFF;
--color-text-primary: #2D2D2D;
--color-border: #E8E8E8;
```

### Typography

```css
/* Font Sizes */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing

```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
```

## 🧩 Component Standards

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `Sidebar.tsx` |
| Hooks | camelCase with `use` | `useAuth.ts`, `useTheme.ts` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |

### Component Template

```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

// Styles
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-sand-500 text-white hover:bg-sand-600',
        secondary: 'bg-surface border border-border hover:bg-surface-hover',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

## 🔍 Consistency Checker

The consistency checker scans your codebase for design inconsistencies.

### Usage

```bash
# Basic check
node design-system/consistency-check.js

# Generate JSON report
node design-system/consistency-check.js --json

# Auto-fix where possible
node design-system/consistency-check.js --fix
```

### Checks Performed

- ✅ Hardcoded color values
- ✅ Inline styles
- ✅ Missing accessibility attributes
- ✅ Component naming conventions
- ✅ Missing displayName
- ✅ Deep relative imports

## 🔄 Migration Path

### Phase 1: Foundation (Week 1)
- [ ] Install design tokens
- [ ] Update tailwind.config.ts
- [ ] Update globals.css

### Phase 2: Components (Week 2-3)
- [ ] Create UI primitives
- [ ] Migrate existing components
- [ ] Add barrel exports

### Phase 3: Pages (Week 3-4)
- [ ] Update page components
- [ ] Replace hardcoded values
- [ ] Test dark mode

### Phase 4: Polish (Week 4)
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation update

## 📝 Common Patterns

### Button Usage

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary" size="md">
  Submit
</Button>

// Secondary button
<Button variant="secondary" size="sm">
  Cancel
</Button>

// Loading state
<Button isLoading variant="primary">
  Saving...
</Button>
```

### Card Usage

```tsx
<div className="bg-surface rounded-lg shadow-card p-6">
  <h2 className="text-h2 text-text-primary">Title</h2>
  <p className="text-body text-text-secondary">Content</p>
</div>
```

### Form Input

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-text-primary">
    Email
  </label>
  <input
    type="email"
    className="w-full h-10 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-sand-500"
    placeholder="Enter your email"
  />
</div>
```

## 🌗 Dark Mode

Dark mode is automatically supported via CSS custom properties:

```tsx
// Components automatically adapt
<div className="bg-surface text-text-primary">
  {/* Works in both light and dark mode */}
</div>
```

## ♿ Accessibility

All components should follow these accessibility standards:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Visible focus indicators
- Color contrast compliance (4.5:1 minimum)

## 📦 Integration with Existing Code

### Tailwind Config

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        sand: {
          200: 'var(--color-sand-200)',
          500: 'var(--color-sand-500)',
        },
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
      },
    },
  },
};
```

### Using Tokens in CSS

```css
.custom-component {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
```

## 🤝 Contributing

When adding new components or patterns:

1. Follow the [Component Standards](./component-standards.md)
2. Use design tokens from [tokens.css](./tokens.css)
3. Run the consistency checker
4. Update documentation
5. Add tests

## 📄 License

This design system is part of the Sandstone project.

---

For questions or issues, refer to the [Migration Guide](./MIGRATION_GUIDE.md) or run the consistency checker for specific guidance.
