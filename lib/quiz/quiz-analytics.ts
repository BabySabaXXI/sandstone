/**
 * Quiz Analytics
 * Comprehensive analysis and reporting for quiz results
 */

import {
  Quiz,
  QuizAttempt,
  QuizAnalytics,
  QuestionAnalytics,
  UserQuizStats,
  QuestionResult,
  QuizQuestion,
  QuizDifficulty,
} from './quiz-types';
import { calculateQuizScore, calculateQuizStats, calculateScoreDistribution } from './quiz-engine';
import { Subject } from '@/types';

// ============================================================================
// Quiz-Level Analytics
// ============================================================================

/**
 * Generate comprehensive analytics for a quiz
 */
export function generateQuizAnalytics(
  quiz: Quiz,
  attempts: QuizAttempt[]
): QuizAnalytics {
  const stats = calculateQuizStats(attempts);
  const scoreDist = calculateScoreDistribution(attempts);
  
  // Get unique users
  const uniqueUsers = new Set(attempts.map(a => a.userId)).size;
  
  // Calculate attempts by day
  const attemptsByDay = calculateAttemptsByDay(attempts);
  
  // Calculate question-level analytics
  const questionAnalytics = generateQuestionAnalytics(quiz.questions, attempts);
  
  return {
    quizId: quiz.id,
    totalAttempts: stats.totalAttempts,
    uniqueUsers,
    averageScore: stats.averageScore,
    medianScore: stats.medianScore,
    passRate: stats.passRate,
    averageTimeSpent: stats.averageTimeSpent,
    questionAnalytics,
    attemptsByDay,
    scoreDistribution: scoreDist,
  };
}

/**
 * Calculate attempts grouped by day
 */
function calculateAttemptsByDay(
  attempts: QuizAttempt[]
): { date: string; count: number }[] {
  const grouped = attempts.reduce((acc, attempt) => {
    const date = attempt.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// Question-Level Analytics
// ============================================================================

/**
 * Generate analytics for each question in a quiz
 */
export function generateQuestionAnalytics(
  questions: QuizQuestion[],
  attempts: QuizAttempt[]
): QuestionAnalytics[] {
  return questions.map(question => {
    const questionAttempts = attempts.filter(
      a => a.questionResults?.some(r => r.questionId === question.id)
    );
    
    if (questionAttempts.length === 0) {
      return {
        questionId: question.id,
        correctRate: 0,
        averageTimeSpent: 0,
        discriminationIndex: 0,
      };
    }
    
    // Calculate correct rate
    const correctCount = questionAttempts.filter(a =>
      a.questionResults?.find(r => r.questionId === question.id)?.correct
    ).length;
    const correctRate = Math.round((correctCount / questionAttempts.length) * 100);
    
    // Calculate average time spent
    const times = questionAttempts
      .map(a => a.questionResults?.find(r => r.questionId === question.id)?.timeSpent)
      .filter((t): t is number => t !== undefined);
    const averageTimeSpent = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;
    
    // Find most common wrong answer
    const wrongAnswers = questionAttempts
      .map(a => a.questionResults?.find(r => r.questionId === question.id))
      .filter((r): r is QuestionResult => r !== undefined && !r.correct)
      .map(r => String(r.userAnswer));
    
    const mostCommonWrongAnswer = findMostCommon(wrongAnswers);
    
    // Calculate discrimination index
    const discriminationIndex = calculateDiscriminationIndex(
      question.id,
      attempts
    );
    
    return {
      questionId: question.id,
      correctRate,
      averageTimeSpent,
      mostCommonWrongAnswer,
      discriminationIndex,
    };
  });
}

/**
 * Find the most common item in an array
 */
function findMostCommon<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  
  const counts = items.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] as unknown as T;
}

/**
 * Calculate discrimination index for a question
 * Measures how well the question distinguishes between high and low performers
 * Range: -1 to 1, where higher is better
 */
function calculateDiscriminationIndex(
  questionId: string,
  attempts: QuizAttempt[]
): number {
  if (attempts.length < 10) return 0; // Need sufficient data
  
  // Sort attempts by overall score
  const sortedAttempts = [...attempts].sort((a, b) => b.percentage - a.percentage);
  
  // Split into top and bottom 27% (standard practice)
  const splitPoint = Math.ceil(sortedAttempts.length * 0.27);
  const topGroup = sortedAttempts.slice(0, splitPoint);
  const bottomGroup = sortedAttempts.slice(-splitPoint);
  
  // Calculate correct rates for each group
  const topCorrect = topGroup.filter(a =>
    a.questionResults?.find(r => r.questionId === questionId)?.correct
  ).length;
  const bottomCorrect = bottomGroup.filter(a =>
    a.questionResults?.find(r => r.questionId === questionId)?.correct
  ).length;
  
  const topRate = topCorrect / topGroup.length;
  const bottomRate = bottomCorrect / bottomGroup.length;
  
  // Discrimination index
  return Math.round((topRate - bottomRate) * 100) / 100;
}

// ============================================================================
// User Statistics
// ============================================================================

/**
 * Generate comprehensive statistics for a user
 */
export function generateUserQuizStats(
  userId: string,
  allAttempts: QuizAttempt[],
  quizzes: Quiz[]
): UserQuizStats {
  const userAttempts = allAttempts.filter(a => a.userId === userId);
  const completedAttempts = userAttempts.filter(a => a.status === 'completed');
  
  if (userAttempts.length === 0) {
    return createEmptyUserStats(userId);
  }
  
  // Calculate overall stats
  const scores = completedAttempts.map(a => a.percentage);
  const averageScore = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length
  );
  const bestScore = Math.max(...scores);
  const totalTimeSpent = userAttempts.reduce((sum, a) => sum + a.timeSpent, 0);
  
  // Calculate streak
  const streakDays = calculateStudyStreak(userAttempts);
  
  // Get last attempt date
  const lastAttemptAt = userAttempts.length > 0
    ? new Date(Math.max(...userAttempts.map(a => a.createdAt.getTime())))
    : undefined;
  
  // Calculate by subject
  const bySubject = calculateStatsBySubject(userAttempts, quizzes);
  
  // Get recent attempts
  const recentAttempts = [...userAttempts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);
  
  return {
    userId,
    totalAttempts: userAttempts.length,
    completedQuizzes: completedAttempts.length,
    averageScore,
    bestScore,
    totalTimeSpent,
    streakDays,
    lastAttemptAt,
    bySubject,
    recentAttempts,
  };
}

/**
 * Create empty user stats
 */
function createEmptyUserStats(userId: string): UserQuizStats {
  return {
    userId,
    totalAttempts: 0,
    completedQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    streakDays: 0,
    bySubject: {
      economics: { attempts: 0, averageScore: 0 },
      geography: { attempts: 0, averageScore: 0 },
    },
    recentAttempts: [],
  };
}

/**
 * Calculate study streak in days
 */
function calculateStudyStreak(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  
  // Get unique dates with attempts
  const dates = attempts
    .map(a => a.createdAt.toISOString().split('T')[0])
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort()
    .reverse();
  
  if (dates.length === 0) return 0;
  
  // Check if streak is still active (today or yesterday)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0; // Streak broken
  }
  
  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Calculate statistics grouped by subject
 */
function calculateStatsBySubject(
  attempts: QuizAttempt[],
  quizzes: Quiz[]
): Record<Subject, { attempts: number; averageScore: number }> {
  const result: Record<Subject, { attempts: number; scores: number[] }> = {
    economics: { attempts: 0, scores: [] },
    geography: { attempts: 0, scores: [] },
  };
  
  for (const attempt of attempts) {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    if (quiz) {
      result[quiz.subject].attempts++;
      result[quiz.subject].scores.push(attempt.percentage);
    }
  }
  
  return {
    economics: {
      attempts: result.economics.attempts,
      averageScore: result.economics.scores.length > 0
        ? Math.round(result.economics.scores.reduce((a, b) => a + b, 0) / result.economics.scores.length)
        : 0,
    },
    geography: {
      attempts: result.geography.attempts,
      averageScore: result.geography.scores.length > 0
        ? Math.round(result.geography.scores.reduce((a, b) => a + b, 0) / result.geography.scores.length)
        : 0,
    },
  };
}

// ============================================================================
// Performance Analysis
// ============================================================================

export interface PerformanceAnalysis {
  overall: {
    rank: number;
    totalParticipants: number;
    percentile: number;
  };
  byTopic: {
    topic: string;
    correctRate: number;
    averageTime: number;
  }[];
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}

/**
 * Analyze user performance on a specific quiz
 */
export function analyzePerformance(
  userId: string,
  quiz: Quiz,
  allAttempts: QuizAttempt[]
): PerformanceAnalysis {
  const quizAttempts = allAttempts.filter(a => a.quizId === quiz.id);
  const userAttempt = quizAttempts.find(a => a.userId === userId);
  
  if (!userAttempt) {
    return createEmptyPerformanceAnalysis();
  }
  
  // Calculate overall rank
  const sortedByScore = [...quizAttempts].sort((a, b) => b.percentage - a.percentage);
  const rank = sortedByScore.findIndex(a => a.userId === userId) + 1;
  const percentile = Math.round(
    ((quizAttempts.length - rank) / quizAttempts.length) * 100
  );
  
  // Analyze by topic
  const topicAnalysis = analyzeByTopic(userAttempt, quiz);
  
  // Identify weak and strong areas
  const weakAreas = topicAnalysis
    .filter(t => t.correctRate < 50)
    .map(t => t.topic);
  
  const strongAreas = topicAnalysis
    .filter(t => t.correctRate >= 80)
    .map(t => t.topic);
  
  // Generate recommendations
  const recommendations = generateRecommendations(
    topicAnalysis,
    weakAreas,
    userAttempt
  );
  
  return {
    overall: {
      rank,
      totalParticipants: quizAttempts.length,
      percentile,
    },
    byTopic: topicAnalysis,
    weakAreas,
    strongAreas,
    recommendations,
  };
}

/**
 * Create empty performance analysis
 */
function createEmptyPerformanceAnalysis(): PerformanceAnalysis {
  return {
    overall: { rank: 0, totalParticipants: 0, percentile: 0 },
    byTopic: [],
    weakAreas: [],
    strongAreas: [],
    recommendations: [],
  };
}

/**
 * Analyze performance by topic
 */
function analyzeByTopic(
  attempt: QuizAttempt,
  quiz: Quiz
): { topic: string; correctRate: number; averageTime: number }[] {
  const topicMap = new Map<string, { correct: number; total: number; time: number }>();
  
  for (const result of attempt.questionResults || []) {
    const question = quiz.questions.find(q => q.id === result.questionId);
    if (!question?.topic) continue;
    
    const current = topicMap.get(question.topic) || { correct: 0, total: 0, time: 0 };
    current.total++;
    if (result.correct) current.correct++;
    current.time += result.timeSpent;
    topicMap.set(question.topic, current);
  }
  
  return Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    correctRate: Math.round((data.correct / data.total) * 100),
    averageTime: Math.round(data.time / data.total),
  }));
}

/**
 * Generate personalized recommendations
 */
function generateRecommendations(
  topicAnalysis: { topic: string; correctRate: number; averageTime: number }[],
  weakAreas: string[],
  attempt: QuizAttempt
): string[] {
  const recommendations: string[] = [];
  
  // Weak areas recommendations
  if (weakAreas.length > 0) {
    recommendations.push(
      `Focus on studying: ${weakAreas.join(', ')}. These topics need improvement.`
    );
  }
  
  // Time management recommendations
  const slowTopics = topicAnalysis.filter(t => t.averageTime > 120);
  if (slowTopics.length > 0) {
    recommendations.push(
      `Practice time management for: ${slowTopics.map(t => t.topic).join(', ')}.`
    );
  }
  
  // Score-based recommendations
  if (attempt.percentage < 60) {
    recommendations.push(
      'Consider reviewing the material before attempting this quiz again.'
    );
  } else if (attempt.percentage >= 90) {
    recommendations.push(
      'Excellent work! Try more challenging quizzes to continue growing.'
    );
  }
  
  // Speed recommendations
  const avgTimePerQuestion = attempt.timeSpent / (attempt.questionResults?.length || 1);
  if (avgTimePerQuestion > 90) {
    recommendations.push(
      'Try to work more quickly to improve your time management.'
    );
  }
  
  return recommendations;
}

// ============================================================================
// Comparison Analytics
// ============================================================================

export interface ComparisonResult {
  metric: string;
  userValue: number;
  averageValue: number;
  difference: number;
  percentile: number;
}

/**
 * Compare user performance to group averages
 */
export function compareToGroup(
  userId: string,
  quiz: Quiz,
  attempts: QuizAttempt[]
): ComparisonResult[] {
  const userAttempts = attempts.filter(a => a.userId === userId);
  const otherAttempts = attempts.filter(a => a.userId !== userId);
  
  if (userAttempts.length === 0 || otherAttempts.length === 0) {
    return [];
  }
  
  const comparisons: ComparisonResult[] = [];
  
  // Score comparison
  const userAvgScore = userAttempts.reduce((sum, a) => sum + a.percentage, 0) / userAttempts.length;
  const groupAvgScore = otherAttempts.reduce((sum, a) => sum + a.percentage, 0) / otherAttempts.length;
  const scorePercentile = calculatePercentile(
    userAvgScore,
    otherAttempts.map(a => a.percentage)
  );
  
  comparisons.push({
    metric: 'Average Score',
    userValue: Math.round(userAvgScore),
    averageValue: Math.round(groupAvgScore),
    difference: Math.round(userAvgScore - groupAvgScore),
    percentile: scorePercentile,
  });
  
  // Time comparison
  const userAvgTime = userAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / userAttempts.length;
  const groupAvgTime = otherAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / otherAttempts.length;
  const timePercentile = calculatePercentile(
    userAvgTime,
    otherAttempts.map(a => a.timeSpent)
  );
  
  comparisons.push({
    metric: 'Average Time',
    userValue: Math.round(userAvgTime),
    averageValue: Math.round(groupAvgTime),
    difference: Math.round(userAvgTime - groupAvgTime),
    percentile: timePercentile,
  });
  
  // Pass rate comparison
  const userPassRate = (userAttempts.filter(a => a.passed).length / userAttempts.length) * 100;
  const groupPassRate = (otherAttempts.filter(a => a.passed).length / otherAttempts.length) * 100;
  
  comparisons.push({
    metric: 'Pass Rate',
    userValue: Math.round(userPassRate),
    averageValue: Math.round(groupPassRate),
    difference: Math.round(userPassRate - groupPassRate),
    percentile: scorePercentile, // Use score percentile as proxy
  });
  
  return comparisons;
}

/**
 * Calculate percentile rank
 */
function calculatePercentile(value: number, allValues: number[]): number {
  const sorted = [...allValues].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  return Math.round((below / sorted.length) * 100);
}

// ============================================================================
// Progress Tracking
// ============================================================================

export interface ProgressData {
  date: string;
  score: number;
  quizTitle: string;
  improvement: number; // Change from previous attempt
}

/**
 * Track user progress over time
 */
export function trackProgress(
  userId: string,
  attempts: QuizAttempt[],
  quizzes: Quiz[]
): ProgressData[] {
  const userAttempts = attempts
    .filter(a => a.userId === userId && a.status === 'completed')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  let previousScore = 0;
  
  return userAttempts.map(attempt => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    const improvement = attempt.percentage - previousScore;
    previousScore = attempt.percentage;
    
    return {
      date: attempt.createdAt.toISOString().split('T')[0],
      score: attempt.percentage,
      quizTitle: quiz?.title || 'Unknown Quiz',
      improvement,
    };
  });
}

// ============================================================================
// Export Reports
// ============================================================================

export interface QuizReport {
  title: string;
  generatedAt: string;
  summary: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
  details: QuizAnalytics;
}

/**
 * Generate a comprehensive quiz report
 */
export function generateQuizReport(quiz: Quiz, attempts: QuizAttempt[]): QuizReport {
  const analytics = generateQuizAnalytics(quiz, attempts);
  
  return {
    title: `Quiz Report: ${quiz.title}`,
    generatedAt: new Date().toISOString(),
    summary: {
      totalAttempts: analytics.totalAttempts,
      averageScore: analytics.averageScore,
      passRate: analytics.passRate,
    },
    details: analytics,
  };
}

/**
 * Export report to JSON
 */
export function exportReportToJSON(report: QuizReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Export report summary to CSV
 */
export function exportReportToCSV(report: QuizReport): string {
  const rows = [
    ['Metric', 'Value'],
    ['Quiz Title', report.title],
    ['Generated At', report.generatedAt],
    ['Total Attempts', report.summary.totalAttempts.toString()],
    ['Average Score', `${report.summary.averageScore}%`],
    ['Pass Rate', `${report.summary.passRate}%`],
    [''],
    ['Score Range', 'Count'],
    ...report.details.scoreDistribution.map(d => [d.range, d.count.toString()]),
  ];
  
  return rows.map(row => row.join(',')).join('\n');
}
