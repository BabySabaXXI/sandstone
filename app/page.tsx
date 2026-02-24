"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { Grid, GridItem } from "@/components/layout/Grid";
import { VStack, HStack } from "@/components/layout/Stack";
import { Container } from "@/components/layout/Container";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { AIChat } from "@/components/layout/AIChat";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
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
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getSubjectConfig } from "@/lib/subjects/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================================
// FEATURE CONFIGURATION
// ============================================================================

const features = [
  {
    icon: GraduationCap,
    title: "AI Response Grading",
    description: "Get instant feedback from AI examiners with detailed analysis",
    href: "/grade",
    color: "#E8D5C4",
    darkColor: "#D4C4B0",
    badge: "Popular",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Study with spaced repetition for better retention",
    href: "/flashcards",
    color: "#A8C5A8",
    darkColor: "#8BA88B",
    badge: null,
  },
  {
    icon: FileText,
    title: "Documents",
    description: "Organize and manage your study notes efficiently",
    href: "/documents",
    color: "#A8C5D4",
    darkColor: "#8BA8C4",
    badge: null,
  },
  {
    icon: Brain,
    title: "Quizzes",
    description: "Test your knowledge with AI-generated questions",
    href: "/quiz",
    color: "#E5C9A8",
    darkColor: "#D4B898",
    badge: "New",
  },
];

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({
  label,
  value,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card className="hover:shadow-soft-md transition-shadow duration-300">
      <CardContent className="p-4">
        <HStack gap={3} align="center">
          <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </HStack>
      </CardContent>
    </Card>
  </motion.div>
);

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

const FeatureCard = ({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) => {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
    >
      <Link href={feature.href}>
        <Card className="group h-full hover:shadow-soft-md transition-all duration-300 border-border/50 hover:border-accent/50">
          <CardContent className="p-6">
            <HStack gap={4} align="start">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${feature.color}40` }}
              >
                <Icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <HStack gap={2} align="center" className="mb-1">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  {feature.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </HStack>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Get started</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </HStack>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

const ActivityItem = ({
  activity,
  index,
}: {
  activity: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
  };
  index: number;
}) => {
  const Icon = activity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${activity.color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: activity.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
        <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
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
    return sum + d.cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
  }, 0);

  const stats = [
    { label: "Responses Graded", value: totalEssays.toString(), icon: FileText },
    { label: "Avg. Score", value: avgScore, icon: TrendingUp },
    { label: "Flashcards", value: totalCards.toString(), icon: Layers },
    { label: "Due for Review", value: dueCards.toString(), icon: Clock },
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
    })),
    ...subjectDecks.slice(0, 2).map((d) => ({
      id: d.id,
      type: "deck" as const,
      title: d.name,
      subtitle: `${d.cards.length} cards`,
      icon: Layers,
      color: "#A8C5A8",
    })),
  ].slice(0, 5);

  return (
    <ThreePanel>
      <Container size="wide" padding={0}>
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
            "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-soft-lg hover:shadow-soft-xl",
            isChatOpen
              ? "bg-primary text-primary-foreground"
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
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
          className="text-center mb-12"
        >
          <HStack gap={3} justify="center" className="mb-6">
            <div className="inline-flex items-center gap-2 bg-accent/30 text-foreground px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Learning</span>
            </div>
            <SubjectSwitcher />
          </HStack>

          <h1 className="text-hero text-foreground mb-4">
            {user ? `Welcome back, ${user.email?.split("@")[0] || "Learner"}!` : "Master Your Studies"}
          </h1>
          <p className="text-body text-muted-foreground max-w-xl mx-auto">
            Get instant, detailed feedback on your {subjectConfig?.name || "subject"} responses from
            our AI examiners. Track your progress and improve your academic skills.
          </p>
          {subjectConfig?.examBoard && (
            <p className="text-sm text-muted-foreground mt-2">
              {subjectConfig.examBoard} • {subjectConfig.level}
            </p>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <Grid cols={2} colsMd={4} gap={4}>
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                delay={0.2 + index * 0.1}
              />
            ))}
          </Grid>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <Grid cols={1} colsMd={2} gap={6}>
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </Grid>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <HStack justify="between" align="center">
                <HStack gap={2} align="center">
                  <Clock className="w-5 h-5 text-accent" />
                  <CardTitle className="text-h4">Recent Activity</CardTitle>
                </HStack>
                <Link
                  href="/library"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                </Link>
              </HStack>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length > 0 ? (
                <VStack gap={0} className="divide-y divide-border">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem key={activity.id} activity={activity} index={index} />
                  ))}
                </VStack>
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Start grading responses or creating flashcards to see activity here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </ThreePanel>
  );
}
