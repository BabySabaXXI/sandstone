-- Enhanced Chat Schema Migration for Sandstone
-- This migration adds support for context-aware chat, folders, and improved metadata

-- Drop existing table if exists (for clean migration)
-- DROP TABLE IF EXISTS ai_chats;

-- Create enhanced ai_chats table
CREATE TABLE IF NOT EXISTS ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    subject TEXT NOT NULL CHECK (subject IN ('economics', 'geography', 'general')),
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    folder TEXT,
    context JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chats_subject ON ai_chats(subject);
CREATE INDEX IF NOT EXISTS idx_ai_chats_is_pinned ON ai_chats(is_pinned);
CREATE INDEX IF NOT EXISTS idx_ai_chats_folder ON ai_chats(folder);
CREATE INDEX IF NOT EXISTS idx_ai_chats_updated_at ON ai_chats(updated_at DESC);

-- Create GIN index for JSONB search on messages
CREATE INDEX IF NOT EXISTS idx_ai_chats_messages ON ai_chats USING GIN(messages jsonb_path_ops);

-- Create chat_folders table for user-defined folders
CREATE TABLE IF NOT EXISTS chat_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_chat_folders_user_id ON chat_folders(user_id);

-- Create chat_usage table for tracking API usage
CREATE TABLE IF NOT EXISTS chat_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chat_id UUID REFERENCES ai_chats(id) ON DELETE SET NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id ON chat_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_usage_chat_id ON chat_usage(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_usage_created_at ON chat_usage(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_chats
CREATE POLICY "Users can view own chats"
    ON ai_chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chats"
    ON ai_chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats"
    ON ai_chats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats"
    ON ai_chats FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for chat_folders
CREATE POLICY "Users can view own folders"
    ON chat_folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
    ON chat_folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
    ON chat_folders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
    ON chat_folders FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for chat_usage
CREATE POLICY "Users can view own usage"
    ON chat_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage"
    ON chat_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ai_chats_updated_at
    BEFORE UPDATE ON ai_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_folders_updated_at
    BEFORE UPDATE ON chat_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate total tokens
CREATE OR REPLACE FUNCTION calculate_total_tokens()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_tokens = NEW.prompt_tokens + NEW.completion_tokens;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_chat_usage_tokens
    BEFORE INSERT OR UPDATE ON chat_usage
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_tokens();

-- Create view for chat statistics
CREATE OR REPLACE VIEW chat_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_chats,
    COUNT(*) FILTER (WHERE is_pinned) as pinned_chats,
    COUNT(*) FILTER (WHERE subject = 'economics') as economics_chats,
    COUNT(*) FILTER (WHERE subject = 'geography') as geography_chats,
    COUNT(*) FILTER (WHERE subject = 'general') as general_chats,
    MAX(updated_at) as last_activity
FROM ai_chats
GROUP BY user_id;

-- Create view for usage statistics
CREATE OR REPLACE VIEW usage_statistics AS
SELECT 
    user_id,
    DATE_TRUNC('day', created_at) as date,
    SUM(prompt_tokens) as total_prompt_tokens,
    SUM(completion_tokens) as total_completion_tokens,
    SUM(total_tokens) as total_tokens,
    COUNT(*) as total_requests
FROM chat_usage
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- Insert default folders for existing users (optional)
-- This can be run after migration to set up default folders
/*
INSERT INTO chat_folders (user_id, name, color)
SELECT 
    DISTINCT user_id,
    unnest(ARRAY['Essay Help', 'Concept Review', 'Practice Questions']) as name,
    unnest(ARRAY['#E8D5C4', '#A8C5A8', '#A8C5D4']) as color
FROM ai_chats
ON CONFLICT (user_id, name) DO NOTHING;
*/

-- Add comments for documentation
COMMENT ON TABLE ai_chats IS 'Stores AI chat conversations with context awareness';
COMMENT ON TABLE chat_folders IS 'User-defined folders for organizing chats';
COMMENT ON TABLE chat_usage IS 'Tracks API token usage per chat';
COMMENT ON COLUMN ai_chats.context IS 'JSON object containing chat context (essay text, document content, etc.)';
COMMENT ON COLUMN ai_chats.metadata IS 'JSON object containing chat metadata (total messages, etc.)';
