# Sandstone Typography System

A comprehensive, accessible, and visually refined typography system for the Sandstone learning platform.

## Overview

The Sandstone typography system is designed to provide excellent readability across all devices while maintaining a sophisticated, academic aesthetic appropriate for an educational platform.

## Font Selection

### Primary Fonts

| Font | Role | Usage |
|------|------|-------|
| **Inter** | Body/UI | Primary font for all body text, UI elements, buttons, and navigation |
| **Playfair Display** | Display | Elegant serif for headlines, page titles, and feature headings |
| **JetBrains Mono** | Monospace | Code blocks, technical data, keyboard shortcuts |

### Font Rationale

- **Inter**: Chosen for its excellent readability at all sizes, extensive weight range (100-900), and modern geometric design. Optimized for screen display with tall x-height and open apertures.

- **Playfair Display**: Selected for its high-contrast transitional serif design that conveys academic authority and elegance. Perfect for educational content headings.

- **JetBrains Mono**: Features increased letter height for better readability, distinctive characters to prevent confusion (0/O, l/1), and programming ligatures.

## Type Scale

### Display Sizes (Fluid/Responsive)

| Class | Size Range | Line Height | Weight | Letter Spacing |
|-------|------------|-------------|--------|----------------|
| `text-display-4xl` | 48px → 80px | 1.05 | 800 | -0.03em |
| `text-display-3xl` | 40px → 64px | 1.08 | 800 | -0.02em |
| `text-display-2xl` | 32px → 56px | 1.10 | 700 | -0.02em |
| `text-display-xl` | 28px → 48px | 1.10 | 700 | -0.02em |
| `text-display-lg` | 24px → 40px | 1.15 | 700 | -0.01em |
| `text-display` | 20px → 32px | 1.20 | 600 | -0.01em |
| `text-display-sm` | 18px → 24px | 1.20 | 600 | -0.01em |

### Heading Sizes

| Class | Size Range | Line Height | Weight | Letter Spacing |
|-------|------------|-------------|--------|----------------|
| `text-h1` | 28px → 40px | 1.20 | 600 | -0.01em |
| `text-h2` | 24px → 32px | 1.25 | 600 | -0.01em |
| `text-h3` | 20px → 28px | 1.30 | 600 | -0.005em |
| `text-h4` | 18px → 24px | 1.35 | 500 | 0 |
| `text-h5` | 16px → 20px | 1.40 | 500 | 0 |
| `text-h6` | 14px → 16px | 1.40 | 500 | 0.01em |

### Body Sizes

| Class | Size | Line Height | Weight | Letter Spacing |
|-------|------|-------------|--------|----------------|
| `text-body-xl` | 20px | 1.70 | 400 | 0 |
| `text-body-lg` | 18px | 1.70 | 400 | 0 |
| `text-body` | 16px | 1.65 | 400 | 0 |
| `text-body-sm` | 14px | 1.60 | 400 | 0 |
| `text-body-xs` | 12px | 1.50 | 400 | 0.01em |

### Special Sizes

| Class | Size | Line Height | Weight | Letter Spacing | Use Case |
|-------|------|-------------|--------|----------------|----------|
| `text-caption` | 12px | 1.40 | 500 | 0.01em | Image captions, helper text |
| `text-caption-sm` | 10px | 1.40 | 500 | 0.02em | Fine print, legal text |
| `text-overline` | 12px | 1.40 | 600 | 0.08em | Labels, categories (uppercase) |
| `text-label` | 14px | 1.40 | 500 | 0.01em | Form labels |
| `text-label-sm` | 12px | 1.40 | 500 | 0.01em | Small labels |

## Usage Guidelines

### Display Headings

Use for hero sections, landing pages, and major feature announcements:

```tsx
// Hero section headline
<h1 className="font-display text-display-3xl">
  Master Your A-Level Exams
</h1>

// Feature section heading
<h2 className="font-display text-display-lg">
  AI-Powered Feedback
</h2>
```

### Content Headings

Use for page sections and content hierarchy:

```tsx
// Page title
<h1 className="font-display text-h1">
  Dashboard
</h1>

// Section heading
<h2 className="font-display text-h2">
  Recent Activity
</h2>

// Subsection heading
<h3 className="font-sans text-h3">
  Completed Quizzes
</h3>
```

### Body Text

```tsx
// Lead paragraph
<p className="text-body-lg text-muted-foreground">
  Welcome to Sandstone, your AI-powered learning companion.
</p>

// Standard paragraph
<p className="text-body">
  Get detailed feedback on your responses with examiner-level analysis.
</p>

// Small text (captions, metadata)
<span className="text-body-sm text-muted-foreground">
  Last updated 2 hours ago
</span>
```

### Special Text

```tsx
// Category label
<span className="text-overline uppercase">
  Economics
</span>

// Caption
<figcaption className="text-caption">
  Figure 1: Supply and Demand Curve
</figcaption>

// Code snippet
<code className="text-code">
  console.log("Hello World")
</code>

// Keyboard shortcut
<kbd className="text-kbd">Ctrl + K</kbd>
```

## CSS Classes

### Heading Classes

```css
.heading-display-4xl  /* Largest display heading */
.heading-display-3xl
.heading-display-2xl
.heading-display-xl
.heading-display-lg
.heading-display
.heading-display-sm
.heading-h1           /* Page title */
.heading-h2           /* Section heading */
.heading-h3           /* Subsection heading */
.heading-h4
.heading-h5
.heading-h6           /* Small heading, often uppercase */
```

### Body Text Classes

```css
.text-body-xl         /* Large body text */
.text-body-lg         /* Lead paragraphs */
.text-body            /* Standard body text */
.text-body-sm         /* Small body text */
.text-body-xs         /* Extra small text */
```

### Special Text Classes

```css
.text-caption         /* Image captions */
.text-caption-sm      /* Fine print */
.text-overline        /* Labels (uppercase) */
.text-label           /* Form labels */
.text-label-sm        /* Small labels */
.text-quote           /* Blockquote styling */
.text-lead            /* Introductory paragraphs */
.text-code            /* Inline code */
.text-code-block      /* Code blocks */
.text-kbd             /* Keyboard shortcuts */
```

## Prose Styles

For rich text content, use the `.prose` class:

```tsx
<article className="prose">
  <h1>Article Title</h1>
  <p>Paragraph content...</p>
  <blockquote>Quote text...</blockquote>
  <ul>
    <li>List item</li>
  </ul>
</article>
```

The prose class automatically styles:
- Headings (h1-h6) with appropriate sizing and spacing
- Paragraphs with proper line height and margins
- Lists with correct indentation
- Blockquotes with accent border
- Code blocks with monospace font
- Links with underline and hover states

## Font Loading Optimization

Fonts are loaded using Next.js `next/font` for optimal performance:

```tsx
// layout.tsx
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});
```

### Font Loading Strategy

- **display: "swap"**: Prevents FOIT (Flash of Invisible Text)
- **preload: true**: Preloads critical fonts
- **subsets: ["latin"]**: Loads only necessary character sets
- **variable**: Enables CSS custom properties for font families

## Responsive Typography

The type scale uses CSS `clamp()` for fluid, responsive sizing:

- **Mobile (default)**: Smaller base size for better fit
- **Tablet (640px+)**: Slight increase in sizes
- **Desktop (1024px+)**: Full size scale
- **Wide (1536px+)**: Slightly larger for big screens

### Mobile Adjustments

```css
@media (max-width: 640px) {
  :root {
    --text-base: 0.9375rem; /* 15px instead of 16px */
    --leading-body: 1.65;
  }
}
```

## Accessibility

### Readability Features

1. **Line Height**: Optimized for body text (1.65) and headings (1.2-1.4)
2. **Letter Spacing**: Tighter for large headings, normal for body
3. **Contrast**: All text meets WCAG AA standards
4. **Font Size**: Minimum 12px for body text

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .prose a {
    text-decoration-thickness: 2px;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

## Best Practices

### Do's

✅ Use `font-display` for headings and hero text  
✅ Use `font-sans` for body text and UI elements  
✅ Use `font-mono` for code and technical content  
✅ Maintain consistent heading hierarchy (h1 → h6)  
✅ Use `text-balance` for headings to prevent orphans  
✅ Apply `prose` class for rich text content  
✅ Use appropriate line lengths (60-80 characters)  

### Don'ts

❌ Skip heading levels (e.g., h1 → h3)  
❌ Use display fonts for body text  
❌ Use font sizes smaller than 12px for body text  
❌ Apply excessive letter spacing to body text  
❌ Use all caps for long passages  

## Typography Utilities

### Font Family

```tsx
<div className="font-sans">Sans-serif text</div>
<div className="font-display">Display serif text</div>
<div className="font-mono">Monospace text</div>
```

### Font Smoothing

```tsx
<div className="antialiased">Smooth text rendering</div>
<div className="subpixel-antialiased">Subpixel rendering</div>
```

### Text Truncation

```tsx
<p className="truncate-lines-2">
  This text will be truncated after 2 lines with ellipsis...
</p>
```

### Prose Width

```tsx
<article className="prose-narrow">  {/* 60ch max */}
<article className="prose-default"> {/* 70ch max */}
<article className="prose-wide">    {/* 80ch max */}
```

### Text Balance

```tsx
<h1 className="text-balance">
  This heading will have balanced line breaks
</h1>
```

## Integration with Tailwind

The typography system is fully integrated with Tailwind CSS:

```tsx
// Tailwind utility classes work alongside typography classes
<h1 className="font-display text-h1 text-primary">
  Styled Heading
</h1>

<p className="text-body text-muted-foreground leading-relaxed">
  Styled paragraph with muted color and relaxed line height
</p>
```

## Migration Guide

### From Old System

Replace legacy classes:

| Old | New |
|-----|-----|
| `text-hero` | `text-h1` or `text-display` |
| `text-small` | `text-body-sm` |
| `font-heading` | `font-display` |

### Gradual Adoption

1. Update `layout.tsx` to use new font configuration
2. Import `typography.css` in `globals.css`
3. Replace headings with new classes incrementally
4. Update component library to use new system

## File Structure

```
app/
├── layout.tsx              # Font configuration
├── globals.css             # Imports typography.css
styles/
├── typography.css          # Complete typography system
├── layout-system.css       # Layout utilities
```

## Performance

- **Font files**: ~100KB total (Inter, Playfair Display, JetBrains Mono)
- **Loading**: Fonts preloaded and use font-display: swap
- **CSS**: Typography styles are tree-shakeable
- **No FOUT/FOIT**: Smooth font loading experience

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- IE11: Graceful degradation with system fonts

---

For questions or issues with the typography system, refer to the component documentation or contact the design team.
