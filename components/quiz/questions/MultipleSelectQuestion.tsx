"use client";

import { motion } from "framer-motion";
import { Check, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { MultipleSelectQuestion as MultipleSelectQuestionType } from "@/lib/quiz/quiz-types";

interface MultipleSelectQuestionProps {
  question: MultipleSelectQuestionType;
  value?: string[];
  onChange: (value: string[]) => void;
}

export function MultipleSelectQuestion({
  question,
  value = [],
  onChange,
}: MultipleSelectQuestionProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Select all that apply ({question.correctAnswers.length} correct answers)
      </p>
      {question.options.map((option, index) => {
        const isSelected = value.includes(option);
        return (
          <motion.button
            key={option}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => toggleOption(option)}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-0" />}
              </div>
              <span className="flex-1">{option}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
