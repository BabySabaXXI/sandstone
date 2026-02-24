# Typography Quick Reference

Quick reference guide for using the Sandstone typography system.

## Font Families

```tsx
// Display/Serif - For headings
<h1 className="font-display">Heading Text</h1>

// Sans-serif - For body and UI
<p className="font-sans">Body text</p>

// Monospace - For code
<code className="font-mono">code snippet</code>
```

## Display Headings (Hero Sections)

```tsx
<h1 className="font-display text-display-4xl">Largest Display</h1>
<h1 className="font-display text-display-3xl">Large Display</h1>
<h1 className="font-display text-display-2xl">Medium Display</h1>
<h1 className="font-display text-display-xl">Standard Display</h1>
<h1 className="font-display text-display-lg">Small Display</h1>
<h1 className="font-display text-display">Compact Display</h1>
<h1 className="font-display text-display-sm">Smallest Display</h1>
```

## Content Headings

```tsx
<h1 className="font-display text-h1">Page Title</h1>
<h2 className="font-display text-h2">Section Heading</h2>
<h3 className="font-sans text-h3">Subsection Heading</h3>
<h4 className="font-sans text-h4">Small Heading</h4>
<h5 className="font-sans text-h5">Minor Heading</h5>
<h6 className="font-sans text-h6">Tiny Heading (uppercase)</h6>
```

## Body Text

```tsx
<p className="text-body-xl">Extra large body (20px)</p>
<p className="text-body-lg">Large body (18px)</p>
<p className="text-body">Standard body (16px)</p>
<p className="text-body-sm">Small body (14px)</p>
<p className="text-body-xs">Extra small body (12px)</p>
```

## Special Text

```tsx
// Labels and captions
<span className="text-overline">CATEGORY LABEL</span>
<span className="text-label">Form Label</span>
<span className="text-label-sm">Small Label</span>
<figcaption className="text-caption">Image caption</figcaption>
<span className="text-caption-sm">Fine print</span>

// Lead paragraph (intro text)
<p className="text-lead">Introduction paragraph with muted color</p>

// Blockquote
<blockquote className="text-quote">
  "This is a quoted text with elegant styling"
</blockquote>

// Code
<code className="text-code">inlineCode()</code>
<pre className="text-code-block">{`code block`}</pre>

// Keyboard shortcut
<kbd className="text-kbd">Ctrl + K</kbd>
```

## Rich Text Content

```tsx
<article className="prose">
  <h1>Article Title</h1>
  <p>Paragraph with automatic styling...</p>
  <blockquote>Styled quote...</blockquote>
  <ul>
    <li>List items...</li>
  </ul>
</article>
```

## Text Utilities

### Line Clamping

```tsx
<p className="line-clamp-2">
  Text truncated after 2 lines with ellipsis...
</p>
```

### Text Balance

```tsx
<h1 className="text-balance">
  This heading will have balanced line breaks
</h1>
```

### Prose Width

```tsx
<article className="prose-narrow">  {/* 60ch max */}
<article className="prose-default"> {/* 70ch max */}
<article className="prose-wide">    {/* 80ch max */}
```

### Font Smoothing

```tsx
<div className="text-smooth">Smooth text rendering</div>
```

## Common Patterns

### Page Header

```tsx
<header className="space-y-4">
  <h1 className="font-display text-h1">Page Title</h1>
  <p className="text-lead">Page description goes here</p>
</header>
```

### Card with Content

```tsx
<div className="card">
  <h3 className="font-sans text-h4 mb-2">Card Title</h3>
  <p className="text-body-sm text-muted-foreground">
    Card description text
  </p>
  <span className="text-caption">Last updated 2h ago</span>
</div>
```

### Form Field

```tsx
<div className="space-y-2">
  <label className="text-label">Email Address</label>
  <input className="input-field" />
  <p className="text-caption text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

### Feature Section

```tsx
<section className="space-y-6">
  <h2 className="font-display text-display-lg">
    Feature Headline
  </h2>
  <p className="text-body-lg max-w-prose">
    Feature description with comfortable line length
  </p>
</section>
```

## Color Modifiers

```tsx
<p className="text-body text-foreground">Primary text</p>
<p className="text-body text-muted-foreground">Secondary text</p>
<p className="text-body text-primary">Brand color text</p>
<p className="text-body text-destructive">Error text</p>
```

## Responsive Typography

All display and heading sizes use fluid typography with `clamp()`:

```tsx
// Automatically scales from mobile to desktop
<h1 className="font-display text-h1">
  Scales: 28px (mobile) → 40px (desktop)
</h1>
```

## Migration from Old Classes

| Old Class | New Class |
|-----------|-----------|
| `text-hero` | `text-h1` or `text-display` |
| `text-small` | `text-body-sm` |
| `font-heading` | `font-display` |

## Font Weights

```tsx
<span className="font-thin">Thin (100)</span>
<span className="font-extralight">Extra Light (200)</span>
<span className="font-light">Light (300)</span>
<span className="font-normal">Normal (400)</span>
<span className="font-medium">Medium (500)</span>
<span className="font-semibold">Semibold (600)</span>
<span className="font-bold">Bold (700)</span>
<span className="font-extrabold">Extra Bold (800)</span>
<span className="font-black">Black (900)</span>
```

## Line Heights

```tsx
<p className="leading-none">No line height (1)</p>
<p className="leading-tight">Tight (1.2)</p>
<p className="leading-snug">Snug (1.35)</p>
<p className="leading-normal">Normal (1.5)</p>
<p className="leading-relaxed">Relaxed (1.65)</p>
<p className="leading-loose">Loose (1.8)</p>
```

## Letter Spacing

```tsx
<span className="tracking-tighter">Tighter (-0.05em)</span>
<span className="tracking-tight">Tight (-0.025em)</span>
<span className="tracking-normal">Normal (0)</span>
<span className="tracking-wide">Wide (0.025em)</span>
<span className="tracking-wider">Wider (0.05em)</span>
<span className="tracking-widest">Widest (0.1em)</span>
```

---

For complete documentation, see [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md)
