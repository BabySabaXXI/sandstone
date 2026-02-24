"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubjectStore } from "@/stores/subject-store";
import { subjects, getSubjectConfig } from "@/lib/subjects/config";
import { Subject } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import { TrendingUp, Globe, Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  TrendingUp,
  Globe,
};

export function ResponsiveSubjectSwitcher() {
  const { currentSubject, setSubject } = useSubjectStore();
  const { isMobile, isTablet } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = getSubjectConfig(currentSubject);
  const CurrentIcon = currentConfig
    ? iconMap[currentConfig.icon as keyof typeof iconMap]
    : TrendingUp;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (subjectId: Subject) => {
    setSubject(subjectId);
    setIsOpen(false);
  };

  // Mobile/Tablet: Full screen bottom sheet
  if ((isMobile || isTablet) && isOpen) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-modal bg-white dark:bg-[#1A1A1A] rounded-t-3xl overflow-hidden"
          style={{
            maxHeight: "80vh",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Handle */}
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[#E5E5E0] dark:bg-[#3D3D3D] rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E8E3] dark:border-[#2A2A2A]">
            <h3 className="font-semibold text-[#2D2D2D] dark:text-white">
              Select Subject
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#2A2A2A] rounded-lg touch-target-sm"
            >
              <X className="w-5 h-5 text-[#8A8A8A]" />
            </button>
          </div>

          {/* Subject List */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
            {subjects.map((subject) => {
              const Icon =
                iconMap[subject.icon as keyof typeof iconMap] || TrendingUp;
              const isActive = currentSubject === subject.id;

              return (
                <motion.button
                  key={subject.id}
                  onClick={() => handleSelect(subject.id as Subject)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl transition-colors",
                    isActive
                      ? "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10 border-2 border-[#E8D5C4]/50"
                      : "bg-[#F5F5F0] dark:bg-[#2A2A2A] border-2 border-transparent hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D]"
                  )}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${subject.color}30` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: subject.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={cn(
                        "font-semibold",
                        isActive
                          ? "text-[#2D2D2D] dark:text-white"
                          : "text-[#5A5A5A] dark:text-[#A0A0A0]"
                      )}
                    >
                      {subject.name}
                    </p>
                    <p className="text-sm text-[#8A8A8A]">
                      {subject.examBoard} • {subject.level}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-8 h-8 rounded-full bg-[#E8D5C4] flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#2D2D2D]" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E8E8E3] dark:border-[#2A2A2A] bg-[#FAFAF8] dark:bg-[#141414]">
            <p className="text-sm text-[#8A8A8A] text-center">
              More subjects coming soon
            </p>
          </div>
        </motion.div>
      </>
    );
  }

  // Desktop: Dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl",
          "bg-[#F5F5F0] hover:bg-[#E5E5E0] dark:bg-[#2A2A2A] dark:hover:bg-[#3D3D3D]",
          "transition-colors touch-target-sm"
        )}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${currentConfig?.color}30` }}
        >
          <CurrentIcon
            className="w-3.5 h-3.5"
            style={{ color: currentConfig?.color }}
          />
        </div>
        <span className="text-sm font-medium text-[#2D2D2D] dark:text-white">
          {currentConfig?.name}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#8A8A8A] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-dropdown"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#E5E5E0] dark:border-[#2A2A2A] shadow-soft-lg z-dropdown overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-[#8A8A8A] px-3 py-2 font-medium uppercase tracking-wider">
                  Select Subject
                </p>
                {subjects.map((subject) => {
                  const Icon =
                    iconMap[subject.icon as keyof typeof iconMap] || TrendingUp;
                  const isActive = currentSubject === subject.id;

                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSelect(subject.id as Subject)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target-sm",
                        isActive
                          ? "bg-[#F5F5F0] dark:bg-[#2A2A2A]"
                          : "hover:bg-[#FAFAF8] dark:hover:bg-[#141414]"
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${subject.color}30` }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: subject.color }}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={cn(
                            "font-medium text-sm",
                            isActive
                              ? "text-[#2D2D2D] dark:text-white"
                              : "text-[#5A5A5A] dark:text-[#A0A0A0]"
                          )}
                        >
                          {subject.name}
                        </p>
                        <p className="text-xs text-[#8A8A8A]">
                          {subject.examBoard}
                        </p>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-[#A8C5A8]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#E5E5E0] dark:border-[#2A2A2A] p-3 bg-[#FAFAF8] dark:bg-[#141414]">
                <p className="text-xs text-[#8A8A8A] text-center">
                  More subjects coming soon
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
