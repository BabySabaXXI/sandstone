/**
 * Enhanced Quiz Types
 * Complete type definitions for the enhanced quiz system
 */

import { Subject } from '@/types';

// ============================================================================
// Question Types
// ============================================================================

export type QuestionType = 
  | 'multiple_choice'      // Single correct answer
  | 'multiple_select'      // Multiple correct answers
  | 'true_false'          // True/False question
  | 'fill_blank'          // Fill in the blank
  | 'short_answer'        // Short text answer
  | 'matching'            // Match items
  | 'ordering'            // Put items in order
  | 'essay'               // Long-form essay
  | 'calculation'         // Math/economic calculation
  | 'diagram_label'       // Label a diagram
  | 'case_study';         // Case study analysis

export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

// ============================================================================
// Base Question Interface
// ============================================================================

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  explanation?: string;
  difficulty: QuizDifficulty;
  topic?: string;
  tags?: string[];
  points: number;
  timeEstimate?: number; // Estimated time in seconds
  hint?: string;
  imageUrl?: string;
}

// ============================================================================
// Specific Question Types
// ============================================================================

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctAnswer: string;
  shuffleOptions?: boolean;
}

export interface MultipleSelectQuestion extends BaseQuestion {
  type: 'multiple_select';
  options: string[];
  correctAnswers: string[];
  shuffleOptions?: boolean;
  partialCredit?: boolean; // Allow partial credit for partially correct answers
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
  statement: string;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  text: string; // Text with blanks marked as [blank]
  blanks: {
    id: string;
    correctAnswer: string;
    acceptableAnswers?: string[]; // Alternative acceptable answers
    hint?: string;
  }[];
  caseSensitive?: boolean;
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  correctAnswer: string;
  acceptableAnswers?: string[];
  maxLength?: number;
  minLength?: number;
  caseSensitive?: boolean;
  keywords?: string[]; // Keywords that should be present for full credit
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: {
    id: string;
    left: string;
    right: string;
  }[];
  shuffleLeft?: boolean;
  shuffleRight?: boolean;
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: {
    id: string;
    text: string;
  }[];
  correctOrder: string[]; // Array of item IDs in correct order
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  rubric?: EssayRubric;
  minWords?: number;
  maxWords?: number;
}

export interface EssayRubric {
  criteria: {
    name: string;
    description: string;
    maxPoints: number;
  }[];
}

export interface CalculationQuestion extends BaseQuestion {
  type: 'calculation';
  problem: string;
  correctAnswer: number;
  tolerance?: number; // Acceptable deviation from correct answer
  units?: string;
  showWork?: boolean; // Whether to show work area
  steps?: CalculationStep[];
}

export interface CalculationStep {
  description: string;
  formula?: string;
}

export interface DiagramLabelQuestion extends BaseQuestion {
  type: 'diagram_label';
  imageUrl: string;
  labels: {
    id: string;
    correctText: string;
    x: number; // Position as percentage
    y: number;
    acceptableAnswers?: string[];
  }[];
}

export interface CaseStudyQuestion extends BaseQuestion {
  type: 'case_study';
  caseText: string;
  subQuestions: BaseQuestion[];
}

// Union type for all question types
export type QuizQuestion =
  | MultipleChoiceQuestion
  | MultipleSelectQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ShortAnswerQuestion
  | MatchingQuestion
  | OrderingQuestion
  | EssayQuestion
  | CalculationQuestion
  | DiagramLabelQuestion
  | CaseStudyQuestion;

// ============================================================================
// Quiz Types
// ============================================================================

export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuizSourceType = 'essay' | 'document' | 'manual' | 'ai_generated' | 'template';

export interface QuizSettings {
  timeLimit?: number; // in minutes, undefined = no limit
  passingScore: number; // percentage (0-100)
  maxAttempts?: number; // undefined = unlimited
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean; // Show after submission
  showExplanation: boolean;
  allowRetake: boolean;
  preventCopyPaste: boolean;
  requireConfirmation: boolean; // Require confirmation before submitting
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  sourceType: QuizSourceType;
  sourceId?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  status: QuizStatus;
  tags?: string[];
  
  // Statistics
  attemptCount: number;
  averageScore: number;
  averageTimeSpent?: number; // in seconds
  
  // Metadata
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// ============================================================================
// Quiz Attempt Types
// ============================================================================

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'timed_out';

export interface QuestionAnswer {
  questionId: string;
  answer: unknown; // Type depends on question type
  correct: boolean;
  pointsEarned: number;
  timeSpent: number; // in seconds
  attempts: number; // Number of attempts on this question
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuestionAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  status: AttemptStatus;
  timeSpent: number; // in seconds
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  
  // Detailed results
  questionResults?: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  question: QuizQuestion;
  userAnswer: unknown;
  correct: boolean;
  pointsEarned: number;
  maxPoints: number;
  feedback?: string;
  timeSpent: number;
}

// ============================================================================
// Quiz Analytics Types
// ============================================================================

export interface QuizAnalytics {
  quizId: string;
  totalAttempts: number;
  uniqueUsers: number;
  averageScore: number;
  medianScore: number;
  passRate: number;
  averageTimeSpent: number;
  
  // Question-level analytics
  questionAnalytics: QuestionAnalytics[];
  
  // Time-based analytics
  attemptsByDay: { date: string; count: number }[];
  
  // Score distribution
  scoreDistribution: { range: string; count: number }[];
}

export interface QuestionAnalytics {
  questionId: string;
  correctRate: number;
  averageTimeSpent: number;
  mostCommonWrongAnswer?: string;
  discriminationIndex: number; // How well question discriminates between high/low performers
}

export interface UserQuizStats {
  userId: string;
  totalAttempts: number;
  completedQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  streakDays: number;
  lastAttemptAt?: Date;
  
  // Subject breakdown
  bySubject: Record<Subject, {
    attempts: number;
    averageScore: number;
  }>;
  
  // Recent activity
  recentAttempts: QuizAttempt[];
}

// ============================================================================
// Quiz Creation Types
// ============================================================================

export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  subject: Subject;
  questionTypes: QuestionType[];
  defaultSettings: QuizSettings;
  defaultQuestions: Partial<QuizQuestion>[];
}

export interface QuizGenerationOptions {
  sourceType: 'essay' | 'document' | 'topic';
  sourceContent?: string;
  topic?: string;
  subject: Subject;
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuestionType[];
  includeExplanations: boolean;
}

export interface BulkQuestionImport {
  format: 'csv' | 'json' | 'qti';
  content: string;
}

// ============================================================================
// Quiz Filter/Sort Types
// ============================================================================

export interface QuizFilters {
  subject?: Subject;
  difficulty?: QuizDifficulty;
  status?: QuizStatus;
  sourceType?: QuizSourceType;
  tags?: string[];
  searchQuery?: string;
  dateRange?: { start: Date; end: Date };
}

export type QuizSortField = 'createdAt' | 'updatedAt' | 'title' | 'attemptCount' | 'averageScore';
export type QuizSortOrder = 'asc' | 'desc';

export interface QuizSortOptions {
  field: QuizSortField;
  order: QuizSortOrder;
}

// ============================================================================
// Quiz Session Types (for active quiz taking)
// ============================================================================

export interface QuizSession {
  attemptId: string;
  quizId: string;
  userId: string;
  currentQuestionIndex: number;
  answers: Record<string, unknown>;
  flaggedQuestions: string[];
  timeRemaining?: number; // in seconds
  startedAt: Date;
  lastActivityAt: Date;
}

// ============================================================================
// Quiz Export Types
// ============================================================================

export type QuizExportFormat = 'pdf' | 'csv' | 'json' | 'qti' | 'moodle_xml';

export interface QuizExportOptions {
  format: QuizExportFormat;
  includeAnswers: boolean;
  includeExplanations: boolean;
  includeStatistics: boolean;
}

// ============================================================================
// Quiz Recommendation Types
// ============================================================================

export interface QuizRecommendation {
  quizId: string;
  reason: string;
  confidence: number;
  basedOn: 'weak_areas' | 'study_pattern' | 'difficulty_progression' | 'related_topic';
}
