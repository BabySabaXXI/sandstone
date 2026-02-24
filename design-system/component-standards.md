# Sandstone Component Standards

## Overview

This document defines the standards for creating consistent, maintainable, and accessible components in the Sandstone application.

## Component Architecture

### File Structure

```
components/
├── ui/                    # Primitive UI components (Button, Input, etc.)
│   ├── button.tsx
│   ├── input.tsx
│   └── index.ts          # Barrel export
├── layout/               # Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── index.ts
├── features/             # Feature-specific components
│   ├── documents/
│   ├── flashcards/
│   └── grading/
└── providers/            # Context providers
    ├── theme-provider.tsx
    └── auth-provider.tsx
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `Sidebar.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useTheme.ts` |
| Utilities | camelCase | `formatDate.ts`, `cn.ts` |
| Types | PascalCase with suffix | `UserType`, `ButtonProps` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |

## Component Template

```tsx
// components/ui/Button.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// ============================================
// Types & Interfaces
// ============================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Loading state */
  isLoading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
}

// ============================================
// Styles (CVA Pattern)
// ============================================

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-sand-500 text-white hover:bg-sand-600 active:bg-sand-700',
        secondary: 'bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover',
        ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        danger: 'bg-error text-white hover:bg-error/90',
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

// ============================================
// Component
// ============================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, leftIcon, rightIcon, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <LoadingSpinner className="mr-2" />}
        {!isLoading && leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

## Styling Standards

### Tailwind CSS Order

Follow this order for Tailwind classes:

1. **Layout** (`display`, `position`, `overflow`, etc.)
2. **Box Model** (`width`, `height`, `padding`, `margin`, `border`)
3. **Typography** (`font-family`, `font-size`, `color`, `text-align`)
4. **Visual** (`background`, `shadow`, `opacity`)
5. **Interactive** (`hover:`, `focus:`, `disabled:`)
6. **Responsive** (`sm:`, `md:`, `lg:`)

```tsx
// ✅ Good
<div className="flex items-center gap-4 px-4 py-2 text-sm font-medium text-text-primary bg-surface rounded-lg hover:bg-surface-hover transition-colors">

// ❌ Bad - classes in random order
<div className="hover:bg-surface-hover text-text-primary flex gap-4 px-4 py-2 rounded-lg text-sm items-center font-medium bg-surface transition-colors">
```

### Design Token Usage

Always use design tokens instead of hardcoded values:

```tsx
// ✅ Good - Using design tokens
<div className="bg-surface text-text-primary p-4 rounded-lg shadow-card">

// ❌ Bad - Hardcoded values
<div className="bg-white text-gray-800 p-4 rounded-md shadow-sm">
```

## Accessibility Standards

### Required Practices

1. **Semantic HTML**: Use appropriate HTML elements
2. **ARIA Labels**: Add when semantic HTML isn't sufficient
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Visible focus indicators
5. **Color Contrast**: Minimum 4.5:1 for normal text

```tsx
// ✅ Good - Accessible button
<button
  aria-label="Close dialog"
  aria-pressed={isOpen}
  className="focus-visible:ring-2 focus-visible:ring-offset-2"
>
  <XIcon aria-hidden="true" />
</button>

// ❌ Bad - Inaccessible
<div onClick={handleClose} className="cursor-pointer">
  <XIcon />
</div>
```

## Component Categories

### 1. Primitive Components (ui/)

Basic building blocks with minimal logic:

- `Button`
- `Input`
- `Select`
- `Card`
- `Modal`
- `Tooltip`

### 2. Layout Components (layout/)

Structural components:

- `Sidebar`
- `Header`
- `ThreePanel`
- `Container`

### 3. Feature Components (features/)

Domain-specific components:

- `DocumentViewer`
- `FlashcardDeck`
- `GradingResult`

### 4. Provider Components (providers/)

Context providers:

- `ThemeProvider`
- `AuthProvider`
- `ToastProvider`

## Props Interface Guidelines

### Required vs Optional

```tsx
interface ComponentProps {
  // Required props first
  title: string;
  
  // Optional props with defaults
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // Optional callbacks
  onAction?: () => void;
  
  // Children
  children?: React.ReactNode;
}
```

### Event Handler Naming

```tsx
// ✅ Good
onClick
onSubmit
onChange
onItemSelect
onModalClose

// ❌ Bad
handleClick    // Use in implementation, not props
clickHandler   // Avoid suffix pattern
```

## State Management

### Local State

Use `useState` for component-specific state:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

### Shared State

Use context for state shared across components:

```tsx
const ThemeContext = createContext<ThemeContextType | null>(null);
```

### External State

Use stores (Zustand) for global state:

```tsx
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Testing Standards

### Component Tests

```tsx
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Performance Guidelines

### Memoization

```tsx
// Memoize expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callbacks
const handleSubmit = useCallback(() => {
  submitForm(data);
}, [data]);

// Memoize components
export const MemoizedList = React.memo(ListComponent);
```

### Lazy Loading

```tsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Documentation Standards

### JSDoc Comments

```tsx
/**
 * A versatile button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Submit
 * </Button>
 * ```
 */
export interface ButtonProps {
  /** The visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** The size of the button */
  size?: 'sm' | 'md' | 'lg';
}
```

## Migration Checklist

When creating or updating components:

- [ ] Follow naming conventions
- [ ] Use design tokens for styling
- [ ] Implement proper TypeScript types
- [ ] Add accessibility attributes
- [ ] Include JSDoc comments
- [ ] Write unit tests
- [ ] Update barrel exports (index.ts)
- [ ] Document in Storybook (if applicable)
