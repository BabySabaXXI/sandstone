/**
 * Grade API Realtime Integration
 * ================================
 * Integration module for broadcasting grading progress
 * via Supabase Realtime from the grade API route.
 */

import {
  broadcastGradingStarted,
  broadcastGradingProgress,
  broadcastGradingCompleted,
  broadcastGradingFailed,
} from "@/lib/realtime/server";

interface GradingContext {
  essayId: string;
  userId: string;
  questionType: string;
  subject: string;
}

interface ExaminerResult {
  examinerId: string;
  examinerName: string;
  score: number;
  maxScore: number;
  feedback: string;
}

/**
 * Notify that grading has started
 */
export async function notifyGradingStarted(
  context: GradingContext
): Promise<void> {
  try {
    await broadcastGradingStarted(context.essayId, context.userId, {
      questionType: context.questionType,
      subject: context.subject,
    });
  } catch (error) {
    console.error("Failed to broadcast grading started:", error);
    // Don't throw - grading should continue even if realtime fails
  }
}

/**
 * Notify grading progress update
 */
export async function notifyGradingProgress(
  context: GradingContext,
  progress: number,
  currentExaminer?: string,
  examinersCompleted: string[] = [],
  partialResults: ExaminerResult[] = []
): Promise<void> {
  try {
    await broadcastGradingProgress(
      context.essayId,
      context.userId,
      progress,
      currentExaminer,
      examinersCompleted,
      partialResults.map(r => ({
        examinerId: r.examinerId,
        score: r.score,
        feedback: r.feedback,
      }))
    );
  } catch (error) {
    console.error("Failed to broadcast grading progress:", error);
  }
}

/**
 * Notify that grading is completed
 */
export async function notifyGradingCompleted(
  context: GradingContext,
  result: {
    overallScore: number;
    grade: string;
    examiners: ExaminerResult[];
  }
): Promise<void> {
  try {
    await broadcastGradingCompleted(context.essayId, context.userId, {
      overallScore: result.overallScore,
      grade: result.grade,
      examiners: result.examiners.map(e => ({
        id: e.examinerId,
        name: e.examinerName,
        score: e.score,
      })),
    });
  } catch (error) {
    console.error("Failed to broadcast grading completed:", error);
  }
}

/**
 * Notify that grading has failed
 */
export async function notifyGradingFailed(
  context: GradingContext,
  error: string
): Promise<void> {
  try {
    await broadcastGradingFailed(context.essayId, context.userId, error);
  } catch (broadcastError) {
    console.error("Failed to broadcast grading failed:", broadcastError);
  }
}

/**
 * Calculate progress percentage based on completed examiners
 */
export function calculateProgress(
  totalExaminers: number,
  completedExaminers: number
): number {
  if (totalExaminers === 0) return 0;
  return Math.round((completedExaminers / totalExaminers) * 100);
}

/**
 * Create a grading context from request data
 */
export function createGradingContext(
  essayId: string,
  userId: string,
  questionType: string,
  subject: string
): GradingContext {
  return {
    essayId,
    userId,
    questionType,
    subject,
  };
}
