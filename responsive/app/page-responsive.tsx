"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveThreePanel } from "@/components/layout/ResponsiveThreePanel";
import { ResponsiveAIChat } from "@/components/layout/ResponsiveAIChat";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { useEssayStore } from "@/stores/essay-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { useQuizStore } from "@/stores/quiz-store";
import { useSubjectStore } from "@/stores/subject-store";
import { useResponsive } from "@/hooks/useResponsive";
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
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSubjectConfig } from "@/lib/subjects/config";

const features = [
  {
    icon: GraduationCap,
    title: "AI Response Grading",
    description: "Get instant feedback from AI examiners",
    href: "/grade",
    color: "#E8D5C4",
    darkColor: "#D4C4B0",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Study with spaced repetition",
    href: "/flashcards",
    color: "#A8C5A8",
    darkColor: "#8BA88B",
  },
  {
    icon: FileText,
    title: "Documents",
    description: "Organize your study notes",
    href: "/documents",
    color: "#A8C5D4",
    darkColor: "#8BA8C4",
  },
  {
    icon: Brain,
    title: "Quizzes",
    description: "Test your knowledge",
    href: "/quiz",
    color: "#E5C9A8",
    darkColor: "#D4B898",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
  const { isMobile, isTablet } = useResponsive();
  const { essays, fetchEssays } = useEssayStore();
  const { decks, fetchDecks } = useFlashcardStore();
  const { quizzes, fetchQuizzes } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const subjectConfig = getSubjectConfig(currentSubject);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchEssays(), fetchDecks(), fetchQuizzes()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchEssays, fetchDecks, fetchQuizzes, currentSubject]);

  // Calculate stats
  const subjectEssays = essays.filter((e) => e.subject === currentSubject);
  const subjectDecks = decks.filter((d) => d.subject === currentSubject);

  const totalEssays = subjectEssays.length;
  const avgScore =
    subjectEssays.length > 0
      ? (
          subjectEssays.reduce((sum, e) => sum + (e.overallScore || 0), 0) /
          subjectEssays.length
        ).toFixed(1)
      : "0.0";
  const totalCards = subjectDecks.reduce((sum, d) => sum + d.cards.length, 0);
  const dueCards = subjectDecks.reduce((sum, d) => {
    const now = new Date();
    return (
      sum +
      d.cards.filter((c) => !c.nextReview || c.nextReview <= now).length
    );
  }, 0);

  const stats = [
    { label: "Responses", value: totalEssays.toString(), icon: FileText },
    { label: "Avg Score", value: avgScore, icon: TrendingUp },
    { label: "Flashcards", value: totalCards.toString(), icon: Layers },
    { label: "Due", value: dueCards.toString(), icon: Clock },
  ];

  const recentActivity = [
    ...subjectEssays.slice(0, 3).map((e) => ({
      id: e.id,
      type: "essay" as const,
      title: e.question.slice(0, 50) + "...",
      subtitle: `Score: ${e.overallScore?.toFixed(1) || "N/A"} • ${new Date(
        e.createdAt
      ).toLocaleDateString()}`,
      icon: FileText,
      color: "#E8D5C4",
      href: `/grade/${e.id}`,
    })),
    ...subjectDecks.slice(0, 2).map((d) => ({
      id: d.id,
      type: "deck" as const,
      title: d.name,
      subtitle: `${d.cards.length} cards`,
      icon: Layers,
      color: "#A8C5A8",
      href: `/flashcards/${d.id}`,
    })),
  ].slice(0, 5);

  return (
    <ResponsiveThreePanel>
      <div className="max-w-4xl mx-auto pt-16 lg:pt-6">
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-4 right-4 lg:top-6 lg:right-6 z-dropdown">
          <ThemeToggle />
        </div>

        {/* AI Chat Button - Floating */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-dropdown w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-mobile-lg",
            isChatOpen
              ? "bg-primary text-primary-foreground"
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>

        {/* AI Chat Popup */}
        <AnimatePresence>
          {isChatOpen && (
            <ResponsiveAIChat
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Header with Subject Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-accent/30 text-foreground px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Learning</span>
            </div>
            <SubjectSwitcher />
          </div>

          <h1 className="text-responsive-hero text-foreground mb-4">
            {user
              ? `Welcome back, ${user.email?.split("@")[0] || "Learner"}!`
              : "Master Your Studies"}
          </h1>
          <p className="text-responsive-body text-muted-foreground max-w-xl mx-auto px-4">
            Get instant, detailed feedback on your {subjectConfig?.name || "subject"}{" "}
            responses from our AI examiners. Track your progress and improve your
            academic skills.
          </p>
          {subjectConfig?.examBoard && (
            <p className="text-sm text-muted-foreground mt-2">
              {subjectConfig.examBoard} • {subjectConfig.level}
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8 lg:mb-12 px-4 lg:px-0"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-card border border-border rounded-xl shadow-soft p-4 text-center"
              >
                <Icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <div className="text-xl lg:text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8 lg:mb-12 px-4 lg:px-0"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link href={feature.href}>
                  <div className="group bg-card border border-border rounded-xl shadow-soft p-5 lg:p-6 hover:shadow-soft-md transition-all duration-300 touch-feedback">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                      style={{ backgroundColor: `${feature.color}30` }}
                    >
                      <Icon
                        className="w-6 h-6 transition-colors"
                        style={{ color: feature.color }}
                      />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-responsive-h3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-xl shadow-soft overflow-hidden mx-4 lg:mx-0"
        >
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="text-responsive-h3 text-foreground">
                  Recent Activity
                </h2>
              </div>
              <Link
                href="/library"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={activity.href}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors touch-target-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}30` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: activity.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">
                  Start grading or creating flashcards to see activity here
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions - Mobile Only */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 px-4"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Actions
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              <Link
                href="/grade"
                className="flex-shrink-0 px-4 py-3 bg-[#E8D5C4]/20 rounded-xl text-sm font-medium text-[#2D2D2D] dark:text-white flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Grade Response
              </Link>
              <Link
                href="/flashcards"
                className="flex-shrink-0 px-4 py-3 bg-[#A8C5A8]/20 rounded-xl text-sm font-medium text-[#2D2D2D] dark:text-white flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Study Cards
              </Link>
              <Link
                href="/quiz"
                className="flex-shrink-0 px-4 py-3 bg-[#E5C9A8]/20 rounded-xl text-sm font-medium text-[#2D2D2D] dark:text-white flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                Take Quiz
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </ResponsiveThreePanel>
  );
}
