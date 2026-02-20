"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Annotation as AnnotationType } from "@/types";

interface AnnotationProps {
  annotation: AnnotationType;
  isActive?: boolean;
  onClick?: () => void;
}

const typeStyles = {
  grammar: "bg-[#D4A8A8]/30 border-[#D4A8A8] hover:bg-[#D4A8A8]/50",
  vocabulary: "bg-[#E5D4A8]/30 border-[#E5D4A8] hover:bg-[#E5D4A8]/50",
  style: "bg-[#A8C5D4]/30 border-[#A8C5D4] hover:bg-[#A8C5D4]/50",
  positive: "bg-[#A8C5A8]/30 border-[#A8C5A8] hover:bg-[#A8C5A8]/50",
};

const typeLabels = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  style: "Style",
  positive: "Good Usage",
};

export function Annotation({ annotation, isActive, onClick }: AnnotationProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "cursor-pointer border-b-2 transition-all duration-200 rounded px-0.5",
        typeStyles[annotation.type],
        isActive && "bg-opacity-70"
      )}
      onClick={onClick}
      title={annotation.message}
    >
      {/* The annotated text is rendered by parent */}
    </motion.span>
  );
}

export function AnnotationBadge({ type }: { type: AnnotationType["type"] }) {
  const styles = {
    grammar: "bg-[#D4A8A8]/20 text-[#8B5A5A] border-[#D4A8A8]/50",
    vocabulary: "bg-[#E5D4A8]/20 text-[#8B7A4A] border-[#E5D4A8]/50",
    style: "bg-[#A8C5D4]/20 text-[#4A6A7A] border-[#A8C5D4]/50",
    positive: "bg-[#A8C5A8]/20 text-[#4A6A4A] border-[#A8C5A8]/50",
  };

  return (
    <span
      className={cn(
        "text-xs px-2 py-0.5 rounded-full border font-medium",
        styles[type]
      )}
    >
      {typeLabels[type]}
    </span>
  );
}
