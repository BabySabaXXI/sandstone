"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Quiz, QuizQuestion } from "@/lib/quiz/quiz-types";
import { useQuizSession } from "@/lib/quiz/quiz-hooks";
import { MultipleChoiceQuestion } from "./questions/MultipleChoiceQuestion";
import { MultipleSelectQuestion } from "./questions/MultipleSelectQuestion";
import { TrueFalseQuestion } from "./questions/TrueFalseQuestion";
import { FillBlankQuestion } from "./questions/FillBlankQuestion";
import { ShortAnswerQuestion } from "./questions/ShortAnswerQuestion";
import { MatchingQuestion } from "./questions/MatchingQuestion";
import { OrderingQuestion } from "./questions/OrderingQuestion";
import { EssayQuestion } from "./questions/EssayQuestion";
import { CalculationQuestion } from "./questions/CalculationQuestion";

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete?: (score: number, passed: boolean) => void;
  onExit?: () => void;
}

export function QuizPlayer({ quiz, onComplete, onExit }: QuizPlayerProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);

  const {
    session,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    timeRemaining,
    isSubmitting,
    startSession,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    toggleFlagQuestion,
    submitQuiz,
    currentQuestion,
    progress,
    answeredCount,
    totalQuestions,
  } = useQuizSession(quiz.id);

  // Start session on mount
  const handleStart = useCallback(async () => {
    await startSession();
  }, [startSession]);

  // Handle answer change
  const handleAnswer = useCallback((answer: unknown) => {
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answer);
    }
  }, [currentQuestion, answerQuestion]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setShowSubmitDialog(false);
    const attempt = await submitQuiz();
    if (attempt && onComplete) {
      onComplete(attempt.percentage, attempt.passed);
    }
  }, [submitQuiz, onComplete]);

  // Format time remaining
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get time warning color
  const getTimeColor = () => {
    if (timeRemaining === null) return "text-muted-foreground";
    if (timeRemaining < 60) return "text-red-500 animate-pulse";
    if (timeRemaining < 300) return "text-amber-500";
    return "text-muted-foreground";
  };

  // Render question based on type
  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceQuestion
            question={question}
            value={currentAnswer as string}
            onChange={handleAnswer}
          />
        );
      case "multiple_select":
        return (
          <MultipleSelectQuestion
            question={question}
            value={currentAnswer as string[]}
            onChange={handleAnswer}
          />
        );
      case "true_false":
        return (
          <TrueFalseQuestion
            question={question}
            value={currentAnswer as boolean}
            onChange={handleAnswer}
          />
        );
      case "fill_blank":
        return (
          <FillBlankQuestion
            question={question}
            value={currentAnswer as Record<string, string>}
            onChange={handleAnswer}
          />
        );
      case "short_answer":
        return (
          <ShortAnswerQuestion
            question={question}
            value={currentAnswer as string}
            onChange={handleAnswer}
          />
        );
      case "matching":
        return (
          <MatchingQuestion
            question={question}
            value={currentAnswer as Record<string, string>}
            onChange={handleAnswer}
          />
        );
      case "ordering":
        return (
          <OrderingQuestion
            question={question}
            value={currentAnswer as string[]}
            onChange={handleAnswer}
          />
        );
      case "essay":
        return (
          <EssayQuestion
            question={question}
            value={currentAnswer as string}
            onChange={handleAnswer}
          />
        );
      case "calculation":
        return (
          <CalculationQuestion
            question={question}
            value={currentAnswer as number}
            onChange={handleAnswer}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>This question type is not yet supported.</p>
          </div>
        );
    }
  };

  // Not started state
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
            <p className="text-muted-foreground mb-6">{quiz.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{quiz.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              {quiz.settings.timeLimit && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{quiz.settings.timeLimit}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
              )}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{quiz.settings.passingScore}%</div>
                <div className="text-sm text-muted-foreground">Passing Score</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {quiz.settings.shuffleQuestions ? "Yes" : "No"}
                </div>
                <div className="text-sm text-muted-foreground">Shuffled</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onExit}>
                Back
              </Button>
              <Button onClick={handleStart} size="lg">
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold truncate">{quiz.title}</h1>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className={cn("flex items-center gap-2 font-mono", getTimeColor())}>
                <Clock className="w-5 h-5" />
                <span className="text-lg">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowExitDialog(true)}>
              Exit
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-muted-foreground">
              {answeredCount} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Question header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {currentQuestion.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <h2 className="text-lg font-medium">{currentQuestion.question}</h2>
                    {currentQuestion.topic && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Topic: {currentQuestion.topic}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlagQuestion(currentQuestion.id)}
                    className={cn(
                      flaggedQuestions.includes(currentQuestion.id) && "text-amber-500"
                    )}
                  >
                    <Flag className={cn(
                      "w-5 h-5",
                      flaggedQuestions.includes(currentQuestion.id) && "fill-current"
                    )} />
                  </Button>
                </div>

                {/* Question content */}
                <div className="min-h-[200px]">
                  {renderQuestion(currentQuestion)}
                </div>

                {/* Hint */}
                {currentQuestion.hint && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Hint</span>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-300">
                      {currentQuestion.hint}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowQuestionList(true)}
        >
          Question List
        </Button>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <Button onClick={nextQuestion} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </Button>
        )}
      </div>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Exit Quiz?
            </DialogTitle>
            <DialogDescription>
              Your progress will be lost if you exit now. Are you sure you want to leave?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Quiz
            </Button>
            <Button variant="destructive" onClick={onExit}>
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Submit Quiz?
            </DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-amber-600">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  You have {totalQuestions - answeredCount} unanswered questions.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Review Answers
            </Button>
            <Button onClick={handleSubmit}>
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question List Dialog */}
      <Dialog open={showQuestionList} onOpenChange={setShowQuestionList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Question List</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2">
            {quiz.questions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = flaggedQuestions.includes(q.id);
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    // Navigate to question
                    setShowQuestionList(false);
                  }}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                    isCurrent && "ring-2 ring-primary",
                    isAnswered
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground",
                    isFlagged && "border-2 border-amber-400"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
