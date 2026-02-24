/**
 * Quiz Creator
 * Tools for creating, editing, and managing quizzes
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Quiz,
  QuizQuestion,
  QuestionType,
  QuizSettings,
  QuizStatus,
  QuizSourceType,
  QuizTemplate,
  QuizGenerationOptions,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion,
  MatchingQuestion,
  OrderingQuestion,
  EssayQuestion,
  CalculationQuestion,
  QuizDifficulty,
} from './quiz-types';
import { getDefaultPoints, getEstimatedTime } from './quiz-engine';
import { Subject } from '@/types';

// ============================================================================
// Default Quiz Settings
// ============================================================================

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  passingScore: 70,
  shuffleQuestions: true,
  showCorrectAnswers: true,
  showExplanation: true,
  allowRetake: true,
  preventCopyPaste: false,
  requireConfirmation: true,
};

// ============================================================================
// Quiz Templates
// ============================================================================

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'quick-review',
    name: 'Quick Review',
    description: 'Short quiz for quick knowledge check',
    subject: 'economics',
    questionTypes: ['multiple_choice', 'true_false'],
    defaultSettings: {
      ...DEFAULT_QUIZ_SETTINGS,
      timeLimit: 10,
    },
    defaultQuestions: [],
  },
  {
    id: 'comprehensive-test',
    name: 'Comprehensive Test',
    description: 'Full assessment with various question types',
    subject: 'economics',
    questionTypes: ['multiple_choice', 'multiple_select', 'short_answer', 'essay'],
    defaultSettings: {
      ...DEFAULT_QUIZ_SETTINGS,
      timeLimit: 60,
      passingScore: 65,
    },
    defaultQuestions: [],
  },
  {
    id: 'calculation-practice',
    name: 'Calculation Practice',
    description: 'Focus on numerical problems and calculations',
    subject: 'economics',
    questionTypes: ['calculation', 'fill_blank'],
    defaultSettings: {
      ...DEFAULT_QUIZ_SETTINGS,
      timeLimit: 45,
      showCorrectAnswers: true,
    },
    defaultQuestions: [],
  },
  {
    id: 'case-study-analysis',
    name: 'Case Study Analysis',
    description: 'Analyze real-world scenarios',
    subject: 'geography',
    questionTypes: ['multiple_choice', 'short_answer', 'essay'],
    defaultSettings: {
      ...DEFAULT_QUIZ_SETTINGS,
      timeLimit: 90,
      passingScore: 60,
    },
    defaultQuestions: [],
  },
];

// ============================================================================
// Quiz Factory
// ============================================================================

export interface CreateQuizParams {
  title: string;
  description?: string;
  subject: Subject;
  sourceType?: QuizSourceType;
  sourceId?: string;
  settings?: Partial<QuizSettings>;
  templateId?: string;
}

/**
 * Create a new quiz with default settings
 */
export function createQuiz(params: CreateQuizParams, userId: string): Quiz {
  const now = new Date();
  const template = params.templateId 
    ? QUIZ_TEMPLATES.find(t => t.id === params.templateId)
    : null;
  
  return {
    id: uuidv4(),
    title: params.title,
    description: params.description || '',
    subject: params.subject,
    sourceType: params.sourceType || 'manual',
    sourceId: params.sourceId,
    questions: [],
    settings: {
      ...DEFAULT_QUIZ_SETTINGS,
      ...template?.defaultSettings,
      ...params.settings,
    },
    status: 'draft',
    tags: [],
    attemptCount: 0,
    averageScore: 0,
    userId,
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Question Builders
// ============================================================================

interface BaseQuestionParams {
  question: string;
  explanation?: string;
  difficulty?: QuizDifficulty;
  topic?: string;
  tags?: string[];
  points?: number;
  hint?: string;
}

export function createMultipleChoiceQuestion(
  params: BaseQuestionParams & {
    options: string[];
    correctAnswer: string;
    shuffleOptions?: boolean;
  }
): MultipleChoiceQuestion {
  return {
    id: uuidv4(),
    type: 'multiple_choice',
    question: params.question,
    options: params.options,
    correctAnswer: params.correctAnswer,
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('multiple_choice'),
    timeEstimate: getEstimatedTime('multiple_choice'),
    hint: params.hint,
    shuffleOptions: params.shuffleOptions ?? true,
  };
}

export function createMultipleSelectQuestion(
  params: BaseQuestionParams & {
    options: string[];
    correctAnswers: string[];
    partialCredit?: boolean;
  }
): MultipleSelectQuestion {
  return {
    id: uuidv4(),
    type: 'multiple_select',
    question: params.question,
    options: params.options,
    correctAnswers: params.correctAnswers,
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('multiple_select'),
    timeEstimate: getEstimatedTime('multiple_select'),
    hint: params.hint,
    partialCredit: params.partialCredit ?? true,
  };
}

export function createTrueFalseQuestion(
  params: BaseQuestionParams & {
    statement: string;
    correctAnswer: boolean;
  }
): TrueFalseQuestion {
  return {
    id: uuidv4(),
    type: 'true_false',
    question: params.question,
    statement: params.statement,
    correctAnswer: params.correctAnswer,
    explanation: params.explanation,
    difficulty: params.difficulty || 'easy',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('true_false'),
    timeEstimate: getEstimatedTime('true_false'),
    hint: params.hint,
  };
}

export function createFillBlankQuestion(
  params: BaseQuestionParams & {
    text: string;
    blanks: {
      id: string;
      correctAnswer: string;
      acceptableAnswers?: string[];
      hint?: string;
    }[];
    caseSensitive?: boolean;
  }
): FillBlankQuestion {
  return {
    id: uuidv4(),
    type: 'fill_blank',
    question: params.question,
    text: params.text,
    blanks: params.blanks,
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('fill_blank'),
    timeEstimate: getEstimatedTime('fill_blank'),
    hint: params.hint,
    caseSensitive: params.caseSensitive ?? false,
  };
}

export function createShortAnswerQuestion(
  params: BaseQuestionParams & {
    correctAnswer: string;
    acceptableAnswers?: string[];
    keywords?: string[];
    maxLength?: number;
    minLength?: number;
  }
): ShortAnswerQuestion {
  return {
    id: uuidv4(),
    type: 'short_answer',
    question: params.question,
    correctAnswer: params.correctAnswer,
    acceptableAnswers: params.acceptableAnswers || [],
    keywords: params.keywords || [],
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('short_answer'),
    timeEstimate: getEstimatedTime('short_answer'),
    hint: params.hint,
    maxLength: params.maxLength,
    minLength: params.minLength,
    caseSensitive: false,
  };
}

export function createMatchingQuestion(
  params: BaseQuestionParams & {
    pairs: { id: string; left: string; right: string }[];
  }
): MatchingQuestion {
  return {
    id: uuidv4(),
    type: 'matching',
    question: params.question,
    pairs: params.pairs,
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('matching'),
    timeEstimate: getEstimatedTime('matching'),
    hint: params.hint,
    shuffleLeft: true,
    shuffleRight: true,
  };
}

export function createOrderingQuestion(
  params: BaseQuestionParams & {
    items: { id: string; text: string }[];
    correctOrder: string[];
  }
): OrderingQuestion {
  return {
    id: uuidv4(),
    type: 'ordering',
    question: params.question,
    items: params.items,
    correctOrder: params.correctOrder,
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('ordering'),
    timeEstimate: getEstimatedTime('ordering'),
    hint: params.hint,
  };
}

export function createEssayQuestion(
  params: BaseQuestionParams & {
    minWords?: number;
    maxWords?: number;
  }
): EssayQuestion {
  return {
    id: uuidv4(),
    type: 'essay',
    question: params.question,
    explanation: params.explanation,
    difficulty: params.difficulty || 'hard',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('essay'),
    timeEstimate: getEstimatedTime('essay'),
    hint: params.hint,
    minWords: params.minWords || 100,
    maxWords: params.maxWords || 500,
  };
}

export function createCalculationQuestion(
  params: BaseQuestionParams & {
    problem: string;
    correctAnswer: number;
    tolerance?: number;
    units?: string;
    steps?: { description: string; formula?: string }[];
  }
): CalculationQuestion {
  return {
    id: uuidv4(),
    type: 'calculation',
    question: params.question,
    problem: params.problem,
    correctAnswer: params.correctAnswer,
    tolerance: params.tolerance || 0.01,
    units: params.units,
    explanation: params.explanation,
    difficulty: params.difficulty || 'medium',
    topic: params.topic,
    tags: params.tags || [],
    points: params.points || getDefaultPoints('calculation'),
    timeEstimate: getEstimatedTime('calculation'),
    hint: params.hint,
    showWork: true,
    steps: params.steps || [],
  };
}

// ============================================================================
// Quiz Modification Functions
// ============================================================================

/**
 * Add a question to a quiz
 */
export function addQuestion(quiz: Quiz, question: QuizQuestion): Quiz {
  return {
    ...quiz,
    questions: [...quiz.questions, question],
    updatedAt: new Date(),
  };
}

/**
 * Remove a question from a quiz
 */
export function removeQuestion(quiz: Quiz, questionId: string): Quiz {
  return {
    ...quiz,
    questions: quiz.questions.filter(q => q.id !== questionId),
    updatedAt: new Date(),
  };
}

/**
 * Update a question in a quiz
 */
export function updateQuestion(
  quiz: Quiz,
  questionId: string,
  updates: Partial<QuizQuestion>
): Quiz {
  return {
    ...quiz,
    questions: quiz.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } as QuizQuestion : q
    ),
    updatedAt: new Date(),
  };
}

/**
 * Reorder questions in a quiz
 */
export function reorderQuestions(quiz: Quiz, questionIds: string[]): Quiz {
  const questionMap = new Map(quiz.questions.map(q => [q.id, q]));
  const reordered = questionIds
    .map(id => questionMap.get(id))
    .filter((q): q is QuizQuestion => q !== undefined);
  
  return {
    ...quiz,
    questions: reordered,
    updatedAt: new Date(),
  };
}

/**
 * Duplicate a question
 */
export function duplicateQuestion(quiz: Quiz, questionId: string): Quiz {
  const question = quiz.questions.find(q => q.id === questionId);
  if (!question) return quiz;
  
  const duplicated = {
    ...question,
    id: uuidv4(),
  };
  
  return addQuestion(quiz, duplicated);
}

/**
 * Update quiz settings
 */
export function updateQuizSettings(
  quiz: Quiz,
  settings: Partial<QuizSettings>
): Quiz {
  return {
    ...quiz,
    settings: { ...quiz.settings, ...settings },
    updatedAt: new Date(),
  };
}

/**
 * Publish a quiz
 */
export function publishQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    status: 'published',
    publishedAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Archive a quiz
 */
export function archiveQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    status: 'archived',
    updatedAt: new Date(),
  };
}

// ============================================================================
// Quiz Import/Export
// ============================================================================

/**
 * Export quiz to JSON format
 */
export function exportQuizToJSON(quiz: Quiz, includeAnswers: boolean = true): string {
  const exportData = {
    title: quiz.title,
    description: quiz.description,
    subject: quiz.subject,
    settings: quiz.settings,
    questions: includeAnswers 
      ? quiz.questions 
      : quiz.questions.map(q => {
          // Remove correct answers if not including them
          const { correctAnswer, correctAnswers, ...rest } = q as Record<string, unknown>;
          return rest;
        }),
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import quiz from JSON format
 */
export function importQuizFromJSON(
  json: string,
  userId: string,
  sourceType: QuizSourceType = 'manual'
): Quiz | null {
  try {
    const data = JSON.parse(json);
    
    return createQuiz(
      {
        title: data.title,
        description: data.description,
        subject: data.subject,
        sourceType,
        settings: data.settings,
      },
      userId
    );
  } catch (error) {
    console.error('Failed to import quiz:', error);
    return null;
  }
}

/**
 * Export questions to CSV format
 */
export function exportQuestionsToCSV(questions: QuizQuestion[]): string {
  const headers = ['Type', 'Question', 'Options', 'Correct Answer', 'Explanation', 'Difficulty', 'Points'];
  
  const rows = questions.map(q => {
    let options = '';
    let correctAnswer = '';
    
    if (q.type === 'multiple_choice') {
      const mq = q as MultipleChoiceQuestion;
      options = mq.options.join('|');
      correctAnswer = mq.correctAnswer;
    } else if (q.type === 'multiple_select') {
      const ms = q as MultipleSelectQuestion;
      options = ms.options.join('|');
      correctAnswer = ms.correctAnswers.join('|');
    } else if (q.type === 'true_false') {
      const tf = q as TrueFalseQuestion;
      correctAnswer = tf.correctAnswer ? 'true' : 'false';
    }
    
    return [
      q.type,
      `"${q.question.replace(/"/g, '""')}"`,
      `"${options.replace(/"/g, '""')}"`,
      `"${correctAnswer.replace(/"/g, '""')}"`,
      `"${(q.explanation || '').replace(/"/g, '""')}"`,
      q.difficulty,
      q.points,
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}

// ============================================================================
// Quiz Validation
// ============================================================================

export interface QuizValidationError {
  field: string;
  message: string;
  questionId?: string;
}

/**
 * Validate a quiz before publishing
 */
export function validateQuiz(quiz: Quiz): QuizValidationError[] {
  const errors: QuizValidationError[] = [];
  
  // Validate title
  if (!quiz.title.trim()) {
    errors.push({ field: 'title', message: 'Quiz title is required' });
  }
  
  // Validate questions
  if (quiz.questions.length === 0) {
    errors.push({ field: 'questions', message: 'Quiz must have at least one question' });
  }
  
  // Validate each question
  quiz.questions.forEach((question, index) => {
    if (!question.question.trim()) {
      errors.push({
        field: `questions[${index}].question`,
        message: `Question ${index + 1} text is required`,
        questionId: question.id,
      });
    }
    
    // Type-specific validation
    switch (question.type) {
      case 'multiple_choice': {
        const mq = question as MultipleChoiceQuestion;
        if (mq.options.length < 2) {
          errors.push({
            field: `questions[${index}].options`,
            message: `Question ${index + 1} must have at least 2 options`,
            questionId: question.id,
          });
        }
        if (!mq.correctAnswer) {
          errors.push({
            field: `questions[${index}].correctAnswer`,
            message: `Question ${index + 1} must have a correct answer`,
            questionId: question.id,
          });
        }
        break;
      }
      case 'multiple_select': {
        const ms = question as MultipleSelectQuestion;
        if (ms.correctAnswers.length === 0) {
          errors.push({
            field: `questions[${index}].correctAnswers`,
            message: `Question ${index + 1} must have at least one correct answer`,
            questionId: question.id,
          });
        }
        break;
      }
      case 'fill_blank': {
        const fb = question as FillBlankQuestion;
        if (fb.blanks.length === 0) {
          errors.push({
            field: `questions[${index}].blanks`,
            message: `Question ${index + 1} must have at least one blank`,
            questionId: question.id,
          });
        }
        break;
      }
    }
  });
  
  return errors;
}

/**
 * Check if a quiz is valid for publishing
 */
export function isQuizValid(quiz: Quiz): boolean {
  return validateQuiz(quiz).length === 0;
}
