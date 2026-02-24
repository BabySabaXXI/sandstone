"use client";

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OrderingQuestion as OrderingQuestionType } from "@/lib/quiz/quiz-types";

interface OrderingQuestionProps {
  question: OrderingQuestionType;
  value?: string[];
  onChange: (value: string[]) => void;
}

export function OrderingQuestion({
  question,
  value,
  onChange,
}: OrderingQuestionProps) {
  const [items, setItems] = useState(
    question.items.map((item) => item.id)
  );

  useEffect(() => {
    if (value) {
      setItems(value);
    }
  }, [value]);

  const handleReorder = (newOrder: string[]) => {
    setItems(newOrder);
    onChange(newOrder);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newItems.length) {
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      handleReorder(newItems);
    }
  };

  const getItemText = (id: string) => {
    return question.items.find((item) => item.id === id)?.text || id;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag items to arrange them in the correct order, or use the arrow buttons.
      </p>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {items.map((id, index) => (
          <Reorder.Item
            key={id}
            value={id}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border-2 bg-card",
              "cursor-grab active:cursor-grabbing hover:border-primary/50"
            )}
          >
            <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium flex-shrink-0">
              {index + 1}
            </span>

            <span className="flex-1">{getItemText(id)}</span>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
