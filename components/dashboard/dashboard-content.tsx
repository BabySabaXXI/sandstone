"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import {
  GraduationCap,
  Layers,
  FileText,
  Sparkles,
  Library,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface DashboardContentProps {
  user: User;
}

const quickActions = [
  {
    title: "AI Grading",
    description: "Get instant feedback on your responses",
    icon: GraduationCap,
    href: "/grade",
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "Flashcards",
    description: "Review with spaced repetition",
    icon: Layers,
    href: "/flashcards",
    color: "from-emerald-400 to-teal-500",
  },
  {
    title: "Documents",
    description: "Manage your study materials",
    icon: FileText,
    href: "/documents",
    color: "from-blue-400 to-indigo-500",
  },
  {
    title: "Quiz",
    description: "Test your knowledge",
    icon: Sparkles,
    href: "/quiz",
    color: "from-purple-400 to-pink-500",
  },
  {
    title: "Library",
    description: "Browse study resources",
    icon: Library,
    href: "/library",
    color: "from-rose-400 to-red-500",
  },
];

const recentActivity = [
  { type: "graded", title: "Economics Essay", time: "2 hours ago", score: 85 },
  { type: "created", title: "Flashcard Deck", time: "5 hours ago", items: 24 },
  { type: "completed", title: "Geography Quiz", time: "1 day ago", score: 92 },
];

const stats = [
  { label: "Responses Graded", value: 24, change: "+12%", icon: TrendingUp },
  { label: "Study Streak", value: 7, change: "days", icon: Target },
  { label: "Time Studied", value: 48, change: "hours", icon: Clock },
];

export function DashboardContent({ user }: DashboardContentProps) {
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your learning journey.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-xs text-emerald-500">{stat.change}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={action.href}>
                <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                        action.color
                      )}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity & Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        activity.type === "graded" && "bg-amber-500",
                        activity.type === "created" && "bg-blue-500",
                        activity.type === "completed" && "bg-emerald-500"
                      )}
                    />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  {activity.score && (
                    <span className="text-sm font-medium text-emerald-500">
                      {activity.score}%
                    </span>
                  )}
                  {activity.items && (
                    <span className="text-sm text-muted-foreground">
                      {activity.items} items
                    </span>
                  )}
                </div>
              ))}
              <Button variant="ghost" className="w-full gap-2" asChild>
                <Link href="/activity">
                  View All Activity
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Study Progress</CardTitle>
              <CardDescription>Your progress this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Economics</span>
                  <span className="text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Geography</span>
                  <span className="text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Flashcards Mastered</span>
                  <span className="text-muted-foreground">42/100</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Goal</p>
                    <p className="text-sm text-muted-foreground">5 hours of study time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">3.5</p>
                    <p className="text-sm text-muted-foreground">hours left</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
