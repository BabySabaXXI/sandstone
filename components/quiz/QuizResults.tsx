"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  RotateCcw,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Quiz, QuizAttempt } from "@/lib/quiz/quiz-types";
import Link from "next/link";

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetry?: () => void;
  onBack?: () => void;
}

export function QuizResults({ quiz, attempt, onRetry, onBack }: QuizResultsProps) {
  const isPassed = attempt.passed;
  const scorePercentage = attempt.percentage;

  // Calculate time taken
  const timeTaken = attempt.timeSpent;
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  // Calculate correct answers
  const correctAnswers = attempt.questionResults?.filter((r) => r.correct).length || 0;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          "border-2",
          isPassed 
            ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10" 
            : "border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10"
        )}>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={cn(
                "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center",
                isPassed ? "bg-green-500" : "bg-amber-500"
              )}
            >
              {isPassed ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <Target className="w-12 h-12 text-white" />
              )}
            </motion.div>

            <h1 className={cn(
              "text-3xl font-bold mb-2",
              isPassed ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
            )}>
              {isPassed ? "Congratulations!" : "Keep Practicing!"}
            </h1>

            <p className="text-muted-foreground mb-6">
              {isPassed 
                ? "You passed the quiz! Great job!" 
                : "You didn't pass this time, but keep practicing!"}
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-5xl font-bold">{scorePercentage}%</span>
              <Badge 
                variant={isPassed ? "default" : "secondary"}
                className={cn(
                  "text-sm",
                  isPassed && "bg-green-500"
                )}
              >
                {isPassed ? "PASSED" : "NOT PASSED"}
              </Badge>
            </div>

            <Progress 
              value={scorePercentage} 
              className="h-3 max-w-md mx-auto"
            />

            <p className="text-sm text-muted-foreground mt-2">
              Passing score: {quiz.settings.passingScore}%
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{totalQuestions - correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, "0")}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{attempt.score}/{attempt.maxScore}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Question Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {attempt.questionResults?.map((result, index) => (
                  <div
                    key={result.questionId}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        result.correct
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {result.correct ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        Question {index + 1}: {result.question.question}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.pointsEarned}/{result.maxPoints} points
                      </p>
                    </div>
                    <Badge variant={result.correct ? "default" : "secondary"}>
                      {result.correct ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {attempt.questionResults?.map((result, index) => (
              <Card key={result.questionId}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">
                        Question {index + 1}
                      </Badge>
                      <CardTitle className="text-base">{result.question.question}</CardTitle>
                    </div>
                    <Badge
                      variant={result.correct ? "default" : "secondary"}
                      className={cn(result.correct && "bg-green-500")}
                    >
                      {result.pointsEarned}/{result.maxPoints} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Show correct answer if enabled */}
                  {quiz.settings.showCorrectAnswers && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Your answer:</span>
                        <p className="font-medium">
                          {Array.isArray(result.userAnswer)
                            ? result.userAnswer.join(", ")
                            : String(result.userAnswer) || "No answer"}
                        </p>
                      </div>

                      {!result.correct && (
                        <div>
                          <span className="text-sm text-green-600">Correct answer:</span>
                          <p className="font-medium text-green-700 dark:text-green-400">
                            {"correctAnswer" in result.question
                              ? String(result.question.correctAnswer)
                              : "correctAnswers" in result.question
                              ? (result.question.correctAnswers as string[]).join(", ")
                              : "N/A"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show explanation if enabled */}
                  {quiz.settings.showExplanation && result.question.explanation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Explanation:
                      </span>
                      <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                        {result.question.explanation}
                      </p>
                    </div>
                  )}

                  {/* Feedback */}
                  {result.feedback && (
                    <p className="text-sm text-muted-foreground">{result.feedback}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Button>

        {quiz.settings.allowRetake && (
          <Button onClick={onRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
        )}

        <Button variant="outline" asChild className="gap-2">
          <Link href={`/quiz/${quiz.id}/analytics`}>
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
