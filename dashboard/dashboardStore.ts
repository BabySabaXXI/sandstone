import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface StudySession {
  id: string;
  date: string;
  duration: number;
  subject: string;
  activityType: 'essay' | 'flashcard' | 'quiz' | 'document' | 'chat';
  score?: number;
}

export interface EssayGrade {
  id: string;
  date: string;
  subject: string;
  topic: string;
  totalScore: number;
  maxScore: number;
  aoScores: {
    ao1: number;
    ao2: number;
    ao3: number;
    ao4: number;
  };
  feedback: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'essay' | 'quiz' | 'streak' | 'social';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  category: 'time' | 'essays' | 'flashcards' | 'quizzes';
}

export interface Insight {
  id: string;
  type: 'improvement' | 'recommendation' | 'milestone' | 'warning';
  title: string;
  description: string;
  metric?: string;
  change?: number;
  createdAt: string;
  read: boolean;
}

export interface DashboardStats {
  totalStudyHours: number;
  totalEssaysGraded: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  totalFlashcardsReviewed: number;
  totalQuizzesCompleted: number;
  subjectsStudied: number;
  lastStudyDate: string;
}

export interface WeeklyData {
  day: string;
  hours: number;
  essays: number;
  flashcards: number;
  quizzes: number;
  averageScore: number;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  essaysGraded: number;
  studyHours: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface DashboardState {
  // Data
  stats: DashboardStats;
  studySessions: StudySession[];
  essayGrades: EssayGrade[];
  achievements: Achievement[];
  goals: StudyGoal[];
  insights: Insight[];
  weeklyData: WeeklyData[];
  subjectPerformance: SubjectPerformance[];
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedPeriod: 'day' | 'week' | 'month' | 'year';
  selectedSubject: string | null;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  addEssayGrade: (grade: Omit<EssayGrade, 'id'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  markInsightAsRead: (insightId: string) => void;
  setSelectedPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
  setSelectedSubject: (subject: string | null) => void;
  checkAchievements: () => void;
  generateInsights: () => void;
  
  // Computed
  getWeeklyProgress: () => number;
  getMonthlyProgress: () => number;
  getSubjectBreakdown: () => { subject: string; percentage: number }[];
  getAOBreakdown: () => { ao: string; score: number; maxScore: number }[];
  getRecentActivity: (limit?: number) => StudySession[];
  getUnlockedAchievements: () => Achievement[];
  getUnreadInsights: () => Insight[];
}

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'essay-novice',
    title: 'Essay Novice',
    description: 'Grade your first essay',
    icon: 'FileText',
    category: 'essay',
    requirement: 1,
    progress: 0,
    unlocked: false,
    points: 50,
  },
  {
    id: 'essay-apprentice',
    title: 'Essay Apprentice',
    description: 'Grade 10 essays',
    icon: 'FileText',
    category: 'essay',
    requirement: 10,
    progress: 0,
    unlocked: false,
    points: 100,
  },
  {
    id: 'essay-master',
    title: 'Essay Master',
    description: 'Grade 50 essays',
    icon: 'FileText',
    category: 'essay',
    requirement: 50,
    progress: 0,
    unlocked: false,
    points: 250,
  },
  {
    id: 'essay-expert',
    title: 'Essay Expert',
    description: 'Grade 100 essays',
    icon: 'FileText',
    category: 'essay',
    requirement: 100,
    progress: 0,
    unlocked: false,
    points: 500,
  },
  {
    id: 'study-streak-3',
    title: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: 'Flame',
    category: 'streak',
    requirement: 3,
    progress: 0,
    unlocked: false,
    points: 75,
  },
  {
    id: 'study-streak-7',
    title: 'Study Streak',
    description: 'Maintain a 7-day study streak',
    icon: 'Flame',
    category: 'streak',
    requirement: 7,
    progress: 0,
    unlocked: false,
    points: 150,
  },
  {
    id: 'study-streak-30',
    title: 'Study Master',
    description: 'Maintain a 30-day study streak',
    icon: 'Flame',
    category: 'streak',
    requirement: 30,
    progress: 0,
    unlocked: false,
    points: 500,
  },
  {
    id: 'flashcard-beginner',
    title: 'Flashcard Beginner',
    description: 'Review 100 flashcards',
    icon: 'Brain',
    category: 'study',
    requirement: 100,
    progress: 0,
    unlocked: false,
    points: 100,
  },
  {
    id: 'flashcard-enthusiast',
    title: 'Flashcard Enthusiast',
    description: 'Review 500 flashcards',
    icon: 'Brain',
    category: 'study',
    requirement: 500,
    progress: 0,
    unlocked: false,
    points: 250,
  },
  {
    id: 'flashcard-wizard',
    title: 'Flashcard Wizard',
    description: 'Review 1000 flashcards',
    icon: 'Brain',
    category: 'study',
    requirement: 1000,
    progress: 0,
    unlocked: false,
    points: 500,
  },
  {
    id: 'quiz-whiz',
    title: 'Quiz Whiz',
    description: 'Complete 10 quizzes',
    icon: 'Trophy',
    category: 'quiz',
    requirement: 10,
    progress: 0,
    unlocked: false,
    points: 150,
  },
  {
    id: 'quiz-champion',
    title: 'Quiz Champion',
    description: 'Complete 25 quizzes',
    icon: 'Trophy',
    category: 'quiz',
    requirement: 25,
    progress: 0,
    unlocked: false,
    points: 300,
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 100% on an essay',
    icon: 'Star',
    category: 'essay',
    requirement: 1,
    progress: 0,
    unlocked: false,
    points: 200,
  },
  {
    id: 'study-hours-10',
    title: 'Getting Serious',
    description: 'Study for 10 hours total',
    icon: 'Clock',
    category: 'study',
    requirement: 10,
    progress: 0,
    unlocked: false,
    points: 100,
  },
  {
    id: 'study-hours-50',
    title: 'Dedicated Student',
    description: 'Study for 50 hours total',
    icon: 'Clock',
    category: 'study',
    requirement: 50,
    progress: 0,
    unlocked: false,
    points: 250,
  },
  {
    id: 'study-hours-100',
    title: 'Knowledge Seeker',
    description: 'Study for 100 hours total',
    icon: 'Clock',
    category: 'study',
    requirement: 100,
    progress: 0,
    unlocked: false,
    points: 500,
  },
];

// Default goals
const defaultGoals: StudyGoal[] = [
  {
    id: 'weekly-hours',
    title: 'Weekly Study Hours',
    target: 20,
    current: 0,
    unit: 'hours',
    period: 'weekly',
    category: 'time',
  },
  {
    id: 'weekly-essays',
    title: 'Weekly Essays',
    target: 5,
    current: 0,
    unit: 'essays',
    period: 'weekly',
    category: 'essays',
  },
  {
    id: 'weekly-flashcards',
    title: 'Weekly Flashcards',
    target: 200,
    current: 0,
    unit: 'cards',
    period: 'weekly',
    category: 'flashcards',
  },
  {
    id: 'daily-quiz',
    title: 'Daily Quiz',
    target: 1,
    current: 0,
    unit: 'quiz',
    period: 'daily',
    category: 'quizzes',
  },
];

// Mock data generator
const generateMockWeeklyData = (): WeeklyData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    hours: Math.random() * 5 + 1,
    essays: Math.floor(Math.random() * 5),
    flashcards: Math.floor(Math.random() * 100 + 20),
    quizzes: Math.floor(Math.random() * 3),
    averageScore: Math.floor(Math.random() * 30 + 65),
  }));
};

const generateMockSubjectPerformance = (): SubjectPerformance[] => [
  {
    subject: 'Economics',
    averageScore: 82,
    essaysGraded: 45,
    studyHours: 67.5,
    trend: 'up',
    trendValue: 5,
  },
  {
    subject: 'Geography',
    averageScore: 76,
    essaysGraded: 23,
    studyHours: 34.2,
    trend: 'stable',
    trendValue: 0,
  },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      stats: {
        totalStudyHours: 0,
        totalEssaysGraded: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalFlashcardsReviewed: 0,
        totalQuizzesCompleted: 0,
        subjectsStudied: 0,
        lastStudyDate: '',
      },
      studySessions: [],
      essayGrades: [],
      achievements: defaultAchievements,
      goals: defaultGoals,
      insights: [],
      weeklyData: generateMockWeeklyData(),
      subjectPerformance: generateMockSubjectPerformance(),
      loading: false,
      error: null,
      selectedPeriod: 'week',
      selectedSubject: null,

      // Actions
      fetchDashboardData: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update with mock data
          set({
            stats: {
              totalStudyHours: 101.7,
              totalEssaysGraded: 68,
              averageScore: 78.5,
              currentStreak: 7,
              longestStreak: 12,
              totalFlashcardsReviewed: 1247,
              totalQuizzesCompleted: 18,
              subjectsStudied: 2,
              lastStudyDate: new Date().toISOString(),
            },
            loading: false,
          });
          
          // Check achievements and generate insights
          get().checkAchievements();
          get().generateInsights();
        } catch (error) {
          set({ error: 'Failed to fetch dashboard data', loading: false });
        }
      },

      addStudySession: (session) => {
        const newSession: StudySession = {
          ...session,
          id: Math.random().toString(36).substr(2, 9),
        };
        
        set(state => ({
          studySessions: [newSession, ...state.studySessions],
          stats: {
            ...state.stats,
            totalStudyHours: state.stats.totalStudyHours + session.duration / 60,
            lastStudyDate: session.date,
          },
        }));
        
        get().checkAchievements();
        get().generateInsights();
      },

      addEssayGrade: (grade) => {
        const newGrade: EssayGrade = {
          ...grade,
          id: Math.random().toString(36).substr(2, 9),
        };
        
        set(state => {
          const newTotalEssays = state.stats.totalEssaysGraded + 1;
          const newAverageScore = Math.round(
            ((state.stats.averageScore * state.stats.totalEssaysGraded) + grade.totalScore) / newTotalEssays
          );
          
          return {
            essayGrades: [newGrade, ...state.essayGrades],
            stats: {
              ...state.stats,
              totalEssaysGraded: newTotalEssays,
              averageScore: newAverageScore,
            },
          };
        });
        
        get().checkAchievements();
        get().generateInsights();
      },

      updateGoalProgress: (goalId, progress) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId ? { ...goal, current: progress } : goal
          ),
        }));
      },

      markInsightAsRead: (insightId) => {
        set(state => ({
          insights: state.insights.map(insight =>
            insight.id === insightId ? { ...insight, read: true } : insight
          ),
        }));
      },

      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setSelectedSubject: (subject) => set({ selectedSubject: subject }),

      checkAchievements: () => {
        const state = get();
        const { stats, achievements } = state;
        
        const updatedAchievements = achievements.map(achievement => {
          if (achievement.unlocked) return achievement;
          
          let progress = 0;
          
          switch (achievement.id) {
            case 'essay-novice':
            case 'essay-apprentice':
            case 'essay-master':
            case 'essay-expert':
              progress = stats.totalEssaysGraded;
              break;
            case 'study-streak-3':
            case 'study-streak-7':
            case 'study-streak-30':
              progress = stats.currentStreak;
              break;
            case 'flashcard-beginner':
            case 'flashcard-enthusiast':
            case 'flashcard-wizard':
              progress = stats.totalFlashcardsReviewed;
              break;
            case 'quiz-whiz':
            case 'quiz-champion':
              progress = stats.totalQuizzesCompleted;
              break;
            case 'perfect-score':
              progress = state.essayGrades.some(g => g.totalScore === 100) ? 1 : 0;
              break;
            case 'study-hours-10':
            case 'study-hours-50':
            case 'study-hours-100':
              progress = Math.floor(stats.totalStudyHours);
              break;
          }
          
          const unlocked = progress >= achievement.requirement;
          
          return {
            ...achievement,
            progress,
            unlocked,
            unlockedAt: unlocked && !achievement.unlocked ? new Date().toISOString() : achievement.unlockedAt,
          };
        });
        
        set({ achievements: updatedAchievements });
      },

      generateInsights: () => {
        const state = get();
        const { stats, essayGrades, subjectPerformance } = state;
        const newInsights: Insight[] = [];
        
        // Check for streak milestone
        if (stats.currentStreak > 0 && stats.currentStreak % 7 === 0) {
          newInsights.push({
            id: `streak-${stats.currentStreak}`,
            type: 'milestone',
            title: `${stats.currentStreak}-Day Streak!`,
            description: `Amazing! You've studied for ${stats.currentStreak} consecutive days. Keep it up!`,
            createdAt: new Date().toISOString(),
            read: false,
          });
        }
        
        // Check for improvement in specific AO
        if (essayGrades.length >= 5) {
          const recentGrades = essayGrades.slice(0, 5);
          const olderGrades = essayGrades.slice(5, 10);
          
          if (olderGrades.length > 0) {
            const recentAO4 = recentGrades.reduce((sum, g) => sum + g.aoScores.ao4, 0) / recentGrades.length;
            const olderAO4 = olderGrades.reduce((sum, g) => sum + g.aoScores.ao4, 0) / olderGrades.length;
            
            if (recentAO4 > olderAO4 + 2) {
              newInsights.push({
                id: 'ao4-improvement',
                type: 'improvement',
                title: 'Evaluation Skills Improving!',
                description: 'Your AO4 (Evaluation) scores have increased significantly. Great job!',
                metric: 'AO4 Score',
                change: Math.round((recentAO4 - olderAO4) * 10) / 10,
                createdAt: new Date().toISOString(),
                read: false,
              });
            }
          }
        }
        
        // Check for low activity
        const lastStudyDate = new Date(stats.lastStudyDate);
        const daysSinceStudy = Math.floor((Date.now() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceStudy > 2 && stats.currentStreak > 0) {
          newInsights.push({
            id: 'streak-warning',
            type: 'warning',
            title: 'Streak at Risk!',
            description: `You haven't studied in ${daysSinceStudy} days. Your ${stats.currentStreak}-day streak is about to end!`,
            createdAt: new Date().toISOString(),
            read: false,
          });
        }
        
        // Check for subject recommendation
        const weakestSubject = subjectPerformance.reduce((min, subject) => 
          subject.averageScore < min.averageScore ? subject : min
        );
        
        if (weakestSubject.averageScore < 75) {
          newInsights.push({
            id: `subject-${weakestSubject.subject}`,
            type: 'recommendation',
            title: `Focus on ${weakestSubject.subject}`,
            description: `Your ${weakestSubject.subject} scores are lower than other subjects. Consider spending more time on this area.`,
            createdAt: new Date().toISOString(),
            read: false,
          });
        }
        
        set(state => ({
          insights: [...newInsights, ...state.insights].slice(0, 20),
        }));
      },

      // Computed getters
      getWeeklyProgress: () => {
        const state = get();
        const weeklyHoursGoal = state.goals.find(g => g.id === 'weekly-hours');
        if (!weeklyHoursGoal) return 0;
        return Math.min(100, (weeklyHoursGoal.current / weeklyHoursGoal.target) * 100);
      },

      getMonthlyProgress: () => {
        const state = get();
        // Calculate monthly progress based on study sessions
        const monthlyHours = state.studySessions
          .filter(s => {
            const sessionDate = new Date(s.date);
            const now = new Date();
            return sessionDate.getMonth() === now.getMonth() && 
                   sessionDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, s) => sum + s.duration / 60, 0);
        
        return Math.min(100, (monthlyHours / 80) * 100); // 80 hours monthly goal
      },

      getSubjectBreakdown: () => {
        const state = get();
        const subjectMap = new Map<string, number>();
        
        state.studySessions.forEach(session => {
          const current = subjectMap.get(session.subject) || 0;
          subjectMap.set(session.subject, current + session.duration);
        });
        
        const total = Array.from(subjectMap.values()).reduce((sum, val) => sum + val, 0);
        
        return Array.from(subjectMap.entries()).map(([subject, duration]) => ({
          subject,
          percentage: total > 0 ? Math.round((duration / total) * 100) : 0,
        }));
      },

      getAOBreakdown: () => {
        const state = get();
        if (state.essayGrades.length === 0) return [];
        
        const totals = state.essayGrades.reduce(
          (acc, grade) => ({
            ao1: acc.ao1 + grade.aoScores.ao1,
            ao2: acc.ao2 + grade.aoScores.ao2,
            ao3: acc.ao3 + grade.aoScores.ao3,
            ao4: acc.ao4 + grade.aoScores.ao4,
          }),
          { ao1: 0, ao2: 0, ao3: 0, ao4: 0 }
        );
        
        const count = state.essayGrades.length;
        
        return [
          { ao: 'AO1', score: Math.round((totals.ao1 / count) * 10) / 10, maxScore: 25 },
          { ao: 'AO2', score: Math.round((totals.ao2 / count) * 10) / 10, maxScore: 25 },
          { ao: 'AO3', score: Math.round((totals.ao3 / count) * 10) / 10, maxScore: 25 },
          { ao: 'AO4', score: Math.round((totals.ao4 / count) * 10) / 10, maxScore: 25 },
        ];
      },

      getRecentActivity: (limit = 10) => {
        return get().studySessions.slice(0, limit);
      },

      getUnlockedAchievements: () => {
        return get().achievements.filter(a => a.unlocked);
      },

      getUnreadInsights: () => {
        return get().insights.filter(i => !i.read);
      },
    }),
    {
      name: 'sandstone-dashboard',
      partialize: (state) => ({
        stats: state.stats,
        studySessions: state.studySessions.slice(0, 100),
        essayGrades: state.essayGrades.slice(0, 100),
        achievements: state.achievements,
        goals: state.goals,
        insights: state.insights,
      }),
    }
  )
);

export default useDashboardStore;
