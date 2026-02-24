/**
 * Examiners Module - Centralized Export
 * Sandstone App - AI Essay Grading System
 * 
 * This module provides all examiner-related functionality for the
 * AI essay grading system, optimized for Edexcel A-Level assessment.
 */

// ============================================================================
// Configuration Exports
// ============================================================================

export {
  // Examiner arrays
  economicsExaminers,
  geographyExaminers,
  
  // Configuration objects
  questionTypeConfigs,
  markBands,
  
  // Helper functions
  getExaminers,
  getQuestionTypeConfig,
  getMarkBand,
  calculateGrade,
  calculateUMS,
  getExaminerPrompt,
  getDiagramFeedback,
} from "./config";

// Type exports
export type {
  ExaminerConfig,
  AssessmentObjective,
  QuestionType,
  UnitCode,
  QuestionTypeConfig,
  MarkBand,
} from "./config";

// ============================================================================
// Grading Service Exports
// ============================================================================

export {
  // Main grading function
  gradeEssay,
  
  // Validation and utilities
  validateGradingRequest,
  getGradeDescription,
  getImprovementPriority,
  
  // Error handling
  GradingError,
} from "./grading-service";

// Type exports
export type {
  GradingRequest,
  GradingResponse,
  ExaminerResult,
  Annotation,
  GradingMetadata,
  KimiResponse,
} from "./grading-service";

// ============================================================================
// Prompts Exports
// ============================================================================

export {
  // Individual AO prompts
  ao1Prompts,
  ao2Prompts,
  ao3Prompts,
  ao4Prompts,
  
  // Prompt getter
  getPromptForAO,
  
  // Combined prompts object
  gradingPrompts,
} from "./prompts";

// ============================================================================
// Mark Scheme Alignment
// ============================================================================

/**
 * Edexcel Mark Scheme Alignment Notes:
 * 
 * AO1 - Knowledge and Understanding (20% weighting)
 * - Accurate definitions and concepts
 * - Correct terminology
 * - Relevant theory
 * 
 * AO2 - Application (20% weighting)
 * - Contextual application
 * - Relevant examples
 * - Case study use
 * 
 * AO3 - Analysis (30% weighting)
 * - Chains of reasoning
 * - Cause and effect
 * - Diagram use
 * 
 * AO4 - Evaluation (30% weighting)
 * - Balanced arguments
 * - Critical assessment
 * - Supported judgment
 */

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Basic Grading
 * ```typescript
 * import { gradeEssay } from "@/lib/examiners";
 * 
 * const result = await gradeEssay({
 *   question: "Explain the causes of inflation...",
 *   essay: studentResponse,
 *   subject: "economics",
 *   questionType: "12-mark",
 * });
 * ```
 * 
 * Example 2: Get Examiner Configuration
 * ```typescript
 * import { getExaminers, getQuestionTypeConfig } from "@/lib/examiners";
 * 
 * const examiners = getExaminers("economics");
 * const config = getQuestionTypeConfig("14-mark");
 * ```
 * 
 * Example 3: Calculate Grade
 * ```typescript
 * import { calculateGrade } from "@/lib/examiners";
 * 
 * const grade = calculateGrade(12, 14); // Returns "A"
 * ```
 */

// ============================================================================
// Feedback Generator Exports
// ============================================================================

export {
  // Detailed feedback generation
  generateDetailedFeedback,
  generateProgressTracker,
  generateSmartAnnotations,
} from "./feedback-generator";

// Type exports
export type {
  DetailedFeedback,
  AOFeedback,
  ActionItem,
  ProgressTracker,
  Milestone,
} from "./feedback-generator";

// ============================================================================
// Default Export
// ============================================================================

export { default } from "./grading-service";
