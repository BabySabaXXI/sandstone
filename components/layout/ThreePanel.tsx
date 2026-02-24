"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

interface ThreePanelProps {
  children: ReactNode;
  className?: string;
}

export function ThreePanel({ children, className }: ThreePanelProps) {
  const { isMobile } = useMobile();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Fixed 64px, hidden on mobile */}
      <Sidebar />

      {/* Main Content - Flexible */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={cn(
          "flex-1 overflow-auto",
          // On desktop, add margin for sidebar
          "lg:ml-16",
          // On mobile, add padding at bottom for navigation
          isMobile && "pb-20",
          className
        )}
      >
        <div className={cn(
          "min-h-full",
          // Responsive padding
          isMobile ? "px-4 py-4" : "p-6"
        )}>
          {children}
        </div>
      </motion.main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNavigation />}
    </div>
  );
}

export default ThreePanel;
