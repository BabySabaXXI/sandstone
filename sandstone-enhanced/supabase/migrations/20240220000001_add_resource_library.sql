-- Resource Library Schema
-- Add support for resource management, folders, and collections

-- Create resource_type enum
CREATE TYPE resource_type AS ENUM (
  'article',
  'video',
  'audio',
  'pdf',
  'document',
  'link',
  'image',
  'interactive',
  'quiz',
  'flashcard'
);

-- Create resource_category enum
CREATE TYPE resource_category AS ENUM (
  'writing_tips',
  'vocabulary',
  'practice',
  'grammar',
  'reading',
  'listening',
  'speaking',
  'exam_prep',
  'study_guides',
  'past_papers',
  'mark_schemes',
  'theory',
  'case_studies',
  'diagrams',
  'formulas',
  'custom'
);

-- Create resource_difficulty enum
CREATE TYPE resource_difficulty AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'all_levels'
);

-- Create resource_status enum
CREATE TYPE resource_status AS ENUM (
  'active',
  'archived',
  'draft'
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type resource_type NOT NULL DEFAULT 'article',
  category resource_category NOT NULL DEFAULT 'custom',
  subject TEXT NOT NULL DEFAULT 'economics',
  url TEXT,
  content TEXT,
  difficulty resource_difficulty NOT NULL DEFAULT 'all_levels',
  status resource_status NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  author TEXT,
  source TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  duration INTEGER, -- in seconds
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  folder_id UUID REFERENCES resource_folders(id) ON DELETE SET NULL,
  parent_resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

-- Create resource_folders table
CREATE TABLE IF NOT EXISTS resource_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT 'economics',
  parent_id UUID REFERENCES resource_folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#E8D5C4',
  icon TEXT DEFAULT 'folder',
  resource_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create resource_collections table
CREATE TABLE IF NOT EXISTS resource_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT 'economics',
  resource_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_folder_id ON resources(folder_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_is_favorite ON resources(is_favorite);
CREATE INDEX IF NOT EXISTS idx_resources_is_pinned ON resources(is_pinned);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON resources(updated_at);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_resources_search ON resources USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);

-- Tags index
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING gin(tags);

-- Folder indexes
CREATE INDEX IF NOT EXISTS idx_resource_folders_user_id ON resource_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_folders_parent_id ON resource_folders(parent_id);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_resource_collections_user_id ON resource_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_collections_resource_ids ON resource_collections USING gin(resource_ids);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_folders_updated_at
  BEFORE UPDATE ON resource_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_collections_updated_at
  BEFORE UPDATE ON resource_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment folder resource count
CREATE OR REPLACE FUNCTION increment_folder_resource_count(folder_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE resource_folders
  SET resource_count = resource_count + 1
  WHERE id = folder_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement folder resource count
CREATE OR REPLACE FUNCTION decrement_folder_resource_count(folder_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE resource_folders
  SET resource_count = GREATEST(resource_count - 1, 0)
  WHERE id = folder_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update resource count when resource is moved
CREATE OR REPLACE FUNCTION update_folder_resource_count_on_move()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement old folder count
  IF OLD.folder_id IS NOT NULL THEN
    UPDATE resource_folders
    SET resource_count = GREATEST(resource_count - 1, 0)
    WHERE id = OLD.folder_id;
  END IF;
  
  -- Increment new folder count
  IF NEW.folder_id IS NOT NULL THEN
    UPDATE resource_folders
    SET resource_count = resource_count + 1
    WHERE id = NEW.folder_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for folder resource count updates
CREATE TRIGGER update_folder_count_on_resource_move
  AFTER UPDATE OF folder_id ON resources
  FOR EACH ROW
  WHEN (OLD.folder_id IS DISTINCT FROM NEW.folder_id)
  EXECUTE FUNCTION update_folder_resource_count_on_move();

-- Create Row Level Security (RLS) policies
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Users can view own resources"
  ON resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON resources FOR DELETE
  USING (auth.uid() = user_id);

-- Resource folders policies
CREATE POLICY "Users can view own folders"
  ON resource_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON resource_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON resource_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON resource_folders FOR DELETE
  USING (auth.uid() = user_id);

-- Resource collections policies
CREATE POLICY "Users can view own collections"
  ON resource_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own collections"
  ON resource_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON resource_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON resource_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to search resources
CREATE OR REPLACE FUNCTION search_resources(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type resource_type,
  category resource_category,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.description,
    r.type,
    r.category,
    ts_rank(
      to_tsvector('english', coalesce(r.title, '') || ' ' || coalesce(r.description, '') || ' ' || coalesce(r.content, '')),
      plainto_tsquery('english', p_query)
    )::REAL as relevance_score
  FROM resources r
  WHERE r.user_id = p_user_id
    AND r.status = 'active'
    AND (
      to_tsvector('english', coalesce(r.title, '') || ' ' || coalesce(r.description, '') || ' ' || coalesce(r.content, ''))
      @@ plainto_tsquery('english', p_query)
      OR r.tags && ARRAY[p_query]
    )
  ORDER BY relevance_score DESC, r.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get resource statistics
CREATE OR REPLACE FUNCTION get_resource_stats(p_user_id UUID)
RETURNS TABLE (
  total_resources BIGINT,
  total_views BIGINT,
  total_downloads BIGINT,
  favorite_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_resources,
    COALESCE(SUM(view_count), 0)::BIGINT as total_views,
    COALESCE(SUM(download_count), 0)::BIGINT as total_downloads,
    COUNT(*) FILTER (WHERE is_favorite = true)::BIGINT as favorite_count
  FROM resources
  WHERE user_id = p_user_id
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create function to get resources by type count
CREATE OR REPLACE FUNCTION get_resources_by_type(p_user_id UUID)
RETURNS TABLE (
  type resource_type,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.type,
    COUNT(*)::BIGINT as count
  FROM resources r
  WHERE r.user_id = p_user_id
    AND r.status = 'active'
  GROUP BY r.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get resources by category count
CREATE OR REPLACE FUNCTION get_resources_by_category(p_user_id UUID)
RETURNS TABLE (
  category resource_category,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.category,
    COUNT(*)::BIGINT as count
  FROM resources r
  WHERE r.user_id = p_user_id
    AND r.status = 'active'
  GROUP BY r.category
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE resources IS 'Stores user resources for the resource library';
COMMENT ON TABLE resource_folders IS 'Stores folder structure for organizing resources';
COMMENT ON TABLE resource_collections IS 'Stores curated collections of resources';
COMMENT ON COLUMN resources.metadata IS 'JSON metadata for flexible resource attributes';
COMMENT ON COLUMN resources.parent_resource_id IS 'For related resources and versioning';
