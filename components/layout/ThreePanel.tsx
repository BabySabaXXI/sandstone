"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";

interface ThreePanelProps {
  children: ReactNode;
}

export function ThreePanel({ children }: ThreePanelProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Fixed 64px */}
      <Sidebar />

      {/* Main Content - Flexible */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 ml-16 overflow-auto"
      >
        <div className="p-6 min-h-screen">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
