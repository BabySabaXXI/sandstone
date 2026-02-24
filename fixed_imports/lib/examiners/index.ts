// Examiner Configuration Exports - Centralized examiner utility exports

// Examiner configurations
export {
  getExaminers,
  economicsExaminers,
  geographyExaminers,
} from "./config";

// Type exports
export type { ExaminerConfig } from "./config";

// Grading prompts
export { gradingPrompts } from "./prompts";

// Economics-specific configuration (if needed directly)
export {
  getQuestionTypeConfig,
  calculateGrade,
  getExaminerPrompt,
  getDiagramFeedback,
} from "./economics-config";
export type { QuestionType, UnitCode } from "./economics-config";
