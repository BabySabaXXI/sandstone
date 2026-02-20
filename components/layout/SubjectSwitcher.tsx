"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubjectStore } from "@/stores/subject-store";
import { subjects, getSubjectConfig } from "@/lib/subjects/config";
import { Subject } from "@/types";
import { ChevronDown, TrendingUp, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  TrendingUp,
  Globe,
};

export function SubjectSwitcher() {
  const { currentSubject, setSubject } = useSubjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentConfig = getSubjectConfig(currentSubject);
  const CurrentIcon = currentConfig ? iconMap[currentConfig.icon as keyof typeof iconMap] : TrendingUp;

  const handleSelect = (subjectId: Subject) => {
    setSubject(subjectId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E5E5E0] transition-colors"
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${currentConfig?.color}30` }}
        >
          <CurrentIcon className="w-3.5 h-3.5" style={{ color: currentConfig?.color }} />
        </div>
        <span className="text-sm font-medium text-[#2D2D2D]">{currentConfig?.name}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[#8A8A8A] transition-transform",
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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-[#E5E5E0] shadow-lg z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-[#8A8A8A] px-3 py-2 font-medium uppercase tracking-wider">
                  Select Subject
                </p>
                {subjects.map((subject) => {
                  const Icon = iconMap[subject.icon as keyof typeof iconMap] || TrendingUp;
                  const isActive = currentSubject === subject.id;

                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSelect(subject.id as Subject)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-[#F5F5F0]"
                          : "hover:bg-[#FAFAF8]"
                      )}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${subject.color}30` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: subject.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={cn(
                          "font-medium text-sm",
                          isActive ? "text-[#2D2D2D]" : "text-[#5A5A5A]"
                        )}>
                          {subject.name}
                        </p>
                        <p className="text-xs text-[#8A8A8A]">{subject.examBoard}</p>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-[#A8C5A8]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#E5E5E0] p-3 bg-[#FAFAF8]">
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
