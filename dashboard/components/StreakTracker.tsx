'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  weeklyData: boolean[];
  className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const streakMilestones = [
  { days: 3, label: 'Getting Started', reward: '50 pts' },
  { days: 7, label: 'Study Streak', reward: '150 pts' },
  { days: 14, label: 'Two Weeks Strong', reward: '300 pts' },
  { days: 30, label: 'Study Master', reward: '500 pts' },
  { days: 60, label: 'Study Legend', reward: '1000 pts' },
  { days: 100, label: 'Century Club', reward: '2000 pts' },
];

export function StreakTracker({ 
  currentStreak, 
  longestStreak, 
  lastStudyDate,
  weeklyData,
  className 
}: StreakTrackerProps) {
  const nextMilestone = streakMilestones.find(m => m.days > currentStreak) || streakMilestones[streakMilestones.length - 1];
  const progressToNext = (currentStreak / nextMilestone.days) * 100;
  
  // Check if streak is at risk (more than 1 day since last study)
  const lastStudy = new Date(lastStudyDate);
  const today = new Date();
  const daysSinceStudy = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
  const isStreakAtRisk = daysSinceStudy >= 1 && currentStreak > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Study Streak
            </CardTitle>
            <CardDescription>Keep your learning momentum going</CardDescription>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Badge 
              variant={currentStreak >= 7 ? 'default' : 'secondary'}
              className={cn(
                "text-lg px-3 py-1",
                currentStreak >= 7 && "bg-gradient-to-r from-orange-500 to-red-500"
              )}
            >
              <Flame className="w-4 h-4 mr-1" />
              {currentStreak} days
            </Badge>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Streak Warning */}
        {isStreakAtRisk && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700">Streak at Risk!</p>
              <p className="text-xs text-amber-600">
                You haven't studied today. Don't lose your {currentStreak}-day streak!
              </p>
            </div>
          </motion.div>
        )}

        {/* Weekly Calendar */}
        <div>
          <p className="text-sm font-medium mb-3">This Week</p>
          <div className="flex justify-between gap-1">
            {DAYS.map((day, index) => {
              const isActive = weeklyData[index];
              const isToday = index === new Date().getDay();
              
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30" 
                        : "bg-muted",
                      isToday && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                      >
                        <Flame className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-xs",
                    isToday ? "font-bold text-primary" : "text-muted-foreground"
                  )}>
                    {day}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-muted/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Next Milestone</span>
            </div>
            <p className="text-2xl font-bold">{nextMilestone.days}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </motion.div>
        </div>

        {/* Progress to Next Milestone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress to {nextMilestone.label}</span>
            <span className="text-sm text-muted-foreground">{nextMilestone.reward}</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressToNext} 
              className="h-3"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute right-0 -top-1"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {nextMilestone.days - currentStreak} more days to unlock {nextMilestone.label}
          </p>
        </div>

        {/* Milestone List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Milestones</p>
          <div className="space-y-1">
            {streakMilestones.slice(0, 4).map((milestone, index) => {
              const isReached = currentStreak >= milestone.days;
              const isNext = !isReached && currentStreak < milestone.days;
              
              return (
                <motion.div
                  key={milestone.days}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                    isReached 
                      ? "bg-emerald-500/10 text-emerald-700" 
                      : isNext 
                        ? "bg-amber-500/10 text-amber-700"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isReached ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-current" />
                    )}
                    <span>{milestone.days} days</span>
                    <span className="text-xs opacity-70">({milestone.label})</span>
                  </div>
                  <span className="text-xs font-medium">{milestone.reward}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MiniStreak({ currentStreak, className }: { currentStreak: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full",
        currentStreak >= 7 
          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20" 
          : "bg-muted",
        className
      )}
    >
      <Flame className={cn(
        "w-4 h-4",
        currentStreak >= 7 ? "text-orange-500" : "text-muted-foreground"
      )} />
      <span className={cn(
        "text-sm font-medium",
        currentStreak >= 7 ? "text-orange-700" : "text-muted-foreground"
      )}>
        {currentStreak} day streak
      </span>
    </motion.div>
  );
}

export default StreakTracker;
