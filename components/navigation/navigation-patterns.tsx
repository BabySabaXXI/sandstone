"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  memo,
  useEffect,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home,
  History,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface NavigationHistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

interface NavigationContextType {
  history: NavigationHistoryItem[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  navigate: (path: string, title?: string) => void;
  goBack: () => void;
  goForward: () => void;
  addToHistory: (path: string, title: string) => void;
  clearHistory: () => void;
}

interface NavigationPatternProps {
  children: React.ReactNode;
}

interface QuickNavProps {
  items: {
    href: string;
    label: string;
    icon?: LucideIcon;
  }[];
  className?: string;
}

interface StepperProps {
  steps: {
    label: string;
    description?: string;
    href?: string;
  }[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisible?: number;
  className?: string;
}

interface TabsProps {
  tabs: {
    id: string;
    label: string;
    icon?: LucideIcon;
    badge?: string;
    content: React.ReactNode;
  }[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

// =============================================================================
// NAVIGATION CONTEXT
// =============================================================================

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: NavigationPatternProps) {
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const navigate = useCallback((path: string, title: string = "Untitled") => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      return [
        ...newHistory,
        { path, title, timestamp: Date.now() },
      ];
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const addToHistory = useCallback((path: string, title: string) => {
    setHistory((prev) => [
      ...prev,
      { path, title, timestamp: Date.now() },
    ]);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const value = useMemo(
    () => ({
      history,
      currentIndex,
      canGoBack: currentIndex > 0,
      canGoForward: currentIndex < history.length - 1,
      navigate,
      goBack,
      goForward,
      addToHistory,
      clearHistory,
    }),
    [history, currentIndex, navigate, goBack, goForward, addToHistory, clearHistory]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
}

// =============================================================================
// BROWSER-STYLE NAVIGATION
// =============================================================================

export const BrowserNavigation = memo(function BrowserNavigation({
  className,
}: {
  className?: string;
}) {
  const { canGoBack, canGoForward, goBack, goForward, history, currentIndex } =
    useNavigation();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (canGoBack) {
      goBack();
      const prevItem = history[currentIndex - 1];
      if (prevItem) {
        router.push(prevItem.path);
      }
    } else {
      router.back();
    }
  }, [canGoBack, goBack, history, currentIndex, router]);

  const handleForward = useCallback(() => {
    if (canGoForward) {
      goForward();
      const nextItem = history[currentIndex + 1];
      if (nextItem) {
        router.push(nextItem.path);
      }
    } else {
      router.forward();
    }
  }, [canGoForward, goForward, history, currentIndex, router]);

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              disabled={!canGoBack}
              className="h-8 w-8"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go back</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleForward}
              disabled={!canGoForward}
              className="h-8 w-8"
              aria-label="Go forward"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go forward</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});

// =============================================================================
// QUICK NAVIGATION
// =============================================================================

export const QuickNav = memo(function QuickNav({ items, className }: QuickNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center gap-2 p-2 bg-muted/50 rounded-lg overflow-x-auto",
        className
      )}
      aria-label="Quick navigation"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
});

// =============================================================================
// STEPPER NAVIGATION
// =============================================================================

export const Stepper = memo(function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <nav
      className={cn("w-full", className)}
      aria-label="Progress"
      role="navigation"
    >
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <li
              key={index}
              className={cn(
                "flex items-center",
                index !== steps.length - 1 && "flex-1"
              )}
            >
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick || isPending}
                className={cn(
                  "flex items-center gap-3 group",
                  onStepClick && !isPending && "cursor-pointer"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Step Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? "hsl(var(--accent))"
                      : isCurrent
                      ? "hsl(var(--accent))"
                      : "hsl(var(--muted))",
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    isCompleted && "text-accent-foreground",
                    isCurrent && "text-accent-foreground ring-2 ring-accent ring-offset-2",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="hidden sm:block text-left">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent
                        ? "text-foreground"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {/* Connector */}
              {index !== steps.length - 1 && (
                <div className="flex-1 h-px mx-4 bg-border">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    className="h-full bg-accent origin-left"
                    transition={{ duration: 0.3, delay: 0.1 }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

// =============================================================================
// PAGINATION
// =============================================================================

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisible = 5,
  className,
}: PaginationProps) {
  const getVisiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, maxVisible]);

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      {/* First Page */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
          aria-label="First page"
        >
          <ChevronLeft className="w-4 h-4" />
          <ChevronLeft className="w-4 h-4 -ml-2" />
        </Button>
      )}

      {/* Previous */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Page Numbers */}
      {getVisiblePages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className="h-8 w-8"
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Last Page */}
      {showFirstLast && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
          aria-label="Last page"
        >
          <ChevronRight className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 -ml-2" />
        </Button>
      )}
    </nav>
  );
});

// =============================================================================
// TABS NAVIGATION
// =============================================================================

export const TabsNavigation = memo(function TabsNavigation({
  tabs,
  defaultTab,
  onChange,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onChange?.(tabId);
    },
    [onChange]
  );

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn("w-full", className)}>
      {/* Tab List */}
      <div
        className="flex items-center gap-1 p-1 bg-muted rounded-lg overflow-x-auto"
        role="tablist"
        aria-label="Navigation tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

// =============================================================================
// RECENTLY VISITED
// =============================================================================

export const RecentlyVisited = memo(function RecentlyVisited({
  maxItems = 5,
  className,
}: {
  maxItems?: number;
  className?: string;
}) {
  const { history, currentIndex } = useNavigation();
  const recentItems = history
    .slice(0, currentIndex + 1)
    .reverse()
    .slice(0, maxItems);

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <History className="w-4 h-4" />
        Recently Visited
      </h3>
      <nav className="space-y-1">
        {recentItems.map((item, index) => (
          <Link
            key={`${item.path}-${index}`}
            href={item.path}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowRight className="w-3 h-3" />
            <span className="flex-1 truncate">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
});

// =============================================================================
// BOOKMARKS
// =============================================================================

export const Bookmarks = memo(function Bookmarks({
  bookmarks,
  className,
}: {
  bookmarks: { href: string; label: string; icon?: LucideIcon }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Bookmark className="w-4 h-4" />
        Bookmarks
      </h3>
      <nav className="space-y-1">
        {bookmarks.map((bookmark) => {
          const Icon = bookmark.icon || Home;
          return (
            <Link
              key={bookmark.href}
              href={bookmark.href}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 truncate">{bookmark.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
});

export default {
  NavigationProvider,
  useNavigation,
  BrowserNavigation,
  QuickNav,
  Stepper,
  Pagination,
  TabsNavigation,
  RecentlyVisited,
  Bookmarks,
};
