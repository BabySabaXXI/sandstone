-- =============================================================================
-- SANDSTONE DOCUMENT SYSTEM MIGRATION
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- FOLDERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'economics',
    parent_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for folders
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

-- Add RLS policies for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own folders"
    ON folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
    ON folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
    ON folders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
    ON folders FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    subject TEXT NOT NULL DEFAULT 'economics',
    content JSONB DEFAULT '[]'::jsonb,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- Add full-text search index
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(content::text, '')));

-- Add RLS policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================================================
-- DOCUMENT VERSIONS (for history/undo)
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for document versions
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);

-- Add RLS policies for document versions
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document versions"
    ON document_versions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document versions"
    ON document_versions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for documents
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for folders
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTION TO SAVE DOCUMENT VERSION
-- =============================================================================

CREATE OR REPLACE FUNCTION save_document_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only save version if content changed
    IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title THEN
        INSERT INTO document_versions (document_id, user_id, title, content)
        VALUES (OLD.id, OLD.user_id, OLD.title, OLD.content);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-save document versions
DROP TRIGGER IF EXISTS auto_save_document_version ON documents;
CREATE TRIGGER auto_save_document_version
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION save_document_version();

-- =============================================================================
-- FUNCTION TO CLEANUP OLD VERSIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_document_versions()
RETURNS void AS $$
BEGIN
    -- Keep only the last 50 versions per document
    DELETE FROM document_versions
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY document_id ORDER BY created_at DESC) as rn
            FROM document_versions
        ) sub
        WHERE rn > 50
    );
    
    -- Delete versions older than 90 days
    DELETE FROM document_versions
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ language 'plpgsql';

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for document statistics
CREATE OR REPLACE VIEW document_stats AS
SELECT 
    user_id,
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '7 days') as documents_this_week,
    COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '24 hours') as documents_today,
    MAX(updated_at) as last_updated
FROM documents
GROUP BY user_id;

-- View for folder statistics
CREATE OR REPLACE VIEW folder_stats AS
SELECT 
    f.id,
    f.name,
    f.user_id,
    COUNT(d.id) as document_count,
    MAX(d.updated_at) as last_document_updated
FROM folders f
LEFT JOIN documents d ON f.id = d.folder_id
GROUP BY f.id, f.name, f.user_id;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE documents IS 'User documents with block-based content';
COMMENT ON TABLE folders IS 'Folders for organizing documents';
COMMENT ON TABLE document_versions IS 'Historical versions of documents for undo/redo';
COMMENT ON COLUMN documents.content IS 'JSON array of document blocks';
COMMENT ON COLUMN documents.tags IS 'Array of tag strings for categorization';
