'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Types
export interface WeeklyDataPoint {
  day: string;
  hours: number;
  essays: number;
  flashcards: number;
  quizzes: number;
  averageScore: number;
}

export interface SkillDataPoint {
  skill: string;
  score: number;
  fullMark: number;
}

export interface SubjectDataPoint {
  subject: string;
  score: number;
  essays: number;
  color?: string;
}

interface ProgressChartsProps {
  weeklyData: WeeklyDataPoint[];
  skillData: SkillDataPoint[];
  subjectData: SubjectDataPoint[];
  className?: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function StudyActivityChart({ data, className }: { data: WeeklyDataPoint[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Study Activity</CardTitle>
            <CardDescription>Your study patterns over time</CardDescription>
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
          <AreaChart data={data}>
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
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="hours" 
              name="Study Hours"
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorHours)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="essays" 
              name="Essays"
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorEssays)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SkillRadarChart({ data, className }: { data: SkillDataPoint[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Skill Analysis</CardTitle>
        <CardDescription>Your strengths and areas for improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
            />
            <Radar
              name="Your Skills"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SubjectPerformanceChart({ data, className }: { data: SubjectDataPoint[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Subject Performance</CardTitle>
        <CardDescription>Average scores by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              dataKey="subject" 
              type="category" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              width={80}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" name="Average Score" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ProgressOverTimeChart({ data, className }: { data: WeeklyDataPoint[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Progress Over Time</CardTitle>
        <CardDescription>Average essay scores trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="averageScore" 
              name="Average Score"
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SubjectDistributionChart({ data, className }: { data: SubjectDataPoint[]; className?: string }) {
  const pieData = data.map(d => ({
    name: d.subject,
    value: d.essays,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Subject Distribution</CardTitle>
        <CardDescription>Essays graded by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ComprehensiveProgressCharts({ 
  weeklyData, 
  skillData, 
  subjectData 
}: ProgressChartsProps) {
  return (
    <Tabs defaultValue="activity" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
      </TabsList>

      <TabsContent value="activity" className="mt-4">
        <StudyActivityChart data={weeklyData} />
      </TabsContent>

      <TabsContent value="skills" className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkillRadarChart data={skillData} />
          <SubjectPerformanceChart data={subjectData} />
        </div>
      </TabsContent>

      <TabsContent value="subjects" className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SubjectPerformanceChart data={subjectData} />
          <SubjectDistributionChart data={subjectData} />
        </div>
      </TabsContent>

      <TabsContent value="trends" className="mt-4">
        <ProgressOverTimeChart data={weeklyData} />
      </TabsContent>
    </Tabs>
  );
}

export default ProgressCharts;
