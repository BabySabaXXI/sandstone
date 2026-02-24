"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { AIChat } from "@/components/layout/AIChat";
import { ThemeToggle } from "@/components/theme-toggle";
import { TouchButton } from "@/components/ui/TouchButton";
import { MobileCard } from "@/components/ui/MobileCard";
import { useAuth } from "@/components/auth-provider";
import { useMobile } from "@/hooks/useMobile";
import { useSwipe } from "@/hooks/useSwipe";
import { useEssayStore } from "@/stores/essay-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { useQuizStore } from "@/stores/quiz-store";
import { useSubjectStore } from "@/stores/subject-store";
import { 
  FileText, 
  GraduationCap, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Brain, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  MessageCircle,
  ChevronRight
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
  const { isMobile } = useMobile();
  const { currentSubject } = useSubjectStore();
  const { essays, fetchEssays } = useEssayStore();
  const { decks, fetchDecks } = useFlashcardStore();
  const { quizzes, fetchQuizzes } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const subjectConfig = getSubjectConfig(currentSubject);

  // Swipe gesture for quick navigation
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      // Could navigate to next section
      console.log("Swiped left");
    },
    onSwipeRight: () => {
      // Could navigate to previous section
      console.log("Swiped right");
    },
    threshold: 80,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchEssays(),
        fetchDecks(),
        fetchQuizzes(),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchEssays, fetchDecks, fetchQuizzes, currentSubject]);

  // Calculate stats
  const subjectEssays = essays.filter((e) => e.subject === currentSubject);
  const subjectDecks = decks.filter((d) => d.subject === currentSubject);
  
  const totalEssays = subjectEssays.length;
  const avgScore = subjectEssays.length > 0
    ? (subjectEssays.reduce((sum, e) => sum + (e.overallScore || 0), 0) / subjectEssays.length).toFixed(1)
    : "0.0";
  const totalCards = subjectDecks.reduce((sum, d) => sum + d.cards.length, 0);
  const dueCards = subjectDecks.reduce((sum, d) => {
    const now = new Date();
    return sum + d.cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
  }, 0);

  const stats = [
    { label: "Responses", value: totalEssays.toString(), sublabel: "Graded" },
    { label: "Avg Score", value: avgScore, sublabel: "/25" },
    { label: "Cards", value: totalCards.toString(), sublabel: "Total" },
    { label: "Due", value: dueCards.toString(), sublabel: "For Review" },
  ];

  const recentActivity = [
    ...subjectEssays.slice(0, 3).map((e) => ({
      id: e.id,
      type: "essay" as const,
      title: e.question.slice(0, 50) + "...",
      subtitle: `Score: ${e.overallScore?.toFixed(1) || "N/A"} • ${new Date(e.createdAt).toLocaleDateString()}`,
      icon: FileText,
      color: "#E8D5C4",
      darkColor: "#D4C4B0",
    })),
    ...subjectDecks.slice(0, 2).map((d) => ({
      id: d.id,
      type: "deck" as const,
      title: d.name,
      subtitle: `${d.cards.length} cards`,
      icon: Layers,
      color: "#A8C5A8",
      darkColor: "#8BA88B",
    })),
  ].slice(0, 5);

  return (
    <ThreePanel>
      <div className="max-w-4xl mx-auto" {...swipeHandlers}>
        {/* Theme Toggle - Top Right (Desktop only) */}
        <div className="hidden lg:block fixed top-6 right-6 z-40">
          <ThemeToggle />
        </div>

        {/* AI Chat Button - Floating */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "fixed z-50 flex items-center justify-center transition-all duration-300 touch-manipulation",
            "w-14 h-14 min-w-[56px] min-h-[56px] rounded-full",
            "shadow-soft-lg hover:shadow-soft-xl",
            isMobile ? "bottom-24 right-4" : "bottom-6 right-6",
            isChatOpen 
              ? "bg-primary text-primary-foreground" 
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
          aria-label={isChatOpen ? "Close AI Chat" : "Open AI Chat"}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>

        {/* AI Chat Popup */}
        <AnimatePresence>
          {isChatOpen && <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        </AnimatePresence>

        {/* Header with Subject Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className={cn(
            "flex items-center justify-center gap-3 mb-4 lg:mb-6",
            isMobile && "flex-wrap"
          )}>
            <div className="inline-flex items-center gap-2 bg-accent/30 text-foreground px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Learning</span>
            </div>
            <SubjectSwitcher />
          </div>
          
          <h1 className={cn(
            "text-foreground mb-4",
            isMobile ? "text-2xl font-bold" : "text-hero"
          )}>
            {user ? `Welcome back, ${user.email?.split('@')[0] || 'Learner'}!` : "Master Your Studies"}
          </h1>
          <p className="text-body text-muted-foreground max-w-xl mx-auto px-2">
            Get instant, detailed feedback on your {subjectConfig?.name || "subject"} responses from our AI examiners.
            Track your progress and improve your academic skills.
          </p>
          {subjectConfig?.examBoard && (
            <p className="text-sm text-muted-foreground mt-2">
              {subjectConfig.examBoard} • {subjectConfig.level}
            </p>
          )}
        </motion.div>

        {/* Stats - Mobile optimized grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "grid gap-3 lg:gap-4 mb-8 lg:mb-12",
            isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card border border-border rounded-xl shadow-soft p-3 lg:p-4 text-center touch-manipulation"
            >
              <div className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              {stat.sublabel && (
                <div className="text-[10px] text-muted-foreground/70">{stat.sublabel}</div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cn(
            "grid gap-4 lg:gap-6 mb-8 lg:mb-12",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}
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
                  <MobileCard
                    variant="interactive"
                    padding={isMobile ? "sm" : "md"}
                    className="group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                          isMobile ? "w-10 h-10" : "w-12 h-12"
                        )}
                        style={{ backgroundColor: `${feature.color}30` }}
                      >
                        <Icon 
                          className={cn(
                            "transition-colors",
                            isMobile ? "w-5 h-5" : "w-6 h-6"
                          )} 
                          style={{ color: feature.color }} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-semibold text-foreground mb-1",
                          isMobile && "text-sm"
                        )}>
                          {feature.title}
                        </h3>
                        <p className={cn(
                          "text-muted-foreground mb-3",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          {feature.description}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          <span className={isMobile ? "text-xs" : ""}>Get started</span>
                          <ChevronRight className={cn(
                            "ml-1 group-hover:translate-x-1 transition-transform",
                            isMobile ? "w-3 h-3" : "w-4 h-4"
                          )} />
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Activity - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
        >
          <div className="p-4 lg:p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className={cn(
                  "text-foreground",
                  isMobile ? "text-base font-semibold" : "text-h3"
                )}>
                  Recent Activity
                </h2>
              </div>
              <Link 
                href="/library" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 lg:p-6 flex items-center gap-4 hover:bg-accent/5 transition-colors touch-manipulation"
                >
                  <div
                    className={cn(
                      "rounded-xl flex items-center justify-center flex-shrink-0",
                      isMobile ? "w-10 h-10" : "w-12 h-12"
                    )}
                    style={{ backgroundColor: `${activity.color}30` }}
                  >
                    <activity.Icon 
                      className={isMobile ? "w-5 h-5" : "w-6 h-6"}
                      style={{ color: activity.color }} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-foreground truncate",
                      isMobile && "text-sm"
                    )}>
                      {activity.title}
                    </p>
                    <p className={cn(
                      "text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {activity.subtitle}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Start grading or creating flashcards to see activity here
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions - Mobile only */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              Quick Actions
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <TouchButton
                variant="primary"
                size="sm"
                className="flex-shrink-0"
                onClick={() => window.location.href = "/grade"}
              >
                <GraduationCap className="w-4 h-4" />
                Grade Now
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
                onClick={() => window.location.href = "/flashcards"}
              >
                <Layers className="w-4 h-4" />
                Study Cards
              </TouchButton>
              <TouchButton
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
                onClick={() => window.location.href = "/quiz"}
              >
                <Brain className="w-4 h-4" />
                Take Quiz
              </TouchButton>
            </div>
          </motion.div>
        )}
      </div>
    </ThreePanel>
  );
}
