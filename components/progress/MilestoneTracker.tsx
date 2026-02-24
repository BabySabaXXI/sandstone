"use client";

import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProgressStore, type Milestone } from "@/stores/progress-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Target,
  CheckCircle2,
  Circle,
  Trophy,
  Gift,
  Crown,
  Star,
  Zap,
  Clock,
  Calendar,
  TrendingUp,
  Flame,
  BookOpen,
  ChevronRight,
  Lock,
  Sparkles,
} from "lucide-react";

interface MilestoneTrackerProps {
  className?: string;
  compact?: boolean;
}

const categoryConfig: Record<
  Milestone["category"],
  { icon: React.ElementType; color: string; label: string }
> = {
  cards: { icon: BookOpen, color: "text-blue-500", label: "Cards" },
  mastery: { icon: Crown, color: "text-purple-500", label: "Mastery" },
  streak: { icon: Flame, color: "text-orange-500", label: "Streak" },
  time: { icon: Clock, color: "text-green-500", label: "Time" },
  consistency: { icon: Calendar, color: "text-cyan-500", label: "Consistency" },
};

const rewardConfig: Record<
  Milestone["reward"]["type"],
  { icon: React.ElementType; label: string }
> = {
  title: { icon: Crown, label: "Title" },
  theme: { icon: Sparkles, label: "Theme" },
  badge: { icon: Trophy, label: "Badge" },
  points: { icon: Star, label: "Points" },
};

interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: () => void;
}

const MilestoneCard = memo(function MilestoneCard({
  milestone,
  onClick,
}: MilestoneCardProps) {
  const category = categoryConfig[milestone.category];
  const CategoryIcon = category.icon;
  const progress = Math.min((milestone.current / milestone.target) * 100, 100);
  const isCompleted = milestone.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
        isCompleted
          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800"
          : "bg-card border-border hover:border-primary/50"
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-3 right-3">
        {isCompleted ? (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Circle className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex items-start gap-4 pr-10">
        {/* Category icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-muted",
            category.color
          )}
        >
          <CategoryIcon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold">{milestone.name}</h4>
          <p className="text-sm text-muted-foreground">
            {milestone.description}
          </p>

          {/* Progress */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {milestone.current.toLocaleString()} /{" "}
                {milestone.target.toLocaleString()}
              </span>
            </div>
            <Progress
              value={progress}
              className={cn("h-2", isCompleted && "bg-green-200")}
            />
          </div>

          {/* Reward */}
          <div className="mt-3 flex items-center gap-2">
            <Badge
              variant={isCompleted ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isCompleted && "bg-green-500 hover:bg-green-600"
              )}
            >
              <Gift className="w-3 h-3 mr-1" />
              Reward: {milestone.reward.value}
            </Badge>
          </div>

          {/* Completed date */}
          {isCompleted && milestone.completedAt && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Completed on{" "}
              {new Date(milestone.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

interface MilestoneDetailDialogProps {
  milestone: Milestone | null;
  open: boolean;
  onClose: () => void;
}

const MilestoneDetailDialog = memo(function MilestoneDetailDialog({
  milestone,
  open,
  onClose,
}: MilestoneDetailDialogProps) {
  if (!milestone) return null;

  const category = categoryConfig[milestone.category];
  const CategoryIcon = category.icon;
  const reward = rewardConfig[milestone.reward.type];
  const RewardIcon = reward.icon;
  const progress = Math.min((milestone.current / milestone.target) * 100, 100);
  const isCompleted = milestone.completed;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-muted",
                category.color
              )}
            >
              <CategoryIcon className="w-4 h-4" />
            </span>
            {milestone.name}
          </DialogTitle>
          <DialogDescription>{milestone.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {milestone.current.toLocaleString()} /{" "}
                {milestone.target.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Status */}
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              isCompleted
                ? "bg-green-50 dark:bg-green-950/20"
                : "bg-muted"
            )}
          >
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Completed
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">In Progress</span>
                </>
              )}
            </div>
          </div>

          {/* Reward */}
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Reward
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                <RewardIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">{milestone.reward.value}</p>
                <p className="text-sm text-muted-foreground">{reward.label}</p>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="secondary">{category.label}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export const MilestoneTracker = memo(function MilestoneTracker({
  className,
  compact = false,
}: MilestoneTrackerProps) {
  const milestones = useProgressStore((state) => state.milestones);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const completedMilestones = useMemo(
    () => milestones.filter((m) => m.completed),
    [milestones]
  );

  const pendingMilestones = useMemo(
    () => milestones.filter((m) => !m.completed),
    [milestones]
  );

  const filteredMilestones = useMemo(() => {
    switch (activeTab) {
      case "completed":
        return completedMilestones;
      case "pending":
        return pendingMilestones;
      default:
        return milestones;
    }
  }, [milestones, completedMilestones, pendingMilestones, activeTab]);

  const completionPercentage = useMemo(
    () => (completedMilestones.length / milestones.length) * 100,
    [completedMilestones.length, milestones.length]
  );

  // Get next milestone (closest to completion)
  const nextMilestone = useMemo(() => {
    return pendingMilestones
      .map((m) => ({ ...m, progress: m.current / m.target }))
      .sort((a, b) => b.progress - a.progress)[0];
  }, [pendingMilestones]);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-2xl font-bold">
                  {completedMilestones.length}/{milestones.length}
                </p>
              </div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-1.5 mt-3" />
          {nextMilestone && (
            <p className="text-xs text-muted-foreground mt-2">
              Next: {nextMilestone.name} ({Math.round((nextMilestone.current / nextMilestone.target) * 100)}%)
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Milestones
          </span>
          <Badge variant="secondary">
            {completedMilestones.length}/{milestones.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">
              {completedMilestones.length} of {milestones.length} completed
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Next milestone */}
        {nextMilestone && (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Next Milestone
              </span>
            </div>
            <p className="font-semibold">{nextMilestone.name}</p>
            <p className="text-sm text-muted-foreground">
              {nextMilestone.description}
            </p>
            <div className="mt-2">
              <Progress
                value={(nextMilestone.current / nextMilestone.target) * 100}
                className="h-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {nextMilestone.current.toLocaleString()} /{" "}
                {nextMilestone.target.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Category stats */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const categoryMilestones = milestones.filter(
              (m) => m.category === key
            );
            const completed = categoryMilestones.filter((m) => m.completed).length;
            const Icon = config.icon;
            return (
              <div
                key={key}
                className="text-center p-2 bg-muted rounded-lg"
              >
                <Icon className={cn("w-4 h-4 mx-auto mb-1", config.color)} />
                <p className="text-sm font-bold">
                  {completed}/{categoryMilestones.length}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Done</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {filteredMilestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    onClick={() => setSelectedMilestone(milestone)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Detail dialog */}
      <MilestoneDetailDialog
        milestone={selectedMilestone}
        open={!!selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
      />
    </Card>
  );
});

export default MilestoneTracker;
