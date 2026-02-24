/**
 * Quiz Module
 * Complete quiz system for the Sandstone app
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Question Types
  QuestionType,
  QuizDifficulty,
  BaseQuestion,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion,
  MatchingQuestion,
  OrderingQuestion,
  EssayQuestion,
  EssayRubric,
  CalculationQuestion,
  CalculationStep,
  DiagramLabelQuestion,
  CaseStudyQuestion,
  QuizQuestion,
  
  // Quiz Types
  QuizStatus,
  QuizSourceType,
  QuizSettings,
  Quiz,
  
  // Attempt Types
  AttemptStatus,
  QuestionAnswer,
  QuizAttempt,
  QuestionResult,
  
  // Analytics Types
  QuizAnalytics,
  QuestionAnalytics,
  UserQuizStats,
  
  // Creation Types
  QuizTemplate,
  QuizGenerationOptions,
  BulkQuestionImport,
  
  // Filter/Sort Types
  QuizFilters,
  QuizSortField,
  QuizSortOrder,
  QuizSortOptions,
  
  // Session Types
  QuizSession,
  
  // Export Types
  QuizExportFormat,
  QuizExportOptions,
  
  // Recommendation Types
  QuizRecommendation,
} from './quiz-types';

// ============================================================================
// Quiz Engine
// ============================================================================

export {
  // Answer Validation
  validateAnswer,
  
  // Quiz Scoring
  calculateQuizScore,
  
  // Question Utilities
  shuffleArray,
  prepareQuizQuestions,
  getDefaultPoints,
  getEstimatedTime,
  
  // Statistics
  calculateQuizStats,
  calculateScoreDistribution,
} from './quiz-engine';

// ============================================================================
// Quiz Creator
// ============================================================================

export {
  // Constants
  DEFAULT_QUIZ_SETTINGS,
  QUIZ_TEMPLATES,
  
  // Quiz Factory
  createQuiz,
  type CreateQuizParams,
  
  // Question Builders
  createMultipleChoiceQuestion,
  createMultipleSelectQuestion,
  createTrueFalseQuestion,
  createFillBlankQuestion,
  createShortAnswerQuestion,
  createMatchingQuestion,
  createOrderingQuestion,
  createEssayQuestion,
  createCalculationQuestion,
  
  // Quiz Modification
  addQuestion,
  removeQuestion,
  updateQuestion,
  reorderQuestions,
  duplicateQuestion,
  updateQuizSettings,
  publishQuiz,
  archiveQuiz,
  
  // Import/Export
  exportQuizToJSON,
  importQuizFromJSON,
  exportQuestionsToCSV,
  
  // Validation
  validateQuiz,
  isQuizValid,
  type QuizValidationError,
} from './quiz-creator';

// ============================================================================
// Quiz Analytics
// ============================================================================

export {
  // Quiz Analytics
  generateQuizAnalytics,
  
  // Question Analytics
  generateQuestionAnalytics,
  
  // User Statistics
  generateUserQuizStats,
  
  // Performance Analysis
  analyzePerformance,
  type PerformanceAnalysis,
  
  // Comparison
  compareToGroup,
  type ComparisonResult,
  
  // Progress Tracking
  trackProgress,
  type ProgressData,
  
  // Reports
  generateQuizReport,
  exportReportToJSON,
  exportReportToCSV,
  type QuizReport,
} from './quiz-analytics';

// ============================================================================
// Quiz Hooks
// ============================================================================

export {
  // Query Hooks
  useQuizzes,
  useQuiz,
  useQuizAttempts,
  useQuizAnalytics,
  useUserQuizStats,
  
  // Mutation Hooks
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  usePublishQuiz,
  
  // Question Management
  useAddQuestion,
  useUpdateQuestion,
  useRemoveQuestion,
  
  // Session
  useQuizSession,
  
  // Performance
  usePerformanceAnalysis,
} from './quiz-hooks';
