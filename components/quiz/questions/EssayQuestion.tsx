"use client";

import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { EssayQuestion as EssayQuestionType } from "@/lib/quiz/quiz-types";

interface EssayQuestionProps {
  question: EssayQuestionType;
  value?: string;
  onChange: (value: string) => void;
}

export function EssayQuestion({
  question,
  value = "",
  onChange,
}: EssayQuestionProps) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

  const minWords = question.minWords || 0;
  const maxWords = question.maxWords || Infinity;

  const wordProgress = Math.min((wordCount / minWords) * 100, 100);
  const isUnderMinimum = wordCount < minWords;
  const isOverMaximum = maxWords !== Infinity && wordCount > maxWords;

  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your essay response here..."
        className="min-h-[300px] resize-y"
      />

      {/* Word count and progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <div className="flex gap-4">
            <span className={isUnderMinimum ? "text-amber-600" : "text-green-600"}>
              {wordCount} words
            </span>
            <span className="text-muted-foreground">{charCount} characters</span>
          </div>
          <div className="text-muted-foreground">
            {minWords > 0 && (
              <span>
                Min: {minWords} {maxWords !== Infinity && `| Max: ${maxWords}`}
              </span>
            )}
          </div>
        </div>

        {minWords > 0 && (
          <Progress
            value={wordProgress}
            className="h-2"
          />
        )}

        {isUnderMinimum && (
          <p className="text-sm text-amber-600">
            You need at least {minWords - wordCount} more words.
          </p>
        )}

        {isOverMaximum && (
          <p className="text-sm text-red-600">
            You have exceeded the maximum word count by {wordCount - maxWords} words.
          </p>
        )}
      </div>

      {/* Rubric display if available */}
      {question.rubric && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="font-medium mb-3">Grading Rubric:</p>
          <ul className="space-y-2">
            {question.rubric.criteria.map((criterion, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{criterion.name}</span>
                <span className="text-muted-foreground"> - {criterion.description}</span>
                <span className="text-muted-foreground"> ({criterion.maxPoints} points)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
