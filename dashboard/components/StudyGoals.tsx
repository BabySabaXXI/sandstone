'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  FileText, 
  Brain, 
  CheckCircle2,
  Target,
  TrendingUp,
  Calendar,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  category: 'time' | 'essays' | 'flashcards' | 'quizzes';
  deadline?: string;
}

interface StudyGoalsProps {
  goals: StudyGoal[];
  onUpdateProgress?: (goalId: string, progress: number) => void;
  className?: string;
}

const goalConfig = {
  time: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    gradient: 'from-blue-500 to-cyan-500',
  },
  essays: {
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    gradient: 'from-purple-500 to-pink-500',
  },
  flashcards: {
    icon: Brain,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    gradient: 'from-emerald-500 to-teal-500',
  },
  quizzes: {
    icon: CheckCircle2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    gradient: 'from-amber-500 to-orange-500',
  },
};

const periodLabels = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
};

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-emerald-500';
  if (percentage >= 75) return 'bg-blue-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getMotivationalMessage(percentage: number): string {
  if (percentage >= 100) return "Goal completed! Amazing work!";
  if (percentage >= 75) return "Almost there! Keep pushing!";
  if (percentage >= 50) return "Halfway there! Stay focused!";
  if (percentage >= 25) return "Good start! Keep going!";
  return "Let's get started!";
}

export function StudyGoals({ goals, onUpdateProgress, className }: StudyGoalsProps) {
  const totalProgress = goals.reduce((sum, goal) => {
    return sum + Math.min(100, (goal.current / goal.target) * 100);
  }, 0) / goals.length;

  const completedGoals = goals.filter(g => g.current >= g.target).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Study Goals
            </CardTitle>
            <CardDescription>Track your daily and weekly targets</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{completedGoals}/{goals.length}</div>
            <p className="text-xs text-muted-foreground">Goals completed</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{Math.round(totalProgress)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={totalProgress} 
              className="h-3"
            />
            {totalProgress >= 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-0 -top-1"
              >
                <Flame className="w-5 h-5 text-orange-500" />
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const config = goalConfig[goal.category];
            const Icon = config.icon;
            const percentage = Math.min(100, (goal.current / goal.target) * 100);
            const isCompleted = percentage >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200",
                  isCompleted 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-muted/30 border-transparent hover:border-border"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "p-3 rounded-xl flex-shrink-0",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {periodLabels[goal.period]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">{goal.current}</span>
                      <span>/</span>
                      <span>{goal.target}</span>
                      <span>{goal.unit}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <Progress 
                        value={percentage} 
                        className={cn("h-2.5", getProgressColor(percentage))}
                      />
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-0 -top-1"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                      )}
                    </div>

                    {/* Motivational Message */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={cn(
                        "text-xs mt-2",
                        isCompleted ? 'text-emerald-500' : 'text-muted-foreground'
                      )}
                    >
                      {getMotivationalMessage(percentage)}
                    </motion.p>

                    {/* Quick Actions */}
                    {onUpdateProgress && !isCompleted && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onUpdateProgress(goal.id, goal.current + 1)}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onUpdateProgress(goal.id, Math.min(goal.target, goal.current + Math.ceil(goal.target * 0.1)))}
                        >
                          +10%
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalSummary({ goals, className }: { goals: StudyGoal[]; className?: string }) {
  const completedGoals = goals.filter(g => g.current >= g.target).length;
  const totalProgress = goals.reduce((sum, goal) => {
    return sum + Math.min(100, (goal.current / goal.target) * 100);
  }, 0) / goals.length;

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-700">Completed</span>
        </div>
        <p className="text-2xl font-bold text-emerald-600">{completedGoals}</p>
        <p className="text-xs text-emerald-600/70">Goals achieved</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-blue-700">Progress</span>
        </div>
        <p className="text-2xl font-bold text-blue-600">{Math.round(totalProgress)}%</p>
        <p className="text-xs text-blue-600/70">Average completion</p>
      </motion.div>
    </div>
  );
}

export default StudyGoals;
