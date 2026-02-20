"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Annotation, GradingResult } from "@/types";
import { FeedbackTooltip } from "./FeedbackTooltip";
import { FeedbackPanel } from "./FeedbackPanel";
import { cn } from "@/lib/utils";

interface EssayHighlighterProps {
  essay: string;
  gradingResult?: GradingResult;
  readOnly?: boolean;
}

export function EssayHighlighter({ essay, gradingResult, readOnly = false }: EssayHighlighterProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const annotations = gradingResult?.annotations || [];

  const handleAnnotationClick = useCallback(
    (annotation: Annotation, event: React.MouseEvent) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2 - 160,
        y: rect.bottom + 10,
      });
      setActiveAnnotation(annotation);
    },
    []
  );

  const handleClickOutside = useCallback(() => {
    setActiveAnnotation(null);
  }, []);

  // Sort annotations by position
  const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);

  // Filter annotations
  const filteredAnnotations = filter
    ? sortedAnnotations.filter((a) => a.type === filter)
    : sortedAnnotations;

  // Render essay with highlighted annotations
  const renderEssay = () => {
    if (filteredAnnotations.length === 0) {
      return <span className="text-[#2D2D2D] leading-relaxed">{essay}</span>;
    }

    const parts: JSX.Element[] = [];
    let lastEnd = 0;

    filteredAnnotations.forEach((annotation, index) => {
      // Text before annotation
      if (annotation.start > lastEnd) {
        parts.push(
          <span key={`text-${index}`} className="text-[#2D2D2D] leading-relaxed">
            {essay.slice(lastEnd, annotation.start)}
          </span>
        );
      }

      // Highlighted annotation
      const highlightedText = essay.slice(annotation.start, annotation.end);
      const typeStyles = {
        grammar: "bg-[#D4A8A8]/30 border-b-2 border-[#D4A8A8]",
        vocabulary: "bg-[#E5D4A8]/30 border-b-2 border-[#E5D4A8]",
        style: "bg-[#A8C5D4]/30 border-b-2 border-[#A8C5D4]",
        positive: "bg-[#A8C5A8]/30 border-b-2 border-[#A8C5A8]",
        knowledge: "bg-[#A8C5A8]/30 border-b-2 border-[#A8C5A8]",
        analysis: "bg-[#E8D5C4]/30 border-b-2 border-[#E8D5C4]",
        evaluation: "bg-[#C9D6DF]/30 border-b-2 border-[#C9D6DF]",
      };

      parts.push(
        <motion.span
          key={`annotation-${annotation.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "cursor-pointer transition-all duration-200 rounded px-0.5 hover:opacity-80",
            typeStyles[annotation.type]
          )}
          onClick={(e) => handleAnnotationClick(annotation, e)}
        >
          {highlightedText}
        </motion.span>
      );

      lastEnd = annotation.end;
    });

    // Remaining text
    if (lastEnd < essay.length) {
      parts.push(
        <span key="text-end" className="text-[#2D2D2D] leading-relaxed">
          {essay.slice(lastEnd)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Essay Display */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-6"
          onClick={handleClickOutside}
        >
          <h3 className="font-semibold text-[#2D2D2D] mb-4">Your Response</h3>
          <div
            ref={containerRef}
            className="prose prose-slate max-w-none text-base leading-relaxed"
          >
            {renderEssay()}
          </div>
        </motion.div>
      </div>

      {/* Feedback Panel */}
      <div className="lg:col-span-1">
        <FeedbackPanel annotations={annotations} onFilterChange={setFilter} />
      </div>

      {/* Tooltip */}
      <FeedbackTooltip
        annotation={activeAnnotation}
        position={tooltipPosition}
        visible={!!activeAnnotation}
      />
    </div>
  );
}
