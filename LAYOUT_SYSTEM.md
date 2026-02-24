# Sandstone Layout System

A comprehensive, modern layout system for the Sandstone application featuring CSS Grid, Flexbox, Container Queries, and consistent spacing utilities.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Components](#components)
  - [Grid](#grid)
  - [Stack](#stack)
  - [Flex](#flex)
  - [Container](#container)
  - [Page Layouts](#page-layouts)
- [CSS Utilities](#css-utilities)
- [Spacing Scale](#spacing-scale)
- [Container Queries](#container-queries)
- [Best Practices](#best-practices)

## Overview

The Sandstone Layout System provides a complete set of layout primitives that work together to create consistent, responsive, and accessible layouts across the application.

### Key Features

- **CSS Grid System** - Responsive grid with auto-fit/fill support
- **Flexbox Utilities** - Comprehensive flexbox controls
- **Container Queries** - Component-based responsive design
- **Consistent Spacing** - 4px-based spacing scale
- **TypeScript Support** - Full type safety
- **Animation Ready** - Works with Framer Motion
- **Accessible** - Semantic HTML and ARIA support

## Installation

The layout system is included in the Sandstone application. Import components from the layout module:

```tsx
import {
  Grid,
  GridItem,
  VStack,
  HStack,
  Flex,
  FlexItem,
  Container,
  ThreePanel,
  Sidebar,
} from "@/components/layout";
```

## Components

### Grid

A powerful grid component with responsive column support and auto-fit/fill modes.

```tsx
import { Grid, GridItem } from "@/components/layout";

// Basic grid
<Grid cols={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Responsive grid
<Grid cols={1} colsSm={2} colsMd={3} colsLg={4} gap={4}>
  {items.map((item) => (
    <div key={item.id}>{item.content}</div>
  ))}
</Grid>

// Auto-fit grid
<Grid autoFit minChildWidth="250px" gap={4}>
  {items.map((item) => (
    <div key={item.id}>{item.content}</div>
  ))}
</Grid>

// Grid with item spans
<Grid cols={4} gap={4}>
  <GridItem colSpan={2}>Spans 2 columns</GridItem>
  <GridItem colSpan={2}>Spans 2 columns</GridItem>
  <GridItem colSpan={4}>Spans all columns</GridItem>
</Grid>
```

#### Grid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `1-12` | - | Number of columns |
| `colsSm` | `1-12` | - | Columns at sm breakpoint |
| `colsMd` | `1-12` | - | Columns at md breakpoint |
| `colsLg` | `1-12` | - | Columns at lg breakpoint |
| `colsXl` | `1-12` | - | Columns at xl breakpoint |
| `gap` | `0-16` | - | Gap between items |
| `gapX` | `0-16` | - | Horizontal gap |
| `gapY` | `0-16` | - | Vertical gap |
| `autoFit` | `boolean` | - | Use auto-fit mode |
| `autoFill` | `boolean` | - | Use auto-fill mode |
| `minChildWidth` | `string` | `250px` | Minimum child width |
| `alignItems` | `start/center/end/stretch` | - | Align items |
| `justifyItems` | `start/center/end/stretch` | - | Justify items |
| `asContainer` | `boolean` | - | Enable container queries |

### Stack

Vertical and horizontal stack layouts with consistent spacing.

```tsx
import { VStack, HStack } from "@/components/layout";

// Vertical stack
<VStack gap={4} align="center">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</VStack>

// Horizontal stack
<HStack gap={4} justify="between" align="center">
  <div>Left</div>
  <div>Center</div>
  <div>Right</div>
</HStack>

// With divider
<HStack gap={4} divider={<div className="w-px h-4 bg-border" />}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</HStack>
```

#### Stack Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `vertical/horizontal` | `vertical` | Stack direction |
| `gap` | `0-24` | - | Gap between items |
| `align` | `start/center/end/stretch/baseline` | - | Align items |
| `justify` | `start/center/end/between/around/evenly` | - | Justify content |
| `wrap` | `boolean/reverse` | - | Flex wrap behavior |
| `fullWidth` | `boolean` | - | Full width |
| `fullHeight` | `boolean` | - | Full height |

### Flex

Advanced flexbox component with grow, shrink, and basis control.

```tsx
import { Flex, FlexItem, Center, Spacer } from "@/components/layout";

// Basic flex
<Flex gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>

// With flex items
<Flex gap={2}>
  <FlexItem grow={false}>Fixed</FlexItem>
  <FlexItem grow>Flexible</FlexItem>
  <FlexItem grow={2}>More flexible</FlexItem>
</Flex>

// Center content
<Center className="h-64">
  <div>Centered content</div>
</Center>

// Push content apart
<Flex>
  <div>Left</div>
  <Spacer />
  <div>Right</div>
</Flex>
```

#### Flex Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `row/row-reverse/col/col-reverse` | `row` | Flex direction |
| `gap` | `0-16` | - | Gap between items |
| `align` | `start/center/end/stretch/baseline` | - | Align items |
| `justify` | `start/center/end/between/around/evenly` | - | Justify content |
| `wrap` | `wrap/wrap-reverse/nowrap` | - | Flex wrap |
| `inline` | `boolean` | - | Use inline-flex |

#### FlexItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `grow` | `boolean/number` | - | Flex grow |
| `shrink` | `boolean/number` | - | Flex shrink |
| `basis` | `auto/full/1/2/1/3/etc` | - | Flex basis |
| `alignSelf` | `auto/start/center/end/stretch` | - | Align self |
| `order` | `first/last/none/number` | - | Order |

### Container

Responsive container with consistent max-widths and padding.

```tsx
import { Container, PageContainer, SectionContainer } from "@/components/layout";

// Basic container
<Container size="wide" padding={6}>
  <div>Your content</div>
</Container>

// As main element
<Container asMain size="full" padding={6}>
  <div>Main content</div>
</Container>

// Page container with sidebar
<PageContainer
  sidebar={<SidebarContent />}
  sidebarWidth={280}
  header={<Header />}
>
  <div>Page content</div>
</PageContainer>

// Section container
<SectionContainer id="features" fullBleed>
  <Container>Section content</Container>
</SectionContainer>
```

#### Container Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `xs/sm/md/lg/xl/2xl/narrow/wide/full/none` | `full` | Container size |
| `padding` | `0-16` | - | Padding |
| `paddingX` | `0-16` | - | Horizontal padding |
| `paddingY` | `0-16` | - | Vertical padding |
| `center` | `boolean` | `true` | Center container |
| `asMain` | `boolean` | - | Render as `<main>` |

### Page Layouts

Pre-built page layout components.

```tsx
import { ThreePanel, TwoPanel, Sidebar } from "@/components/layout";

// Three panel layout (sidebar + main + right panel)
<ThreePanel
  showSidebar={true}
  sidebarWidth={64}
  showRightPanel={false}
  header={<Header />}
>
  <div>Main content</div>
</ThreePanel>

// Two panel layout
<TwoPanel
  sidebar={<Sidebar />}
  sidebarWidth={280}
  sidebarPosition="left"
>
  <div>Main content</div>
</TwoPanel>

// Sidebar component
<Sidebar
  width={64}
  expandedWidth={240}
  collapsible={true}
/>
```

## CSS Utilities

The layout system includes comprehensive CSS utilities in `styles/layout-system.css`:

### Grid Utilities

```css
.grid-auto-fit          /* Auto-fit grid */
.grid-auto-fit-sm       /* Auto-fit with smaller min-width */
.grid-auto-fit-lg       /* Auto-fit with larger min-width */
.grid-dense             /* Dense grid flow */
.subgrid-rows           /* Subgrid rows (with fallback) */
.subgrid-cols           /* Subgrid columns (with fallback) */
```

### Flex Utilities

```css
.flex-row-reverse       /* Reverse row direction */
.flex-col-reverse       /* Reverse column direction */
.flex-grow-0            /* No grow */
.flex-grow-1            /* Grow */
.flex-grow-2            /* Grow more */
.flex-basis-auto        /* Auto basis */
.flex-basis-full        /* Full basis */
.flex-basis-1/2         /* 50% basis */
.justify-evenly         /* Evenly justify */
.content-start          /* Align content start */
.self-start             /* Align self start */
.order-first            /* First in order */
.order-last             /* Last in order */
```

### Spacing Utilities

```css
/* Margin */
.m-0, .m-1, .m-2, ... .m-24
.mx-0, .mx-1, ... .mx-auto
.my-0, .my-1, ... .my-24
.mt-0, .mt-1, ... .mt-24
.mb-0, .mb-1, ... .mb-24
.ml-0, .ml-1, ... .ml-auto
.mr-0, .mr-1, ... .mr-auto

/* Padding */
.p-0, .p-1, ... .p-20
.px-0, .px-1, ... .px-12
.py-0, .py-1, ... .py-20
.pt-0, .pt-1, ... .pt-24
.pb-0, .pb-1, ... .pb-24
.pl-0, .pl-1, ... .pl-12
.pr-0, .pr-1, ... .pr-12
```

### Layout Patterns

```css
.center-abs             /* Absolute centering */
.center-flex            /* Flex centering */
.center-grid            /* Grid centering */
.sticky-top             /* Sticky top */
.sticky-header          /* Sticky header with blur */
.aspect-video           /* 16:9 aspect ratio */
.aspect-square          /* 1:1 aspect ratio */
.aspect-portrait        /* 3:4 aspect ratio */
.container-xs           /* Extra small container */
.container-sm           /* Small container */
.container-md           /* Medium container */
.container-lg           /* Large container */
.container-xl           /* Extra large container */
.container-narrow       /* Narrow container (768px) */
.container-wide         /* Wide container (1200px) */
.container-full         /* Full container (1440px) */
.full-bleed             /* Full viewport width */
.h-screen-safe          /* Safe screen height */
.scroll-x               /* Horizontal scroll */
.scroll-y               /* Vertical scroll */
.scrollbar-hide         /* Hide scrollbar */
```

## Spacing Scale

The spacing scale is based on 4px increments:

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Compact spacing |
| `space-3` | 12px | Small spacing |
| `space-4` | 16px | Default spacing |
| `space-5` | 20px | Medium spacing |
| `space-6` | 24px | Large spacing |
| `space-8` | 32px | Extra large spacing |
| `space-10` | 40px | Section spacing |
| `space-12` | 48px | Large section spacing |
| `space-16` | 64px | Major section spacing |
| `space-20` | 80px | Page section spacing |
| `space-24` | 96px | Large page spacing |

## Container Queries

The layout system supports CSS Container Queries for component-based responsive design:

```tsx
// Mark a container
<div className="cq-container">
  <Grid cols={1} className="cq:grid-cols-2-sm cq:grid-cols-4-lg">
    {/* Content responds to container width, not viewport */}
  </Grid>
</div>
```

### Container Query Breakpoints

| Name | Width | Class Prefix |
|------|-------|--------------|
| xs | 320px | `cq:` |
| sm | 480px | `cq:sm:` |
| md | 768px | `cq:md:` |
| lg | 1024px | `cq:lg:` |
| xl | 1280px | `cq:xl:` |
| 2xl | 1536px | `cq:2xl:` |

## Best Practices

### 1. Use Semantic HTML

```tsx
// Good
<Container asMain>
  <SectionContainer id="hero">
    <h1>Title</h1>
  </SectionContainer>
</Container>

// Avoid
<div className="main">
  <div id="hero">
    <div className="title">Title</div>
  </div>
</div>
```

### 2. Prefer Layout Components Over Utility Classes

```tsx
// Good
<VStack gap={4} align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</VStack>

// Avoid when layout components available
<div className="flex flex-col gap-4 items-center">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### 3. Use Responsive Props

```tsx
// Good
<Grid cols={1} colsSm={2} colsMd={3} colsLg={4} gap={4}>
  {items.map((item) => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</Grid>
```

### 4. Maintain Consistent Spacing

```tsx
// Good - uses spacing scale
<VStack gap={4}>
  <div>Content</div>
</VStack>

// Avoid - arbitrary values
<div style={{ marginBottom: '17px' }}>
  Content
</div>
```

### 5. Use Container Queries for Components

```tsx
// Good - component is self-responsive
<Card className="cq-container">
  <Grid cols={1} className="cq:grid-cols-2-md">
    <div>Left</div>
    <div>Right</div>
  </Grid>
</Card>
```

### 6. Animate Layout Changes

```tsx
// Good - smooth transitions
<motion.div
  layout
  transition={{ type: "spring", damping: 25, stiffness: 200 }}
>
  <Grid cols={isExpanded ? 2 : 1}>
    {items.map((item) => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </Grid>
</motion.div>
```

## Migration Guide

### From Tailwind Classes

```tsx
// Before
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {children}
</div>

// After
<Grid cols={1} colsMd={2} colsLg={3} gap={4}>
  {children}
</Grid>
```

```tsx
// Before
<div className="flex flex-col items-center gap-4">
  {children}
</div>

// After
<VStack gap={4} align="center">
  {children}
</VStack>
```

```tsx
// Before
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {children}
</div>

// After
<Container size="full" paddingX={4} paddingXSm={6} paddingXLg={8}>
  {children}
</Container>
```

## Demo

Visit `/layout-demo` in the application to see interactive examples of all layout components.

## License

Part of the Sandstone application.
