-- Enhanced Database Schema for Sandstone API
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- Flashcards
-- ============================================

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('economics', 'geography')),
  topic TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai-generated', 'imported')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Flashcard progress tracking (SRS)
CREATE TABLE IF NOT EXISTS flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  confidence TEXT CHECK (confidence IN ('again', 'hard', 'good', 'easy')),
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

-- ============================================
-- Documents
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  summary TEXT,
  subject TEXT CHECK (subject IN ('economics', 'geography')),
  topic TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'needs_manual_processing')),
  processing_error TEXT,
  processing_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Document questions (AI-generated)
CREATE TABLE IF NOT EXISTS document_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short', 'essay')),
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Quizzes
-- ============================================

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL CHECK (subject IN ('economics', 'geography')),
  unit TEXT,
  topic TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  question_types TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  time_limit INTEGER, -- minutes
  questions JSONB NOT NULL DEFAULT '[]',
  include_explanations BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  answers JSONB DEFAULT '[]',
  score INTEGER,
  total_marks INTEGER,
  percentage DECIMAL(5,2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Chat Logs
-- ============================================

CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('economics', 'geography')),
  message_length INTEGER,
  response_length INTEGER,
  request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Grading History
-- ============================================

CREATE TABLE IF NOT EXISTS grading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  essay_preview TEXT,
  overall_score DECIMAL(4,1),
  grade TEXT,
  percentage DECIMAL(5,1),
  question_type TEXT,
  unit TEXT,
  examiner_scores JSONB DEFAULT '[]',
  summary TEXT,
  improvements TEXT[] DEFAULT '{}',
  request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- User Profiles & Settings
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  target_grade TEXT,
  exam_date DATE,
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  study_reminders BOOLEAN DEFAULT TRUE,
  weekly_report BOOLEAN DEFAULT TRUE,
  default_subject TEXT CHECK (default_subject IN ('economics', 'geography')),
  accessibility JSONB DEFAULT '{"highContrast": false, "largeText": false, "reduceMotion": false}',
  grading_units JSONB DEFAULT '{"WEC11": true, "WEC12": true, "WEC13": true, "WEC14": true}',
  chat_history_enabled BOOLEAN DEFAULT TRUE,
  auto_save_essays BOOLEAN DEFAULT TRUE,
  default_question_type TEXT DEFAULT '14-mark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_essays_graded INTEGER DEFAULT 0,
  total_chat_messages INTEGER DEFAULT 0,
  total_flashcards_created INTEGER DEFAULT 0,
  total_quizzes_taken INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- minutes
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log for tracking user engagement
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  subject TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

-- Flashcards indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_subject ON flashcards(subject) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON flashcards USING GIN(tags) WHERE deleted_at IS NULL;

-- Flashcard progress indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review ON flashcard_progress(next_review);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_subject ON documents(subject) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags) WHERE deleted_at IS NULL;

-- Quizzes indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_subject ON quizzes(subject) WHERE deleted_at IS NULL;

-- Quiz sessions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);

-- Chat logs indexes
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);

-- Grading history indexes
CREATE INDEX IF NOT EXISTS idx_grading_history_user_id ON grading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_grading_history_created_at ON grading_history(created_at);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Flashcards policies
CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "Users can create own flashcards" ON flashcards
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own flashcards" ON flashcards
  FOR DELETE USING (user_id = auth.uid());

-- Flashcard progress policies
CREATE POLICY "Users can view own progress" ON flashcard_progress
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own progress" ON flashcard_progress
  FOR ALL USING (user_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view own and public documents" ON documents
  FOR SELECT USING ((user_id = auth.uid() OR is_public = TRUE) AND deleted_at IS NULL);
CREATE POLICY "Users can create own documents" ON documents
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (user_id = auth.uid());

-- Quizzes policies
CREATE POLICY "Users can view own and public quizzes" ON quizzes
  FOR SELECT USING ((user_id = auth.uid() OR is_public = TRUE) AND deleted_at IS NULL);
CREATE POLICY "Users can create own quizzes" ON quizzes
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own quizzes" ON quizzes
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own quizzes" ON quizzes
  FOR DELETE USING (user_id = auth.uid());

-- Quiz sessions policies
CREATE POLICY "Users can view own sessions" ON quiz_sessions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own sessions" ON quiz_sessions
  FOR ALL USING (user_id = auth.uid());

-- Chat logs policies
CREATE POLICY "Users can view own chat logs" ON chat_logs
  FOR SELECT USING (user_id = auth.uid());

-- Grading history policies
CREATE POLICY "Users can view own grading history" ON grading_history
  FOR SELECT USING (user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- User stats policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (user_id = auth.uid());

-- Activity log policies
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- Functions and Triggers
-- ============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for all tables with updated_at
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_progress_updated_at
  BEFORE UPDATE ON flashcard_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile and settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  -- Create settings
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  -- Create stats
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_subject TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, subject, metadata)
  VALUES (p_user_id, p_action, p_subject, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Storage Buckets
-- ============================================

-- Create documents bucket (run in Supabase dashboard or use storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for documents bucket
-- CREATE POLICY "Users can upload own documents" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own documents" ON storage.objects
--   FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own documents" ON storage.objects
--   FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
