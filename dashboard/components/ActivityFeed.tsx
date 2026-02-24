'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  CheckCircle2, 
  BookOpen, 
  MessageSquare,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Activity {
  id: string;
  type: 'essay' | 'flashcard' | 'quiz' | 'document' | 'chat';
  title: string;
  subject: string;
  score?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const activityConfig = {
  essay: {
    icon: FileText,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Essay',
  },
  flashcard: {
    icon: Brain,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Flashcards',
  },
  quiz: {
    icon: CheckCircle2,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Quiz',
  },
  document: {
    icon: BookOpen,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Document',
  },
  chat: {
    icon: MessageSquare,
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-500/10',
    label: 'Chat',
  },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

export function ActivityFeed({ 
  activities, 
  maxItems = 10, 
  showViewAll = true,
  onViewAll,
  className 
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest study sessions</CardDescription>
          </div>
          {showViewAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAll}
              className="group/btn"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="px-6 pb-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {displayActivities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start studying to see your activity here
                  </p>
                </motion.div>
              ) : (
                displayActivities.map((activity, index) => {
                  const config = activityConfig[activity.type];
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ 
                        delay: index * 0.05,
                        type: 'spring',
                        stiffness: 100
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer group",
                        "hover:bg-muted/80 hover:shadow-sm"
                      )}
                    >
                      {/* Icon */}
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                          "p-3 rounded-xl flex-shrink-0",
                          config.bgColor
                        )}
                      >
                        <Icon className={cn("w-5 h-5", config.color.replace('bg-', 'text-'))} />
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-normal"
                          >
                            {activity.subject}
                          </Badge>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Score */}
                      {activity.score !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-lg font-bold",
                            getScoreColor(activity.score)
                          )}>
                            {activity.score}%
                          </span>
                        </div>
                      )}
                      
                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;
