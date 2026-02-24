"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Save,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  GripVertical,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Quiz,
  QuizQuestion,
  QuestionType,
  QuizSettings,
  QuizValidationError,
} from "@/lib/quiz/quiz-types";
import {
  createQuiz,
  addQuestion,
  removeQuestion,
  updateQuestion,
  duplicateQuestion,
  updateQuizSettings,
  publishQuiz,
  validateQuiz,
  QUIZ_TEMPLATES,
} from "@/lib/quiz/quiz-creator";
import { Subject } from "@/types";
import { QuestionEditor } from "./QuestionEditor";

interface QuizCreatorProps {
  initialQuiz?: Quiz;
  onSave?: (quiz: Quiz) => void;
  onPublish?: (quiz: Quiz) => void;
  onCancel?: () => void;
}

const questionTypeLabels: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  multiple_select: "Multiple Select",
  true_false: "True/False",
  fill_blank: "Fill in the Blank",
  short_answer: "Short Answer",
  matching: "Matching",
  ordering: "Ordering",
  essay: "Essay",
  calculation: "Calculation",
  diagram_label: "Diagram Label",
  case_study: "Case Study",
};

export function QuizCreator({ initialQuiz, onSave, onPublish, onCancel }: QuizCreatorProps) {
  const [quiz, setQuiz] = useState<Quiz>(() => {
    if (initialQuiz) return initialQuiz;
    return createQuiz(
      {
        title: "",
        description: "",
        subject: "economics",
      },
      "temp-user-id"
    );
  });

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<QuizValidationError[]>([]);
  const [activeTab, setActiveTab] = useState("questions");

  const selectedQuestion = quiz.questions.find((q) => q.id === selectedQuestionId);

  // Add a new question
  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = createDefaultQuestion(type);
    const updated = addQuestion(quiz, newQuestion);
    setQuiz(updated);
    setSelectedQuestionId(newQuestion.id);
  };

  // Update question
  const handleUpdateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    const updated = updateQuestion(quiz, questionId, updates);
    setQuiz(updated);
  };

  // Remove question
  const handleRemoveQuestion = (questionId: string) => {
    const updated = removeQuestion(quiz, questionId);
    setQuiz(updated);
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
  };

  // Duplicate question
  const handleDuplicateQuestion = (questionId: string) => {
    const updated = duplicateQuestion(quiz, questionId);
    setQuiz(updated);
  };

  // Update settings
  const handleUpdateSettings = (settings: Partial<QuizSettings>) => {
    const updated = updateQuizSettings(quiz, settings);
    setQuiz(updated);
  };

  // Save quiz
  const handleSave = () => {
    const errors = validateQuiz(quiz);
    setValidationErrors(errors);

    if (errors.length === 0 && onSave) {
      onSave(quiz);
    }
  };

  // Publish quiz
  const handlePublish = () => {
    const errors = validateQuiz(quiz);
    setValidationErrors(errors);

    if (errors.length === 0) {
      const published = publishQuiz(quiz);
      setQuiz(published);
      setShowPublishDialog(false);
      if (onPublish) {
        onPublish(published);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onCancel}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {initialQuiz ? "Edit Quiz" : "Create New Quiz"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {quiz.questions.length} questions • {quiz.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => setShowPublishDialog(true)}
            disabled={quiz.questions.length === 0}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please fix the following issues:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Questions
                  <Badge variant="secondary">{quiz.questions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Question Dropdown */}
                <Select onValueChange={(value) => handleAddQuestion(value as QuestionType)}>
                  <SelectTrigger>
                    <Plus className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Add Question" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(questionTypeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Question List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {quiz.questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                        selectedQuestionId === question.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      )}
                      onClick={() => setSelectedQuestionId(question.id)}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {question.question || "Untitled Question"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {questionTypeLabels[question.type]} • {question.points} pts
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateQuestion(question.id);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveQuestion(question.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {quiz.questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No questions yet</p>
                      <p className="text-sm">Add your first question to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Editor */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                {selectedQuestion ? (
                  <QuestionEditor
                    question={selectedQuestion}
                    onChange={(updates) => handleUpdateQuestion(selectedQuestion.id, updates)}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">Select a question to edit</p>
                    <p className="text-sm">or add a new question to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quiz Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quiz.description}
                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                    placeholder="Enter quiz description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={quiz.subject}
                    onValueChange={(value) =>
                      setQuiz({ ...quiz, subject: value as Subject })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quiz Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Quiz Behavior</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Time Limit</Label>
                    <p className="text-sm text-muted-foreground">
                      Set a time limit for the quiz
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={quiz.settings.timeLimit || ""}
                      onChange={(e) =>
                        handleUpdateSettings({
                          timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-24"
                      placeholder="None"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Passing Score</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimum score required to pass
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={quiz.settings.passingScore}
                      onChange={(e) =>
                        handleUpdateSettings({
                          passingScore: parseInt(e.target.value) || 70,
                        })
                      }
                      className="w-24"
                      min={0}
                      max={100}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      Randomize question order for each attempt
                    </p>
                  </div>
                  <Switch
                    checked={quiz.settings.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings({ shuffleQuestions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Correct Answers</Label>
                    <p className="text-sm text-muted-foreground">
                      Show correct answers after submission
                    </p>
                  </div>
                  <Switch
                    checked={quiz.settings.showCorrectAnswers}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings({ showCorrectAnswers: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Explanations</Label>
                    <p className="text-sm text-muted-foreground">
                      Show answer explanations after submission
                    </p>
                  </div>
                  <Switch
                    checked={quiz.settings.showExplanation}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings({ showExplanation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Retake</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to retake the quiz
                    </p>
                  </div>
                  <Switch
                    checked={quiz.settings.allowRetake}
                    onCheckedChange={(checked) =>
                      handleUpdateSettings({ allowRetake: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Publish Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Quiz?</DialogTitle>
            <DialogDescription>
              Once published, this quiz will be available for users to take.
              You can still edit the quiz after publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium">{quiz.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points:</span>
                <span className="font-medium">
                  {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passing Score:</span>
                <span className="font-medium">{quiz.settings.passingScore}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublish}>Publish Quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to create default questions
function createDefaultQuestion(type: QuestionType): QuizQuestion {
  const base = {
    id: crypto.randomUUID(),
    type,
    question: "",
    explanation: "",
    difficulty: "medium" as const,
    points: 1,
  };

  switch (type) {
    case "multiple_choice":
      return {
        ...base,
        type: "multiple_choice",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswer: "Option 1",
        shuffleOptions: true,
      };
    case "multiple_select":
      return {
        ...base,
        type: "multiple_select",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctAnswers: ["Option 1"],
        partialCredit: true,
      };
    case "true_false":
      return {
        ...base,
        type: "true_false",
        statement: "Enter your statement here",
        correctAnswer: true,
      };
    case "fill_blank":
      return {
        ...base,
        type: "fill_blank",
        text: "The capital of France is [blank].",
        blanks: [{ id: "1", correctAnswer: "Paris" }],
        caseSensitive: false,
      };
    case "short_answer":
      return {
        ...base,
        type: "short_answer",
        correctAnswer: "",
        acceptableAnswers: [],
        caseSensitive: false,
      };
    case "matching":
      return {
        ...base,
        type: "matching",
        pairs: [
          { id: "1", left: "Item A", right: "Match A" },
          { id: "2", left: "Item B", right: "Match B" },
        ],
        shuffleLeft: true,
        shuffleRight: true,
      };
    case "ordering":
      return {
        ...base,
        type: "ordering",
        items: [
          { id: "1", text: "First" },
          { id: "2", text: "Second" },
          { id: "3", text: "Third" },
        ],
        correctOrder: ["1", "2", "3"],
      };
    case "essay":
      return {
        ...base,
        type: "essay",
        minWords: 100,
        maxWords: 500,
      };
    case "calculation":
      return {
        ...base,
        type: "calculation",
        problem: "Calculate the result:",
        correctAnswer: 0,
        tolerance: 0.01,
        showWork: true,
        steps: [],
      };
    default:
      return base as QuizQuestion;
  }
}
