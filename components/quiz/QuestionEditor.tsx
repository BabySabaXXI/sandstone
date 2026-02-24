"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { QuizQuestion, QuestionType, QuizDifficulty } from "@/lib/quiz/quiz-types";

interface QuestionEditorProps {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}

const difficultyOptions: { value: QuizDifficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

export function QuestionEditor({ question, onChange }: QuestionEditorProps) {
  const [localOptions, setLocalOptions] = useState<string[]>(
    "options" in question ? question.options : []
  );

  const renderQuestionFields = () => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceEditor
            question={question}
            onChange={onChange}
            options={localOptions}
            setOptions={setLocalOptions}
          />
        );
      case "multiple_select":
        return (
          <MultipleSelectEditor
            question={question}
            onChange={onChange}
            options={localOptions}
            setOptions={setLocalOptions}
          />
        );
      case "true_false":
        return <TrueFalseEditor question={question} onChange={onChange} />;
      case "fill_blank":
        return <FillBlankEditor question={question} onChange={onChange} />;
      case "short_answer":
        return <ShortAnswerEditor question={question} onChange={onChange} />;
      case "matching":
        return <MatchingEditor question={question} onChange={onChange} />;
      case "ordering":
        return <OrderingEditor question={question} onChange={onChange} />;
      case "essay":
        return <EssayEditor question={question} onChange={onChange} />;
      case "calculation":
        return <CalculationEditor question={question} onChange={onChange} />;
      default:
        return <p>Editor not implemented for this question type.</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Type Badge */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-sm">
          {question.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
        <div className="flex items-center gap-2">
          <Label htmlFor="points" className="text-sm text-muted-foreground">
            Points:
          </Label>
          <Input
            id="points"
            type="number"
            value={question.points}
            onChange={(e) => onChange({ points: parseInt(e.target.value) || 1 })}
            className="w-20"
            min={1}
          />
        </div>
      </div>

      {/* Question Text */}
      <div>
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={question.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Enter your question"
          rows={3}
        />
      </div>

      {/* Difficulty */}
      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={question.difficulty}
          onValueChange={(value) =>
            onChange({ difficulty: value as QuizDifficulty })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {difficultyOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic */}
      <div>
        <Label htmlFor="topic">Topic (optional)</Label>
        <Input
          id="topic"
          value={question.topic || ""}
          onChange={(e) => onChange({ topic: e.target.value })}
          placeholder="e.g., Supply and Demand"
        />
      </div>

      {/* Type-specific fields */}
      {renderQuestionFields()}

      {/* Explanation */}
      <div>
        <Label htmlFor="explanation">Explanation (optional)</Label>
        <Textarea
          id="explanation"
          value={question.explanation || ""}
          onChange={(e) => onChange({ explanation: e.target.value })}
          placeholder="Explain the correct answer"
          rows={3}
        />
      </div>

      {/* Hint */}
      <div>
        <Label htmlFor="hint">Hint (optional)</Label>
        <Input
          id="hint"
          value={question.hint || ""}
          onChange={(e) => onChange({ hint: e.target.value })}
          placeholder="Give a hint to help users"
        />
      </div>
    </div>
  );
}

// Multiple Choice Editor
function MultipleChoiceEditor({
  question,
  onChange,
  options,
  setOptions,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
  options: string[];
  setOptions: (options: string[]) => void;
}) {
  const q = question as { options: string[]; correctAnswer: string; shuffleOptions?: boolean };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Options</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor="shuffle" className="text-sm text-muted-foreground">
            Shuffle
          </Label>
          <Switch
            id="shuffle"
            checked={q.shuffleOptions !== false}
            onCheckedChange={(checked) => onChange({ shuffleOptions: checked })}
          />
        </div>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-answer"
              checked={q.correctAnswer === option}
              onChange={() => onChange({ correctAnswer: option })}
              className="w-4 h-4"
            />
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addOption} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Option
      </Button>

      <p className="text-sm text-muted-foreground">
        Select the radio button next to the correct answer.
      </p>
    </div>
  );
}

// Multiple Select Editor
function MultipleSelectEditor({
  question,
  onChange,
  options,
  setOptions,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
  options: string[];
  setOptions: (options: string[]) => void;
}) {
  const q = question as {
    options: string[];
    correctAnswers: string[];
    partialCredit?: boolean;
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  const toggleCorrectAnswer = (option: string) => {
    const current = q.correctAnswers || [];
    const updated = current.includes(option)
      ? current.filter((a) => a !== option)
      : [...current, option];
    onChange({ correctAnswers: updated });
  };

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Options</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor="partial" className="text-sm text-muted-foreground">
            Partial Credit
          </Label>
          <Switch
            id="partial"
            checked={q.partialCredit !== false}
            onCheckedChange={(checked) => onChange({ partialCredit: checked })}
          />
        </div>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(q.correctAnswers || []).includes(option)}
              onChange={() => toggleCorrectAnswer(option)}
              className="w-4 h-4"
            />
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addOption} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Option
      </Button>

      <p className="text-sm text-muted-foreground">
        Check all boxes that apply as correct answers.
      </p>
    </div>
  );
}

// True/False Editor
function TrueFalseEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as { statement: string; correctAnswer: boolean };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="statement">Statement</Label>
        <Textarea
          id="statement"
          value={q.statement}
          onChange={(e) => onChange({ statement: e.target.value })}
          placeholder="Enter the true/false statement"
          rows={3}
        />
      </div>

      <div>
        <Label>Correct Answer</Label>
        <div className="flex gap-4 mt-2">
          <Button
            variant={q.correctAnswer === true ? "default" : "outline"}
            onClick={() => onChange({ correctAnswer: true })}
            className="flex-1"
          >
            True
          </Button>
          <Button
            variant={q.correctAnswer === false ? "default" : "outline"}
            onClick={() => onChange({ correctAnswer: false })}
            className="flex-1"
          >
            False
          </Button>
        </div>
      </div>
    </div>
  );
}

// Fill in the Blank Editor
function FillBlankEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as {
    text: string;
    blanks: { id: string; correctAnswer: string; acceptableAnswers?: string[]; hint?: string }[];
    caseSensitive?: boolean;
  };

  const addBlank = () => {
    const newBlanks = [
      ...q.blanks,
      { id: crypto.randomUUID(), correctAnswer: "" },
    ];
    onChange({ blanks: newBlanks });
  };

  const updateBlank = (id: string, updates: Partial<(typeof q.blanks)[0]>) => {
    const newBlanks = q.blanks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    onChange({ blanks: newBlanks });
  };

  const removeBlank = (id: string) => {
    const newBlanks = q.blanks.filter((b) => b.id !== id);
    onChange({ blanks: newBlanks });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Text with Blanks</Label>
        <Textarea
          id="text"
          value={q.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Use [blank] to mark where blanks should appear"
          rows={4}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Use [blank] to indicate where blanks should appear in the text.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label>Blanks</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor="case" className="text-sm text-muted-foreground">
            Case Sensitive
          </Label>
          <Switch
            id="case"
            checked={q.caseSensitive || false}
            onCheckedChange={(checked) => onChange({ caseSensitive: checked })}
          />
        </div>
      </div>

      <div className="space-y-3">
        {q.blanks.map((blank, index) => (
          <div key={blank.id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Blank {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeBlank(blank.id)}
                disabled={q.blanks.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={blank.correctAnswer}
              onChange={(e) => updateBlank(blank.id, { correctAnswer: e.target.value })}
              placeholder="Correct answer"
            />
            <Input
              value={blank.hint || ""}
              onChange={(e) => updateBlank(blank.id, { hint: e.target.value })}
              placeholder="Hint (optional)"
            />
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addBlank} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Blank
      </Button>
    </div>
  );
}

// Short Answer Editor
function ShortAnswerEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as {
    correctAnswer: string;
    acceptableAnswers?: string[];
    keywords?: string[];
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="correct">Correct Answer</Label>
        <Input
          id="correct"
          value={q.correctAnswer}
          onChange={(e) => onChange({ correctAnswer: e.target.value })}
          placeholder="Enter the correct answer"
        />
      </div>

      <div>
        <Label htmlFor="acceptable">Acceptable Answers (comma-separated)</Label>
        <Input
          id="acceptable"
          value={(q.acceptableAnswers || []).join(", ")}
          onChange={(e) =>
            onChange({
              acceptableAnswers: e.target.value.split(",").map((s) => s.trim()),
            })
          }
          placeholder="alternative1, alternative2"
        />
      </div>

      <div>
        <Label htmlFor="keywords">Required Keywords (comma-separated)</Label>
        <Input
          id="keywords"
          value={(q.keywords || []).join(", ")}
          onChange={(e) =>
            onChange({
              keywords: e.target.value.split(",").map((s) => s.trim()),
            })
          }
          placeholder="keyword1, keyword2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          These keywords must be present for full credit.
        </p>
      </div>
    </div>
  );
}

// Matching Editor
function MatchingEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as { pairs: { id: string; left: string; right: string }[] };

  const addPair = () => {
    const newPairs = [
      ...q.pairs,
      { id: crypto.randomUUID(), left: "", right: "" },
    ];
    onChange({ pairs: newPairs });
  };

  const updatePair = (id: string, updates: Partial<(typeof q.pairs)[0]>) => {
    const newPairs = q.pairs.map((p) => (p.id === id ? { ...p, ...updates } : p));
    onChange({ pairs: newPairs });
  };

  const removePair = (id: string) => {
    const newPairs = q.pairs.filter((p) => p.id !== id);
    onChange({ pairs: newPairs });
  };

  return (
    <div className="space-y-4">
      <Label>Matching Pairs</Label>

      <div className="space-y-2">
        {q.pairs.map((pair, index) => (
          <div key={pair.id} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
            <Input
              value={pair.left}
              onChange={(e) => updatePair(pair.id, { left: e.target.value })}
              placeholder="Left item"
            />
            <span className="text-muted-foreground">→</span>
            <Input
              value={pair.right}
              onChange={(e) => updatePair(pair.id, { right: e.target.value })}
              placeholder="Right item"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePair(pair.id)}
              disabled={q.pairs.length <= 2}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addPair} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Pair
      </Button>
    </div>
  );
}

// Ordering Editor
function OrderingEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as {
    items: { id: string; text: string }[];
    correctOrder: string[];
  };

  const addItem = () => {
    const newItem = { id: crypto.randomUUID(), text: "" };
    const newItems = [...q.items, newItem];
    const newOrder = [...q.correctOrder, newItem.id];
    onChange({ items: newItems, correctOrder: newOrder });
  };

  const updateItem = (id: string, text: string) => {
    const newItems = q.items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    onChange({ items: newItems });
  };

  const removeItem = (id: string) => {
    const newItems = q.items.filter((item) => item.id !== id);
    const newOrder = q.correctOrder.filter((orderId) => orderId !== id);
    onChange({ items: newItems, correctOrder: newOrder });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newOrder = [...q.correctOrder];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      onChange({ correctOrder: newOrder });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Items (in correct order)</Label>

      <div className="space-y-2">
        {q.correctOrder.map((id, index) => {
          const item = q.items.find((i) => i.id === id);
          return (
            <div key={id} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
              <Input
                value={item?.text || ""}
                onChange={(e) => updateItem(id, e.target.value)}
                placeholder={`Item ${index + 1}`}
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === q.correctOrder.length - 1}
                >
                  ↓
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(id)}
                disabled={q.items.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button variant="outline" onClick={addItem} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Add Item
      </Button>

      <p className="text-sm text-muted-foreground">
        Arrange items in the correct order. Users will need to reorder them.
      </p>
    </div>
  );
}

// Essay Editor
function EssayEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as { minWords?: number; maxWords?: number };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minWords">Minimum Words</Label>
          <Input
            id="minWords"
            type="number"
            value={q.minWords || ""}
            onChange={(e) =>
              onChange({ minWords: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="No minimum"
          />
        </div>
        <div>
          <Label htmlFor="maxWords">Maximum Words</Label>
          <Input
            id="maxWords"
            type="number"
            value={q.maxWords || ""}
            onChange={(e) =>
              onChange({ maxWords: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="No maximum"
          />
        </div>
      </div>
    </div>
  );
}

// Calculation Editor
function CalculationEditor({
  question,
  onChange,
}: {
  question: QuizQuestion;
  onChange: (updates: Partial<QuizQuestion>) => void;
}) {
  const q = question as {
    problem: string;
    correctAnswer: number;
    tolerance?: number;
    units?: string;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="problem">Problem Statement</Label>
        <Textarea
          id="problem"
          value={q.problem}
          onChange={(e) => onChange({ problem: e.target.value })}
          placeholder="Describe the calculation problem"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="answer">Correct Answer</Label>
          <Input
            id="answer"
            type="number"
            value={q.correctAnswer}
            onChange={(e) =>
              onChange({ correctAnswer: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label htmlFor="tolerance">Tolerance</Label>
          <Input
            id="tolerance"
            type="number"
            value={q.tolerance || 0.01}
            onChange={(e) =>
              onChange({ tolerance: parseFloat(e.target.value) || 0 })
            }
            step="0.01"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="units">Units (optional)</Label>
        <Input
          id="units"
          value={q.units || ""}
          onChange={(e) => onChange({ units: e.target.value })}
          placeholder="e.g., USD, kg, %"
        />
      </div>
    </div>
  );
}
