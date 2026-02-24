-- ============================================================================
-- SANDSTONE MULTI-TENANT DATA ISOLATION SECURITY IMPLEMENTATION
-- ============================================================================
-- This file implements comprehensive tenant isolation for the Sandstone app
-- supporting multiple subjects (Economics, Geography) with strict data separation
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TENANT CONFIGURATION TABLE
-- ============================================================================

-- Create subjects/tenants table for formal tenant management
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  exam_board TEXT,
  level TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (id, name, description, color, exam_board, level) VALUES
  ('economics', 'Economics', 'Pearson Edexcel IAL Economics', '#A8C5A8', 'Pearson Edexcel IAL', 'A-Level'),
  ('geography', 'Geography', 'Pearson Edexcel IAL Geography', '#A8C5D4', 'Pearson Edexcel IAL', 'A-Level')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on subjects table (read-only for users)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subjects are viewable by all authenticated users" ON subjects
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 2. USER-SUBJECT ACCESS CONTROL
-- ============================================================================

-- Create user_subject_access table to track which subjects each user can access
CREATE TABLE IF NOT EXISTS user_subject_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, subject_id)
);

-- Enable RLS on user_subject_access
ALTER TABLE user_subject_access ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subject access
CREATE POLICY "Users can view own subject access" ON user_subject_access
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can manage subject access
CREATE POLICY "Admins can manage subject access" ON user_subject_access
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subject_access_user_id ON user_subject_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subject_access_subject_id ON user_subject_access(subject_id);

-- ============================================================================
-- 3. SECURITY FUNCTIONS FOR TENANT ISOLATION
-- ============================================================================

-- Function to check if user has access to a specific subject
CREATE OR REPLACE FUNCTION user_has_subject_access(user_uuid UUID, subject_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin users have access to all subjects
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Check explicit subject access
  RETURN EXISTS (
    SELECT 1 FROM user_subject_access 
    WHERE user_id = user_uuid 
    AND subject_id = $2 
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all subjects a user has access to
CREATE OR REPLACE FUNCTION get_user_subjects(user_uuid UUID)
RETURNS TEXT[] AS $$
DECLARE
  subjects TEXT[];
BEGIN
  -- Admin gets all subjects
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin') THEN
    SELECT ARRAY_AGG(id) INTO subjects FROM subjects WHERE is_active = TRUE;
    RETURN subjects;
  END IF;
  
  -- Regular users get their assigned subjects
  SELECT ARRAY_AGG(subject_id) INTO subjects 
  FROM user_subject_access 
  WHERE user_id = user_uuid AND is_active = TRUE;
  
  RETURN COALESCE(subjects, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate subject access (throws error if no access)
CREATE OR REPLACE FUNCTION validate_subject_access(user_uuid UUID, subject_id TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT user_has_subject_access(user_uuid, subject_id) THEN
    RAISE EXCEPTION 'Access denied: User does not have access to subject %', subject_id
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce subject isolation on INSERT/UPDATE
CREATE OR REPLACE FUNCTION enforce_subject_isolation()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  table_name TEXT;
BEGIN
  current_user_id := auth.uid();
  table_name := TG_TABLE_NAME;
  
  -- Skip if no subject column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = TG_TABLE_NAME 
    AND column_name = 'subject'
  ) THEN
    RETURN NEW;
  END IF;
  
  -- Validate subject access
  IF NEW.subject IS NOT NULL THEN
    IF NOT user_has_subject_access(current_user_id, NEW.subject) THEN
      RAISE EXCEPTION 'Access denied: Cannot access subject %', NEW.subject
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. ENHANCED ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop existing policies to recreate with subject isolation
DROP POLICY IF EXISTS "Users can view own essays" ON essays;
DROP POLICY IF EXISTS "Users can create own essays" ON essays;
DROP POLICY IF EXISTS "Users can update own essays" ON essays;
DROP POLICY IF EXISTS "Users can delete own essays" ON essays;

-- Essays policies with subject isolation
CREATE POLICY "Users can view own essays with subject isolation" ON essays
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can create own essays with subject isolation" ON essays
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can update own essays with subject isolation" ON essays
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can delete own essays with subject isolation" ON essays
  FOR DELETE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

-- Prevent cross-subject updates
CREATE POLICY "Prevent cross-subject essay updates" ON essays
  FOR UPDATE WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
    AND subject = (SELECT subject FROM essays WHERE id = essays.id)
  );

-- ============================================================================
-- Flashcard decks policies with subject isolation
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own decks" ON flashcard_decks;
DROP POLICY IF EXISTS "Users can manage own decks" ON flashcard_decks;

CREATE POLICY "Users can view own decks with subject isolation" ON flashcard_decks
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can create decks with subject isolation" ON flashcard_decks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can update decks with subject isolation" ON flashcard_decks
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can delete decks with subject isolation" ON flashcard_decks
  FOR DELETE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

-- ============================================================================
-- Flashcards policies (inherit subject from deck)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can manage own flashcards" ON flashcards;

CREATE POLICY "Users can view own flashcards with subject isolation" ON flashcards
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_has_subject_access(auth.uid(), subject)
    )
  );

CREATE POLICY "Users can manage own flashcards with subject isolation" ON flashcards
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM flashcard_decks 
      WHERE id = flashcards.deck_id 
      AND user_has_subject_access(auth.uid(), subject)
    )
  );

-- ============================================================================
-- Documents policies with subject isolation
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can manage own documents" ON documents;

CREATE POLICY "Users can view own documents with subject isolation" ON documents
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can create documents with subject isolation" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can update documents with subject isolation" ON documents
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can delete documents with subject isolation" ON documents
  FOR DELETE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

-- ============================================================================
-- Folders policies with subject isolation
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can manage own folders" ON folders;

CREATE POLICY "Users can view own folders with subject isolation" ON folders
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can create folders with subject isolation" ON folders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can update folders with subject isolation" ON folders
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can delete folders with subject isolation" ON folders
  FOR DELETE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

-- ============================================================================
-- Quizzes policies with subject isolation
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can manage own quizzes" ON quizzes;

CREATE POLICY "Users can view own quizzes with subject isolation" ON quizzes
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can create quizzes with subject isolation" ON quizzes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can update quizzes with subject isolation" ON quizzes
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can delete quizzes with subject isolation" ON quizzes
  FOR DELETE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

-- ============================================================================
-- Quiz attempts policies (inherit subject from quiz)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON quiz_attempts;

CREATE POLICY "Users can view own attempts with subject isolation" ON quiz_attempts
  FOR SELECT USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM quizzes 
      WHERE id = quiz_attempts.quiz_id 
      AND user_has_subject_access(auth.uid(), subject)
    )
  );

CREATE POLICY "Users can create attempts with subject isolation" ON quiz_attempts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM quizzes 
      WHERE id = quiz_attempts.quiz_id 
      AND user_has_subject_access(auth.uid(), subject)
    )
  );

-- ============================================================================
-- AI Chats policies with subject isolation
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own chats" ON ai_chats;
DROP POLICY IF EXISTS "Users can manage own chats" ON ai_chats;

CREATE POLICY "Users can view own chats with subject isolation" ON ai_chats
  FOR SELECT USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can create chats with subject isolation" ON ai_chats
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can update chats with subject isolation" ON ai_chats
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

CREATE POLICY "Users can delete chats with subject isolation" ON ai_chats
  FOR DELETE USING (
    auth.uid() = user_id 
    AND user_has_subject_access(auth.uid(), subject)
  );

-- ============================================================================
-- Examiner scores policies (inherit subject from essay)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own examiner scores" ON examiner_scores;
DROP POLICY IF EXISTS "Users can create examiner scores" ON examiner_scores;

CREATE POLICY "Users can view own examiner scores with subject isolation" ON examiner_scores
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM essays 
      WHERE id = examiner_scores.essay_id 
      AND user_has_subject_access(auth.uid(), subject)
    )
  );

CREATE POLICY "Users can create examiner scores with subject isolation" ON examiner_scores
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM essays 
      WHERE id = examiner_scores.essay_id 
      AND user_has_subject_access(auth.uid(), subject)
    )
  );

-- ============================================================================
-- 5. CROSS-TENANT QUERY PREVENTION
-- ============================================================================

-- Create function to validate queries don't cross subject boundaries
CREATE OR REPLACE FUNCTION validate_cross_subject_query(
  p_user_id UUID,
  p_table_name TEXT,
  p_subject_filter TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_subjects TEXT[];
BEGIN
  -- Get user's accessible subjects
  user_subjects := get_user_subjects(p_user_id);
  
  -- If no subject filter provided, user can only access their subjects
  IF p_subject_filter IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Validate the requested subject is in user's accessible subjects
  RETURN p_subject_filter = ANY(user_subjects);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for secure cross-subject analytics (admin only)
CREATE OR REPLACE VIEW cross_subject_analytics AS
SELECT 
  subject,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM essays
GROUP BY subject
UNION ALL
SELECT 
  subject,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM flashcard_decks
GROUP BY subject
UNION ALL
SELECT 
  subject,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM documents
GROUP BY subject
UNION ALL
SELECT 
  subject,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM quizzes
GROUP BY subject;

-- Restrict cross-subject analytics to admins only
CREATE POLICY "Only admins can view cross-subject analytics" ON cross_subject_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 6. TRIGGERS FOR AUTOMATIC SUBJECT VALIDATION
-- ============================================================================

-- Trigger to validate subject on essay operations
CREATE OR REPLACE FUNCTION trigger_validate_essay_subject()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.subject IS NOT NULL AND NOT user_has_subject_access(auth.uid(), NEW.subject) THEN
      RAISE EXCEPTION 'Subject access denied: %', NEW.subject;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_essay_subject ON essays;
CREATE TRIGGER validate_essay_subject
  BEFORE INSERT OR UPDATE ON essays
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_essay_subject();

-- Trigger to validate subject on flashcard_deck operations
CREATE OR REPLACE FUNCTION trigger_validate_deck_subject()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.subject IS NOT NULL AND NOT user_has_subject_access(auth.uid(), NEW.subject) THEN
      RAISE EXCEPTION 'Subject access denied: %', NEW.subject;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_deck_subject ON flashcard_decks;
CREATE TRIGGER validate_deck_subject
  BEFORE INSERT OR UPDATE ON flashcard_decks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_deck_subject();

-- Trigger to validate subject on document operations
CREATE OR REPLACE FUNCTION trigger_validate_document_subject()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.subject IS NOT NULL AND NOT user_has_subject_access(auth.uid(), NEW.subject) THEN
      RAISE EXCEPTION 'Subject access denied: %', NEW.subject;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_document_subject ON documents;
CREATE TRIGGER validate_document_subject
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_document_subject();

-- ============================================================================
-- 7. AUDIT LOGGING FOR TENANT ACCESS
-- ============================================================================

-- Create audit log table for cross-tenant access attempts
CREATE TABLE IF NOT EXISTS tenant_access_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  subject_attempted TEXT,
  subject_allowed TEXT[],
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE tenant_access_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON tenant_access_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_tenant_access_audit_user_id ON tenant_access_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_access_audit_created_at ON tenant_access_audit(created_at DESC);

-- Function to log tenant access attempts
CREATE OR REPLACE FUNCTION log_tenant_access(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_subject_attempted TEXT,
  p_success BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO tenant_access_audit (
    user_id, action, table_name, subject_attempted, subject_allowed, success
  ) VALUES (
    p_user_id, p_action, p_table_name, p_subject_attempted, 
    get_user_subjects(p_user_id), p_success
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. SECURE VIEWS FOR APPLICATION QUERIES
-- ============================================================================

-- Create secure view for essays that enforces subject isolation
CREATE OR REPLACE VIEW user_essays_secure AS
SELECT e.*
FROM essays e
WHERE e.user_id = auth.uid()
  AND user_has_subject_access(auth.uid(), e.subject);

-- Create secure view for flashcard decks
CREATE OR REPLACE VIEW user_flashcard_decks_secure AS
SELECT f.*
FROM flashcard_decks f
WHERE f.user_id = auth.uid()
  AND user_has_subject_access(auth.uid(), f.subject);

-- Create secure view for documents
CREATE OR REPLACE VIEW user_documents_secure AS
SELECT d.*
FROM documents d
WHERE d.user_id = auth.uid()
  AND user_has_subject_access(auth.uid(), d.subject);

-- Create secure view for quizzes
CREATE OR REPLACE VIEW user_quizzes_secure AS
SELECT q.*
FROM quizzes q
WHERE q.user_id = auth.uid()
  AND user_has_subject_access(auth.uid(), q.subject);

-- Create secure view for AI chats
CREATE OR REPLACE VIEW user_ai_chats_secure AS
SELECT a.*
FROM ai_chats a
WHERE a.user_id = auth.uid()
  AND user_has_subject_access(auth.uid(), a.subject);

-- ============================================================================
-- 9. DEFAULT SUBJECT ACCESS SETUP
-- ============================================================================

-- Function to grant default subject access to new users
CREATE OR REPLACE FUNCTION grant_default_subject_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant access to economics by default
  INSERT INTO user_subject_access (user_id, subject_id, is_active)
  VALUES (NEW.id, 'economics', TRUE)
  ON CONFLICT (user_id, subject_id) DO NOTHING;
  
  -- Grant access to geography by default
  INSERT INTO user_subject_access (user_id, subject_id, is_active)
  VALUES (NEW.id, 'geography', TRUE)
  ON CONFLICT (user_id, subject_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply default subject access to existing users
INSERT INTO user_subject_access (user_id, subject_id, is_active)
SELECT id, 'economics', TRUE FROM auth.users
ON CONFLICT (user_id, subject_id) DO NOTHING;

INSERT INTO user_subject_access (user_id, subject_id, is_active)
SELECT id, 'geography', TRUE FROM auth.users
ON CONFLICT (user_id, subject_id) DO NOTHING;

-- ============================================================================
-- 10. PERFORMANCE INDEXES
-- ============================================================================

-- Indexes for subject-based queries
CREATE INDEX IF NOT EXISTS idx_essays_subject_user ON essays(subject, user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_subject_user ON flashcard_decks(subject, user_id);
CREATE INDEX IF NOT EXISTS idx_documents_subject_user ON documents(subject, user_id);
CREATE INDEX IF NOT EXISTS idx_folders_subject_user ON folders(subject, user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_subject_user ON quizzes(subject, user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_subject_user ON ai_chats(subject, user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_essays_user_created ON essays(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_created ON flashcard_decks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents(user_id, created_at DESC);

-- ============================================================================
-- 11. VERIFICATION QUERIES (Run these to verify setup)
-- ============================================================================

/*
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('essays', 'flashcard_decks', 'flashcards', 'documents', 
                  'folders', 'quizzes', 'quiz_attempts', 'ai_chats', 
                  'examiner_scores', 'user_subject_access');

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('essays', 'flashcard_decks', 'documents', 'quizzes', 'ai_chats');

-- Test subject access function
SELECT user_has_subject_access('USER_UUID_HERE', 'economics');
SELECT get_user_subjects('USER_UUID_HERE');

-- Verify user subject access
SELECT * FROM user_subject_access WHERE user_id = 'USER_UUID_HERE';

-- Test cross-tenant query prevention
-- This should fail if user doesn't have geography access:
-- INSERT INTO essays (user_id, subject, question, content) 
-- VALUES ('USER_UUID', 'geography', 'Test?', 'Test content');
*/

-- ============================================================================
-- END OF MULTI-TENANT SECURITY IMPLEMENTATION
-- ============================================================================
