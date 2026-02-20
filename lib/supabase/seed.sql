-- Seed file for Sandstone application
-- Creates admin and test accounts

-- Note: This should be run AFTER the main schema is set up
-- These are SQL templates - actual user creation should be done through Supabase Auth API

-- ============================================
-- USER ROLES AND PERMISSIONS
-- ============================================

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'test')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================
-- USER PREFERENCES
-- ============================================

-- Create user_preferences table for extended settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  default_subject TEXT DEFAULT 'economics',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  study_reminders BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Policies for user_activity
CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own activity" ON user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR USER MANAGEMENT
-- ============================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM user_roles WHERE user_id = user_uuid;
  RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_essays', (SELECT COUNT(*) FROM essays WHERE user_id = user_uuid),
    'avg_score', (SELECT AVG(overall_score) FROM essays WHERE user_id = user_uuid),
    'total_flashcards', (SELECT COUNT(*) FROM flashcards WHERE deck_id IN (
      SELECT id FROM flashcard_decks WHERE user_id = user_uuid
    )),
    'total_documents', (SELECT COUNT(*) FROM documents WHERE user_id = user_uuid),
    'total_quizzes', (SELECT COUNT(*) FROM quizzes WHERE user_id = user_uuid)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);

-- ============================================
-- DEMO DATA SETUP (Optional)
-- ============================================

-- Note: The actual user accounts need to be created through Supabase Auth
-- These are just placeholder records that would be linked after auth creation

-- Example of how to create a test user profile after auth signup:
/*
-- After creating user through Supabase Auth, run:
INSERT INTO profiles (id, email, full_name, avatar_url)
VALUES (
  'USER_UUID_FROM_AUTH',
  'test@example.com',
  'Test User',
  NULL
);

INSERT INTO user_roles (user_id, role)
VALUES ('USER_UUID_FROM_AUTH', 'test');

INSERT INTO user_preferences (user_id, theme, default_subject)
VALUES ('USER_UUID_FROM_AUTH', 'light', 'economics');
*/

-- ============================================
-- VIEWS FOR ADMIN DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW user_stats_summary AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  COALESCE(ur.role, 'student') as role,
  (SELECT COUNT(*) FROM essays WHERE user_id = p.id) as essay_count,
  (SELECT COUNT(*) FROM flashcard_decks WHERE user_id = p.id) as deck_count,
  (SELECT COUNT(*) FROM documents WHERE user_id = p.id) as document_count,
  p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;

-- Grant access to the view
GRANT SELECT ON user_stats_summary TO authenticated;
