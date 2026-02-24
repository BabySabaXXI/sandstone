'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Flame, 
  Lightbulb,
  AlertTriangle,
  Award,
  X,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Insight {
  id: string;
  type: 'improvement' | 'recommendation' | 'milestone' | 'warning';
  title: string;
  description: string;
  metric?: string;
  change?: number;
  createdAt: string;
  read: boolean;
}

interface InsightsPanelProps {
  insights: Insight[];
  onDismiss?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  maxItems?: number;
  className?: string;
}

const insightConfig = {
  improvement: {
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    label: 'Improvement',
  },
  recommendation: {
    icon: Lightbulb,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    label: 'Tip',
  },
  milestone: {
    icon: Award,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    label: 'Milestone',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'Attention',
  },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function InsightsPanel({ 
  insights, 
  onDismiss, 
  onMarkAsRead,
  maxItems = 10,
  className 
}: InsightsPanelProps) {
  const unreadInsights = insights.filter(i => !i.read);
  const displayInsights = unreadInsights.slice(0, maxItems);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Insights & Tips
              {unreadInsights.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadInsights.length} new
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Personalized recommendations for you</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="px-6 pb-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {displayInsights.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-muted-foreground font-medium">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No new insights at the moment
                  </p>
                </motion.div>
              ) : (
                displayInsights.map((insight, index) => {
                  const config = insightConfig[insight.type];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={insight.id}
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
                        "relative p-4 rounded-xl border transition-all duration-200 group",
                        config.bgColor,
                        config.borderColor,
                        "hover:shadow-md"
                      )}
                    >
                      {/* Dismiss Button */}
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(insight.id)}
                          className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/50"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}

                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={cn(
                            "p-2.5 rounded-xl flex-shrink-0",
                            config.bgColor.replace('/10', '/20')
                          )}
                        >
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs font-normal", config.color, config.borderColor)}
                            >
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(insight.createdAt)}
                            </span>
                          </div>

                          <h4 className="font-semibold text-sm">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.description}
                          </p>

                          {/* Metric Display */}
                          {insight.metric && insight.change !== undefined && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="mt-3 flex items-center gap-2"
                            >
                              <span className="text-xs text-muted-foreground">{insight.metric}:</span>
                              <span className={cn(
                                "text-sm font-bold flex items-center gap-1",
                                insight.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                              )}>
                                {insight.change >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {insight.change > 0 ? '+' : ''}{insight.change}%
                              </span>
                            </motion.div>
                          )}

                          {/* Mark as Read Button */}
                          {onMarkAsRead && !insight.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(insight.id)}
                              className="mt-3 h-8 text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
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

export function InsightBadge({ type, className }: { type: Insight['type']; className?: string }) {
  const config = insightConfig[type];
  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs", config.color, config.borderColor, className)}
    >
      {config.label}
    </Badge>
  );
}

export default InsightsPanel;
