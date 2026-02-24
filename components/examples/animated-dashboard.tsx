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
  Bell,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Import animation components
import {
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
  AnimatedButton,
  AnimatedIcon,
  AnimatedBadge,
  ViewportAnimation,
} from "@/components/animations";

interface AnimatedDashboardProps {
  user: User;
}

const quickActions = [
  {
    title: "AI Grading",
    description: "Get instant feedback on your responses",
    icon: GraduationCap,
    href: "/grade",
    color: "from-amber-400 to-orange-500",
    badge: "Popular",
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
    badge: "New",
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

/**
 * AnimatedDashboard - Enhanced dashboard with smooth animations
 * 
 * Features:
 * - Staggered entrance animations
 * - Hover effects on cards
 * - Animated stats counters
 * - Smooth transitions
 */
export function AnimatedDashboard({ user }: AnimatedDashboardProps) {
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

  return (
    <StaggerContainer className="space-y-8" staggerDelay={0.1}>
      {/* Welcome Header */}
      <StaggerItem>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <motion.h1 
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Welcome back, {userName}!
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Here&apos;s what&apos;s happening with your learning journey.
            </motion.p>
          </div>
          <AnimatedIcon animation="pulse" hoverAnimation="scale">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </Button>
          </AnimatedIcon>
        </div>
      </StaggerItem>

      {/* Stats Grid */}
      <StaggerItem>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <ViewportAnimation key={stat.label} delay={index * 0.1} threshold={0.3}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <motion.span 
                            className="text-2xl font-bold"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                              duration: 0.5, 
                              delay: 0.5 + index * 0.1,
                              type: "spring",
                              stiffness: 200,
                            }}
                          >
                            {stat.value}
                          </motion.span>
                          <span className="text-xs text-emerald-500">{stat.change}</span>
                        </div>
                      </div>
                      <motion.div 
                        className="p-3 rounded-lg bg-muted"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <stat.icon className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ViewportAnimation>
          ))}
        </div>
      </StaggerItem>

      {/* Quick Actions */}
      <StaggerItem>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.3 + index * 0.08,
                  type: "spring",
                  stiffness: 300,
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 400, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={action.href}>
                  <Card className="group cursor-pointer h-full overflow-hidden relative">
                    {/* Gradient overlay on hover */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
                        action.color
                      )}
                    />
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          className={cn(
                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                            action.color
                          )}
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        {action.badge && (
                          <AnimatedBadge 
                            variant={action.badge === "New" ? "success" : "warning"}
                            pulse={action.badge === "New"}
                          >
                            {action.badge}
                          </AnimatedBadge>
                        )}
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
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
        </div>
      </StaggerItem>

      {/* Recent Activity & Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <StaggerItem>
          <ViewportAnimation delay={0.2} threshold={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StaggerContainer staggerDelay={0.08}>
                  {recentActivity.map((activity, index) => (
                    <StaggerItem key={index}>
                      <motion.div
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        whileHover={{ 
                          backgroundColor: "hsl(var(--accent))",
                          scale: 1.01,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              activity.type === "graded" && "bg-amber-500",
                              activity.type === "created" && "bg-blue-500",
                              activity.type === "completed" && "bg-emerald-500"
                            )}
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3,
                            }}
                          />
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                        {activity.score && (
                          <motion.span 
                            className="text-sm font-medium text-emerald-500"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            {activity.score}%
                          </motion.span>
                        )}
                        {activity.items && (
                          <span className="text-sm text-muted-foreground">
                            {activity.items} items
                          </span>
                        )}
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button variant="ghost" className="w-full gap-2" asChild>
                    <Link href="/activity">
                      View All Activity
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </ViewportAnimation>
        </StaggerItem>

        {/* Study Progress */}
        <StaggerItem>
          <ViewportAnimation delay={0.3} threshold={0.2}>
            <Card>
              <CardHeader>
                <CardTitle>Study Progress</CardTitle>
                <CardDescription>Your progress this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Economics", value: 75 },
                  { label: "Geography", value: 60 },
                  { label: "Flashcards Mastered", value: 42, max: 100, showMax: true },
                ].map((item, index) => (
                  <motion.div 
                    key={item.label} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.showMax ? `${item.value}/${item.max}` : `${item.value}%`}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.showMax ? (item.value / (item.max || 100)) * 100 : item.value}%` }}
                        transition={{ 
                          duration: 1, 
                          delay: 0.6 + index * 0.1,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
                <motion.div 
                  className="pt-4 border-t"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Goal</p>
                      <p className="text-sm text-muted-foreground">5 hours of study time</p>
                    </div>
                    <div className="text-right">
                      <motion.p 
                        className="text-2xl font-bold"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                      >
                        3.5
                      </motion.p>
                      <p className="text-sm text-muted-foreground">hours left</p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </ViewportAnimation>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
