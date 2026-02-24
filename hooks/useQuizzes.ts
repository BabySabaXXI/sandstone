/**
 * Quiz Data Fetching Hooks with SWR
 * Features: caching, optimistic updates, error retry, attempt tracking
 */

'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cacheKeys, documentSWRConfig, cacheMutations } from '@/lib/swr/config';
import type { Quiz, QuizAttempt, QuizQuestion } from '@/stores/types';
import type { Subject } from '@/types';

const supabase = createClient();

// ============================================================================
// Types
// ============================================================================

interface CreateQuizParams {
  title: string;
  description?: string;
  documentId?: string;
  subject?: Subject;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore?: number;
}

interface UpdateQuizParams {
  id: string;
  updates: Partial<Omit<Quiz, 'id' | 'createdAt'>>;
}

interface SubmitQuizAttemptParams {
  quizId: string;
  answers: Record<string, string | string[]>;
  timeSpent: number; // in seconds
}

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch all quizzes for the current user
 */
async function fetchQuizzes(): Promise<Quiz[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    documentId: quiz.document_id,
    subject: quiz.subject as Subject,
    questions: quiz.questions || [],
    timeLimit: quiz.time_limit,
    passingScore: quiz.passing_score,
    attemptCount: quiz.attempt_count || 0,
    averageScore: quiz.average_score || 0,
    userId: quiz.user_id,
    createdAt: new Date(quiz.created_at),
    updatedAt: new Date(quiz.updated_at),
  }));
}

/**
 * Fetch a single quiz
 */
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

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    documentId: data.document_id,
    subject: data.subject as Subject,
    questions: data.questions || [],
    timeLimit: data.time_limit,
    passingScore: data.passing_score,
    attemptCount: data.attempt_count || 0,
    averageScore: data.average_score || 0,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Fetch quizzes by document
 */
async function fetchQuizzesByDocument(documentId: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    documentId: quiz.document_id,
    subject: quiz.subject as Subject,
    questions: quiz.questions || [],
    timeLimit: quiz.time_limit,
    passingScore: quiz.passing_score,
    attemptCount: quiz.attempt_count || 0,
    averageScore: quiz.average_score || 0,
    userId: quiz.user_id,
    createdAt: new Date(quiz.created_at),
    updatedAt: new Date(quiz.updated_at),
  }));
}

/**
 * Fetch quiz attempts
 */
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

  return (data || []).map((attempt) => ({
    id: attempt.id,
    quizId: attempt.quiz_id,
    userId: attempt.user_id,
    answers: attempt.answers || {},
    score: attempt.score,
    maxScore: attempt.max_score,
    percentage: attempt.percentage,
    passed: attempt.passed,
    timeSpent: attempt.time_spent,
    completedAt: attempt.completed_at ? new Date(attempt.completed_at) : null,
    createdAt: new Date(attempt.created_at),
  }));
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new quiz
 */
async function createQuiz(
  url: string,
  { arg }: { arg: CreateQuizParams }
): Promise<Quiz> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const newQuiz: Quiz = {
    id: crypto.randomUUID(),
    title: arg.title,
    description: arg.description,
    documentId: arg.documentId,
    subject: arg.subject || 'economics',
    questions: arg.questions,
    timeLimit: arg.timeLimit,
    passingScore: arg.passingScore || 70,
    attemptCount: 0,
    averageScore: 0,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from('quizzes').insert({
    id: newQuiz.id,
    user_id: user.id,
    title: newQuiz.title,
    description: newQuiz.description,
    document_id: newQuiz.documentId,
    subject: newQuiz.subject,
    questions: newQuiz.questions,
    time_limit: newQuiz.timeLimit,
    passing_score: newQuiz.passingScore,
    attempt_count: 0,
    average_score: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) throw error;

  return newQuiz;
}

/**
 * Update a quiz
 */
async function updateQuiz(
  url: string,
  { arg }: { arg: UpdateQuizParams }
): Promise<Quiz> {
  const { id, updates } = arg;

  const { error } = await supabase
    .from('quizzes')
    .update({
      title: updates.title,
      description: updates.description,
      questions: updates.questions,
      time_limit: updates.timeLimit,
      passing_score: updates.passingScore,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;

  const updated = await fetchQuiz(id);
  if (!updated) throw new Error('Quiz not found after update');
  
  return updated;
}

/**
 * Delete a quiz
 */
async function deleteQuiz(
  url: string,
  { arg }: { arg: string }
): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', arg);

  if (error) throw error;
}

/**
 * Submit a quiz attempt
 */
async function submitQuizAttempt(
  url: string,
  { arg }: { arg: SubmitQuizAttemptParams }
): Promise<QuizAttempt> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch the quiz to calculate score
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', arg.quizId)
    .single();

  if (quizError) throw quizError;

  // Calculate score
  let score = 0;
  let maxScore = 0;
  const questions: QuizQuestion[] = quiz.questions || [];

  for (const question of questions) {
    maxScore += question.points || 1;
    const userAnswer = arg.answers[question.id];
    
    if (userAnswer !== undefined) {
      if (Array.isArray(question.correctAnswer)) {
        // Multiple correct answers
        const correctAnswers = question.correctAnswer as string[];
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const correctCount = userAnswers.filter(a => correctAnswers.includes(a)).length;
        score += (correctCount / correctAnswers.length) * (question.points || 1);
      } else {
        // Single correct answer
        if (userAnswer === question.correctAnswer) {
          score += question.points || 1;
        }
      }
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const passed = percentage >= (quiz.passing_score || 70);

  const now = new Date();
  const attempt: QuizAttempt = {
    id: crypto.randomUUID(),
    quizId: arg.quizId,
    userId: user.id,
    answers: arg.answers,
    score,
    maxScore,
    percentage,
    passed,
    timeSpent: arg.timeSpent,
    completedAt: now,
    createdAt: now,
  };

  // Save attempt
  const { error } = await supabase.from('quiz_attempts').insert({
    id: attempt.id,
    quiz_id: attempt.quizId,
    user_id: attempt.userId,
    answers: attempt.answers,
    score: attempt.score,
    max_score: attempt.maxScore,
    percentage: attempt.percentage,
    passed: attempt.passed,
    time_spent: attempt.timeSpent,
    completed_at: now.toISOString(),
    created_at: now.toISOString(),
  });

  if (error) throw error;

  // Update quiz stats
  const newAttemptCount = (quiz.attempt_count || 0) + 1;
  const newAverageScore = ((quiz.average_score || 0) * (newAttemptCount - 1) + percentage) / newAttemptCount;

  await supabase
    .from('quizzes')
    .update({
      attempt_count: newAttemptCount,
      average_score: newAverageScore,
      updated_at: now.toISOString(),
    })
    .eq('id', arg.quizId);

  return attempt;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all quizzes
 */
export function useQuizzes() {
  return useSWR<Quiz[]>(
    cacheKeys.quizzes,
    fetchQuizzes,
    documentSWRConfig
  );
}

/**
 * Hook to fetch a single quiz
 */
export function useQuiz(id: string | null) {
  return useSWR<Quiz | null>(
    id ? cacheKeys.quiz(id) : null,
    () => fetchQuiz(id!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch quizzes by document
 */
export function useQuizzesByDocument(documentId: string | null) {
  return useSWR<Quiz[]>(
    documentId ? cacheKeys.quizzesByDocument(documentId) : null,
    () => fetchQuizzesByDocument(documentId!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch quiz attempts
 */
export function useQuizAttempts(quizId: string | null) {
  return useSWR<QuizAttempt[]>(
    quizId ? cacheKeys.quizAttempts(quizId) : null,
    () => fetchQuizAttempts(quizId!),
    documentSWRConfig
  );
}

/**
 * Hook to create a quiz with optimistic updates
 */
export function useCreateQuiz() {
  return useSWRMutation<Quiz, Error, string, CreateQuizParams>(
    cacheKeys.quizzes,
    createQuiz,
    {
      onSuccess: (data) => {
        toast.success('Quiz created successfully');
        
        globalMutate(
          cacheKeys.quizzes,
          (current: Quiz[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        
        if (data.documentId) {
          globalMutate(
            cacheKeys.quizzesByDocument(data.documentId),
            (current: Quiz[] | undefined) => cacheMutations.addToList(current, data),
            { revalidate: false }
          );
        }
        
        globalMutate(cacheKeys.quiz(data.id), data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to create quiz: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update a quiz with optimistic updates
 */
export function useUpdateQuiz() {
  return useSWRMutation<Quiz, Error, string, UpdateQuizParams>(
    cacheKeys.quizzes,
    updateQuiz,
    {
      onSuccess: (data, { arg }) => {
        toast.success('Quiz updated successfully');
        
        globalMutate(
          cacheKeys.quizzes,
          (current: Quiz[] | undefined) => cacheMutations.updateInList(current, data),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.quiz(arg.id), data, { revalidate: false });
        
        if (data.documentId) {
          globalMutate(
            cacheKeys.quizzesByDocument(data.documentId),
            (current: Quiz[] | undefined) => cacheMutations.updateInList(current, data),
            { revalidate: false }
          );
        }
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
    deleteQuiz,
    {
      onSuccess: (_, quizId) => {
        toast.success('Quiz deleted successfully');
        
        globalMutate(
          cacheKeys.quizzes,
          (current: Quiz[] | undefined) => cacheMutations.removeFromList(current, quizId),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.quiz(quizId), null, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to delete quiz: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to submit a quiz attempt
 */
export function useSubmitQuizAttempt() {
  return useSWRMutation<QuizAttempt, Error, string, SubmitQuizAttemptParams>(
    cacheKeys.quizzes,
    submitQuizAttempt,
    {
      onSuccess: (data, { arg }) => {
        const message = data.passed 
          ? `Congratulations! You passed with ${data.percentage}%` 
          : `You scored ${data.percentage}%. Keep practicing!`;
        toast.success(message);
        
        // Revalidate quiz attempts
        globalMutate(cacheKeys.quizAttempts(arg.quizId));
        
        // Revalidate quiz to get updated stats
        globalMutate(cacheKeys.quiz(arg.quizId));
        globalMutate(cacheKeys.quizzes);
      },
      onError: (error) => {
        toast.error(`Failed to submit quiz: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Exports
// ============================================================================

export type {
  CreateQuizParams,
  UpdateQuizParams,
  SubmitQuizAttemptParams,
};
