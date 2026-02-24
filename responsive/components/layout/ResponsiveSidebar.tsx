"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Layers,
  GraduationCap,
  Brain,
  Settings,
  Menu,
  X,
  BookOpen,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: GraduationCap, label: "Grade", href: "/grade" },
  { icon: Layers, label: "Flashcards", href: "/flashcards" },
  { icon: Brain, label: "Quiz", href: "/quiz" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: BookOpen, label: "Library", href: "/library" },
];

const bottomItems: NavItem[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface ResponsiveSidebarProps {
  className?: string;
}

export function ResponsiveSidebar({ className }: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-4 left-4 z-dropdown p-2 rounded-xl",
          "bg-white dark:bg-[#1A1A1A] shadow-mobile border border-[#E8E8E3] dark:border-[#2A2A2A]",
          "lg:hidden touch-target-sm flex items-center justify-center",
          "active:scale-95 transition-transform duration-150"
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-[#2D2D2D] dark:text-white" />
          ) : (
            <Menu className="w-5 h-5 text-[#2D2D2D] dark:text-white" />
          )}
        </motion.div>
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -280) : 0,
          width: isMobile ? 280 : 64,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-modal",
          "bg-white dark:bg-[#1A1A1A]",
          "border-r border-[#E8E8E3] dark:border-[#2A2A2A]",
          "flex flex-col",
          "lg:relative lg:transform-none",
          className
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[#E8E8E3] dark:border-[#2A2A2A]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-[#2D2D2D]">S</span>
            </div>
            {/* Expanded logo text (mobile drawer only) */}
            <AnimatePresence>
              {isOpen && isMobile && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-semibold text-[#2D2D2D] dark:text-white text-lg"
                >
                  Sandstone
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  "touch-target-sm",
                  isActive
                    ? "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10 text-[#2D2D2D] dark:text-white"
                    : "text-[#5A5A5A] dark:text-[#A0A0A0] hover:bg-[#F5F5F0] dark:hover:bg-[#2A2A2A]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive && "text-[#E8D5C4]"
                  )}
                />
                {/* Label (visible in mobile drawer) */}
                <AnimatePresence>
                  {isOpen && isMobile && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Badge */}
                {item.badge && isOpen && isMobile && (
                  <span className="ml-auto bg-[#E8D5C4] text-[#2D2D2D] text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {/* Active indicator (desktop collapsed) */}
                {isActive && !isOpen && (
                  <div className="absolute left-0 w-1 h-6 bg-[#E8D5C4] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="py-4 px-2 border-t border-[#E8E8E3] dark:border-[#2A2A2A] space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  "touch-target-sm",
                  isActive
                    ? "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10 text-[#2D2D2D] dark:text-white"
                    : "text-[#5A5A5A] dark:text-[#A0A0A0] hover:bg-[#F5F5F0] dark:hover:bg-[#2A2A2A]"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && isMobile && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* User Section */}
          {user && (
            <div className="pt-2 border-t border-[#E8E8E3] dark:border-[#2A2A2A] mt-2">
              <button
                onClick={handleSignOut}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
                  "text-[#5A5A5A] dark:text-[#A0A0A0] hover:bg-[#F5F5F0] dark:hover:bg-[#2A2A2A]",
                  "transition-all duration-200 touch-target-sm"
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && isMobile && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm"
                    >
                      Sign Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
