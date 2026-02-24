"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MultipleChoiceQuestion as MultipleChoiceQuestionType } from "@/lib/quiz/quiz-types";

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestionType;
  value?: string;
  onChange: (value: string) => void;
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => (
        <motion.button
          key={option}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onChange(option)}
          className={cn(
            "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
            value === option
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                value === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30"
              )}
            >
              {value === option && <Check className="w-4 h-4" />}
            </div>
            <span className="flex-1">{option}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
