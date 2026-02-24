'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BookOpen, 
  Target, 
  Award, 
  Clock, 
  Calendar,
  Flame,
  Brain,
  BarChart3,
  ChevronRight,
  Zap,
  Star,
  Trophy,
  Activity,
  FileText,
  MessageSquare,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { useDashboardStore } from '@/stores/dashboardStore';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

// Mock data for charts
const studyTimeData = [
  { day: 'Mon', hours: 2.5, essays: 3, flashcards: 45 },
  { day: 'Tue', hours: 3.2, essays: 4, flashcards: 62 },
  { day: 'Wed', hours: 1.8, essays: 2, flashcards: 30 },
  { day: 'Thu', hours: 4.0, essays: 5, flashcards: 80 },
  { day: 'Fri', hours: 2.9, essays: 3, flashcards: 55 },
  { day: 'Sat', hours: 5.5, essays: 7, flashcards: 120 },
  { day: 'Sun', hours: 3.8, essays: 4, flashcards: 75 },
];

const subjectPerformanceData = [
  { subject: 'Economics', score: 85, maxScore: 100, essays: 28 },
  { subject: 'Geography', score: 72, maxScore: 100, essays: 15 },
];

const aoBreakdownData = [
  { name: 'AO1', fullMark: 'Knowledge', score: 22, maxScore: 25, percentage: 88 },
  { name: 'AO2', fullMark: 'Application', score: 18, maxScore: 25, percentage: 72 },
  { name: 'AO3', fullMark: 'Analysis', score: 20, maxScore: 25, percentage: 80 },
  { name: 'AO4', fullMark: 'Evaluation', score: 16, maxScore: 25, percentage: 64 },
];

const skillRadarData = [
  { skill: 'Knowledge', A: 88, fullMark: 100 },
  { skill: 'Application', A: 72, fullMark: 100 },
  { skill: 'Analysis', A: 80, fullMark: 100 },
  { skill: 'Evaluation', A: 64, fullMark: 100 },
  { skill: 'Structure', A: 75, fullMark: 100 },
  { skill: 'Examples', A: 82, fullMark: 100 },
];

const activityData = [
  { id: 1, type: 'essay', title: 'Essay graded: Market Failure', subject: 'Economics', score: 85, time: '2 hours ago' },
  { id: 2, type: 'flashcard', title: 'Completed 50 flashcards', subject: 'Economics', time: '4 hours ago' },
  { id: 3, type: 'quiz', title: 'Quiz completed: Microeconomics', subject: 'Economics', score: 92, time: 'Yesterday' },
  { id: 4, type: 'essay', title: 'Essay graded: Climate Change', subject: 'Geography', score: 78, time: 'Yesterday' },
  { id: 5, type: 'document', title: 'Added new notes: Fiscal Policy', subject: 'Economics', time: '2 days ago' },
];

const achievements = [
  { 
    id: 1, 
    title: 'Essay Master', 
    description: 'Grade 50 essays', 
    icon: FileText, 
    progress: 43, 
    total: 50, 
    unlocked: false,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 2, 
    title: 'Study Streak', 
    description: '7-day study streak', 
    icon: Flame, 
    progress: 7, 
    total: 7, 
    unlocked: true,
    color: 'from-orange-500 to-red-500'
  },
  { 
    id: 3, 
    title: 'Flashcard Wizard', 
    description: 'Review 500 flashcards', 
    icon: Brain, 
    progress: 467, 
    total: 500, 
    unlocked: false,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    id: 4, 
    title: 'Perfect Score', 
    description: 'Get 100% on an essay', 
    icon: Star, 
    progress: 1, 
    total: 1, 
    unlocked: true,
    color: 'from-yellow-500 to-amber-500'
  },
  { 
    id: 5, 
    title: 'Knowledge Seeker', 
    description: 'Study 100 hours total', 
    icon: BookOpen, 
    progress: 87, 
    total: 100, 
    unlocked: false,
    color: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 6, 
    title: 'Quiz Champion', 
    description: 'Complete 20 quizzes', 
    icon: Trophy, 
    progress: 18, 
    total: 20, 
    unlocked: false,
    color: 'from-indigo-500 to-violet-500'
  },
];

const insights = [
  {
    id: 1,
    type: 'improvement',
    title: 'Evaluation Skills Improving',
    description: 'Your AO4 scores have increased by 15% this week. Keep practicing those judgment calls!',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 2,
    type: 'recommendation',
    title: 'Focus on Application',
    description: 'Your AO2 scores are lower than other areas. Try using more real-world examples in your essays.',
    icon: Target,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  {
    id: 3,
    type: 'milestone',
    title: 'Study Streak Active!',
    description: 'You\'ve studied for 7 consecutive days. Your dedication is paying off!',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { stats, loading, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!mounted) return null;

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }: any) => (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2", color)} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              {trend && (
                <div className={cn("flex items-center gap-1 mt-2 text-sm", trend === 'up' ? 'text-emerald-500' : 'text-red-500')}>
                  {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", color.replace('bg-', 'bg-opacity-20 bg-'))}>
              <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-sm text-muted-foreground">Track your learning progress and achievements</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                {['day', 'week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      selectedPeriod === period 
                        ? "bg-background shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Study Hours" 
              value="23.7" 
              subtitle="This week"
              icon={Clock}
              trend="up"
              trendValue="+12%"
              color="bg-blue-500"
            />
            <StatCard 
              title="Essays Graded" 
              value="43" 
              subtitle="Total graded"
              icon={FileText}
              trend="up"
              trendValue="+8%"
              color="bg-purple-500"
            />
            <StatCard 
              title="Average Score" 
              value="78.5" 
              subtitle="Out of 100"
              icon={Target}
              trend="up"
              trendValue="+5%"
              color="bg-emerald-500"
            />
            <StatCard 
              title="Current Streak" 
              value="7" 
              subtitle="Days"
              icon={Flame}
              trend="up"
              trendValue="Best: 12"
              color="bg-orange-500"
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Study Time Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Study Activity</CardTitle>
                          <CardDescription>Hours spent studying this week</CardDescription>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">Hours</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <span className="text-muted-foreground">Essays</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={studyTimeData}>
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEssays" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="hours" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorHours)" 
                            strokeWidth={2}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="essays" 
                            stroke="#8b5cf6" 
                            fillOpacity={1} 
                            fill="url(#colorEssays)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Insights Panel */}
                <motion.div variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Insights & Tips
                      </CardTitle>
                      <CardDescription>Personalized recommendations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[280px]">
                        <div className="space-y-4">
                          {insights.map((insight) => (
                            <motion.div
                              key={insight.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-lg", insight.bgColor)}>
                                  <insight.icon className={cn("w-4 h-4", insight.color)} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{insight.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Subject Performance & AO Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                      <CardDescription>Average scores by subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {subjectPerformanceData.map((subject) => (
                          <div key={subject.subject} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{subject.subject}</p>
                                  <p className="text-xs text-muted-foreground">{subject.essays} essays graded</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{subject.score}%</p>
                              </div>
                            </div>
                            <Progress value={subject.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Objectives</CardTitle>
                      <CardDescription>Performance by AO breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={aoBreakdownData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={40} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: any) => [`${value}%`, 'Score']}
                          />
                          <Bar dataKey="percentage" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {aoBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Radar Chart */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Skill Analysis</CardTitle>
                      <CardDescription>Your strengths and areas for improvement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={skillRadarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <Radar
                            name="Your Skills"
                            dataKey="A"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Progress Over Time */}
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress Over Time</CardTitle>
                      <CardDescription>Average essay scores trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={studyTimeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Weekly Goals */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Goals</CardTitle>
                    <CardDescription>Track your study targets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Study Hours', current: 23.7, target: 30, unit: 'hrs' },
                        { label: 'Essays Graded', current: 28, target: 35, unit: '' },
                        { label: 'Flashcards Reviewed', current: 467, target: 500, unit: '' },
                      ].map((goal) => (
                        <div key={goal.label} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{goal.label}</span>
                            <span className="text-sm text-muted-foreground">
                              {goal.current}/{goal.target} {goal.unit}
                            </span>
                          </div>
                          <div className="relative">
                            <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                            <span className="absolute right-0 -top-6 text-xs font-medium text-primary">
                              {Math.round((goal.current / goal.target) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest study sessions</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activityData.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                        >
                          <div className={cn(
                            "p-3 rounded-xl",
                            activity.type === 'essay' && "bg-blue-500/10",
                            activity.type === 'flashcard' && "bg-purple-500/10",
                            activity.type === 'quiz' && "bg-emerald-500/10",
                            activity.type === 'document' && "bg-amber-500/10"
                          )}>
                            {activity.type === 'essay' && <FileText className="w-5 h-5 text-blue-500" />}
                            {activity.type === 'flashcard' && <Brain className="w-5 h-5 text-purple-500" />}
                            {activity.type === 'quiz' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {activity.type === 'document' && <BookOpen className="w-5 h-5 text-amber-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">{activity.subject}</Badge>
                              <span>•</span>
                              <span>{activity.time}</span>
                            </div>
                          </div>
                          {activity.score && (
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-lg font-bold",
                                activity.score >= 80 ? 'text-emerald-500' : 
                                activity.score >= 60 ? 'text-amber-500' : 'text-red-500'
                              )}>
                                {activity.score}%
                              </span>
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    variants={itemVariants}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "relative overflow-hidden group cursor-pointer transition-all duration-300",
                      achievement.unlocked ? "hover:shadow-lg" : "opacity-75 grayscale"
                    )}>
                      {achievement.unlocked && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                            <Trophy className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-4 rounded-2xl bg-gradient-to-br",
                            achievement.color
                          )}>
                            <achievement.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{achievement.progress}/{achievement.total}</span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.total) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Achievement Stats */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Stats</CardTitle>
                    <CardDescription>Your achievement progress overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary">2</div>
                        <p className="text-sm text-muted-foreground mt-1">Achievements Unlocked</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-emerald-500">33%</div>
                        <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-500">4</div>
                        <p className="text-sm text-muted-foreground mt-1">In Progress</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-500">1,250</div>
                        <p className="text-sm text-muted-foreground mt-1">Total Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
