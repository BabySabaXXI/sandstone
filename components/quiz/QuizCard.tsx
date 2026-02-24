"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Clock,
  Trophy,
  Target,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  BarChart3,
  CheckCircle,
  Archive,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Quiz, QuizDifficulty } from "@/lib/quiz/quiz-types";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  quiz: Quiz;
  userScore?: number;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quizId: string) => void;
  onArchive?: (quizId: string) => void;
  showActions?: boolean;
}

const difficultyConfig: Record<QuizDifficulty, { label: string; color: string; icon: React.ReactNode }> = {
  easy: {
    label: "Easy",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <Star className="w-3 h-3" />,
  },
  medium: {
    label: "Medium",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Star className="w-3 h-3" />,
  },
  hard: {
    label: "Hard",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    icon: <Star className="w-3 h-3" />,
  },
  expert: {
    label: "Expert",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <Star className="w-3 h-3" />,
  },
};

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  published: { label: "Published", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  archived: { label: "Archived", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
};

export function QuizCard({
  quiz,
  userScore,
  onEdit,
  onDelete,
  onArchive,
  showActions = true,
}: QuizCardProps) {
  const hasCompleted = userScore !== undefined;
  const isPassed = hasCompleted && userScore >= quiz.settings.passingScore;

  // Calculate average difficulty
  const avgDifficulty = quiz.questions.length > 0
    ? (quiz.questions.reduce((sum, q) => {
        const diffMap = { easy: 1, medium: 2, hard: 3, expert: 4 };
        return sum + diffMap[q.difficulty];
      }, 0) / quiz.questions.length)
    : 1;

  const overallDifficulty: QuizDifficulty =
    avgDifficulty <= 1.5 ? "easy" :
    avgDifficulty <= 2.5 ? "medium" :
    avgDifficulty <= 3.5 ? "hard" : "expert";

  const difficulty = difficultyConfig[overallDifficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className={cn(
            "h-2",
            overallDifficulty === "easy" && "bg-gradient-to-r from-emerald-400 to-emerald-500",
            overallDifficulty === "medium" && "bg-gradient-to-r from-amber-400 to-amber-500",
            overallDifficulty === "hard" && "bg-gradient-to-r from-rose-400 to-rose-500",
            overallDifficulty === "expert" && "bg-gradient-to-r from-purple-400 to-purple-500",
          )} />

          <div className="p-6">
            {/* Top row with badges and actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className={cn("text-xs", difficulty.color)}>
                  {difficulty.icon}
                  <span className="ml-1">{difficulty.label}</span>
                </Badge>
                <Badge variant="secondary" className={cn("text-xs", statusConfig[quiz.status].color)}>
                  {statusConfig[quiz.status].label}
                </Badge>
                {isPassed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passed
                  </Badge>
                )}
              </div>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(quiz)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={`/quiz/${quiz.id}/analytics`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {onArchive && quiz.status !== "archived" && (
                      <DropdownMenuItem onClick={() => onArchive(quiz.id)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(quiz.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Title and description */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{quiz.title}</h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {quiz.description || "No description provided"}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>{quiz.questions.length} questions</span>
              </div>
              {quiz.settings.timeLimit && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.settings.timeLimit} min</span>
                </div>
              )}
              {quiz.attemptCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>{quiz.attemptCount} attempts</span>
                </div>
              )}
            </div>

            {/* Score progress if completed */}
            {hasCompleted && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Your Score</span>
                  <span className={cn(
                    "font-medium",
                    isPassed ? "text-green-600" : "text-amber-600"
                  )}>
                    {userScore}%
                  </span>
                </div>
                <Progress 
                  value={userScore} 
                  className="h-2"
                />
              </div>
            )}

            {/* Tags */}
            {quiz.tags && quiz.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {quiz.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {quiz.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{quiz.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action button */}
            <Button 
              className="w-full gap-2" 
              asChild
              variant={hasCompleted ? "outline" : "default"}
            >
              <Link href={`/quiz/${quiz.id}`}>
                <Play className="w-4 h-4" />
                {hasCompleted ? "Retake Quiz" : "Start Quiz"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
