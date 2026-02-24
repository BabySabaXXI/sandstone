"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface QuizContentProps {
  userId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questionCount: number;
  timeLimit: number;
  difficulty: "easy" | "medium" | "hard";
  completed?: boolean;
  score?: number;
}

const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Microeconomics Fundamentals",
    description: "Test your knowledge of supply, demand, and market structures",
    subject: "Economics",
    questionCount: 20,
    timeLimit: 30,
    difficulty: "medium",
    completed: true,
    score: 85,
  },
  {
    id: "2",
    title: "Geography Case Studies",
    description: "Key case studies for A-Level Geography",
    subject: "Geography",
    questionCount: 15,
    timeLimit: 25,
    difficulty: "hard",
  },
  {
    id: "3",
    title: "Macroeconomic Indicators",
    description: "GDP, inflation, unemployment, and more",
    subject: "Economics",
    questionCount: 25,
    timeLimit: 35,
    difficulty: "easy",
    completed: true,
    score: 92,
  },
  {
    id: "4",
    title: "Physical Geography",
    description: "Coasts, rivers, and glaciation",
    subject: "Geography",
    questionCount: 18,
    timeLimit: 28,
    difficulty: "medium",
  },
];

const getDifficultyColor = (difficulty: Quiz["difficulty"]) => {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "hard":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
  }
};

export function QuizContent({ userId }: QuizContentProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredQuizzes = selectedSubject
    ? mockQuizzes.filter((q) => q.subject === selectedSubject)
    : mockQuizzes;

  const completedQuizzes = mockQuizzes.filter((q) => q.completed);
  const averageScore = completedQuizzes.length > 0
    ? completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quiz</h1>
        <p className="text-muted-foreground mt-1">
          Test your knowledge with AI-generated quizzes
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                <p className="text-2xl font-bold">{completedQuizzes.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{Math.round(averageScore)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">
                  {completedQuizzes.length > 0
                    ? Math.max(...completedQuizzes.map((q) => q.score || 0))
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">5 days</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Filter */}
      <div className="flex gap-2">
        <Button
          variant={selectedSubject === null ? "default" : "outline"}
          onClick={() => setSelectedSubject(null)}
        >
          All
        </Button>
        <Button
          variant={selectedSubject === "Economics" ? "default" : "outline"}
          onClick={() => setSelectedSubject("Economics")}
        >
          Economics
        </Button>
        <Button
          variant={selectedSubject === "Geography" ? "default" : "outline"}
          onClick={() => setSelectedSubject("Geography")}
        >
          Geography
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredQuizzes.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge
                      variant="secondary"
                      className={`mb-2 ${getDifficultyColor(quiz.difficulty)}`}
                    >
                      {quiz.difficulty}
                    </Badge>
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                  </div>
                  {quiz.completed && quiz.score && quiz.score >= 80 && (
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  )}
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  {quiz.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {quiz.questionCount} questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {quiz.timeLimit} min
                  </div>
                </div>

                {quiz.completed && quiz.score !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Your Score</span>
                      <span className="font-medium">{quiz.score}%</span>
                    </div>
                    <Progress value={quiz.score} className="h-2" />
                  </div>
                )}

                <Button className="w-full gap-2" asChild>
                  <Link href={`/quiz/${quiz.id}`}>
                    <Play className="w-4 h-4" />
                    {quiz.completed ? "Retake Quiz" : "Start Quiz"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Practice */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Quick Practice</h3>
              <p className="text-muted-foreground text-sm">
                Get instant questions on any topic
              </p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/quiz/practice">
                <Zap className="w-4 h-4" />
                Start Practice
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
