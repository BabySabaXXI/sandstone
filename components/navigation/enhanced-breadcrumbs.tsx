"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Home,
  MoreHorizontal,
  Slash,
  ArrowLeft,
} from "lucide-react";
import { useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// =============================================================================
// TYPES
// =============================================================================

interface BreadcrumbItem {
  href: string;
  label: string;
  isLast: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface RouteConfig {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  parent?: string;
  hideInBreadcrumb?: boolean;
}

interface EnhancedBreadcrumbsProps {
  maxItems?: number;
  separator?: "chevron" | "slash" | "arrow";
  showHome?: boolean;
  className?: string;
  items?: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================

const routeConfig: Record<string, RouteConfig> = {
  "": { label: "Home", icon: Home },
  grade: { label: "AI Grading", icon: Home },
  flashcards: { label: "Flashcards", icon: Home },
  documents: { label: "Documents", icon: Home },
  quiz: { label: "Quiz", icon: Home },
  library: { label: "Library", icon: Home },
  settings: { label: "Settings", icon: Home, parent: "" },
  help: { label: "Help & Support", icon: Home, parent: "" },
  profile: { label: "Profile", icon: Home, parent: "settings" },
  billing: { label: "Billing", icon: Home, parent: "settings" },
  notifications: { label: "Notifications", icon: Home, parent: "settings" },
  security: { label: "Security", icon: Home, parent: "settings" },
  new: { label: "New", hideInBreadcrumb: true },
  edit: { label: "Edit", hideInBreadcrumb: true },
  create: { label: "Create", hideInBreadcrumb: true },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  const segments = cleanPath.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    const isDynamic =
      segment.startsWith("[") ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      ) ||
      /^\d+$/.test(segment);

    const config = routeConfig[segment];

    if (config?.hideInBreadcrumb) return;

    let label = config?.label;
    if (!label) {
      if (isDynamic) {
        label = "Details";
      } else {
        label = segment
          .replace(/-/g, " ")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
    }

    breadcrumbs.push({
      href: currentPath,
      label,
      isLast: index === segments.length - 1,
      icon: config?.icon,
    });
  });

  return breadcrumbs;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const Separator = memo(function Separator({
  type,
}: {
  type: "chevron" | "slash" | "arrow";
}) {
  const icons = {
    chevron: ChevronRight,
    slash: Slash,
    arrow: ArrowLeft,
  };
  const Icon = icons[type];

  return (
    <Icon
      className={cn(
        "w-4 h-4 text-muted-foreground flex-shrink-0",
        type === "arrow" && "rotate-180"
      )}
    />
  );
});

const BreadcrumbDropdown = memo(function BreadcrumbDropdown({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          aria-label="Show more navigation items"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              onClick={() => onNavigate?.(item.href)}
              className="cursor-pointer"
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EnhancedBreadcrumbs = memo(function EnhancedBreadcrumbs({
  maxItems = 4,
  separator = "chevron",
  showHome = true,
  className,
  items: customItems,
  onNavigate,
}: EnhancedBreadcrumbsProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const breadcrumbs = customItems || generateBreadcrumbs(pathname);

  if (pathname === "/" && !customItems) {
    return null;
  }

  // Handle truncation
  const shouldTruncate = breadcrumbs.length > maxItems;
  let visibleItems: BreadcrumbItem[] = breadcrumbs;
  let hiddenItems: BreadcrumbItem[] = [];

  if (shouldTruncate) {
    const firstItems = breadcrumbs.slice(0, 1);
    const lastItems = breadcrumbs.slice(-(maxItems - 2));
    hiddenItems = breadcrumbs.slice(1, -(maxItems - 2));
    visibleItems = [...firstItems, { href: "", label: "...", isLast: false }, ...lastItems];
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, href: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNavigate?.(href);
      }
    },
    [onNavigate]
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
      onMouseLeave={() => setIsHovered(null)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {/* Home Link */}
        {showHome && (
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link
              href="/"
              onClick={() => onNavigate?.("/")}
              className={cn(
                "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 -ml-2",
                pathname === "/" && "text-foreground font-medium"
              )}
              aria-label="Go to homepage"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
            {visibleItems.length > 0 && (
              <span className="ml-1">
                <Separator type={separator} />
              </span>
            )}
          </motion.li>
        )}

        {/* Breadcrumb Items */}
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => (
            <motion.li
              key={item.href || `ellipsis-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center"
              onMouseEnter={() => setIsHovered(item.href)}
            >
              {item.href === "" && item.label === "..." ? (
                <BreadcrumbDropdown
                  items={hiddenItems}
                  onNavigate={onNavigate}
                />
              ) : item.isLast ? (
                <span
                  className={cn(
                    "text-sm font-medium text-foreground px-2 py-1 rounded-md transition-colors",
                    isHovered === item.href && "bg-accent"
                  )}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => onNavigate?.(item.href)}
                  onKeyDown={(e) => handleKeyDown(e, item.href)}
                  className={cn(
                    "text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1",
                    isHovered === item.href && "bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              )}

              {index < visibleItems.length - 1 && (
                <span className="mx-1">
                  <Separator type={separator} />
                </span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </nav>
  );
});

// =============================================================================
// BACK BUTTON BREADCRUMB
// =============================================================================

export const BackButtonBreadcrumb = memo(function BackButtonBreadcrumb({
  fallbackHref = "/",
  fallbackLabel = "Back to Dashboard",
  className,
}: {
  fallbackHref?: string;
  fallbackLabel?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const parentPath = pathname.split("/").slice(0, -1).join("/") || fallbackHref;
  const label = parentPath === "/" ? fallbackLabel : "Go back";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex items-center", className)}
    >
      <Link
        href={parentPath}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>{label}</span>
      </Link>
    </motion.div>
  );
});

// =============================================================================
// STRUCTURED DATA FOR SEO
// =============================================================================

export function StructuredDataBreadcrumbs({
  pathname,
  baseUrl = "https://sandstone.app",
}: {
  pathname: string;
  baseUrl?: string;
}) {
  const breadcrumbs = generateBreadcrumbs(pathname);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      ...breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `${baseUrl}${item.href}`,
      })),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default EnhancedBreadcrumbs;
