-- ============================================
-- NOTIFICATION SYSTEM DATABASE SCHEMA
-- ============================================
-- This schema adds notification tables to the Sandstone database

-- ============================================
-- ENUM TYPES
-- ============================================

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'info', 'success', 'warning', 'error', 'system',
    'essay_graded', 'flashcard_due', 'study_reminder',
    'collaboration', 'achievement', 'message'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('in_app', 'push', 'email', 'sms');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'info',
  priority notification_priority NOT NULL DEFAULT 'normal',
  status notification_status NOT NULL DEFAULT 'unread',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  icon TEXT,
  image_url TEXT,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  delivered_via notification_channel[] DEFAULT '{}',
  group_id TEXT,
  group_count INTEGER DEFAULT 1,
  
  -- Indexes
  CONSTRAINT valid_expires CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Global settings
  global_enabled BOOLEAN NOT NULL DEFAULT true,
  do_not_disturb BOOLEAN NOT NULL DEFAULT false,
  do_not_disturb_start TIME,
  do_not_disturb_end TIME,
  
  -- Channel preferences (stored as JSONB for flexibility)
  channels JSONB NOT NULL DEFAULT '{
    "in_app": true,
    "push": true,
    "email": true,
    "sms": false
  }',
  
  -- Type-specific preferences
  type_preferences JSONB NOT NULL DEFAULT '{
    "essay_graded": { "enabled": true, "channels": ["in_app", "push"], "priority_threshold": "normal" },
    "flashcard_due": { "enabled": true, "channels": ["in_app"], "priority_threshold": "normal" },
    "study_reminder": { "enabled": true, "channels": ["push", "email"], "priority_threshold": "normal" },
    "collaboration": { "enabled": true, "channels": ["in_app", "push"], "priority_threshold": "normal" },
    "achievement": { "enabled": true, "channels": ["in_app", "push"], "priority_threshold": "low" },
    "message": { "enabled": true, "channels": ["in_app", "push"], "priority_threshold": "normal" },
    "system": { "enabled": true, "channels": ["in_app"], "priority_threshold": "high" }
  }',
  
  -- Category preferences
  category_preferences JSONB NOT NULL DEFAULT '{
    "study": true,
    "social": true,
    "system": true,
    "marketing": false
  }',
  
  -- Quiet hours configuration
  quiet_hours JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "start_time": "22:00",
    "end_time": "08:00",
    "timezone": "UTC",
    "allow_urgent": true
  }',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================
-- NOTIFICATION HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'read', 'dismissed', 'clicked', 'deleted', 'action_taken')),
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_notification_id ON notification_history(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_created_at ON notification_history(created_at DESC);

-- ============================================
-- PUSH NOTIFICATION SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;

-- ============================================
-- NOTIFICATION TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type notification_type NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  default_priority notification_priority NOT NULL DEFAULT 'normal',
  default_channels notification_channel[] DEFAULT '{"in_app"}',
  default_actions JSONB DEFAULT '[]',
  default_icon TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active) WHERE is_active = true;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND status = 'unread'
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET 
    status = 'read',
    read_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'unread'
    AND (p_notification_ids IS NULL OR id = ANY(p_notification_ids))
    AND (expires_at IS NULL OR expires_at > NOW());
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Log to history
  INSERT INTO notification_history (user_id, notification_id, action, action_data)
  SELECT 
    p_user_id,
    id,
    'read',
    jsonb_build_object('batch', p_notification_ids IS NOT NULL AND array_length(p_notification_ids, 1) > 1)
  FROM notifications
  WHERE user_id = p_user_id
    AND read_at = NOW();
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification with history
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_priority notification_priority DEFAULT 'normal',
  p_data JSONB DEFAULT '{}',
  p_actions JSONB DEFAULT '[]',
  p_icon TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_delivered_via notification_channel[] DEFAULT '{"in_app"}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    priority,
    title,
    message,
    data,
    actions,
    icon,
    image_url,
    link,
    expires_at,
    delivered_via
  ) VALUES (
    p_user_id,
    p_type,
    p_priority,
    p_title,
    p_message,
    p_data,
    p_actions,
    p_icon,
    p_image_url,
    p_link,
    p_expires_at,
    p_delivered_via
  )
  RETURNING id INTO v_notification_id;
  
  -- Log to history
  INSERT INTO notification_history (user_id, notification_id, action, action_data)
  VALUES (
    p_user_id,
    v_notification_id,
    'created',
    jsonb_build_object('type', p_type, 'priority', p_priority)
  );
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET status = 'deleted'
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND status != 'deleted';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_preferences JSONB;
BEGIN
  SELECT to_jsonb(p) INTO v_preferences
  FROM notification_preferences p
  WHERE p.user_id = p_user_id;
  
  -- Return defaults if not found
  IF v_preferences IS NULL THEN
    v_preferences := '{
      "global_enabled": true,
      "do_not_disturb": false,
      "channels": { "in_app": true, "push": true, "email": true, "sms": false },
      "type_preferences": {},
      "category_preferences": { "study": true, "social": true, "system": true, "marketing": false },
      "quiet_hours": { "enabled": false, "start_time": "22:00", "end_time": "08:00", "timezone": "UTC", "allow_urgent": true }
    }'::JSONB;
  END IF;
  
  RETURN v_preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive notification
CREATE OR REPLACE FUNCTION should_send_notification(
  p_user_id UUID,
  p_type notification_type,
  p_priority notification_priority,
  p_channel notification_channel
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prefs JSONB;
  v_type_config JSONB;
  v_channels JSONB;
  v_quiet_hours JSONB;
  v_current_time TIME;
  v_quiet_start TIME;
  v_quiet_end TIME;
  v_in_quiet_hours BOOLEAN;
BEGIN
  -- Get user preferences
  SELECT get_user_notification_preferences(p_user_id) INTO v_prefs;
  
  -- Check global enabled
  IF NOT (v_prefs->>'global_enabled')::BOOLEAN THEN
    RETURN false;
  END IF;
  
  -- Check do not disturb
  IF (v_prefs->>'do_not_disturb')::BOOLEAN THEN
    v_current_time := CURRENT_TIME;
    v_quiet_start := (v_prefs->>'do_not_disturb_start')::TIME;
    v_quiet_end := (v_prefs->>'do_not_disturb_end')::TIME;
    
    IF v_quiet_start IS NOT NULL AND v_quiet_end IS NOT NULL THEN
      IF v_quiet_start < v_quiet_end THEN
        v_in_quiet_hours := v_current_time >= v_quiet_start AND v_current_time <= v_quiet_end;
      ELSE
        v_in_quiet_hours := v_current_time >= v_quiet_start OR v_current_time <= v_quiet_end;
      END IF;
      
      IF v_in_quiet_hours AND p_priority != 'urgent' THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  -- Check quiet hours
  v_quiet_hours := v_prefs->'quiet_hours';
  IF (v_quiet_hours->>'enabled')::BOOLEAN THEN
    v_current_time := CURRENT_TIME;
    v_quiet_start := (v_quiet_hours->>'start_time')::TIME;
    v_quiet_end := (v_quiet_hours->>'end_time')::TIME;
    
    IF v_quiet_start < v_quiet_end THEN
      v_in_quiet_hours := v_current_time >= v_quiet_start AND v_current_time <= v_quiet_end;
    ELSE
      v_in_quiet_hours := v_current_time >= v_quiet_start OR v_current_time <= v_quiet_end;
    END IF;
    
    IF v_in_quiet_hours AND p_priority != 'urgent' AND NOT (v_quiet_hours->>'allow_urgent')::BOOLEAN THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check channel preference
  v_channels := v_prefs->'channels';
  IF NOT (v_channels->>p_channel::TEXT)::BOOLEAN THEN
    RETURN false;
  END IF;
  
  -- Check type-specific preference
  v_type_config := v_prefs->'type_preferences'->p_type::TEXT;
  IF v_type_config IS NOT NULL THEN
    IF NOT (v_type_config->>'enabled')::BOOLEAN THEN
      RETURN false;
    END IF;
    
    -- Check priority threshold
    IF p_priority < (v_type_config->>'priority_threshold')::notification_priority THEN
      RETURN false;
    END IF;
    
    -- Check if channel is allowed for this type
    IF NOT (v_type_config->'channels')::jsonb ? p_channel::TEXT THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on notification tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can create notifications" ON notifications;
CREATE POLICY "Service can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Notification preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON notification_preferences;
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON notification_preferences;
CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON notification_preferences;
CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notification history policies
DROP POLICY IF EXISTS "Users can view own history" ON notification_history;
CREATE POLICY "Users can view own history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);

-- Push subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- DEFAULT TEMPLATES
-- ============================================

INSERT INTO notification_templates (name, type, title_template, message_template, default_priority, default_channels, default_icon)
VALUES
  ('essay_graded', 'essay_graded', 'Essay Graded: {essay_title}', 'Your essay has been graded with a score of {score}/100 ({grade}).', 'normal', ARRAY['in_app', 'push']::notification_channel[], 'CheckCircle'),
  ('flashcards_due', 'flashcard_due', '{cards_due_count} Flashcards Due', 'You have {cards_due_count} flashcards ready for review in {deck_name}.', 'normal', ARRAY['in_app']::notification_channel[], 'Layers'),
  ('study_reminder', 'study_reminder', 'Time to Study!', 'Don''t forget your scheduled study session for {subject}.', 'normal', ARRAY['push', 'email']::notification_channel[], 'Clock'),
  ('collaboration_invite', 'collaboration', 'Collaboration Invite', '{collaborator_name} invited you to collaborate on {document_title}.', 'normal', ARRAY['in_app', 'push']::notification_channel[], 'Users'),
  ('achievement_unlocked', 'achievement', 'Achievement Unlocked!', 'Congratulations! You''ve earned the {achievement_name} badge.', 'low', ARRAY['in_app', 'push']::notification_channel[], 'Award'),
  ('new_message', 'message', 'New Message from {sender_name}', 'You have a new message in {chat_title}.', 'normal', ARRAY['in_app', 'push']::notification_channel[], 'MessageSquare'),
  ('system_maintenance', 'system', 'Scheduled Maintenance', 'We''ll be performing system maintenance on {maintenance_date}.', 'high', ARRAY['in_app', 'email']::notification_channel[], 'AlertTriangle'),
  ('quiz_completed', 'success', 'Quiz Completed!', 'You scored {score}% on {quiz_title}.', 'normal', ARRAY['in_app']::notification_channel[], 'CheckCircle')
ON CONFLICT (name) DO UPDATE SET
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  updated_at = NOW();

-- ============================================
-- REALTIME SUBSCRIPTION SETUP
-- ============================================

-- Add notifications table to realtime publication
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- ============================================
-- SCHEDULED CLEANUP JOB (requires pg_cron)
-- ============================================

-- Uncomment if pg_cron is available
-- SELECT cron.schedule('cleanup-expired-notifications', '0 0 * * *', 'SELECT cleanup_expired_notifications()');
