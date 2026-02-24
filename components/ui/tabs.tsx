"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * Tabs Component
 * 
 * A flexible tabs component built on Radix UI Tabs primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </Tabs>
 */

// ============================================
// Tabs Root
// ============================================

const Tabs = TabsPrimitive.Root;

// ============================================
// Tabs List Variants
// ============================================

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-xl bg-sand-100 p-1",
  {
    variants: {
      variant: {
        default: "",
        pills: "bg-transparent gap-1 p-0",
        underline: "bg-transparent rounded-none border-b border-border p-0 gap-6",
        cards: "bg-transparent gap-2 p-0",
      },
      size: {
        sm: "h-9",
        md: "h-10",
        lg: "h-12",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

// ============================================
// Tabs List
// ============================================

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

// ============================================
// Tabs Trigger Variants
// ============================================

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 " +
  "text-sm font-medium ring-offset-background transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "data-[state=active]:shadow-soft-sm",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-card data-[state=active]:text-foreground text-sand-600",
        pills: "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sand-600",
        underline: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-sand-600 hover:text-foreground pb-3",
        cards: "rounded-xl border border-transparent data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-soft-sm text-sand-600 hover:text-foreground",
      },
      size: {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-5 py-2.5",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

// ============================================
// Tabs Trigger
// ============================================

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(
  ({ className, variant, size, fullWidth, icon, badge, children, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
      {children}
      {badge && <span className="ml-2 flex-shrink-0">{badge}</span>}
    </TabsPrimitive.Trigger>
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ============================================
// Tabs Content
// ============================================

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
      "data-[state=inactive]:hidden data-[state=active]:animate-fade-in",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// ============================================
// Vertical Tabs - Specialized Component
// ============================================

interface VerticalTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface VerticalTabsProps {
  tabs: VerticalTab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

const VerticalTabs: React.FC<VerticalTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
  sidebarClassName,
  contentClassName,
}) => {
  return (
    <Tabs
      defaultValue={defaultTab || tabs[0]?.id}
      onValueChange={onChange}
      className={cn("flex gap-6", className)}
      orientation="vertical"
    >
      <TabsList
        className={cn(
          "flex-col h-auto w-56 bg-transparent p-0 gap-1",
          sidebarClassName
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              "w-full justify-start px-4 py-3 rounded-xl text-left",
              "text-sand-600 hover:bg-sand-100 hover:text-sand-800",
              "data-[state=active]:bg-peach-100 data-[state=active]:text-primary data-[state=active]:shadow-none",
              "transition-colors duration-200"
            )}
          >
            {tab.icon && <span className="mr-3 flex-shrink-0">{tab.icon}</span>}
            <span className="flex-1">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={cn("flex-1 min-w-0", contentClassName)}>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

// ============================================
// Icon Tabs - Specialized Component
// ============================================

interface IconTab {
  id: string;
  icon: React.ReactNode;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface IconTabsProps {
  tabs: IconTab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const IconTabs: React.FC<IconTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
  position = "top",
}) => {
  const isVertical = position === "left" || position === "right";

  return (
    <Tabs
      defaultValue={defaultTab || tabs[0]?.id}
      onValueChange={onChange}
      className={cn(
        "flex",
        position === "top" && "flex-col",
        position === "bottom" && "flex-col-reverse",
        position === "left" && "flex-row",
        position === "right" && "flex-row-reverse",
        className
      )}
    >
      <TabsList
        className={cn(
          "bg-transparent p-0 gap-1",
          isVertical && "flex-col w-16",
          !isVertical && "mb-4"
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-3 rounded-xl",
              "text-sand-500 hover:bg-sand-100 hover:text-sand-700",
              "data-[state=active]:bg-peach-100 data-[state=active]:text-primary",
              "transition-colors duration-200",
              isVertical ? "w-14 h-14" : "w-16 h-16"
            )}
          >
            <span className="flex-shrink-0">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className={cn("flex-1 min-w-0", isVertical && "ml-4")}>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className={cn("mt-0", !isVertical && "mt-0")}
          >
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

// ============================================
// Scrollable Tabs - Specialized Component
// ============================================

interface ScrollableTabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
}) => {
  return (
    <Tabs
      defaultValue={defaultTab || tabs[0]?.id}
      onValueChange={onChange}
      className={cn("w-full", className)}
    >
      <div className="relative">
        <TabsList
          className="w-full bg-transparent p-0 gap-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-lg whitespace-nowrap",
                "text-sm text-sand-600 hover:text-sand-800",
                "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft-sm",
                "border border-transparent data-[state=active]:border-border",
                "transition-all duration-200"
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

// ============================================
// Badge Tabs - Specialized Component with Badge Counts
// ============================================

interface BadgeTab {
  id: string;
  label: string;
  badge?: number;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "error";
  content: React.ReactNode;
}

interface BadgeTabsProps {
  tabs: BadgeTab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

const BadgeTabs: React.FC<BadgeTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
}) => {
  const badgeVariantClasses = {
    default: "bg-sand-200 text-sand-700",
    primary: "bg-peach-100 text-sand-800",
    success: "bg-sage-100 text-sage-300",
    warning: "bg-amber-100 text-amber-200",
    error: "bg-rose-100 text-rose-200",
  };

  return (
    <Tabs
      defaultValue={defaultTab || tabs[0]?.id}
      onValueChange={onChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full bg-sand-100 p-1 gap-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg",
              "text-sm text-sand-600",
              "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft-sm",
              "transition-all duration-200"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5",
                  "text-[10px] font-semibold rounded-full",
                  badgeVariantClasses[tab.badgeVariant || "default"]
                )}
              >
                {tab.badge > 99 ? "99+" : tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  VerticalTabs,
  IconTabs,
  ScrollableTabs,
  BadgeTabs,
  tabsListVariants,
  tabsTriggerVariants,
};

export type {
  TabsListProps,
  TabsTriggerProps,
  VerticalTab,
  VerticalTabsProps,
  IconTab,
  IconTabsProps,
  ScrollableTabsProps,
  BadgeTab,
  BadgeTabsProps,
};
