"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { AIPopup, AIToggleButton } from "./AIPopup";
import { useLayoutStore } from "@/stores/layout-store";

interface ThreePanelProps {
  children: ReactNode;
}

export function ThreePanel({ children }: ThreePanelProps) {
  const { aiPopupOpen } = useLayoutStore();

  return (
    <div className="flex h-screen bg-[#F5F5F0]">
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

      {/* AI Popup - Floating Notion-style */}
      <AnimatePresence>
        {aiPopupOpen && <AIPopup />}
      </AnimatePresence>

      {/* AI Toggle Button */}
      <AIToggleButton />
    </div>
  );
}
