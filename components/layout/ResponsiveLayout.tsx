"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  showSidebar?: boolean;
  showMobileNav?: boolean;
}

export function ResponsiveLayout({
  children,
  className,
  showSidebar = true,
  showMobileNav = true,
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet } = useMobile();
  const showDesktopSidebar = showSidebar && !isMobile;
  const showBottomNav = showMobileNav && isMobile;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      {showDesktopSidebar && <Sidebar />}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex-1 overflow-auto",
          showDesktopSidebar ? "ml-16" : "ml-0",
          showBottomNav && "pb-24", // Space for bottom nav
          className
        )}
      >
        <div className={cn(
          "min-h-screen",
          isMobile ? "px-4 py-4" : "p-6"
        )}>
          {children}
        </div>
      </motion.main>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileNavigation />}
    </div>
  );
}

export default ResponsiveLayout;
