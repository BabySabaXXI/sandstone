"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MatchingQuestion as MatchingQuestionType } from "@/lib/quiz/quiz-types";

interface MatchingQuestionProps {
  question: MatchingQuestionType;
  value?: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function MatchingQuestion({
  question,
  value = {},
  onChange,
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<string, string>>(value);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    setMatches(value);
  }, [value]);

  // Shuffle right items if needed
  const rightItems = question.shuffleRight !== false
    ? [...question.pairs].sort(() => Math.random() - 0.5)
    : question.pairs;

  const handleLeftClick = (id: string) => {
    if (matches[id]) {
      // Remove existing match
      const newMatches = { ...matches };
      delete newMatches[id];
      setMatches(newMatches);
      onChange(newMatches);
      return;
    }

    if (selectedLeft === id) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(id);
      // If right is already selected, create match
      if (selectedRight) {
        const newMatches = { ...matches, [id]: selectedRight };
        setMatches(newMatches);
        onChange(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);
      }
    }
  };

  const handleRightClick = (rightValue: string) => {
    if (selectedRight === rightValue) {
      setSelectedRight(null);
    } else {
      setSelectedRight(rightValue);
      // If left is already selected, create match
      if (selectedLeft) {
        const newMatches = { ...matches, [selectedLeft]: rightValue };
        setMatches(newMatches);
        onChange(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);
      }
    }
  };

  const clearMatches = () => {
    setMatches({});
    onChange({});
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={clearMatches}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-start">
        {/* Left column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Items</p>
          {question.pairs.map((pair) => (
            <motion.button
              key={pair.id}
              onClick={() => handleLeftClick(pair.id)}
              className={cn(
                "w-full p-3 rounded-lg border-2 text-left transition-all",
                matches[pair.id]
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : selectedLeft === pair.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                {matches[pair.id] && <Check className="w-4 h-4 text-green-500" />}
                <span>{pair.left}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center pt-10">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Matches</p>
          {rightItems.map((pair) => {
            const isMatched = Object.values(matches).includes(pair.right);
            return (
              <motion.button
                key={`right-${pair.id}`}
                onClick={() => handleRightClick(pair.right)}
                disabled={isMatched}
                className={cn(
                  "w-full p-3 rounded-lg border-2 text-left transition-all",
                  isMatched
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 opacity-50"
                    : selectedRight === pair.right
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
              >
                {pair.right}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Current matches display */}
      {Object.keys(matches).length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Your matches:</p>
          <div className="space-y-1">
            {Object.entries(matches).map(([leftId, rightValue]) => {
              const leftItem = question.pairs.find((p) => p.id === leftId);
              return (
                <div key={leftId} className="text-sm flex items-center gap-2">
                  <span className="font-medium">{leftItem?.left}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span>{rightValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
