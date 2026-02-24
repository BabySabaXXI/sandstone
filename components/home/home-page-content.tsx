"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { AIChat } from "@/components/layout/AIChat";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSubjectStore } from "@/stores/subject-store";
import { 
  FileText, 
  GraduationCap, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Clock, 
  BookOpen, 
  MessageCircle,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSubjectConfig } from "@/lib/subjects/config";
import type { User } from "@supabase/supabase-js";

// Feature cards configuration
const FEATURES = [
  {
    icon: GraduationCap,
    title: "AI Response Grading",
    description: "Get instant feedback from AI examiners based on official mark schemes",
    href: "/grade",
    color: "#E8D5C4",
    darkColor: "#D4C4B0",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Study with spaced repetition and track your progress",
    href: "/flashcards",
    color: "#A8C5A8",
    darkColor: "#8BA88B",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: FileText,
    title: "Documents",
    description: "Organize your study notes and access them anywhere",
    href: "/documents",
    color: "#A8C5D4",
    darkColor: "#8BA8C4",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: Brain,
    title: "Quizzes",
    description: "Test your knowledge with AI-generated questions",
    href: "/quiz",
    color: "#E5C9A8",
    darkColor: "#D4B898",
    gradient: "from-purple-400 to-pink-500",
  },
] as const;

// Stats configuration
interface Stat {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  trend?: "up" | "down" | "neutral";
}

interface HomePageContentProps {
  user: User;
}

export function HomePageContent({ user }: HomePageContentProps) {
  const { currentSubject } = useSubjectStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stats, setStats] = useState<Stat[]>([
    { label: "Responses Graded", value: "0", icon: FileText },
    { label: "Avg. Score", value: "0.0", icon: TrendingUp },
    { label: "Flashcards", value: "0", icon: Layers },
    { label: "Due for Review", value: "0", icon: Target },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/stats?subject=${currentSubject}`, {
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats([
          { label: "Responses Graded", value: data.essaysCount.toString(), icon: FileText },
          { label: "Avg. Score", value: data.avgScore.toFixed(1), icon: TrendingUp },
          { label: "Flashcards", value: data.flashcardsCount.toString(), icon: Layers },
          { label: "Due for Review", value: data.dueCards.toString(), icon: Target },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSubject]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const subjectConfig = getSubjectConfig(currentSubject);
  const userName = user.email?.split("@")[0] || "Learner";

  return (
    <ThreePanel>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-6 right-6 z-40">
          <ThemeToggle />
        </div>

        {/* AI Chat Button - Floating */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isChatOpen 
              ? "bg-primary text-primary-foreground rotate-45" 
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          {isChatOpen ? (
            <Zap className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </motion.button>

        {/* AI Chat Popup */}
        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <motion.div 
              className="inline-flex items-center gap-2 bg-accent/30 text-foreground px-4 py-2 rounded-full text-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Learning</span>
            </motion.div>
            <SubjectSwitcher />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome back, <span className="text-accent">{userName}</span>!
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant, detailed feedback on your {subjectConfig?.name || "subject"} responses 
            from our AI examiners. Track your progress and improve your academic skills.
          </p>
          
          {subjectConfig?.examBoard && (
            <p className="text-sm text-muted-foreground mt-3 inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
              <BookOpen className="w-4 h-4" />
              {subjectConfig.examBoard} • {subjectConfig.level}
            </p>
          )}
        </motion.header>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="bg-card border border-border rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Feature Cards Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link href={feature.href} className="block h-full">
                    <article className="group h-full bg-card border border-border rounded-xl shadow-sm p-6 hover:shadow-md hover:border-accent/50 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} flex-shrink-0`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {feature.description}
                          </p>
                          <div className="flex items-center text-sm text-accent font-medium">
                            <span>Get started</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Recent Activity Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              </div>
              <Link 
                href="/library" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <Suspense fallback={<ActivitySkeleton />}>
              <RecentActivityList subject={currentSubject} />
            </Suspense>
          </div>
        </motion.section>
      </div>
    </ThreePanel>
  );
}

// Recent Activity List Component
function RecentActivityList({ subject }: { subject: string }) {
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: string;
    title: string;
    subtitle: string;
    date: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/user/activity?subject=${subject}&limit=5`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [subject]);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No recent activity</p>
        <p className="text-sm">Start grading responses or creating flashcards to see activity here</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map((activity, index) => (
        <motion.li
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            {activity.type === "essay" ? (
              <FileText className="w-5 h-5 text-accent" />
            ) : activity.type === "deck" ? (
              <Layers className="w-5 h-5 text-accent" />
            ) : (
              <BookOpen className="w-5 h-5 text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
          </div>
          <time className="text-xs text-muted-foreground flex-shrink-0">
            {new Date(activity.date).toLocaleDateString()}
          </time>
        </motion.li>
      ))}
    </ul>
  );
}

// Activity Skeleton Loader
function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
