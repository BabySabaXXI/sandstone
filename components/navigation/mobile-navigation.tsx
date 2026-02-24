"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Library,
  GraduationCap,
  Settings,
  Menu,
  X,
  Layers,
  Sparkles,
  User,
  Bell,
  Search,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  isNew?: boolean;
  shortcut?: string;
}

interface MobileNavSection {
  title: string;
  items: MobileNavItem[];
}

interface MobileNavigationProps {
  user?: {
    email?: string;
    name?: string;
    avatar?: string;
  };
  notificationCount?: number;
  onSearch?: () => void;
  onNavigate?: (path: string) => void;
}

interface BottomNavProps {
  items?: MobileNavItem[];
  activeIndex?: number;
  onItemClick?: (index: number) => void;
}

// =============================================================================
// NAVIGATION DATA
// =============================================================================

const mainNavSections: MobileNavSection[] = [
  {
    title: "Main",
    items: [
      { href: "/", label: "Dashboard", icon: Home },
      { href: "/grade", label: "AI Grading", icon: GraduationCap, badge: "New", isNew: true },
      { href: "/flashcards", label: "Flashcards", icon: Layers },
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/quiz", label: "Quiz", icon: Sparkles },
      { href: "/library", label: "Library", icon: Library },
    ],
  },
];

const bottomNavItems: MobileNavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/grade", label: "Grade", icon: GraduationCap },
  { href: "/flashcards", label: "Cards", icon: Layers },
  { href: "/documents", label: "Docs", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

// =============================================================================
// MOBILE DRAWER NAVIGATION
// =============================================================================

const MobileDrawerItem = memo(function MobileDrawerItem({
  item,
  isActive,
  onClick,
}: {
  item: MobileNavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-muted"
      )}
    >
      <div className="relative">
        <Icon className="w-6 h-6" />
        {item.isNew && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-background" />
        )}
      </div>

      <span className="flex-1 text-base font-medium">{item.label}</span>

      {item.badge && (
        <Badge
          variant="secondary"
          className="bg-amber-500/20 text-amber-600 dark:text-amber-400"
        >
          {item.badge}
        </Badge>
      )}

      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </Link>
  );
});

export const MobileDrawer = memo(function MobileDrawer({
  user,
  notificationCount = 0,
  onSearch,
  onNavigate,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleNavigate = useCallback(
    (path: string) => {
      onNavigate?.(path);
      setIsOpen(false);
    },
    [onNavigate]
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => handleNavigate("/")}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-lg font-bold">Sandstone</span>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div
              className="relative"
              onClick={() => {
                onSearch?.();
                setIsOpen(false);
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-10 bg-muted border-0"
                readOnly
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6" aria-label="Mobile">
            {mainNavSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                {section.items.map((item) => (
                  <MobileDrawerItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    onClick={() => handleNavigate(item.href)}
                  />
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Link
              href="/settings"
              onClick={() => handleNavigate("/settings")}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              <Settings className="w-6 h-6" />
              <span className="flex-1 text-base font-medium">Settings</span>
            </Link>

            <Separator className="my-3" />

            {/* User Profile */}
            <div className="flex items-center gap-3 px-4 py-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name || user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

// =============================================================================
// BOTTOM NAVIGATION BAR
// =============================================================================

export const BottomNavigation = memo(function BottomNavigation({
  items = bottomNavItems,
  activeIndex,
  onItemClick,
}: BottomNavProps) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentIndex =
    activeIndex ??
    items.findIndex(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t lg:hidden z-50 safe-area-pb"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentIndex === index;
          const isHovered = hoveredIndex === index;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onItemClick?.(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                isActive
                  ? "text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon Container */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {/* Badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <motion.span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-all",
                  isActive && "text-accent-foreground"
                )}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

// =============================================================================
// MOBILE HEADER
// =============================================================================

export const MobileHeader = memo(function MobileHeader({
  user,
  notificationCount = 0,
  onMenuClick,
  onSearchClick,
  onNotificationClick,
  title,
  showBackButton,
  onBackClick,
}: {
  user?: {
    email?: string;
    name?: string;
    avatar?: string;
  };
  notificationCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}) {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background border-b">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              aria-label="Go back"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
          ) : (
            <MobileDrawer user={user} notificationCount={notificationCount} />
          )}

          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationClick}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          <Link href="/profile" className="ml-1">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
});

// =============================================================================
// COMBINED MOBILE NAVIGATION
// =============================================================================

export const MobileNavigation = memo(function MobileNavigation({
  user,
  notificationCount,
  onSearch,
  onNavigate,
  headerTitle,
  showBackButton,
  onBackClick,
  children,
}: MobileNavigationProps & {
  headerTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="lg:hidden">
      <MobileHeader
        user={user}
        notificationCount={notificationCount}
        onSearchClick={onSearch}
        title={headerTitle}
        showBackButton={showBackButton}
        onBackClick={onBackClick}
      />

      <main className="pb-20">{children}</main>

      <BottomNavigation
        onItemClick={(index) => onNavigate?.(bottomNavItems[index].href)}
      />
    </div>
  );
});

export default MobileNavigation;
