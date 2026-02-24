"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Library,
  Settings,
  GraduationCap,
  Layers,
  Brain,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

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
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      router.push("/login");
    }
  };

  // Handle keyboard navigation for tooltips
  const handleKeyDown = (e: React.KeyboardEvent, label: string) => {
    if (e.key === "Enter" || e.key === " ") {
      setTooltipVisible(label);
    }
  };

  const handleBlur = () => {
    setTooltipVisible(null);
  };

  return (
    <>
      {/* Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      <motion.aside
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-16 h-screen bg-card border-r border-border flex flex-col items-center py-4 fixed left-0 top-0 z-50"
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Logo */}
        <Link 
          href="/"
          aria-label="Sandstone Home"
          className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-8 cursor-pointer hover:shadow-soft transition-shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="text-accent-foreground font-bold text-lg" aria-hidden="true">S</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1" aria-label="Primary">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isTooltipVisible = tooltipVisible === item.label;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onFocus={() => setTooltipVisible(item.label)}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, item.label)}
                  onMouseEnter={() => setTooltipVisible(item.label)}
                  onMouseLeave={() => setTooltipVisible(null)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  
                  {/* Accessible Tooltip */}
                  <span
                    ref={tooltipRef}
                    role="tooltip"
                    className={cn(
                      "absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50 transition-opacity",
                      isTooltipVisible ? "opacity-100" : "opacity-0"
                    )}
                  >
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
            aria-label={user ? `Sign out ${user.email}` : "Sign In"}
            onFocus={() => setTooltipVisible(user ? "Sign Out" : "Sign In")}
            onBlur={handleBlur}
            onMouseEnter={() => setTooltipVisible(user ? "Sign Out" : "Sign In")}
            onMouseLeave={() => setTooltipVisible(null)}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {user ? (
              <div className="relative">
                <div 
                  className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-xs font-bold text-accent-foreground">
                    {user.email?.[0].toUpperCase() || "U"}
                  </span>
                </div>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card"
                  aria-hidden="true"
                />
              </div>
            ) : (
              <LogIn className="w-5 h-5" aria-hidden="true" />
            )}
            
            {/* Tooltip */}
            <span
              role="tooltip"
              className={cn(
                "absolute left-14 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-50 transition-opacity",
                tooltipVisible === (user ? "Sign Out" : "Sign In") ? "opacity-100" : "opacity-0"
              )}
            >
              {user ? "Sign Out" : "Sign In"}
            </span>
          </button>
        </motion.div>
      </motion.aside>
    </>
  );
}
