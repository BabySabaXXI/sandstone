"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { CalculationQuestion as CalculationQuestionType } from "@/lib/quiz/quiz-types";

interface CalculationQuestionProps {
  question: CalculationQuestionType;
  value?: number;
  onChange: (value: number) => void;
}

export function CalculationQuestion({
  question,
  value,
  onChange,
}: CalculationQuestionProps) {
  const [showSteps, setShowSteps] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() || "");

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem statement */}
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-lg font-medium">{question.problem}</p>
      </div>

      {/* Answer input */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Your Answer</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter your answer"
              className="text-lg"
            />
            {question.units && (
              <span className="text-muted-foreground whitespace-nowrap">
                {question.units}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Work area */}
      {question.showWork && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Show Your Work (optional)</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background resize-y"
            placeholder="Show your calculations here..."
          />
        </div>
      )}

      {/* Solution steps (collapsible) */}
      {question.steps && question.steps.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full p-3 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="font-medium">Solution Steps</span>
            </div>
            {showSteps ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showSteps && (
            <div className="p-4 space-y-3">
              {question.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p>{step.description}</p>
                    {step.formula && (
                      <code className="mt-1 block p-2 bg-muted rounded text-sm font-mono">
                        {step.formula}
                      </code>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tolerance info */}
      {question.tolerance && question.tolerance > 0 && (
        <p className="text-sm text-muted-foreground">
          Your answer will be accepted if it is within ±{question.tolerance} of the correct answer.
        </p>
      )}
    </div>
  );
}
