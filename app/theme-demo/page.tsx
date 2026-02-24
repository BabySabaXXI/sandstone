"use client";

/**
 * Dark Mode Demo Page
 * 
 * This page demonstrates all dark mode features and components.
 * Use it to test and verify the theme implementation.
 */

import { ThemeToggle } from "@/components/theme-toggle";
import {
  ThemeAwareCard,
  ThemeAwareText,
  ThemeAwareButton,
  ThemeAwareInput,
  ThemeAwareDivider,
  ThemeAwareBadge,
  ThemeAwareSkeleton,
  ThemeAwareIconButton,
} from "@/components/theme-aware";
import {
  useTheme,
  useIsDarkMode,
  useResolvedTheme,
} from "@/components/theme-provider";
import { cn } from "@/lib/utils";

// =============================================================================
// THEME INFO SECTION
// =============================================================================

function ThemeInfo() {
  const { theme, resolvedTheme, systemTheme, themes, isDark } = useTheme();

  return (
    <ThemeAwareCard variant="elevated" className="space-y-4">
      <ThemeAwareText variant="primary" size="lg" as="h2">
        Current Theme State
      </ThemeAwareText>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Theme:</span>
            <span className="font-mono font-medium">{theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resolved:</span>
            <span className="font-mono font-medium">{resolvedTheme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">System:</span>
            <span className="font-mono font-medium">{systemTheme}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Is Dark:</span>
            <span
              className={cn(
                "font-mono font-medium",
                isDark ? "text-sage-300" : "text-amber-300"
              )}
            >
              {isDark ? "true" : "false"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Available:</span>
            <span className="font-mono font-medium">{themes.join(", ")}</span>
          </div>
        </div>
      </div>
    </ThemeAwareCard>
  );
}

// =============================================================================
// THEME TOGGLE VARIANTS SECTION
// =============================================================================

function ThemeToggleVariants() {
  return (
    <ThemeAwareCard className="space-y-6">
      <ThemeAwareText variant="primary" size="lg" as="h2">
        Theme Toggle Variants
      </ThemeAwareText>

      <div className="space-y-6">
        {/* Default Toggle */}
        <div className="space-y-2">
          <ThemeAwareText variant="muted" size="sm">
            Default (cycles themes)
          </ThemeAwareText>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="default" size="sm" />
            <ThemeToggle variant="default" size="md" />
            <ThemeToggle variant="default" size="lg" />
          </div>
        </div>

        <ThemeAwareDivider />

        {/* Minimal Toggle */}
        <div className="space-y-2">
          <ThemeAwareText variant="muted" size="sm">
            Minimal (light/dark only)
          </ThemeAwareText>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="minimal" size="sm" />
            <ThemeToggle variant="minimal" size="md" />
            <ThemeToggle variant="minimal" size="lg" />
          </div>
        </div>

        <ThemeAwareDivider />

        {/* Segmented Toggle */}
        <div className="space-y-2">
          <ThemeAwareText variant="muted" size="sm">
            Segmented (all options)
          </ThemeAwareText>
          <div className="flex flex-wrap items-center gap-4">
            <ThemeToggle variant="segmented" size="sm" />
            <ThemeToggle variant="segmented" size="md" showLabels />
            <ThemeToggle variant="segmented" size="lg" showLabels />
          </div>
        </div>

        <ThemeAwareDivider />

        {/* Switch Toggle */}
        <div className="space-y-2">
          <ThemeAwareText variant="muted" size="sm">
            Switch (iOS-style)
          </ThemeAwareText>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="switch" size="sm" />
            <ThemeToggle variant="switch" size="md" />
            <ThemeToggle variant="switch" size="lg" />
          </div>
        </div>
      </div>
    </ThemeAwareCard>
  );
}

// =============================================================================
// COLOR PALETTE SECTION
// =============================================================================

function ColorPalette() {
  const colors = [
    { name: "Background", class: "bg-background", text: "text-foreground" },
    { name: "Card", class: "bg-card", text: "text-card-foreground" },
    { name: "Primary", class: "bg-primary", text: "text-primary-foreground" },
    { name: "Secondary", class: "bg-secondary", text: "text-secondary-foreground" },
    { name: "Muted", class: "bg-muted", text: "text-muted-foreground" },
    { name: "Accent", class: "bg-accent", text: "text-accent-foreground" },
    { name: "Destructive", class: "bg-destructive", text: "text-destructive-foreground" },
  ];

  const semanticColors = [
    { name: "Success", bg: "bg-[hsl(var(--success))]", text: "text-[hsl(var(--success-foreground))]" },
    { name: "Warning", bg: "bg-[hsl(var(--warning))]", text: "text-[hsl(var(--warning-foreground))]" },
    { name: "Error", bg: "bg-[hsl(var(--error))]", text: "text-[hsl(var(--error-foreground))]" },
    { name: "Info", bg: "bg-[hsl(var(--info))]", text: "text-[hsl(var(--info-foreground))]" },
  ];

  return (
    <ThemeAwareCard className="space-y-6">
      <ThemeAwareText variant="primary" size="lg" as="h2">
        Color Palette
      </ThemeAwareText>

      <div className="space-y-4">
        <ThemeAwareText variant="muted" size="sm">
          Theme Colors
        </ThemeAwareText>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {colors.map((color) => (
            <div
              key={color.name}
              className={cn(
                "h-20 rounded-lg flex items-center justify-center text-xs font-medium",
                color.class,
                color.text
              )}
            >
              {color.name}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <ThemeAwareText variant="muted" size="sm">
          Semantic Colors
        </ThemeAwareText>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {semanticColors.map((color) => (
            <div
              key={color.name}
              className={cn(
                "h-20 rounded-lg flex items-center justify-center text-xs font-medium",
                color.bg,
                color.text
              )}
            >
              {color.name}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <ThemeAwareText variant="muted" size="sm">
          Sand Palette
        </ThemeAwareText>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div
              key={shade}
              className={cn(
                "h-12 rounded flex items-end justify-center pb-1 text-[10px]",
                `bg-sand-${shade}`,
                shade > 500 ? "text-white" : "text-black"
              )}
            >
              {shade}
            </div>
          ))}
        </div>
      </div>
    </ThemeAwareCard>
  );
}

// =============================================================================
// COMPONENT SHOWCASE SECTION
// =============================================================================

function ComponentShowcase() {
  return (
    <ThemeAwareCard className="space-y-6">
      <ThemeAwareText variant="primary" size="lg" as="h2">
        Component Showcase
      </ThemeAwareText>

      {/* Buttons */}
      <div className="space-y-3">
        <ThemeAwareText variant="muted" size="sm">
          Buttons
        </ThemeAwareText>
        <div className="flex flex-wrap gap-3">
          <ThemeAwareButton variant="primary">Primary</ThemeAwareButton>
          <ThemeAwareButton variant="secondary">Secondary</ThemeAwareButton>
          <ThemeAwareButton variant="ghost">Ghost</ThemeAwareButton>
          <ThemeAwareButton variant="danger">Danger</ThemeAwareButton>
          <ThemeAwareButton variant="primary" isLoading>
            Loading
          </ThemeAwareButton>
        </div>
      </div>

      <ThemeAwareDivider />

      {/* Inputs */}
      <div className="space-y-3">
        <ThemeAwareText variant="muted" size="sm">
          Inputs
        </ThemeAwareText>
        <div className="grid gap-4 max-w-md">
          <ThemeAwareInput label="Default Input" placeholder="Type something..." />
          <ThemeAwareInput
            label="With Error"
            placeholder="Type something..."
            error="This field is required"
          />
          <ThemeAwareInput
            label="With Helper"
            placeholder="Type something..."
            helperText="This is helper text"
          />
        </div>
      </div>

      <ThemeAwareDivider />

      {/* Badges */}
      <div className="space-y-3">
        <ThemeAwareText variant="muted" size="sm">
          Badges
        </ThemeAwareText>
        <div className="flex flex-wrap gap-2">
          <ThemeAwareBadge variant="default">Default</ThemeAwareBadge>
          <ThemeAwareBadge variant="primary">Primary</ThemeAwareBadge>
          <ThemeAwareBadge variant="success">Success</ThemeAwareBadge>
          <ThemeAwareBadge variant="warning">Warning</ThemeAwareBadge>
          <ThemeAwareBadge variant="error">Error</ThemeAwareBadge>
          <ThemeAwareBadge variant="info">Info</ThemeAwareBadge>
        </div>
      </div>

      <ThemeAwareDivider />

      {/* Skeletons */}
      <div className="space-y-3">
        <ThemeAwareText variant="muted" size="sm">
          Skeletons
        </ThemeAwareText>
        <div className="space-y-2 max-w-md">
          <ThemeAwareSkeleton variant="text" className="w-3/4" />
          <ThemeAwareSkeleton variant="text" className="w-1/2" />
          <div className="flex gap-2">
            <ThemeAwareSkeleton variant="circle" className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <ThemeAwareSkeleton variant="text" className="w-1/3" />
              <ThemeAwareSkeleton variant="text" className="w-1/4" />
            </div>
          </div>
        </div>
      </div>

      <ThemeAwareDivider />

      {/* Icon Buttons */}
      <div className="space-y-3">
        <ThemeAwareText variant="muted" size="sm">
          Icon Buttons
        </ThemeAwareText>
        <div className="flex gap-2">
          <ThemeAwareIconButton variant="default">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ThemeAwareIconButton>
          <ThemeAwareIconButton variant="ghost">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </ThemeAwareIconButton>
        </div>
      </div>
    </ThemeAwareCard>
  );
}

// =============================================================================
// TYPOGRAPHY SECTION
// =============================================================================

function TypographyShowcase() {
  return (
    <ThemeAwareCard className="space-y-6">
      <ThemeAwareText variant="primary" size="lg" as="h2">
        Typography
      </ThemeAwareText>

      <div className="space-y-4">
        {[
          { variant: "default" as const, label: "Default Text" },
          { variant: "muted" as const, label: "Muted Text" },
          { variant: "primary" as const, label: "Primary Text" },
          { variant: "secondary" as const, label: "Secondary Text" },
          { variant: "danger" as const, label: "Danger Text" },
        ].map(({ variant, label }) => (
          <div key={variant} className="flex items-center gap-4">
            <ThemeAwareText variant={variant}>{label}</ThemeAwareText>
            <span className="text-xs text-muted-foreground font-mono">
              variant=&quot;{variant}&quot;
            </span>
          </div>
        ))}
      </div>

      <ThemeAwareDivider />

      <div className="space-y-4">
        {[
          { size: "xs" as const, label: "Extra Small" },
          { size: "sm" as const, label: "Small" },
          { size: "base" as const, label: "Base" },
          { size: "lg" as const, label: "Large" },
          { size: "xl" as const, label: "Extra Large" },
        ].map(({ size, label }) => (
          <div key={size} className="flex items-center gap-4">
            <ThemeAwareText size={size}>{label}</ThemeAwareText>
            <span className="text-xs text-muted-foreground font-mono">
              size=&quot;{size}&quot;
            </span>
          </div>
        ))}
      </div>
    </ThemeAwareCard>
  );
}

// =============================================================================
// ELEVATION SECTION
// =============================================================================

function ElevationShowcase() {
  return (
    <ThemeAwareCard className="space-y-6">
      <ThemeAwareText variant="primary" size="lg" as="h2">
        Elevation Levels
      </ThemeAwareText>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-24 rounded-lg bg-card flex items-center justify-center",
              `elevation-${level}`
            )}
          >
            <span className="text-sm font-medium">Level {level}</span>
          </div>
        ))}
      </div>
    </ThemeAwareCard>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-glass border-b border-border">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dark Mode Demo
              </h1>
              <p className="text-sm text-muted-foreground">
                Test and verify the theme implementation
              </p>
            </div>
            <ThemeToggle variant="segmented" showLabels />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-wide py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            <ThemeInfo />
            <ThemeToggleVariants />
            <ColorPalette />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ComponentShowcase />
            <TypographyShowcase />
            <ElevationShowcase />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container-wide py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Sandstone Dark Mode Implementation</p>
            <div className="flex items-center gap-2">
              <span>Current theme:</span>
              <ThemeStatus />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// =============================================================================
// THEME STATUS INDICATOR
// =============================================================================

function ThemeStatus() {
  const resolvedTheme = useResolvedTheme();
  const isDark = useIsDarkMode();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        isDark
          ? "bg-sage-200/20 text-sage-300"
          : "bg-amber-100 text-amber-700"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          isDark ? "bg-sage-300" : "bg-amber-500"
        )}
      />
      {resolvedTheme}
    </span>
  );
}
