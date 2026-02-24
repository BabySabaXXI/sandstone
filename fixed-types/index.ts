// Subject Types
export type Subject = "economics" | "geography";

export interface SubjectConfig {
  id: Subject;
  name: string;
  description: string;
  icon: string;
  color: string;
  examBoard?: string;
  level?: string;
}

// Grading Types
export interface ExaminerScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteria: string[];
}

export interface ExaminerScoreDetailed extends ExaminerScore {
  examinerId?: string;
  ao?: string;
  color?: string;
}

export type AnnotationType = 
  | "grammar" 
  | "vocabulary" 
  | "style" 
  | "positive" 
  | "knowledge" 
  | "analysis" 
  | "evaluation";

export interface Annotation {
  id: string;
  type: AnnotationType;
  start: number;
  end: number;
  message: string;
  suggestion?: string;
}

export interface GradingResult {
  overallScore: number;
  band?: string;
  grade?: string;
  examiners: ExaminerScore[];
  annotations: Annotation[];
  summary: string;
  improvements: string[];
  subject: Subject;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: Date;
  lastReviewed?: Date;
  nextReview?: Date;
  interval: number;
  repetitionCount: number;
  easeFactor: number;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  name: string;
  description: string;
  subject: Subject;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

// Document Types
export type DocumentBlockType = 
  | "heading1" 
  | "heading2" 
  | "heading3" 
  | "paragraph" 
  | "bullet" 
  | "numbered" 
  | "quote" 
  | "divider";

export interface DocumentBlock {
  id: string;
  type: DocumentBlockType;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  subject: Subject;
  blocks: DocumentBlock[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  subject: Subject;
  parentId?: string;
  createdAt: Date;
}

// Quiz Types
export type QuizQuestionType = 
  | "multiple_choice" 
  | "fill_blank" 
  | "matching" 
  | "essay" 
  | "definition" 
  | "calculation";

export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: QuizDifficulty;
  topic?: string;
}

export type QuizSourceType = "essay" | "document" | "manual";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  sourceType: QuizSourceType;
  sourceId?: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  completedAt?: Date;
  createdAt: Date;
}

// Essay/Response Types
export interface EssayResponse {
  id: string;
  userId: string;
  subject: Subject;
  question: string;
  content: string;
  overallScore?: number;
  grade?: string;
  feedback?: ExaminerScore[];
  annotations?: Annotation[];
  summary?: string;
  improvements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Essay Store Types
export interface Essay {
  id: string;
  userId: string;
  subject: Subject;
  question: string;
  content: string;
  questionType?: string;
  marks?: number;
  overallScore?: number;
  grade?: string;
  feedback: ExaminerScoreDetailed[];
  annotations: Annotation[];
  summary?: string;
  improvements: string[];
  examinerScores: ExaminerScoreDetailed[];
  createdAt: Date;
  updatedAt: Date;
}

// Layout Types
export interface PanelState {
  sidebarOpen: boolean;
  aiPopupOpen: boolean;
  aiPopupPosition: { x: number; y: number };
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database Types (for Supabase)
export interface DatabaseEssay {
  id: string;
  user_id: string;
  subject: string;
  question: string;
  content: string;
  overall_score?: number;
  grade?: string;
  feedback?: ExaminerScoreDetailed[];
  annotations?: Annotation[];
  summary?: string;
  improvements?: string[];
  examiner_scores?: ExaminerScoreDetailed[];
  question_type?: string;
  marks?: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFlashcardDeck {
  id: string;
  user_id: string;
  name: string;
  description: string;
  subject: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFlashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  interval: number;
  repetition_count: number;
  ease_factor: number;
  next_review?: string;
  last_reviewed?: string;
  created_at: string;
}

export interface DatabaseDocument {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  content: DocumentBlock[];
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFolder {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  parent_id?: string;
  created_at: string;
}

export interface DatabaseQuiz {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  source_type: string;
  source_id?: string;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseQuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  answers: QuizAnswer[];
  completed_at?: string;
  created_at: string;
}

// Re-export API types
export type { GradeRequest, GradeResponse, APIErrorResponse, RateLimitInfo } from "./api";
