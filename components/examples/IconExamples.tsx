/**
 * Icon System Examples
 * 
 * Examples demonstrating the new icon system usage patterns.
 */

"use client";

import React from "react";
import {
  // Direct icon imports (tree-shaking friendly)
  Home,
  Settings,
  User,
  Bell,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  // Icon component
  Icon,
  // Pre-sized icons
  IconXs,
  IconSm,
  IconMd,
  IconLg,
  IconXl,
  // Pre-colored icons
  IconPrimary,
  IconSuccess,
  IconWarning,
  IconError,
  IconInfo,
  // Animated icons
  IconSpin,
  // SVG icons
  UploadIcon,
  CloseIcon,
  SpinnerIcon,
  // Lazy icon
  LazyIcon,
  // Icon categories
  navigationIcons,
  actionIcons,
  statusIcons,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Example 1: Basic Icon Usage
// ============================================================================

export function BasicIconExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Icon Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Direct icon usage */}
          <Home className="w-5 h-5" />
          
          {/* Using Icon component with size */}
          <Icon icon={Settings} size="md" />
          <Icon icon={User} size="lg" />
          <Icon icon={Bell} size="xl" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Pre-sized icons */}
          <IconXs icon={Home} />
          <IconSm icon={Home} />
          <IconMd icon={Home} />
          <IconLg icon={Home} />
          <IconXl icon={Home} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 2: Icon Colors
// ============================================================================

export function IconColorsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Icon Colors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Using color prop */}
          <Icon icon={CheckCircle2} color="success" size="lg" />
          <Icon icon={AlertCircle} color="warning" size="lg" />
          <Icon icon={AlertCircle} color="error" size="lg" />
          <Icon icon={Bell} color="info" size="lg" />
          <Icon icon={Home} color="primary" size="lg" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Pre-colored icons */}
          <IconSuccess icon={CheckCircle2} size="lg" />
          <IconWarning icon={AlertCircle} size="lg" />
          <IconError icon={AlertCircle} size="lg" />
          <IconInfo icon={Bell} size="lg" />
          <IconPrimary icon={Home} size="lg" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 3: Icon Animations
// ============================================================================

export function IconAnimationsExample() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Icon Animations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Spin animation for loading */}
          <Icon icon={Loader2} animation="spin" size="lg" />
          
          {/* Using IconSpin convenience component */}
          <IconSpin icon={Loader2} size="lg" />
          
          {/* Pulse animation */}
          <Icon icon={Bell} animation="pulse" size="lg" />
          
          {/* Bounce animation */}
          <Icon icon={Bell} animation="bounce" size="lg" />
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IconSpin icon={Loader2} size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              <>
                <Icon icon={CheckCircle2} size="sm" className="mr-2" />
                Click to Load
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 4: Accessible Icons
// ============================================================================

export function AccessibleIconsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessible Icons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {/* Decorative icon (hidden from screen readers) */}
          <div className="flex items-center gap-2">
            <Icon icon={Home} decorative size="md" />
            <span>Home (decorative icon)</span>
          </div>
          
          {/* Icon with label (announced by screen readers) */}
          <div className="flex items-center gap-2">
            <Icon icon={CheckCircle2} label="Success" color="success" size="md" />
            <span>Operation completed successfully</span>
          </div>
          
          {/* Icon with custom aria-label */}
          <div className="flex items-center gap-2">
            <Icon
              icon={AlertCircle}
              ariaLabel="Warning: Please review your input"
              color="warning"
              size="md"
            />
            <span>Warning message</span>
          </div>
          
          {/* Interactive icon with proper accessibility */}
          <button
            className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
            onClick={() => alert("Settings clicked")}
          >
            <Icon icon={Settings} label="Open settings" size="md" />
            <span>Settings</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 5: SVG Icons
// ============================================================================

export function SVGIconsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SVG Icons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Pre-built SVG icons */}
          <UploadIcon size="lg" />
          <CloseIcon size="lg" />
          <SpinnerIcon size="lg" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* SVG icons with colors */}
          <UploadIcon size="lg" color="primary" />
          <CloseIcon size="lg" color="error" />
          <SpinnerIcon size="lg" color="muted" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 6: Lazy Loading Icons
// ============================================================================

export function LazyIconsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lazy Loading Icons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          These icons are only loaded when they enter the viewport:
        </p>
        
        <div className="flex items-center gap-4">
          {/* Lazy loaded icons with fallback */}
          <LazyIcon
            icon={Home}
            size="lg"
            fallback={<div className="w-8 h-8 bg-muted rounded animate-pulse" />}
          />
          <LazyIcon
            icon={Settings}
            size="lg"
            fallback={<div className="w-8 h-8 bg-muted rounded animate-pulse" />}
          />
          <LazyIcon
            icon={User}
            size="lg"
            fallback={<div className="w-8 h-8 bg-muted rounded animate-pulse" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 7: Icon Categories
// ============================================================================

export function IconCategoriesExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Icon Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Navigation Icons */}
        <div>
          <h4 className="text-sm font-medium mb-2">Navigation</h4>
          <div className="flex items-center gap-3">
            <navigationIcons.Home className="w-5 h-5" />
            <navigationIcons.ArrowLeft className="w-5 h-5" />
            <navigationIcons.ArrowRight className="w-5 h-5" />
            <navigationIcons.ChevronLeft className="w-5 h-5" />
            <navigationIcons.ChevronRight className="w-5 h-5" />
            <navigationIcons.ExternalLink className="w-5 h-5" />
          </div>
        </div>
        
        {/* Action Icons */}
        <div>
          <h4 className="text-sm font-medium mb-2">Actions</h4>
          <div className="flex items-center gap-3">
            <actionIcons.Plus className="w-5 h-5" />
            <actionIcons.Edit className="w-5 h-5" />
            <actionIcons.Trash2 className="w-5 h-5" />
            <actionIcons.Copy className="w-5 h-5" />
            <actionIcons.Search className="w-5 h-5" />
            <actionIcons.Filter className="w-5 h-5" />
          </div>
        </div>
        
        {/* Status Icons */}
        <div>
          <h4 className="text-sm font-medium mb-2">Status</h4>
          <div className="flex items-center gap-3">
            <statusIcons.AlertCircle className="w-5 h-5" />
            <statusIcons.AlertTriangle className="w-5 h-5" />
            <statusIcons.Info className="w-5 h-5" />
            <statusIcons.HelpCircle className="w-5 h-5" />
            <statusIcons.Loader2 className="w-5 h-5" />
            <statusIcons.Sparkles className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 8: Icons in Buttons
// ============================================================================

export function IconsInButtonsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Icons in Buttons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button>
            <Icon icon={Home} size="sm" className="mr-2" />
            Home
          </Button>
          
          <Button variant="secondary">
            <Icon icon={Settings} size="sm" className="mr-2" />
            Settings
          </Button>
          
          <Button variant="outline">
            <Icon icon={User} size="sm" className="mr-2" />
            Profile
          </Button>
          
          <Button variant="ghost" size="icon">
            <Icon icon={Bell} size="sm" />
          </Button>
          
          <Button variant="destructive">
            <Icon icon={actionIcons.Trash2} size="sm" className="mr-2" />
            Delete
          </Button>
          
          <Button disabled>
            <IconSpin icon={Loader2} size="sm" className="mr-2" />
            Loading
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Example 9: Custom Styled Icons
// ============================================================================

export function CustomStyledIconsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Styled Icons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Icon with custom className */}
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon icon={Home} size="lg" color="primary" />
          </div>
          
          {/* Icon with gradient background */}
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Icon icon={Bell} size="lg" className="text-white" />
          </div>
          
          {/* Icon with shadow */}
          <div className="p-3 bg-background rounded-lg shadow-lg">
            <Icon icon={Settings} size="lg" />
          </div>
          
          {/* Icon with border */}
          <div className="p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <Icon icon={UploadIcon} size="lg" color="muted" />
          </div>
        </div>
        
        {/* Icon with custom numeric size */}
        <div className="flex items-center gap-4">
          <Icon icon={Home} size={16} />
          <Icon icon={Home} size={24} />
          <Icon icon={Home} size={32} />
          <Icon icon={Home} size={48} />
          <Icon icon={Home} size={64} />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Example Page
// ============================================================================

export function IconExamples() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Icon System</h1>
        <p className="text-muted-foreground">
          Comprehensive examples of the Sandstone icon system.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <BasicIconExample />
        <IconColorsExample />
        <IconAnimationsExample />
        <AccessibleIconsExample />
        <SVGIconsExample />
        <LazyIconsExample />
        <IconCategoriesExample />
        <IconsInButtonsExample />
        <CustomStyledIconsExample />
      </div>
    </div>
  );
}

export default IconExamples;
