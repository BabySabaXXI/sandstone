/**
 * Enhanced Quiz Hooks
 * React hooks for quiz functionality with SWR caching
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  Quiz,
  QuizAttempt,
  QuizQuestion,
  QuizSettings,
  QuizFilters,
  QuizSortOptions,
  QuizSession,
  QuestionAnswer,
} from './quiz-types';
import { calculateQuizScore, prepareQuizQuestions } from './quiz-engine';
import { createQuiz, addQuestion, updateQuizSettings, publishQuiz, validateQuiz } from './quiz-creator';
import { generateQuizAnalytics, generateUserQuizStats, analyzePerformance } from './quiz-analytics';
import { Subject } from '@/types';

const supabase = createClient();

// ============================================================================
// Cache Keys
// ============================================================================

const cacheKeys = {
  quizzes: 'quizzes',
  quiz: (id: string) => `quiz-${id}`,
  quizAttempts: (quizId: string) => `quiz-attempts-${quizId}`,
  userAttempts: (userId: string) => `user-attempts-${userId}`,
  quizAnalytics: (quizId: string) => `quiz-analytics-${quizId}`,
  userStats: (userId: string) => `user-stats-${userId}`,
  quizSession: (attemptId: string) => `quiz-session-${attemptId}`,
};

// ============================================================================
// Fetch Functions
// ============================================================================

async function fetchQuizzes(filters?: QuizFilters): Promise<Quiz[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('quizzes')
    .select('*')
    .eq('user_id', user.id);

  // Apply filters
  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.sourceType) {
    query = query.eq('source_type', filters.sourceType);
  }
  if (filters?.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapQuizFromDB);
}

async function fetchQuiz(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapQuizFromDB(data);
}

async function fetchQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapAttemptFromDB);
}

async function fetchAllQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapAttemptFromDB);
}

// ============================================================================
// Database Mappers
// ============================================================================

function mapQuizFromDB(data: Record<string, unknown>): Quiz {
  return {
    id: data.id as string,
    title: data.title as string,
    description: (data.description as string) || '',
    subject: data.subject as Subject,
    sourceType: (data.source_type as Quiz['sourceType']) || 'manual',
    sourceId: data.source_id as string | undefined,
    questions: (data.questions as QuizQuestion[]) || [],
    settings: (data.settings as QuizSettings) || {
      passingScore: 70,
      shuffleQuestions: true,
      showCorrectAnswers: true,
      showExplanation: true,
      allowRetake: true,
      preventCopyPaste: false,
      requireConfirmation: true,
    },
    status: (data.status as Quiz['status']) || 'draft',
    tags: (data.tags as string[]) || [],
    attemptCount: (data.attempt_count as number) || 0,
    averageScore: (data.average_score as number) || 0,
    averageTimeSpent: data.average_time_spent as number | undefined,
    userId: data.user_id as string,
    createdAt: new Date(data.created_at as string),
    updatedAt: new Date(data.updated_at as string),
    publishedAt: data.published_at ? new Date(data.published_at as string) : undefined,
  };
}

function mapAttemptFromDB(data: Record<string, unknown>): QuizAttempt {
  return {
    id: data.id as string,
    quizId: data.quiz_id as string,
    userId: data.user_id as string,
    answers: (data.answers as QuestionAnswer[]) || [],
    score: (data.score as number) || 0,
    maxScore: (data.max_score as number) || 0,
    percentage: (data.percentage as number) || 0,
    passed: (data.passed as boolean) || false,
    status: (data.status as QuizAttempt['status']) || 'completed',
    timeSpent: (data.time_spent as number) || 0,
    startedAt: new Date(data.started_at as string),
    completedAt: data.completed_at ? new Date(data.completed_at as string) : undefined,
    createdAt: new Date(data.created_at as string),
    questionResults: (data.question_results as QuizAttempt['questionResults']) || [],
  };
}

function mapQuizToDB(quiz: Quiz): Record<string, unknown> {
  return {
    id: quiz.id,
    user_id: quiz.userId,
    title: quiz.title,
    description: quiz.description,
    subject: quiz.subject,
    source_type: quiz.sourceType,
    source_id: quiz.sourceId,
    questions: quiz.questions,
    settings: quiz.settings,
    status: quiz.status,
    tags: quiz.tags,
    attempt_count: quiz.attemptCount,
    average_score: quiz.averageScore,
    average_time_spent: quiz.averageTimeSpent,
    created_at: quiz.createdAt.toISOString(),
    updated_at: quiz.updatedAt.toISOString(),
    published_at: quiz.publishedAt?.toISOString(),
  };
}

function mapAttemptToDB(attempt: QuizAttempt): Record<string, unknown> {
  return {
    id: attempt.id,
    quiz_id: attempt.quizId,
    user_id: attempt.userId,
    answers: attempt.answers,
    score: attempt.score,
    max_score: attempt.maxScore,
    percentage: attempt.percentage,
    passed: attempt.passed,
    status: attempt.status,
    time_spent: attempt.timeSpent,
    started_at: attempt.startedAt.toISOString(),
    completed_at: attempt.completedAt?.toISOString(),
    created_at: attempt.createdAt.toISOString(),
    question_results: attempt.questionResults,
  };
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook to fetch all quizzes with optional filtering
 */
export function useQuizzes(filters?: QuizFilters) {
  return useSWR<Quiz[]>(
    [cacheKeys.quizzes, filters],
    () => fetchQuizzes(filters),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook to fetch a single quiz
 */
export function useQuiz(id: string | null) {
  return useSWR<Quiz | null>(
    id ? cacheKeys.quiz(id) : null,
    () => fetchQuiz(id!),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook to fetch quiz attempts for a user
 */
export function useQuizAttempts(quizId: string | null) {
  return useSWR<QuizAttempt[]>(
    quizId ? cacheKeys.quizAttempts(quizId) : null,
    () => fetchQuizAttempts(quizId!),
    { revalidateOnFocus: false }
  );
}

/**
 * Hook to fetch quiz analytics
 */
export function useQuizAnalytics(quizId: string | null) {
  return useSWR(
    quizId ? cacheKeys.quizAnalytics(quizId) : null,
    async () => {
      if (!quizId) return null;
      const [quiz, attempts] = await Promise.all([
        fetchQuiz(quizId),
        fetchAllQuizAttempts(quizId),
      ]);
      if (!quiz) return null;
      return generateQuizAnalytics(quiz, attempts);
    },
    { revalidateOnFocus: false }
  );
}

/**
 * Hook to fetch user quiz statistics
 */
export function useUserQuizStats(userId: string | null) {
  return useSWR(
    userId ? cacheKeys.userStats(userId) : null,
    async () => {
      if (!userId) return null;
      
      const { data: attemptsData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId);
      
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*');
      
      const attempts = (attemptsData || []).map(mapAttemptFromDB);
      const quizzes = (quizzesData || []).map(mapQuizFromDB);
      
      return generateUserQuizStats(userId, attempts, quizzes);
    },
    { revalidateOnFocus: false }
  );
}

// ============================================================================
// Mutation Hooks
// ============================================================================

interface CreateQuizParams {
  title: string;
  description?: string;
  subject: Subject;
  sourceType?: Quiz['sourceType'];
  sourceId?: string;
  settings?: Partial<QuizSettings>;
}

/**
 * Hook to create a new quiz
 */
export function useCreateQuiz() {
  return useSWRMutation<Quiz, Error, string, CreateQuizParams>(
    cacheKeys.quizzes,
    async (_, { arg }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const quiz = createQuiz(arg, user.id);
      
      const { error } = await supabase.from('quizzes').insert(mapQuizToDB(quiz));
      if (error) throw error;
      
      return quiz;
    },
    {
      onSuccess: (data) => {
        toast.success('Quiz created successfully');
        globalMutate(cacheKeys.quizzes);
        globalMutate(cacheKeys.quiz(data.id), data);
      },
      onError: (error) => {
        toast.error(`Failed to create quiz: ${error.message}`);
      },
    }
  );
}

interface UpdateQuizParams {
  id: string;
  updates: Partial<Quiz>;
}

/**
 * Hook to update a quiz
 */
export function useUpdateQuiz() {
  return useSWRMutation<Quiz, Error, string, UpdateQuizParams>(
    cacheKeys.quizzes,
    async (_, { arg }) => {
      const { id, updates } = arg;
      
      const { error } = await supabase
        .from('quizzes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
      
      const updated = await fetchQuiz(id);
      if (!updated) throw new Error('Quiz not found after update');
      
      return updated;
    },
    {
      onSuccess: (data, { arg }) => {
        toast.success('Quiz updated successfully');
        globalMutate(cacheKeys.quizzes);
        globalMutate(cacheKeys.quiz(arg.id), data);
      },
      onError: (error) => {
        toast.error(`Failed to update quiz: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to delete a quiz
 */
export function useDeleteQuiz() {
  return useSWRMutation<void, Error, string, string>(
    cacheKeys.quizzes,
    async (_, quizId) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      
      if (error) throw error;
    },
    {
      onSuccess: (_, quizId) => {
        toast.success('Quiz deleted successfully');
        globalMutate(cacheKeys.quizzes);
        globalMutate(cacheKeys.quiz(quizId), null);
      },
      onError: (error) => {
        toast.error(`Failed to delete quiz: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to publish a quiz
 */
export function usePublishQuiz() {
  return useSWRMutation<Quiz, Error, string, string>(
    cacheKeys.quizzes,
    async (_, quizId) => {
      const quiz = await fetchQuiz(quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      // Validate quiz before publishing
      const errors = validateQuiz(quiz);
      if (errors.length > 0) {
        throw new Error(`Cannot publish: ${errors[0].message}`);
      }
      
      const published = publishQuiz(quiz);
      
      const { error } = await supabase
        .from('quizzes')
        .update({
          status: published.status,
          published_at: published.publishedAt?.toISOString(),
          updated_at: published.updatedAt.toISOString(),
        })
        .eq('id', quizId);
      
      if (error) throw error;
      
      return published;
    },
    {
      onSuccess: (data, quizId) => {
        toast.success('Quiz published successfully');
        globalMutate(cacheKeys.quizzes);
        globalMutate(cacheKeys.quiz(quizId), data);
      },
      onError: (error) => {
        toast.error(`Failed to publish quiz: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Quiz Session Hook
// ============================================================================

interface QuizSessionState {
  session: QuizSession | null;
  currentQuestionIndex: number;
  answers: Record<string, unknown>;
  flaggedQuestions: string[];
  timeRemaining: number | null;
  isSubmitting: boolean;
}

/**
 * Hook to manage an active quiz session
 */
export function useQuizSession(quizId: string | null) {
  const { data: quiz } = useQuiz(quizId);
  const [state, setState] = useState<QuizSessionState>({
    session: null,
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: [],
    timeRemaining: null,
    isSubmitting: false,
  });

  // Start a new quiz session
  const startSession = useCallback(async () => {
    if (!quiz) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to take quizzes');
      return;
    }
    
    const attemptId = crypto.randomUUID();
    const preparedQuestions = prepareQuizQuestions(quiz);
    
    const session: QuizSession = {
      attemptId,
      quizId: quiz.id,
      userId: user.id,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      timeRemaining: quiz.settings.timeLimit ? quiz.settings.timeLimit * 60 : undefined,
      startedAt: new Date(),
      lastActivityAt: new Date(),
    };
    
    setState({
      session,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      timeRemaining: session.timeRemaining || null,
      isSubmitting: false,
    });
    
    // Save attempt to database
    await supabase.from('quiz_attempts').insert({
      id: attemptId,
      quiz_id: quiz.id,
      user_id: user.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });
    
    return session;
  }, [quiz]);

  // Answer a question
  const answerQuestion = useCallback((questionId: string, answer: unknown) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  }, []);

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(
        prev.currentQuestionIndex + 1,
        (quiz?.questions.length || 1) - 1
      ),
    }));
  }, [quiz?.questions.length]);

  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  }, []);

  // Flag/unflag a question for review
  const toggleFlagQuestion = useCallback((questionId: string) => {
    setState(prev => {
      const isFlagged = prev.flaggedQuestions.includes(questionId);
      return {
        ...prev,
        flaggedQuestions: isFlagged
          ? prev.flaggedQuestions.filter(id => id !== questionId)
          : [...prev.flaggedQuestions, questionId],
      };
    });
  }, []);

  // Submit the quiz
  const submitQuiz = useCallback(async () => {
    if (!quiz || !state.session) return null;
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Calculate score
      const result = calculateQuizScore(quiz, state.answers);
      
      const completedAt = new Date();
      const timeSpent = quiz.settings.timeLimit
        ? (quiz.settings.timeLimit * 60) - (state.timeRemaining || 0)
        : Math.round((completedAt.getTime() - state.session.startedAt.getTime()) / 1000);
      
      const attempt: QuizAttempt = {
        id: state.session.attemptId,
        quizId: quiz.id,
        userId: user.id,
        answers: Object.entries(state.answers).map(([questionId, answer]) => ({
          questionId,
          answer,
          correct: result.questionResults.find(r => r.questionId === questionId)?.correct || false,
          pointsEarned: result.questionResults.find(r => r.questionId === questionId)?.pointsEarned || 0,
          timeSpent: 0,
          attempts: 1,
        })),
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        passed: result.passed,
        status: 'completed',
        timeSpent,
        startedAt: state.session.startedAt,
        completedAt,
        createdAt: state.session.startedAt,
        questionResults: result.questionResults,
      };
      
      // Update attempt in database
      const { error } = await supabase
        .from('quiz_attempts')
        .update(mapAttemptToDB(attempt))
        .eq('id', attempt.id);
      
      if (error) throw error;
      
      // Update quiz statistics
      await updateQuizStats(quiz.id);
      
      // Show result
      if (result.passed) {
        toast.success(`Congratulations! You passed with ${result.percentage}%`);
      } else {
        toast.info(`You scored ${result.percentage}%. Keep practicing!`);
      }
      
      // Invalidate caches
      globalMutate(cacheKeys.quizAttempts(quiz.id));
      globalMutate(cacheKeys.quiz(quiz.id));
      globalMutate(cacheKeys.quizAnalytics(quiz.id));
      
      return attempt;
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error(error);
      return null;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [quiz, state.session, state.answers, state.timeRemaining]);

  // Timer effect
  useEffect(() => {
    if (!quiz?.settings.timeLimit || state.timeRemaining === null) return;
    
    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining === null || prev.timeRemaining <= 0) {
          clearInterval(timer);
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quiz?.settings.timeLimit, state.timeRemaining]);

  return {
    quiz,
    ...state,
    startSession,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    toggleFlagQuestion,
    submitQuiz,
    currentQuestion: quiz?.questions[state.currentQuestionIndex],
    progress: quiz ? ((state.currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0,
    answeredCount: Object.keys(state.answers).length,
    totalQuestions: quiz?.questions.length || 0,
  };
}

/**
 * Update quiz statistics after an attempt
 */
async function updateQuizStats(quizId: string) {
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('percentage, time_spent')
    .eq('quiz_id', quizId)
    .eq('status', 'completed');
  
  if (!attempts || attempts.length === 0) return;
  
  const avgScore = Math.round(
    attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
  );
  
  const avgTime = Math.round(
    attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0) / attempts.length
  );
  
  await supabase
    .from('quizzes')
    .update({
      attempt_count: attempts.length,
      average_score: avgScore,
      average_time_spent: avgTime,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quizId);
}

// ============================================================================
// Question Management Hooks
// ============================================================================

interface AddQuestionParams {
  quizId: string;
  question: QuizQuestion;
}

/**
 * Hook to add a question to a quiz
 */
export function useAddQuestion() {
  return useSWRMutation<Quiz, Error, string, AddQuestionParams>(
    cacheKeys.quizzes,
    async (_, { arg }) => {
      const quiz = await fetchQuiz(arg.quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      const updated = addQuestion(quiz, arg.question);
      
      const { error } = await supabase
        .from('quizzes')
        .update({
          questions: updated.questions,
          updated_at: updated.updatedAt.toISOString(),
        })
        .eq('id', arg.quizId);
      
      if (error) throw error;
      
      return updated;
    },
    {
      onSuccess: (data, { arg }) => {
        toast.success('Question added successfully');
        globalMutate(cacheKeys.quiz(arg.quizId), data);
        globalMutate(cacheKeys.quizzes);
      },
      onError: (error) => {
        toast.error(`Failed to add question: ${error.message}`);
      },
    }
  );
}

interface UpdateQuestionParams {
  quizId: string;
  questionId: string;
  updates: Partial<QuizQuestion>;
}

/**
 * Hook to update a question
 */
export function useUpdateQuestion() {
  return useSWRMutation<Quiz, Error, string, UpdateQuestionParams>(
    cacheKeys.quizzes,
    async (_, { arg }) => {
      const quiz = await fetchQuiz(arg.quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      const updatedQuestions = quiz.questions.map(q =>
        q.id === arg.questionId ? { ...q, ...arg.updates } as QuizQuestion : q
      );
      
      const { error } = await supabase
        .from('quizzes')
        .update({
          questions: updatedQuestions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', arg.quizId);
      
      if (error) throw error;
      
      return { ...quiz, questions: updatedQuestions };
    },
    {
      onSuccess: (data, { arg }) => {
        toast.success('Question updated successfully');
        globalMutate(cacheKeys.quiz(arg.quizId), data);
        globalMutate(cacheKeys.quizzes);
      },
      onError: (error) => {
        toast.error(`Failed to update question: ${error.message}`);
      },
    }
  );
}

interface RemoveQuestionParams {
  quizId: string;
  questionId: string;
}

/**
 * Hook to remove a question
 */
export function useRemoveQuestion() {
  return useSWRMutation<Quiz, Error, string, RemoveQuestionParams>(
    cacheKeys.quizzes,
    async (_, { arg }) => {
      const quiz = await fetchQuiz(arg.quizId);
      if (!quiz) throw new Error('Quiz not found');
      
      const updatedQuestions = quiz.questions.filter(q => q.id !== arg.questionId);
      
      const { error } = await supabase
        .from('quizzes')
        .update({
          questions: updatedQuestions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', arg.quizId);
      
      if (error) throw error;
      
      return { ...quiz, questions: updatedQuestions };
    },
    {
      onSuccess: (data, { arg }) => {
        toast.success('Question removed successfully');
        globalMutate(cacheKeys.quiz(arg.quizId), data);
        globalMutate(cacheKeys.quizzes);
      },
      onError: (error) => {
        toast.error(`Failed to remove question: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Performance Analysis Hook
// ============================================================================

/**
 * Hook to analyze user performance on a quiz
 */
export function usePerformanceAnalysis(quizId: string | null, userId: string | null) {
  return useSWR(
    quizId && userId ? `performance-${quizId}-${userId}` : null,
    async () => {
      if (!quizId || !userId) return null;
      
      const [quiz, attempts] = await Promise.all([
        fetchQuiz(quizId),
        fetchAllQuizAttempts(quizId),
      ]);
      
      if (!quiz) return null;
      
      return analyzePerformance(userId, quiz, attempts);
    },
    { revalidateOnFocus: false }
  );
}
