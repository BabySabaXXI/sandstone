"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Annotation } from "@/types";
import { AnnotationBadge } from "./Annotation";
import { Lightbulb, MessageCircle, Check } from "lucide-react";

interface FeedbackTooltipProps {
  annotation: Annotation | null;
  position: { x: number; y: number };
  visible: boolean;
}

const typeIcons = {
  grammar: MessageCircle,
  vocabulary: Lightbulb,
  style: MessageCircle,
  positive: Check,
};

export function FeedbackTooltip({ annotation, position, visible }: FeedbackTooltipProps) {
  if (!annotation) return null;

  const Icon = typeIcons[annotation.type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            zIndex: 100,
          }}
          className="w-80 bg-white rounded-xl shadow-card-hover border border-[#E5E5E0] p-4"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                annotation.type === "grammar"
                  ? "bg-[#D4A8A8]/20"
                  : annotation.type === "vocabulary"
                  ? "bg-[#E5D4A8]/20"
                  : annotation.type === "style"
                  ? "bg-[#A8C5D4]/20"
                  : "bg-[#A8C5A8]/20"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  annotation.type === "grammar"
                    ? "text-[#D4A8A8]"
                    : annotation.type === "vocabulary"
                    ? "text-[#E5D4A8]"
                    : annotation.type === "style"
                    ? "text-[#A8C5D4]"
                    : "text-[#A8C5A8]"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AnnotationBadge type={annotation.type} />
              </div>
              <p className="text-[#2D2D2D] text-sm">{annotation.message}</p>
              {annotation.suggestion && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E0]">
                  <p className="text-[#8A8A8A] text-xs mb-1">Suggestion:</p>
                  <p className="text-[#5A5A5A] text-sm italic">{annotation.suggestion}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
