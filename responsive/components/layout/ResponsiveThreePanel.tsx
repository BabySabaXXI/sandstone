"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ResponsiveSidebar } from "./ResponsiveSidebar";
import { MobileNavigation } from "./MobileNavigation";
import { cn } from "@/lib/utils";

interface ResponsiveThreePanelProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function ResponsiveThreePanel({
  children,
  className,
  fullWidth = false,
}: ResponsiveThreePanelProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Responsive */}
      <ResponsiveSidebar />

      {/* Main Content - Flexible */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={cn(
          "flex-1 min-h-screen",
          "lg:ml-16", // Account for collapsed sidebar on desktop
          "overflow-x-hidden"
        )}
      >
        <div
          className={cn(
            "min-h-screen pb-20 lg:pb-6", // Add padding for mobile nav
            fullWidth ? "px-0" : "px-4 sm:px-6 lg:px-8",
            className
          )}
        >
          {children}
        </div>
      </motion.main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
