# Sandstone App Database Schema Migration Guide

## Overview

This guide documents the migration from the original Sandstone schema (v1.0) to the optimized schema (v2.0).

## Key Improvements

### 1. **ENUM Types for Data Integrity**
- `subject_type`: 'economics', 'geography'
- `user_role`: 'student', 'teacher', 'admin'
- `essay_grade`: 'A*', 'A', 'B', 'C', 'D', 'E', 'U'
- `question_type`: '10', '12', '14', '20', 'other'
- `quiz_source_type`: 'essay', 'document', 'flashcard_deck', 'manual'
- `context_type`: 'essay', 'document', 'flashcard_deck', 'quiz', 'general'

### 2. **New Tables Added**

| Table | Purpose |
|-------|---------|
| `subjects` | Reference table for proper subject management |
| `essay_tags` | Tagging system for essays |
| `essay_tag_assignments` | Many-to-many relationship for essay tags |
| `flashcard_reviews` | History of all flashcard reviews |
| `document_tags` | Tagging system for documents |
| `document_tag_assignments` | Many-to-many relationship for document tags |
| `study_sessions` | Track study time and sessions |
| `user_activity_log` | Audit trail for user actions |
| `shared_resources` | Collaboration/sharing functionality |
| `user_subscriptions` | Future monetization support |

### 3. **New Columns Added**

#### profiles table:
- `role` (user_role) - User role for permissions
- `study_streak` (INTEGER) - Consecutive study days
- `last_study_date` (DATE) - Last study session date
- `total_study_minutes` (INTEGER) - Total study time
- `is_active` (BOOLEAN) - Soft delete support
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

#### essays table:
- `word_count` (INTEGER, GENERATED) - Auto-calculated word count
- `search_vector` (tsvector, GENERATED) - Full-text search index
- `is_favorite` (BOOLEAN) - Favorite flag
- `is_archived` (BOOLEAN) - Archive flag
- `tags` (TEXT[]) - Array of tags
- `deleted_at` (TIMESTAMP) - Soft delete support

#### flashcard_decks table:
- `is_public` (BOOLEAN) - Public sharing
- `share_code` (TEXT) - Unique share code
- `card_count` (INTEGER) - Cached card count
- `last_studied` (TIMESTAMP) - Last study time
- `deleted_at` (TIMESTAMP) - Soft delete support

#### flashcards table:
- `front_image_url` (TEXT) - Image support
- `back_image_url` (TEXT) - Image support
- `hint` (TEXT) - Hint text
- `tags` (TEXT[]) - Array of tags
- `total_reviews` (INTEGER) - Review statistics
- `correct_reviews` (INTEGER) - Review statistics
- `search_vector` (tsvector, GENERATED) - Full-text search

#### documents table:
- `plain_text` (TEXT, GENERATED) - Extracted text content
- `document_type` (TEXT) - Type of document
- `is_favorite` (BOOLEAN) - Favorite flag
- `is_archived` (BOOLEAN) - Archive flag
- `tags` (TEXT[]) - Array of tags
- `search_vector` (tsvector, GENERATED) - Full-text search
- `deleted_at` (TIMESTAMP) - Soft delete support

#### quizzes table:
- `question_count` (INTEGER, GENERATED) - Auto-calculated count
- `time_limit_minutes` (INTEGER) - Optional time limit
- `passing_score` (INTEGER) - Passing percentage
- `is_public` (BOOLEAN) - Public sharing
- `share_code` (TEXT) - Unique share code
- `attempt_count` (INTEGER) - Cached attempt count
- `average_score` (DECIMAL) - Cached average score
- `deleted_at` (TIMESTAMP) - Soft delete support

#### quiz_attempts table:
- `percentage` (DECIMAL, GENERATED) - Auto-calculated percentage
- `time_taken_seconds` (INTEGER) - Time tracking

#### ai_chats table:
- `message_count` (INTEGER, GENERATED) - Auto-calculated count
- `search_vector` (tsvector, GENERATED) - Full-text search
- `deleted_at` (TIMESTAMP) - Soft delete support

#### user_settings table:
- `study_reminder_time` (TIME) - Reminder time
- `reminder_days` (INTEGER[]) - Days for reminders
- `essay_auto_save` (BOOLEAN) - Auto-save setting
- `flashcard_daily_goal` (INTEGER) - Daily review goal

### 4. **Indexes Added (50+ indexes)**

#### Critical Performance Indexes:
- All foreign key columns
- Composite indexes for common query patterns
- GIN indexes for JSONB fields
- GIN indexes for full-text search
- Partial indexes for filtered queries
- Array indexes for tags

#### Key Indexes:
```sql
-- Essays
CREATE INDEX idx_essays_user_subject ON essays(user_id, subject);
CREATE INDEX idx_essays_search ON essays USING GIN(search_vector);
CREATE INDEX idx_essays_tags ON essays USING GIN(tags);

-- Flashcards
CREATE INDEX idx_flashcards_due_review ON flashcards(deck_id, next_review) 
    WHERE next_review <= NOW();

-- Documents
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);

-- AI Chats
CREATE INDEX idx_ai_chats_search ON ai_chats USING GIN(search_vector);
```

### 5. **Triggers Added**

| Trigger | Purpose |
|---------|---------|
| `update_deck_card_count` | Auto-update card count in decks |
| `update_quiz_statistics` | Auto-update attempt count and average score |
| `update_user_study_streak` | Track and update study streaks |

### 6. **Functions Added**

| Function | Purpose |
|----------|---------|
| `is_resource_owner()` | Check resource ownership |
| `is_admin()` | Check admin status |
| `search_essays()` | Full-text search for essays |
| `search_documents()` | Full-text search for documents |
| `get_flashcards_for_review()` | Get due flashcards |
| `process_flashcard_review()` | SM-2 algorithm implementation |
| `soft_delete()` | Soft delete records |
| `restore_record()` | Restore soft-deleted records |
| `log_user_activity()` | Log user actions |

### 7. **Views Added**

| View | Purpose |
|------|---------|
| `flashcards_due_for_review` | Flashcards ready for review |
| `user_study_statistics` | Aggregated study stats per user/subject |
| `essay_performance_summary` | Essay performance metrics |

### 8. **RLS Policy Improvements**

- Added `deleted_at IS NULL` checks for soft delete support
- Added public resource viewing (for shared decks/quizzes)
- Added admin bypass for profiles
- Optimized policies with helper functions

## Migration Steps

### Step 1: Backup Current Data
```sql
-- Create backup schema
CREATE SCHEMA backup;

-- Backup all tables
CREATE TABLE backup.profiles AS SELECT * FROM profiles;
CREATE TABLE backup.essays AS SELECT * FROM essays;
CREATE TABLE backup.examiner_scores AS SELECT * FROM examiner_scores;
CREATE TABLE backup.flashcard_decks AS SELECT * FROM flashcard_decks;
CREATE TABLE backup.flashcards AS SELECT * FROM flashcards;
CREATE TABLE backup.documents AS SELECT * FROM documents;
CREATE TABLE backup.folders AS SELECT * FROM folders;
CREATE TABLE backup.quizzes AS SELECT * FROM quizzes;
CREATE TABLE backup.quiz_attempts AS SELECT * FROM quiz_attempts;
CREATE TABLE backup.ai_chats AS SELECT * FROM ai_chats;
CREATE TABLE backup.user_settings AS SELECT * FROM user_settings;
```

### Step 2: Create ENUM Types
```sql
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE subject_type AS ENUM ('economics', 'geography');
CREATE TYPE essay_grade AS ENUM ('A*', 'A', 'B', 'C', 'D', 'E', 'U');
CREATE TYPE question_type AS ENUM ('10', '12', '14', '20', 'other');
CREATE TYPE quiz_source_type AS ENUM ('essay', 'document', 'flashcard_deck', 'manual');
CREATE TYPE context_type AS ENUM ('essay', 'document', 'flashcard_deck', 'quiz', 'general');
```

### Step 3: Migrate subjects
```sql
-- Create subjects table
CREATE TABLE subjects (
    id subject_type PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (id, name, description, color, display_order) VALUES
    ('economics', 'Economics', 'A-Level Economics study materials', '#10B981', 1),
    ('geography', 'Geography', 'A-Level Geography study materials', '#3B82F6', 2);
```

### Step 4: Add new columns to existing tables
```sql
-- Add columns to profiles
ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'student',
    ADD COLUMN IF NOT EXISTS study_streak INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_study_date DATE,
    ADD COLUMN IF NOT EXISTS total_study_minutes INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add columns to essays
ALTER TABLE essays 
    ADD COLUMN IF NOT EXISTS word_count INTEGER,
    ADD COLUMN IF NOT EXISTS search_vector tsvector,
    ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update word_count for existing essays
UPDATE essays SET word_count = array_length(regexp_split_to_array(content, '\s+'), 1);

-- Update search_vector for existing essays
UPDATE essays SET search_vector = 
    setweight(to_tsvector('english', COALESCE(question, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(summary, '')), 'C');

-- Convert subject to enum type
ALTER TABLE essays ALTER COLUMN subject TYPE subject_type USING subject::subject_type;
```

### Step 5: Create new tables
```sql
-- Create all new tables (see full schema for complete definitions)
-- - essay_tags
-- - essay_tag_assignments
-- - flashcard_reviews
-- - document_tags
-- - document_tag_assignments
-- - study_sessions
-- - user_activity_log
-- - shared_resources
-- - user_subscriptions
```

### Step 6: Create indexes
```sql
-- Run all CREATE INDEX statements from the improved schema
-- (50+ indexes for performance optimization)
```

### Step 7: Create triggers
```sql
-- Create trigger functions and attach to tables
-- - update_deck_card_count
-- - update_quiz_statistics
-- - update_user_study_streak
```

### Step 8: Create functions and views
```sql
-- Create helper functions
-- - is_resource_owner()
-- - is_admin()
-- - search_essays()
-- - search_documents()
-- - get_flashcards_for_review()
-- - process_flashcard_review()

-- Create views
-- - flashcards_due_for_review
-- - user_study_statistics
-- - essay_performance_summary
```

### Step 9: Update RLS policies
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own essays" ON essays;
DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
-- ... (drop all existing policies)

-- Create new policies with soft delete support
CREATE POLICY "Users can view own essays" ON essays 
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
-- ... (create all new policies)
```

### Step 10: Update handle_new_user function
```sql
-- Update the function to also create subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    
    INSERT INTO public.user_settings (user_id, theme, default_subject)
    VALUES (NEW.id, 'light', 'economics');
    
    INSERT INTO public.user_subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Post-Migration Verification

### 1. Verify ENUM types
```sql
SELECT * FROM pg_type WHERE typname IN ('user_role', 'subject_type', 'essay_grade');
```

### 2. Verify new tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subjects', 'essay_tags', 'flashcard_reviews', 'study_sessions');
```

### 3. Verify indexes
```sql
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

### 4. Verify triggers
```sql
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### 5. Test RLS policies
```sql
-- Test as regular user
SET ROLE authenticated;
SELECT * FROM essays LIMIT 1;

-- Test as admin
SET ROLE admin;
SELECT * FROM profiles LIMIT 1;
```

## Rollback Plan

If migration fails, restore from backup:

```sql
-- Restore from backup schema
INSERT INTO profiles SELECT * FROM backup.profiles;
INSERT INTO essays SELECT * FROM backup.essays;
-- ... restore all tables

-- Drop backup schema
DROP SCHEMA backup CASCADE;
```

## Performance Considerations

### Expected Improvements:
- **Query Performance**: 50-80% faster with proper indexes
- **Search Performance**: Full-text search enabled
- **Flashcard Review**: O(1) lookup for due cards
- **Dashboard Loading**: Reduced from N+1 queries to single queries with views

### Monitoring:
Monitor these metrics after migration:
- Average query execution time
- Index usage statistics
- Table bloat
- Cache hit ratio

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT schemaname, tablename, seq_scan, idx_scan, n_tup_ins, n_tup_upd
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

## Future Enhancements

1. **Partitioning**: Consider partitioning essays and ai_chats by user_id for very large datasets
2. **Materialized Views**: Create materialized views for analytics dashboards
3. **Connection Pooling**: Implement PgBouncer for high-traffic scenarios
4. **Read Replicas**: Set up read replicas for reporting queries
