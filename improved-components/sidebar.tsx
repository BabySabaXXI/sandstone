"use client";

import { memo, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Library,
  Settings,
  GraduationCap,
  Layers,
  Brain,
  LogIn,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

// =============================================================================
// STATIC DATA (Outside component to prevent recreation)
// =============================================================================

const NAV_ITEMS: readonly NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "Grade", href: "/grade" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Layers, label: "Flashcards", href: "/flashcards" },
  { icon: Brain, label: "Quiz", href: "/quiz" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Settings, label: "Settings", href: "/settings" },
] as const;

const SIDEBAR_ANIMATION = {
  initial: { x: -64 },
  animate: { x: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
} as const;

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  index: number;
}

const NavItemComponent = memo(function NavItemComponent({
  item,
  isActive,
  index,
}: NavItemProps) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 + 0.2 }}
    >
      <Link
        href={item.href}
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
          isActive
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />

        {/* Tooltip */}
        <span className="absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {item.label}
        </span>
      </Link>
    </motion.div>
  );
});

interface UserAvatarProps {
  email: string | undefined;
}

const UserAvatar = memo(function UserAvatar({ email }: UserAvatarProps) {
  const initial = email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="relative">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
        <span className="text-xs font-bold text-accent-foreground">{initial}</span>
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Memoize auth click handler
  const handleAuthClick = useCallback(() => {
    if (user) {
      signOut();
    } else {
      router.push("/login");
    }
  }, [user, signOut, router]);

  // Memoize auth tooltip text
  const authTooltip = useMemo(
    () => (user ? "Sign Out" : "Sign In"),
    [user]
  );

  return (
    <motion.aside
      {...SIDEBAR_ANIMATION}
      className="w-16 h-screen bg-card border-r border-border flex flex-col items-center py-4 fixed left-0 top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link href="/" aria-label="Go to homepage">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-8 cursor-pointer hover:shadow-soft transition-shadow">
          <span className="text-accent-foreground font-bold text-lg">S</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Primary">
        {NAV_ITEMS.map((item, index) => (
          <NavItemComponent
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            index={index}
          />
        ))}
      </nav>

      {/* Auth Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto"
      >
        <button
          onClick={handleAuthClick}
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={authTooltip}
        >
          {user ? (
            <UserAvatar email={user.email} />
          ) : (
            <LogIn className="w-5 h-5" aria-hidden="true" />
          )}

          {/* Tooltip */}
          <span className="absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {authTooltip}
          </span>
        </button>
      </motion.div>
    </motion.aside>
  );
});

export default Sidebar;
