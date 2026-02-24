"use client";

import { useState, useCallback, memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import {
  Home,
  FileText,
  Library,
  GraduationCap,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  Sparkles,
  ChevronDown,
  BookOpen,
  History,
  Star,
  Search,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// =============================================================================
// TYPES
// =============================================================================

type NavItemVariant = "default" | "active" | "pending";

interface NavSubItem {
  href: string;
  label: string;
  badge?: string;
  isNew?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  isNew?: boolean;
  description?: string;
  subItems?: NavSubItem[];
  shortcut?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface WayfindingState {
  currentPath: string;
  previousPath: string | null;
  navigationHistory: string[];
}

interface EnhancedSidebarProps {
  user: User;
  onNavigate?: (path: string) => void;
  defaultCollapsed?: boolean;
}

// =============================================================================
// NAVIGATION DATA
// =============================================================================

const mainNavSections: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: Home,
        shortcut: "⌘D",
      },
      {
        href: "/grade",
        label: "AI Grading",
        icon: GraduationCap,
        badge: "New",
        isNew: true,
        description: "Get AI-powered feedback on your responses",
        shortcut: "⌘G",
      },
      {
        href: "/flashcards",
        label: "Flashcards",
        icon: Layers,
        description: "Study with spaced repetition",
        shortcut: "⌘F",
      },
      {
        href: "/documents",
        label: "Documents",
        icon: FileText,
        description: "Manage your study materials",
        subItems: [
          { href: "/documents/recent", label: "Recent", icon: History },
          { href: "/documents/starred", label: "Starred", icon: Star },
        ] as NavSubItem[],
        shortcut: "⌘O",
      },
      {
        href: "/quiz",
        label: "Quiz",
        icon: Sparkles,
        description: "Test your knowledge",
        shortcut: "⌘Q",
      },
      {
        href: "/library",
        label: "Library",
        icon: Library,
        description: "Browse study resources",
        shortcut: "⌘L",
      },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { href: "/help", label: "Help & Support", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings, shortcut: "⌘," },
];

// =============================================================================
// WAYFINDING STORE (Hook)
// =============================================================================

function useWayfinding() {
  const [state, setState] = useState<WayfindingState>({
    currentPath: "",
    previousPath: null,
    navigationHistory: [],
  });

  const navigate = useCallback((path: string) => {
    setState((prev) => ({
      currentPath: path,
      previousPath: prev.currentPath,
      navigationHistory: [...prev.navigationHistory.slice(-9), path],
    }));
  }, []);

  const canGoBack = state.navigationHistory.length > 1;

  const goBack = useCallback(() => {
    if (canGoBack) {
      const newHistory = [...state.navigationHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      setState((prev) => ({
        ...prev,
        currentPath: previousPath,
        previousPath: prev.currentPath,
        navigationHistory: newHistory,
      }));
      return previousPath;
    }
    return null;
  }, [canGoBack, state.navigationHistory]);

  return {
    ...state,
    navigate,
    goBack,
    canGoBack,
  };
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const NavItemIcon = memo(function NavItemIcon({
  icon: Icon,
  isActive,
  isNew,
}: {
  icon: LucideIcon;
  isActive: boolean;
  isNew?: boolean;
}) {
  return (
    <div className="relative">
      <Icon
        className={cn(
          "w-5 h-5 flex-shrink-0 transition-colors",
          isActive && "text-accent-foreground"
        )}
      />
      {isNew && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      )}
    </div>
  );
});

const WayfindingIndicator = memo(function WayfindingIndicator({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending?: boolean;
}) {
  if (!isActive && !isPending) return null;

  return (
    <motion.div
      layoutId="wayfindingIndicator"
      className={cn(
        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
        isActive && "bg-accent",
        isPending && "bg-amber-500"
      )}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  );
});

const ActiveBackground = memo(function ActiveBackground() {
  return (
    <motion.div
      layoutId="activeBackground"
      className="absolute inset-0 bg-accent rounded-lg -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  );
});

const NavLink = memo(function NavLink({
  item,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: (path: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const linkContent = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive
          ? "text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {isActive && <ActiveBackground />}
      <WayfindingIndicator isActive={isActive} />

      <NavItemIcon icon={item.icon} isActive={isActive} isNew={item.isNew} />

      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">
            {item.label}
          </span>

          {item.badge && (
            <Badge
              variant="secondary"
              className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30"
            >
              {item.badge}
            </Badge>
          )}

          {item.shortcut && (
            <kbd className="hidden xl:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              {item.shortcut}
            </kbd>
          )}

          {hasSubItems && (
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </>
      )}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            onClick={() => onNavigate?.(item.href)}
            className="block"
          >
            {linkContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{item.label}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400"
            >
              {item.badge}
            </Badge>
          )}
          {item.shortcut && (
            <kbd className="ml-2 h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              {item.shortcut}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (hasSubItems) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">{linkContent}</button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-4"
              >
                {item.subItems?.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={() => onNavigate?.(subItem.href)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                  >
                    <span className="flex-1">{subItem.label}</span>
                    {subItem.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {subItem.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={() => onNavigate?.(item.href)}
      className="block"
    >
      {linkContent}
    </Link>
  );
});

const SearchInput = memo(function SearchInput({
  isCollapsed,
}: {
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="w-full">
            <Search className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">Search (⌘K)</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-9 h-9 bg-muted border-0"
        readOnly
        onClick={() => {
          // Trigger command palette
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", metaKey: true })
          );
        }}
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </div>
  );
});

const UserProfile = memo(function UserProfile({
  user,
  isCollapsed,
  onSignOut,
}: {
  user: User;
  isCollapsed: boolean;
  onSignOut: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex justify-center w-full"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="font-medium">
            {user.user_metadata?.full_name || user.email?.split("@")[0]}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
          {user.email?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {user.user_metadata?.full_name || user.email?.split("@")[0]}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={onSignOut}
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const EnhancedSidebar = memo(function EnhancedSidebar({
  user,
  onNavigate,
  defaultCollapsed = false,
}: EnhancedSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const wayfinding = useWayfinding();
  const supabase = createClient();

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, [supabase]);

  const handleNavigate = useCallback(
    (path: string) => {
      wayfinding.navigate(path);
      onNavigate?.(path);
      setIsMobileOpen(false);
    },
    [wayfinding, onNavigate]
  );

  // Memoize active states
  const activeStates = useMemo(() => {
    const states: Record<string, boolean> = {};
    mainNavSections.forEach((section) => {
      section.items.forEach((item) => {
        states[item.href] =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        item.subItems?.forEach((subItem) => {
          states[subItem.href] = pathname === subItem.href;
        });
      });
    });
    return states;
  }, [pathname]);

  const sidebarContent = (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {!isCollapsed && <span className="text-lg font-bold">Sandstone</span>}
          </Link>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className={cn("p-3", isCollapsed && "px-2")}>
          <SearchInput isCollapsed={isCollapsed} />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6" aria-label="Main">
          {mainNavSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={activeStates[item.href]}
                  isCollapsed={isCollapsed}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={activeStates[item.href]}
              isCollapsed={isCollapsed}
              onNavigate={handleNavigate}
            />
          ))}

          <Separator className="my-3" />

          {/* User Profile */}
          <UserProfile
            user={user}
            isCollapsed={isCollapsed}
            onSignOut={handleSignOut}
          />
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r z-50 lg:hidden"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-background transition-all duration-300 h-screen sticky top-0",
          isCollapsed ? "w-16" : "w-64"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="m-2"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        {sidebarContent}
      </aside>
    </>
  );
});

export default EnhancedSidebar;
