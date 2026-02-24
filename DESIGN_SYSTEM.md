# Sandstone Design System

## Overview

A refined, cohesive design system for the Sandstone AI-powered learning platform. This system emphasizes warmth, clarity, and academic professionalism while maintaining visual consistency across all components.

---

## 1. Color Palette

### Primary Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--sand-50` | `#FAFAF8` | `#141414` | Page background |
| `--sand-100` | `#F5F5F0` | `#1A1A1A` | Card backgrounds |
| `--sand-200` | `#EBEBE5` | `#242424` | Elevated surfaces |
| `--sand-300` | `#DEDED5` | `#333333` | Borders, dividers |
| `--sand-400` | `#B8B8B0` | `#525252` | Disabled states |
| `--sand-500` | `#8A8A82` | `#737373` | Muted text |
| `--sand-600` | `#6A6A62` | `#A3A3A3` | Secondary text |
| `--sand-700` | `#4A4A42` | `#D4D4D4` | Primary text (dark) |
| `--sand-800` | `#2D2D2D` | `#E8E8E8` | Headings |
| `--sand-900` | `#1A1A1A` | `#F5F5F5` | Strong emphasis |

### Accent Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--peach-100` | `#FDF6F0` | `#2A2520` | Subtle highlights |
| `--peach-200` | `#F5E6D3` | `#3D3530` | Hover states |
| `--peach-300` | `#E8D5C4` | `#5A4D42` | Primary accent |
| `--peach-400` | `#D4C4B0` | `#7A6A5A` | Active states |
| `--peach-500` | `#B8A894` | `#9A8A7A` | Emphasis |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--sage-100` | `#E8F0E8` | `#1F2A1F` | Success backgrounds |
| `--sage-200` | `#A8C5A8` | `#4A6A4A` | Success indicators |
| `--sage-300` | `#6A9A6A` | `#7AB87A` | Success text |
| `--blue-100` | `#E8F0F5` | `#1F252A` | Info backgrounds |
| `--blue-200` | `#A8C5D4` | `#4A5A6A` | Info indicators |
| `--blue-300` | `#6A9AB8` | `#7AB8D4` | Info text |
| `--amber-100` | `#F5F0E8` | `#2A251F` | Warning backgrounds |
| `--amber-200` | `#E5D4A8` | `#6A5A4A` | Warning indicators |
| `--rose-100` | `#F5E8E8` | `#2A1F1F` | Error backgrounds |
| `--rose-200` | `#D4A8A8` | `#6A4A4A` | Error indicators |

### Subject Colors (Dynamic)

| Subject | Primary | Secondary | Background |
|---------|---------|-----------|------------|
| Economics | `#E8D5C4` | `#D4C4B0` | `#FDF6F0` |
| History | `#A8C5D4` | `#8BA8C4` | `#E8F0F5` |
| Literature | `#D4A8B8` | `#C498A8` | `#F5E8EC` |
| Science | `#A8D4A8` | `#8BC48B` | `#E8F5E8` |

---

## 2. Typography System

### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "SF Mono", monospace;
--font-display: "Inter", sans-serif;
```

### Type Scale

| Style | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| Display | 3rem (48px) | 1.1 | 700 | -0.02em | Hero headlines |
| H1 | 2.25rem (36px) | 1.2 | 600 | -0.01em | Page titles |
| H2 | 1.75rem (28px) | 1.3 | 600 | -0.01em | Section headers |
| H3 | 1.375rem (22px) | 1.4 | 600 | 0 | Subsection headers |
| H4 | 1.125rem (18px) | 1.4 | 500 | 0 | Card titles |
| Body Large | 1.125rem (18px) | 1.7 | 400 | 0 | Lead paragraphs |
| Body | 1rem (16px) | 1.6 | 400 | 0 | Default text |
| Body Small | 0.875rem (14px) | 1.5 | 400 | 0 | Secondary text |
| Caption | 0.75rem (12px) | 1.4 | 500 | 0.01em | Labels, metadata |
| Overline | 0.75rem (12px) | 1.4 | 600 | 0.08em | Uppercase labels |

### Typography Patterns

```css
/* Headings */
.heading-display { @apply text-5xl font-bold tracking-tight leading-tight; }
.heading-1 { @apply text-4xl font-semibold tracking-tight leading-tight; }
.heading-2 { @apply text-3xl font-semibold tracking-tight leading-snug; }
.heading-3 { @apply text-2xl font-semibold leading-snug; }
.heading-4 { @apply text-lg font-medium leading-snug; }

/* Body text */
.text-body-lg { @apply text-lg leading-relaxed; }
.text-body { @apply text-base leading-relaxed; }
.text-body-sm { @apply text-sm leading-normal; }

/* Special */
.text-caption { @apply text-xs font-medium tracking-wide; }
.text-overline { @apply text-xs font-semibold tracking-widest uppercase; }
```

---

## 3. Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0 | None |
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Compact elements |
| `--space-3` | 12px | Default padding |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 20px | Medium padding |
| `--space-6` | 24px | Large padding |
| `--space-8` | 32px | Section padding |
| `--space-10` | 40px | Large sections |
| `--space-12` | 48px | Extra large |
| `--space-16` | 64px | Major sections |
| `--space-20` | 80px | Page sections |
| `--space-24` | 96px | Hero spacing |

### Component Spacing

```css
/* Cards */
.card-padding { @apply p-5; }
.card-gap { @apply gap-4; }

/* Forms */
.form-gap { @apply gap-4; }
.input-padding { @apply px-4 py-3; }
.label-gap { @apply mb-2; }

/* Lists */
.list-gap { @apply gap-2; }
.list-item-padding { @apply py-3 px-4; }
```

---

## 4. Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp edges |
| `--radius-sm` | 6px | Small elements |
| `--radius-md` | 10px | Default cards |
| `--radius-lg` | 14px | Large cards |
| `--radius-xl` | 18px | Modals, dialogs |
| `--radius-2xl` | 24px | Feature cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## 5. Shadow System

### Light Mode Shadows

```css
--shadow-none: none;
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.03);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.12);
```

### Dark Mode Shadows

```css
--shadow-dark-xs: 0 1px 2px 0 rgb(0 0 0 / 0.2);
--shadow-dark-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
--shadow-dark-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
--shadow-dark-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
```

---

## 6. Component Design Specifications

### Buttons

#### Primary Button
```
Background: var(--peach-300)
Text: var(--sand-900)
Padding: 12px 24px
Border Radius: 10px
Font Weight: 500
Font Size: 14px
Shadow: --shadow-sm
Hover: Background var(--peach-400), Shadow --shadow-md
Active: Scale 0.98, Background var(--peach-500)
Disabled: Opacity 0.5, Cursor not-allowed
```

#### Secondary Button
```
Background: var(--sand-100)
Text: var(--sand-800)
Border: 1px solid var(--sand-300)
Padding: 12px 24px
Border Radius: 10px
Font Weight: 500
Hover: Background var(--sand-200)
Active: Background var(--sand-300)
```

#### Ghost Button
```
Background: transparent
Text: var(--sand-700)
Padding: 12px 24px
Border Radius: 10px
Hover: Background var(--sand-100)
Active: Background var(--sand-200)
```

### Cards

#### Standard Card
```
Background: var(--sand-100)
Border: 1px solid var(--sand-300)
Border Radius: 14px
Padding: 20px
Shadow: --shadow-sm
Hover: Shadow --shadow-md, Border var(--sand-400)
```

#### Feature Card
```
Background: var(--sand-100)
Border: 1px solid var(--sand-300)
Border Radius: 18px
Padding: 24px
Shadow: --shadow-md
Hover: Shadow --shadow-lg, Transform translateY(-2px)
```

#### Interactive Card
```
Background: var(--sand-100)
Border: 1px solid var(--sand-300)
Border Radius: 14px
Padding: 16px
Cursor: pointer
Transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1)
Hover: Background var(--sand-200), Border var(--peach-300)
Active: Scale 0.99
```

### Inputs

#### Text Input
```
Background: var(--sand-100)
Border: 1px solid var(--sand-300)
Border Radius: 10px
Padding: 12px 16px
Font Size: 14px
Color: var(--sand-900)
Placeholder: var(--sand-500)
Focus: Border var(--peach-300), Ring 2px var(--peach-100)
Error: Border var(--rose-200), Background var(--rose-100)
```

#### Textarea
```
Min Height: 120px
Resize: vertical
Line Height: 1.6
```

### Badges

```
Padding: 4px 10px
Border Radius: 9999px
Font Size: 12px
Font Weight: 500

Default: Background var(--sand-200), Text var(--sand-700)
Primary: Background var(--peach-100), Text var(--sand-800)
Success: Background var(--sage-100), Text var(--sage-300)
Warning: Background var(--amber-100), Text var(--amber-200)
Error: Background var(--rose-100), Text var(--rose-200)
```

### Navigation

#### Sidebar
```
Width: 280px
Background: var(--sand-100)
Border Right: 1px solid var(--sand-300)
Padding: 24px 16px
```

#### Nav Item
```
Padding: 10px 14px
Border Radius: 10px
Font Size: 14px
Font Weight: 500
Color: var(--sand-600)
Hover: Background var(--sand-200), Color var(--sand-800)
Active: Background var(--peach-100), Color var(--sand-900)
```

---

## 7. Animation & Transitions

### Timing Functions

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations

```css
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Standard Transitions

```css
/* Interactive elements */
transition: all 200ms var(--ease-default);

/* Card hover */
transition: transform 300ms var(--ease-spring), 
            box-shadow 300ms var(--ease-spring),
            border-color 200ms var(--ease-default);

/* Modal/Dialog */
transition: opacity 300ms var(--ease-out),
            transform 300ms var(--ease-spring);

/* Page transitions */
transition: opacity 400ms var(--ease-out);
```

---

## 8. Layout Grid

### Container

```css
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1536px; }
```

### Grid System

```css
/* 12-column grid */
.grid-12 { @apply grid grid-cols-12 gap-6; }

/* Common patterns */
.grid-cards { @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6; }
.grid-features { @apply grid grid-cols-1 md:grid-cols-2 gap-6; }
```

---

## 9. Dark Mode Considerations

### Elevation in Dark Mode

| Level | Background | Usage |
|-------|------------|-------|
| Base | `#0A0A0A` | Page background |
| Low | `#141414` | Cards |
| Medium | `#1A1A1A` | Elevated cards |
| High | `#242424` | Modals, popovers |
| Highest | `#333333` | Tooltips, menus |

### Contrast Requirements

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

---

## 10. Accessibility

### Focus States

```css
.focus-visible {
  outline: 2px solid var(--peach-300);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Implementation Files

### Updated Files

1. `tailwind.config.ts` - Extended theme configuration
2. `app/globals.css` - CSS variables and utilities
3. `components/ui/` - UI component implementations

### Usage Examples

```tsx
// Card with proper styling
<div className="bg-card border border-border rounded-xl shadow-soft p-5 hover:shadow-soft-md transition-all duration-300">
  <h3 className="text-h4 text-foreground mb-2">Card Title</h3>
  <p className="text-body-sm text-muted-foreground">Card description</p>
</div>

// Button with variants
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-ghost">Ghost Action</button>

// Form input
<input 
  className="input-field"
  placeholder="Enter your response..."
/>
```
