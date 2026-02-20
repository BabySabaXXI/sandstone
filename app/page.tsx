"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { useAuth } from "@/components/auth-provider";
import { useEssayStore } from "@/stores/essay-store";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { useQuizStore } from "@/stores/quiz-store";
import { useSubjectStore } from "@/stores/subject-store";
import { FileText, GraduationCap, Layers, Sparkles, ArrowRight, Brain, TrendingUp, Clock, BookOpen } from "lucide-react";
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
  },
  {
    icon: Layers,
    title: "Flashcards",
    description: "Study with spaced repetition",
    href: "/flashcards",
    color: "#A8C5A8",
  },
  {
    icon: FileText,
    title: "Documents",
    description: "Organize your study notes",
    href: "/documents",
    color: "#A8C5D4",
  },
  {
    icon: Brain,
    title: "Quizzes",
    description: "Test your knowledge",
    href: "/quiz",
    color: "#E5C9A8",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
  const { essays, fetchEssays } = useEssayStore();
  const { decks, fetchDecks } = useFlashcardStore();
  const { quizzes, fetchQuizzes } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);

  const subjectConfig = getSubjectConfig(currentSubject);

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
    { label: "Responses Graded", value: totalEssays.toString() },
    { label: "Avg. Score", value: avgScore },
    { label: "Flashcards", value: totalCards.toString() },
    { label: "Due for Review", value: dueCards.toString() },
  ];

  const recentActivity = [
    ...subjectEssays.slice(0, 3).map((e) => ({
      id: e.id,
      type: "essay" as const,
      title: e.question.slice(0, 50) + "...",
      subtitle: `Score: ${e.overallScore?.toFixed(1) || "N/A"} • ${new Date(e.createdAt).toLocaleDateString()}`,
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
      <div className="max-w-4xl mx-auto">
        {/* Header with Subject Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-[#E8D5C4]/30 text-[#2D2D2D] px-4 py-2 rounded-full text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Learning</span>
            </div>
            <SubjectSwitcher />
          </div>
          
          <h1 className="text-hero text-[#2D2D2D] mb-4">
            {user ? `Welcome back, ${user.email?.split('@')[0] || 'Learner'}!` : "Master Your Studies"}
          </h1>
          <p className="text-body text-[#5A5A5A] max-w-xl mx-auto">
            Get instant, detailed feedback on your {subjectConfig?.name || "subject"} responses from our AI examiners.
            Track your progress and improve your academic skills.
          </p>
          {subjectConfig?.examBoard && (
            <p className="text-sm text-[#8A8A8A] mt-2">
              {subjectConfig.examBoard} • {subjectConfig.level}
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-4 text-center"
            >
              <div className="text-2xl font-bold text-[#2D2D2D]">{stat.value}</div>
              <div className="text-xs text-[#8A8A8A]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
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
                  <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-6 hover:shadow-card-hover transition-all duration-300 group">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${feature.color}30` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-semibold text-[#2D2D2D] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#5A5A5A] mb-4">{feature.description}</p>
                    <div className="flex items-center text-sm text-[#8A8A8A] group-hover:text-[#2D2D2D] transition-colors">
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
          className="bg-white rounded-xl border border-[#E5E5E0] shadow-card overflow-hidden"
        >
          <div className="p-6 border-b border-[#E5E5E0]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E8D5C4]" />
                <h2 className="text-h3 text-[#2D2D2D]">Recent Activity</h2>
              </div>
              <Link 
                href="/library" 
                className="text-sm text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors"
              >
                View all
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-[#E5E5E0]">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-[#FAFAF8] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${activity.color}30` }}
                  >
                    <activity.icon className="w-5 h-5" style={{ color: activity.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2D2D2D] truncate">{activity.title}</p>
                    <p className="text-xs text-[#8A8A8A]">{activity.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E5E5E0]" />
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-[#8A8A8A]">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[#E8D5C4]" />
                <p>Start grading responses to see your activity here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: "Knowledge", tip: "Demonstrate understanding of key concepts", icon: BookOpen },
            { title: "Analysis", tip: "Develop clear chains of reasoning", icon: TrendingUp },
            { title: "Evaluation", tip: "Provide balanced critical assessment", icon: Brain },
          ].map((item, index) => (
            <div key={item.title} className="bg-[#F5F5F0] rounded-xl p-4">
              <h4 className="font-medium text-[#2D2D2D] text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-[#5A5A5A]">{item.tip}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </ThreePanel>
  );
}
