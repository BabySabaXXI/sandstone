'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Flame, 
  Brain, 
  Trophy, 
  Star, 
  Clock,
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'FileText' | 'Flame' | 'Brain' | 'Trophy' | 'Star' | 'Clock';
  category: 'study' | 'essay' | 'quiz' | 'streak' | 'social';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
  color?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  delay?: number;
  onClick?: () => void;
}

const iconMap = {
  FileText,
  Flame,
  Brain,
  Trophy,
  Star,
  Clock,
};

const categoryColors = {
  study: 'from-emerald-500 to-teal-500',
  essay: 'from-blue-500 to-cyan-500',
  quiz: 'from-indigo-500 to-violet-500',
  streak: 'from-orange-500 to-red-500',
  social: 'from-pink-500 to-rose-500',
};

const categoryBgColors = {
  study: 'bg-emerald-500/10',
  essay: 'bg-blue-500/10',
  quiz: 'bg-indigo-500/10',
  streak: 'bg-orange-500/10',
  social: 'bg-pink-500/10',
};

export function AchievementCard({ achievement, delay = 0, onClick }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon];
  const progressPercentage = Math.min(100, (achievement.progress / achievement.requirement) * 100);
  const isNearUnlock = !achievement.unlocked && progressPercentage >= 75;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        type: 'spring',
        stiffness: 100 
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        onClick={onClick}
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300",
          achievement.unlocked 
            ? "hover:shadow-lg hover:shadow-primary/10" 
            : "opacity-80 grayscale hover:grayscale-[0.5]",
          isNearUnlock && "ring-2 ring-amber-500/50 animate-pulse"
        )}
      >
        {/* Unlocked Badge */}
        {achievement.unlocked && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="absolute top-3 right-3 z-10"
          >
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Unlocked
            </Badge>
          </motion.div>
        )}

        {/* Near Unlock Indicator */}
        {isNearUnlock && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-amber-500 text-white border-0">
              Almost There!
            </Badge>
          </div>
        )}

        {/* Locked Overlay */}
        {!achievement.unlocked && progressPercentage < 75 && (
          <div className="absolute top-3 right-3 z-10">
            <div className="p-1.5 rounded-full bg-muted">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: delay + 0.1 }}
              className={cn(
                "p-4 rounded-2xl bg-gradient-to-br flex-shrink-0",
                achievement.unlocked 
                  ? (achievement.color || categoryColors[achievement.category])
                  : 'from-gray-400 to-gray-500'
              )}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-bold text-lg",
                !achievement.unlocked && "text-muted-foreground"
              )}>
                {achievement.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {achievement.description}
              </p>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {achievement.progress}/{achievement.requirement}
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={progressPercentage} 
                    className={cn(
                      "h-2.5",
                      achievement.unlocked && "[&>div]:bg-gradient-to-r [&>div]:from-yellow-400 [&>div]:to-amber-500"
                    )}
                  />
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-0 -top-1"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Points */}
              {achievement.unlocked && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delay + 0.3 }}
                  className="mt-3 flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">
                    +{achievement.points} points
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Shine Effect for Unlocked */}
        {achievement.unlocked && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: 'linear',
              repeatDelay: 2
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
          />
        )}
      </Card>
    </motion.div>
  );
}

export function AchievementGrid({ 
  achievements, 
  className 
}: { 
  achievements: Achievement[]; 
  className?: string 
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {achievements.map((achievement, index) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}

export default AchievementCard;
