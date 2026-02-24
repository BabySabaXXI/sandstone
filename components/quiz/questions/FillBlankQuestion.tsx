"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FillBlankQuestion as FillBlankQuestionType } from "@/lib/quiz/quiz-types";

interface FillBlankQuestionProps {
  question: FillBlankQuestionType;
  value?: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function FillBlankQuestion({
  question,
  value = {},
  onChange,
}: FillBlankQuestionProps) {
  const [localValues, setLocalValues] = useState<Record<string, string>>(value);

  useEffect(() => {
    setLocalValues(value);
  }, [value]);

  const handleChange = (blankId: string, newValue: string) => {
    const updated = { ...localValues, [blankId]: newValue };
    setLocalValues(updated);
    onChange(updated);
  };

  // Parse the text and replace [blank] markers with inputs
  const renderTextWithBlanks = () => {
    const parts = question.text.split(/(\[blank\])/);
    let blankIndex = 0;

    return parts.map((part, index) => {
      if (part === "[blank]") {
        const blank = question.blanks[blankIndex];
        blankIndex++;

        return (
          <Input
            key={`${blank.id}-${index}`}
            value={localValues[blank.id] || ""}
            onChange={(e) => handleChange(blank.id, e.target.value)}
            placeholder={blank.hint || "Answer"}
            className="inline-block w-32 mx-1 text-center"
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-lg leading-relaxed">{renderTextWithBlanks()}</div>

      {/* Show blank hints if available */}
      {question.blanks.some((b) => b.hint) && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Hints:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {question.blanks.map(
              (blank, index) =>
                blank.hint && (
                  <li key={blank.id}>
                    Blank {index + 1}: {blank.hint}
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
