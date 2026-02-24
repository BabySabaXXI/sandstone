-- =============================================================================
-- Sandstone Collaboration Schema
-- =============================================================================
-- This migration adds collaboration features to Sandstone:
-- - Sharing system
-- - Comments system
-- - Study groups
-- - Collaborative editing
-- - Notifications
-- =============================================================================

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE share_permission AS ENUM ('view', 'comment', 'edit', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE share_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE comment_status AS ENUM ('active', 'resolved', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE group_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE group_status AS ENUM ('active', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'share_invite', 'share_accepted', 'comment_added', 'comment_reply',
    'group_invite', 'group_joined', 'document_edited', 'mention',
    'study_session_started', 'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('essay', 'document', 'flashcard_deck', 'quiz', 'folder');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- SHARES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_with_email TEXT,
  permission share_permission NOT NULL DEFAULT 'view',
  status share_status NOT NULL DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_share_recipient CHECK (
    (shared_with_id IS NOT NULL) OR (shared_with_email IS NOT NULL)
  )
);

-- Indexes for shares
CREATE INDEX IF NOT EXISTS idx_shares_owner ON shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_shares_recipient ON shares(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_shares_email ON shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_shares_content ON shares(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_shares_status ON shares(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_shares_updated_at ON shares;
CREATE TRIGGER trigger_shares_updated_at
  BEFORE UPDATE ON shares
  FOR EACH ROW
  EXECUTE FUNCTION update_shares_updated_at();

-- =============================================================================
-- COMMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  html_content TEXT,
  status comment_status NOT NULL DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  selection_start INTEGER,
  selection_end INTEGER,
  selection_text TEXT,
  reactions JSONB NOT NULL DEFAULT '[]',
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Trigger to update reply count on parent comments
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_reply_count ON comments;
CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reply_count();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comments_updated_at ON comments;
CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- =============================================================================
-- STUDY GROUPS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  icon TEXT,
  color TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 50,
  is_public BOOLEAN NOT NULL DEFAULT false,
  join_code TEXT UNIQUE,
  status group_status NOT NULL DEFAULT 'active',
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for study groups
CREATE INDEX IF NOT EXISTS idx_study_groups_owner ON study_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_status ON study_groups(status);
CREATE INDEX IF NOT EXISTS idx_study_groups_public ON study_groups(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_study_groups_join_code ON study_groups(join_code);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS trigger_study_groups_updated_at ON study_groups;
CREATE TRIGGER trigger_study_groups_updated_at
  BEFORE UPDATE ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_shares_updated_at();

-- =============================================================================
-- STUDY GROUP MEMBERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  
  UNIQUE(group_id, user_id)
);

-- Indexes for study group members
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_role ON study_group_members(role);

-- Trigger to update member count
CREATE OR REPLACE FUNCTION update_study_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE study_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE study_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_count ON study_group_members;
CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON study_group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_study_group_member_count();

-- =============================================================================
-- GROUP SHARED CONTENT TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS group_shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for group shared content
CREATE INDEX IF NOT EXISTS idx_group_shared_content_group ON group_shared_content(group_id);
CREATE INDEX IF NOT EXISTS idx_group_shared_content_created ON group_shared_content(created_at DESC);

-- =============================================================================
-- DOCUMENT COLLABORATORS TABLE (for real-time collaboration)
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  avatar_url TEXT,
  cursor_position JSONB,
  selection JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(document_id, user_id)
);

-- Indexes for document collaborators
CREATE INDEX IF NOT EXISTS idx_document_collaborators_document ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_document_collaborators_active ON document_collaborators(document_id, is_active) WHERE is_active = true;

-- =============================================================================
-- DOCUMENT VERSIONS TABLE (for version history)
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(document_id, version_number)
);

-- Indexes for document versions
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_number ON document_versions(document_id, version_number DESC);

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',
  status notification_status NOT NULL DEFAULT 'unread',
  data JSONB NOT NULL DEFAULT '{}',
  action_url TEXT,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, status) WHERE status = 'unread';
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(user_id, type);

-- =============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, type)
);

-- Indexes for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- =============================================================================
-- ACTIVITY LOG TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  content_type content_type,
  content_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_content ON activity_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- Partition activity logs by month for better performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_month ON activity_logs(DATE_TRUNC('month', created_at));

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Shares policies
CREATE POLICY "Users can view shares they own or are recipients of"
  ON shares FOR SELECT
  USING (owner_id = auth.uid() OR shared_with_id = auth.uid() OR shared_with_email = auth.jwt()->>'email');

CREATE POLICY "Users can create shares for their own content"
  ON shares FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update shares they own"
  ON shares FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete shares they own"
  ON shares FOR DELETE
  USING (owner_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can view comments on content they have access to"
  ON comments FOR SELECT
  USING (status != 'deleted');

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

-- Study groups policies
CREATE POLICY "Users can view public groups or groups they are members of"
  ON study_groups FOR SELECT
  USING (
    is_public = true 
    OR owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM study_group_members 
      WHERE group_id = study_groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create study groups"
  ON study_groups FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and admins can update study groups"
  ON study_groups FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM study_group_members 
      WHERE group_id = study_groups.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners can delete study groups"
  ON study_groups FOR DELETE
  USING (owner_id = auth.uid());

-- Study group members policies
CREATE POLICY "Users can view members of groups they belong to"
  ON study_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members AS sgm
      WHERE sgm.group_id = study_group_members.group_id AND sgm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM study_groups
      WHERE id = study_group_members.group_id AND (owner_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can join public groups or with invite"
  ON study_group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM study_groups
      WHERE id = group_id AND (is_public = true OR owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Owners and admins can manage members"
  ON study_group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members AS sgm
      WHERE sgm.group_id = study_group_members.group_id 
      AND sgm.user_id = auth.uid() 
      AND sgm.role IN ('owner', 'admin')
    )
  );

-- Group shared content policies
CREATE POLICY "Members can view shared content"
  ON group_shared_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = group_shared_content.group_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can share content"
  ON group_shared_content FOR INSERT
  WITH CHECK (
    shared_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = group_shared_content.group_id AND user_id = auth.uid()
    )
  );

-- Document collaborators policies
CREATE POLICY "Collaborators can view other collaborators"
  ON document_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shares
      WHERE content_type = 'document' 
      AND content_id = document_collaborators.document_id
      AND (shared_with_id = auth.uid() OR owner_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_collaborators.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves as collaborators"
  ON document_collaborators FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collaborator status"
  ON document_collaborators FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can remove themselves as collaborators"
  ON document_collaborators FOR DELETE
  USING (user_id = auth.uid());

-- Document versions policies
CREATE POLICY "Users with access can view document versions"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shares
      WHERE content_type = 'document' 
      AND content_id = document_versions.document_id
      AND (shared_with_id = auth.uid() OR owner_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_versions.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can create versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shares
      WHERE content_type = 'document' 
      AND content_id = document_versions.document_id
      AND shared_with_id = auth.uid()
      AND permission IN ('edit', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_versions.document_id AND user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to generate join code
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate join code for study groups
CREATE OR REPLACE FUNCTION auto_generate_join_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.join_code IS NULL THEN
    NEW.join_code = generate_join_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_join_code ON study_groups;
CREATE TRIGGER trigger_auto_join_code
  BEFORE INSERT ON study_groups
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_join_code();

-- Function to create notification on share
CREATE OR REPLACE FUNCTION notify_share_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shared_with_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.shared_with_id,
      'share_invite',
      'New Share Invitation',
      'Someone has shared content with you',
      jsonb_build_object(
        'share_id', NEW.id,
        'content_type', NEW.content_type,
        'content_id', NEW.content_id,
        'owner_id', NEW.owner_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_share ON shares;
CREATE TRIGGER trigger_notify_share
  AFTER INSERT ON shares
  FOR EACH ROW
  EXECUTE FUNCTION notify_share_created();

-- Function to create notification on comment
CREATE OR REPLACE FUNCTION notify_comment_created()
RETURNS TRIGGER AS $$
DECLARE
  content_owner_id UUID;
  parent_user_id UUID;
BEGIN
  -- Get content owner (simplified - would need to query actual content tables)
  -- For now, just notify parent comment author if replying
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_user_id
    FROM comments
    WHERE id = NEW.parent_id;
    
    IF parent_user_id IS NOT NULL AND parent_user_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        parent_user_id,
        'comment_reply',
        'New Reply to Your Comment',
        'Someone replied to your comment',
        jsonb_build_object(
          'comment_id', NEW.id,
          'content_type', NEW.content_type,
          'content_id', NEW.content_id,
          'user_id', NEW.user_id
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_comment ON comments;
CREATE TRIGGER trigger_notify_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_created();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count
  FROM notifications
  WHERE user_id = user_uuid AND status = 'unread';
  RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET status = 'read', read_at = NOW()
  WHERE user_id = user_uuid AND status = 'unread';
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_content_type content_type DEFAULT NULL,
  p_content_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, action, content_type, content_id, metadata)
  VALUES (p_user_id, p_action, p_content_type, p_content_id, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for shares with user details
CREATE OR REPLACE VIEW shares_with_details AS
SELECT 
  s.*,
  jsonb_build_object(
    'id', owner.id,
    'full_name', owner.raw_user_meta_data->>'full_name',
    'email', owner.email,
    'avatar_url', owner.raw_user_meta_data->>'avatar_url'
  ) as owner,
  jsonb_build_object(
    'id', recipient.id,
    'full_name', recipient.raw_user_meta_data->>'full_name',
    'email', recipient.email,
    'avatar_url', recipient.raw_user_meta_data->>'avatar_url'
  ) as shared_with
FROM shares s
LEFT JOIN auth.users owner ON s.owner_id = owner.id
LEFT JOIN auth.users recipient ON s.shared_with_id = recipient.id;

-- View for comments with user details
CREATE OR REPLACE VIEW comments_with_users AS
SELECT 
  c.*,
  jsonb_build_object(
    'id', u.id,
    'full_name', u.raw_user_meta_data->>'full_name',
    'email', u.email,
    'avatar_url', u.raw_user_meta_data->>'avatar_url'
  ) as user
FROM comments c
JOIN auth.users u ON c.user_id = u.id
WHERE c.status != 'deleted';

-- View for study groups with member count
CREATE OR REPLACE VIEW study_groups_with_stats AS
SELECT 
  sg.*,
  jsonb_build_object(
    'id', owner.id,
    'full_name', owner.raw_user_meta_data->>'full_name',
    'email', owner.email,
    'avatar_url', owner.raw_user_meta_data->>'avatar_url'
  ) as owner,
  (
    SELECT jsonb_agg(jsonb_build_object(
      'id', sgm.id,
      'user_id', sgm.user_id,
      'role', sgm.role,
      'joined_at', sgm.joined_at,
      'user', jsonb_build_object(
        'id', u.id,
        'full_name', u.raw_user_meta_data->>'full_name',
        'email', u.email,
        'avatar_url', u.raw_user_meta_data->>'avatar_url'
      )
    ))
    FROM study_group_members sgm
    JOIN auth.users u ON sgm.user_id = u.id
    WHERE sgm.group_id = sg.id
  ) as members
FROM study_groups sg
JOIN auth.users owner ON sg.owner_id = owner.id
WHERE sg.status = 'active';

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================

-- Enable realtime for collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE shares;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE study_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_shared_content;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================================================
-- SEED DATA (Optional)
-- =============================================================================

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, type)
SELECT 
  id as user_id,
  unnest(enum_range(NULL::notification_type)) as type
FROM auth.users
ON CONFLICT (user_id, type) DO NOTHING;
