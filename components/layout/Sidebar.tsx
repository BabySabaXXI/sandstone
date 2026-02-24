"use client";

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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useState } from "react";
import { useSwipe } from "@/hooks/useSwipe";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: GraduationCap, label: "Grade", href: "/grade" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Layers, label: "Flashcards", href: "/flashcards" },
  { icon: Brain, label: "Quiz", href: "/quiz" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      router.push("/login");
    }
  };

  // Swipe to close mobile menu
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => setIsMobileMenuOpen(false),
    threshold: 50,
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex w-16 h-screen bg-card border-r border-border flex-col items-center py-4 fixed left-0 top-0 z-50"
      >
        {/* Logo */}
        <Link href="/">
          <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-accent flex items-center justify-center mb-8 cursor-pointer hover:shadow-soft transition-shadow touch-manipulation">
            <span className="text-accent-foreground font-bold text-lg">S</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all duration-200 group relative touch-manipulation",
                    "active:scale-95",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
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
            className={cn(
              "w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all duration-200 group relative touch-manipulation",
              "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
            )}
            aria-label={user ? "Sign Out" : "Sign In"}
          >
            {user ? (
              <div className="relative">
                <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-accent flex items-center justify-center">
                  <span className="text-xs font-bold text-accent-foreground">
                    {user.email?.[0].toUpperCase() || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            
            {/* Tooltip */}
            <span className="absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {user ? "Sign Out" : "Sign In"}
            </span>
          </button>
        </motion.div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={cn(
          "lg:hidden fixed top-4 left-4 z-40 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl",
          "bg-card border border-border shadow-soft",
          "flex items-center justify-center touch-manipulation active:scale-95"
        )}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border z-50"
            {...swipeHandlers}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl bg-accent flex items-center justify-center">
                    <span className="text-accent-foreground font-bold text-lg">S</span>
                  </div>
                  <span className="font-semibold text-lg">Sandstone</span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl",
                  "flex items-center justify-center touch-manipulation active:scale-95",
                  "hover:bg-secondary transition-colors"
                )}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 min-h-[52px] rounded-xl transition-all duration-200 touch-manipulation",
                        "active:scale-[0.98]",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="mobileNavIndicator"
                          className="ml-auto w-2 h-2 rounded-full bg-accent-foreground"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <button
                onClick={() => {
                  handleAuthClick();
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 min-h-[52px] rounded-xl transition-all duration-200 touch-manipulation",
                  "active:scale-[0.98]",
                  "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {user ? (
                  <>
                    <div className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-accent flex items-center justify-center">
                      <span className="text-xs font-bold text-accent-foreground">
                        {user.email?.[0].toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </>
  );
}

export default Sidebar;
