/**
 * Sandstone Database Types
 * ========================
 * TypeScript type definitions for Supabase database schema
 * Generated from migration files
 */

// ============================================
// ENUM TYPES
// ============================================

export type UserRole = 'admin' | 'teacher' | 'student' | 'test';
export type Theme = 'light' | 'dark' | 'system';
export type QuestionType = '14' | '6' | '20' | '8' | '12';
export type SourceType = 'essay' | 'document' | 'flashcards' | 'manual' | 'ai-generated';
export type DeckSourceType = 'manual' | 'ai-generated' | 'imported';
export type ContextType = 'essay' | 'document' | 'flashcard' | 'general';
export type ExaminerType = 'strict' | 'balanced' | 'lenient' | 'analytical';

// ============================================
// CORE TABLES
// ============================================

export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: Theme;
  default_subject: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  study_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, any>;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  exam_board: string | null;
  level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// ESSAY TABLES
// ============================================

export interface Essay {
  id: string;
  user_id: string;
  subject: string;
  question: string;
  content: string;
  question_type: QuestionType | null;
  overall_score: number | null;
  grade: string | null;
  feedback: any[];
  annotations: any[];
  summary: string | null;
  improvements: any[];
  examiner_scores: any[];
  word_count: number | null;
  time_spent_seconds: number | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExaminerScore {
  id: string;
  essay_id: string;
  examiner_name: string;
  examiner_type: string;
  score: number;
  max_score: number;
  feedback: string | null;
  criteria: any[];
  rubric_breakdown: Record<string, any>;
  confidence_score: number | null;
  created_at: string;
}

// ============================================
// FLASHCARD TABLES
// ============================================

export interface FlashcardDeck {
  id: string;
  user_id: string;
  subject: string;
  name: string;
  description: string | null;
  is_public: boolean;
  source_type: DeckSourceType | null;
  source_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  front_html: string | null;
  back_html: string | null;
  interval: number;
  repetition_count: number;
  ease_factor: number;
  next_review: string | null;
  last_reviewed: string | null;
  difficulty_rating: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// DOCUMENT TABLES
// ============================================

export interface Folder {
  id: string;
  user_id: string;
  subject: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  content: any[];
  folder_id: string | null;
  is_template: boolean;
  template_type: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// QUIZ TABLES
// ============================================

export interface Quiz {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  description: string | null;
  source_type: SourceType;
  source_id: string | null;
  questions: any[];
  settings: Record<string, any>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number | null;
  total_questions: number | null;
  answers: any[];
  time_spent_seconds: number | null;
  completed_at: string | null;
  created_at: string;
}

// ============================================
// AI CHAT TABLES
// ============================================

export interface AIChat {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  context_type: ContextType | null;
  context_id: string | null;
  messages: any[];
  is_pinned: boolean;
  is_archived: boolean;
  folder: string | null;
  model_version: string | null;
  token_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONFIGURATION TABLES
// ============================================

export interface ExaminerConfiguration {
  id: string;
  subject: string;
  examiner_name: string;
  examiner_type: string;
  personality: Record<string, any>;
  grading_style: Record<string, any>;
  focus_areas: string[];
  is_active: boolean;
  created_at: string;
}

export interface RubricCriterion {
  id: string;
  subject: string;
  question_type: string;
  criteria_name: string;
  criteria_description: string | null;
  max_marks: number;
  weight: number;
  is_active: boolean;
  created_at: string;
}

export interface DocumentTemplate {
  id: string;
  subject: string;
  name: string;
  description: string | null;
  template_type: string;
  content: any[];
  is_active: boolean;
  created_at: string;
}

export interface PublicFlashcardDeck {
  id: string;
  subject: string;
  name: string;
  description: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export interface PublicFlashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  tags: string[];
  created_at: string;
}

// ============================================
// MIGRATION TRACKING
// ============================================

export interface SchemaMigration {
  id: number;
  version: string;
  name: string;
  description: string | null;
  applied_at: string;
  applied_by: string;
  checksum: string | null;
  execution_time_ms: number | null;
  rolled_back_at: string | null;
  rolled_back_by: string | null;
}

// ============================================
// VIEWS
// ============================================

export interface UserStatsSummary {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  member_since: string;
  essay_count: number;
  deck_count: number;
  flashcard_count: number;
  document_count: number;
  quiz_count: number;
  chat_count: number;
  last_active: string | null;
}

export interface EssayStatistics {
  user_id: string;
  total_essays: number;
  avg_score: number | null;
  max_score: number | null;
  min_score: number | null;
  essays_last_7_days: number;
  essays_last_30_days: number;
  by_question_type: Record<string, number>;
}

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

export interface DatabaseFunctions {
  // User management
  get_user_role: (user_uuid: string) => UserRole;
  is_admin: (user_uuid: string) => boolean;
  is_teacher: (user_uuid: string) => boolean;
  get_user_stats: (user_uuid: string) => Record<string, any>;
  
  // Essay functions
  calculate_essay_stats: (user_uuid: string) => Record<string, any>;
  
  // Flashcard functions
  get_due_flashcards: (
    user_id: string,
    deck_id?: string,
    limit?: number
  ) => Array<{
    flashcard_id: string;
    deck_id: string;
    front: string;
    back: string;
    next_review: string;
    days_overdue: number;
  }>;
  
  // Migration functions
  is_migration_applied: (version: string) => boolean;
  record_migration: (
    version: string,
    name: string,
    description?: string,
    checksum?: string,
    execution_time_ms?: number
  ) => void;
  record_rollback: (version: string) => void;
  get_migration_status: () => SchemaMigration[];
}

// ============================================
// SUPABASE CLIENT TYPES
// ============================================

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Profile> };
      user_settings: { Row: UserSettings; Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>; Update: Partial<UserSettings> };
      user_roles: { Row: UserRoleRecord; Insert: Omit<UserRoleRecord, 'id' | 'created_at'>; Update: Partial<UserRoleRecord> };
      user_activity: { Row: UserActivity; Insert: Omit<UserActivity, 'id' | 'created_at'>; Update: Partial<UserActivity> };
      subjects: { Row: Subject; Insert: Omit<Subject, 'created_at' | 'updated_at'>; Update: Partial<Subject> };
      essays: { Row: Essay; Insert: Omit<Essay, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Essay> };
      examiner_scores: { Row: ExaminerScore; Insert: Omit<ExaminerScore, 'id' | 'created_at'>; Update: Partial<ExaminerScore> };
      flashcard_decks: { Row: FlashcardDeck; Insert: Omit<FlashcardDeck, 'id' | 'created_at' | 'updated_at'>; Update: Partial<FlashcardDeck> };
      flashcards: { Row: Flashcard; Insert: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Flashcard> };
      folders: { Row: Folder; Insert: Omit<Folder, 'id' | 'created_at'>; Update: Partial<Folder> };
      documents: { Row: Document; Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Document> };
      quizzes: { Row: Quiz; Insert: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Quiz> };
      quiz_attempts: { Row: QuizAttempt; Insert: Omit<QuizAttempt, 'id' | 'created_at'>; Update: Partial<QuizAttempt> };
      ai_chats: { Row: AIChat; Insert: Omit<AIChat, 'id' | 'created_at' | 'updated_at'>; Update: Partial<AIChat> };
      examiner_configurations: { Row: ExaminerConfiguration; Insert: Omit<ExaminerConfiguration, 'id' | 'created_at'>; Update: Partial<ExaminerConfiguration> };
      rubric_criteria: { Row: RubricCriterion; Insert: Omit<RubricCriterion, 'id' | 'created_at'>; Update: Partial<RubricCriterion> };
      document_templates: { Row: DocumentTemplate; Insert: Omit<DocumentTemplate, 'id' | 'created_at'>; Update: Partial<DocumentTemplate> };
      public_flashcard_decks: { Row: PublicFlashcardDeck; Insert: Omit<PublicFlashcardDeck, 'id' | 'created_at'>; Update: Partial<PublicFlashcardDeck> };
      public_flashcards: { Row: PublicFlashcard; Insert: Omit<PublicFlashcard, 'id' | 'created_at'>; Update: Partial<PublicFlashcard> };
      schema_migrations: { Row: SchemaMigration; Insert: Omit<SchemaMigration, 'id' | 'applied_at'>; Update: Partial<SchemaMigration> };
    };
    Views: {
      user_stats_summary: { Row: UserStatsSummary };
      essay_statistics: { Row: EssayStatistics };
    };
    Functions: DatabaseFunctions;
  };
};
