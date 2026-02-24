"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrueFalseQuestion as TrueFalseQuestionType } from "@/lib/quiz/quiz-types";

interface TrueFalseQuestionProps {
  question: TrueFalseQuestionType;
  value?: boolean;
  onChange: (value: boolean) => void;
}

export function TrueFalseQuestion({
  question,
  value,
  onChange,
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-lg font-medium">{question.statement}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onChange(true)}
          className={cn(
            "p-6 rounded-lg border-2 text-center transition-all duration-200",
            value === true
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-border hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-900/10"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-colors",
              value === true
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Check className="w-6 h-6" />
          </div>
          <span className={cn(
            "font-medium",
            value === true ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
          )}>
            True
          </span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onChange(false)}
          className={cn(
            "p-6 rounded-lg border-2 text-center transition-all duration-200",
            value === false
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-border hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/10"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-colors",
              value === false
                ? "bg-red-500 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <X className="w-6 h-6" />
          </div>
          <span className={cn(
            "font-medium",
            value === false ? "text-red-700 dark:text-red-400" : "text-muted-foreground"
          )}>
            False
          </span>
        </motion.button>
      </div>
    </div>
  );
}
