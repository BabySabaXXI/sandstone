"use client";

import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProgressStore, type Achievement } from "@/stores/progress-store";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Zap,
  Crown,
  Play,
  Calendar,
  Trophy,
  Flame,
  Fire,
  Star,
  Award,
  CheckCircle,
  Target,
  Medal,
  PlusCircle,
  Layers,
  Clock,
  Hourglass,
  Timer,
  Sparkles,
  Lock,
  Unlock,
  Share2,
  X,
} from "lucide-react";

interface AchievementShowcaseProps {
  className?: string;
  compact?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Brain,
  GraduationCap,
  Zap,
  Crown,
  Play,
  Calendar,
  Trophy,
  Flame,
  Fire,
  Star,
  Award,
  CheckCircle,
  Target,
  Medal,
  PlusCircle,
  Layers,
  Clock,
  Hourglass,
  Timer,
  Sparkles,
};

const tierConfig = {
  bronze: {
    color: "from-amber-600 to-amber-700",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    label: "Bronze",
    points: 10,
  },
  silver: {
    color: "from-slate-400 to-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/20",
    borderColor: "border-slate-200 dark:border-slate-800",
    label: "Silver",
    points: 25,
  },
  gold: {
    color: "from-yellow-400 to-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    label: "Gold",
    points: 50,
  },
  platinum: {
    color: "from-cyan-400 to-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    label: "Platinum",
    points: 100,
  },
  diamond: {
    color: "from-purple-400 via-pink-400 to-red-400",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    label: "Diamond",
    points: 250,
  },
};

const categoryLabels: Record<Achievement["category"], string> = {
  study: "Study",
  streak: "Streak",
  mastery: "Mastery",
  social: "Social",
  special: "Special",
};

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  onClick?: () => void;
}

const AchievementCard = memo(function AchievementCard({
  achievement,
  showProgress = true,
  onClick,
}: AchievementCardProps) {
  const Icon = iconMap[achievement.icon] || Star;
  const tier = tierConfig[achievement.tier];
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border-2 cursor-pointer transition-all",
        tier.bgColor,
        tier.borderColor,
        isUnlocked ? "opacity-100" : "opacity-60",
        "hover:shadow-lg"
      )}
    >
      {/* Tier badge */}
      <div
        className={cn(
          "absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white",
          "bg-gradient-to-r",
          tier.color
        )}
      >
        {tier.label}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br",
            tier.color,
            isUnlocked ? "opacity-100" : "opacity-50"
          )}
        >
          {isUnlocked ? (
            <Icon className="w-7 h-7 text-white" />
          ) : (
            <Lock className="w-6 h-6 text-white/70" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold", !isUnlocked && "text-muted-foreground")}>
            {achievement.name}
          </h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>

          {/* Progress bar */}
          {showProgress && !isUnlocked && (
            <div className="mt-3 space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {achievement.progress} / {achievement.maxProgress}
              </p>
            </div>
          )}

          {/* Unlocked info */}
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Points */}
        <div className="text-right">
          <Badge variant="secondary" className="font-mono">
            +{achievement.points}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
});

interface AchievementDetailDialogProps {
  achievement: Achievement;
  open: boolean;
  onClose: () => void;
}

const AchievementDetailDialog = memo(function AchievementDetailDialog({
  achievement,
  open,
  onClose,
}: AchievementDetailDialogProps) {
  const Icon = iconMap[achievement.icon] || Star;
  const tier = tierConfig[achievement.tier];
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "bg-gradient-to-br",
                tier.color
              )}
            >
              <Icon className="w-4 h-4 text-white" />
            </span>
            {achievement.name}
          </DialogTitle>
          <DialogDescription>{achievement.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tier info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Tier</span>
            <Badge
              className={cn(
                "bg-gradient-to-r text-white border-0",
                tier.color
              )}
            >
              {tier.label}
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {achievement.progress} / {achievement.maxProgress}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-lg">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <>
                  <Unlock className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Unlocked
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Locked</span>
                </>
              )}
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Points Reward</span>
            <Badge variant="secondary" className="font-mono text-lg">
              +{achievement.points}
            </Badge>
          </div>

          {/* Share button (only for unlocked) */}
          {isUnlocked && (
            <Button className="w-full" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Achievement
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export const AchievementShowcase = memo(function AchievementShowcase({
  className,
  compact = false,
}: AchievementShowcaseProps) {
  const achievements = useProgressStore((state) => state.achievements);
  const totalPoints = useProgressStore((state) => state.totalPoints);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const unlockedAchievements = useMemo(
    () => achievements.filter((a) => a.unlockedAt),
    [achievements]
  );

  const lockedAchievements = useMemo(
    () => achievements.filter((a) => !a.unlockedAt),
    [achievements]
  );

  const filteredAchievements = useMemo(() => {
    switch (activeTab) {
      case "unlocked":
        return unlockedAchievements;
      case "locked":
        return lockedAchievements;
      case "study":
        return achievements.filter((a) => a.category === "study");
      case "streak":
        return achievements.filter((a) => a.category === "streak");
      case "mastery":
        return achievements.filter((a) => a.category === "mastery");
      default:
        return achievements;
    }
  }, [achievements, unlockedAchievements, lockedAchievements, activeTab]);

  const completionPercentage = useMemo(
    () => (unlockedAchievements.length / achievements.length) * 100,
    [unlockedAchievements.length, achievements.length]
  );

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">
                  {unlockedAchievements.length}/{achievements.length}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono">
              {totalPoints} pts
            </Badge>
          </div>
          <Progress value={completionPercentage} className="h-1.5 mt-3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Achievements
          </span>
          <Badge variant="secondary" className="font-mono">
            {totalPoints} points
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">
              {unlockedAchievements.length} of {achievements.length}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Category stats */}
        <div className="grid grid-cols-3 gap-2">
          {(["study", "streak", "mastery"] as const).map((category) => {
            const categoryAchievements = achievements.filter(
              (a) => a.category === category
            );
            const unlocked = categoryAchievements.filter((a) => a.unlockedAt).length;
            return (
              <div
                key={category}
                className="text-center p-2 bg-muted rounded-lg"
              >
                <p className="text-lg font-bold">
                  {unlocked}/{categoryAchievements.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoryLabels[category]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Done</TabsTrigger>
            <TabsTrigger value="locked">Lock</TabsTrigger>
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="streak">Fire</TabsTrigger>
            <TabsTrigger value="mastery">Master</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Detail dialog */}
      {selectedAchievement && (
        <AchievementDetailDialog
          achievement={selectedAchievement}
          open={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </Card>
  );
});

export default AchievementShowcase;
