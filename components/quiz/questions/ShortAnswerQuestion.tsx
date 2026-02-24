"use client";

import { Textarea } from "@/components/ui/textarea";
import { ShortAnswerQuestion as ShortAnswerQuestionType } from "@/lib/quiz/quiz-types";

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestionType;
  value?: string;
  onChange: (value: string) => void;
}

export function ShortAnswerQuestion({
  question,
  value = "",
  onChange,
}: ShortAnswerQuestionProps) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="min-h-[150px] resize-none"
        maxLength={question.maxLength}
      />

      <div className="flex justify-between text-sm text-muted-foreground">
        <div>
          {question.minLength && (
            <span>Minimum {question.minLength} characters</span>
          )}
        </div>
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          {question.maxLength && (
            <span className={charCount > question.maxLength ? "text-red-500" : ""}>
              / {question.maxLength}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
