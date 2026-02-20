"use client";

import { motion } from "framer-motion";
import { Annotation } from "@/types";
import { AnnotationBadge } from "./Annotation";
import { MessageSquare, Filter, Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  annotations: Annotation[];
  onFilterChange?: (filter: string | null) => void;
}

export function FeedbackPanel({ annotations, onFilterChange }: FeedbackPanelProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleFilter = (type: string | null) => {
    setActiveFilter(type);
    onFilterChange?.(type);
  };

  const counts = {
    grammar: annotations.filter((a) => a.type === "grammar").length,
    vocabulary: annotations.filter((a) => a.type === "vocabulary").length,
    style: annotations.filter((a) => a.type === "style").length,
    positive: annotations.filter((a) => a.type === "positive").length,
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8A8A8A]" />
          <h3 className="font-semibold text-[#2D2D2D]">Feedback</h3>
          <span className="bg-[#F0F0EC] text-[#5A5A5A] text-xs px-2 py-0.5 rounded-full">
            {annotations.length}
          </span>
        </div>
        <button className="flex items-center gap-1 text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors text-sm">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-[#8A8A8A]" />
        <button
          onClick={() => handleFilter(null)}
          className={cn(
            "px-3 py-1 rounded-full text-xs transition-colors",
            activeFilter === null
              ? "bg-[#2D2D2D] text-white"
              : "bg-[#F0F0EC] text-[#5A5A5A] hover:bg-[#E5E5E0]"
          )}
        >
          All
        </button>
        {Object.entries(counts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => handleFilter(type)}
            className={cn(
              "px-3 py-1 rounded-full text-xs transition-colors flex items-center gap-1",
              activeFilter === type
                ? "bg-[#2D2D2D] text-white"
                : "bg-[#F0F0EC] text-[#5A5A5A] hover:bg-[#E5E5E0]"
            )}
          >
            <span className="capitalize">{type}</span>
            <span className="text-[#8A8A8A]">{count}</span>
          </button>
        ))}
      </div>

      {/* Annotation List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {annotations
          .filter((a) => !activeFilter || a.type === activeFilter)
          .map((annotation, index) => (
            <motion.div
              key={annotation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E0] hover:border-[#D5D5D0] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <AnnotationBadge type={annotation.type} />
              </div>
              <p className="text-[#2D2D2D] text-sm mt-2">{annotation.message}</p>
              {annotation.suggestion && (
                <p className="text-[#5A5A5A] text-xs mt-2 italic">
                  Suggestion: {annotation.suggestion}
                </p>
              )}
            </motion.div>
          ))}

        {annotations.filter((a) => !activeFilter || a.type === activeFilter).length === 0 && (
          <div className="text-center py-8 text-[#8A8A8A]">
            <p>No feedback items match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
