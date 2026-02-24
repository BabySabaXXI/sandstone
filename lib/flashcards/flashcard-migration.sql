-- Flashcard System Database Migration
-- Run this SQL to update your database schema for the enhanced flashcard system

-- ============================================================================
-- FLASHCARD DECKS TABLE
-- ============================================================================

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcard_decks' AND column_name = 'tags'
  ) THEN
    ALTER TABLE flashcard_decks ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Add is_public column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcard_decks' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE flashcard_decks ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add card_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcard_decks' AND column_name = 'card_count'
  ) THEN
    ALTER TABLE flashcard_decks ADD COLUMN card_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index on tags for faster searching
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_tags ON flashcard_decks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_is_public ON flashcard_decks(is_public) WHERE is_public = TRUE;

-- ============================================================================
-- FLASHCARDS TABLE
-- ============================================================================

-- Add new columns for enhanced SM-2 algorithm
DO $$
BEGIN
  -- Add difficulty column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN difficulty DECIMAL DEFAULT 0.3;
  END IF;

  -- Add stability column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'stability'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN stability DECIMAL DEFAULT 0;
  END IF;

  -- Add lapses column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'lapses'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN lapses INTEGER DEFAULT 0;
  END IF;

  -- Add review_history column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'review_history'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN review_history JSONB DEFAULT '[]';
  END IF;

  -- Add document_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'document_id'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN document_id UUID REFERENCES documents(id) ON DELETE SET NULL;
  END IF;

  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'tags'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Add subject column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'flashcards' AND column_name = 'subject'
  ) THEN
    ALTER TABLE flashcards ADD COLUMN subject TEXT DEFAULT 'economics';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review) WHERE next_review IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_document_id ON flashcards(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON flashcards USING GIN(tags);

-- ============================================================================
-- STUDY SESSIONS TABLE (Optional - for detailed session tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  cards_reviewed INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in milliseconds
  ratings INTEGER[] DEFAULT '{}',
  mode TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_deck_id ON study_sessions(deck_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON study_sessions(start_time);

-- ============================================================================
-- STUDY PROGRESS TABLE (Optional - for daily progress tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  cards_reviewed INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in milliseconds
  decks_studied UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_date ON study_progress(date);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update card_count on flashcard_decks
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE flashcard_decks 
    SET card_count = card_count + 1, updated_at = NOW()
    WHERE id = NEW.deck_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flashcard_decks 
    SET card_count = card_count - 1, updated_at = NOW()
    WHERE id = OLD.deck_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for card count
DROP TRIGGER IF EXISTS trigger_update_card_count ON flashcards;
CREATE TRIGGER trigger_update_card_count
AFTER INSERT OR DELETE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_deck_card_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_flashcard_decks_updated_at ON flashcard_decks;
CREATE TRIGGER trigger_flashcard_decks_updated_at
BEFORE UPDATE ON flashcard_decks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_flashcards_updated_at ON flashcards;
CREATE TRIGGER trigger_flashcards_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_study_progress_updated_at ON study_progress;
CREATE TRIGGER trigger_study_progress_updated_at
BEFORE UPDATE ON study_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- Policies for study_sessions
DROP POLICY IF EXISTS "Users can view own study sessions" ON study_sessions;
CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own study sessions" ON study_sessions;
CREATE POLICY "Users can create own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study sessions" ON study_sessions;
CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own study sessions" ON study_sessions;
CREATE POLICY "Users can delete own study sessions"
  ON study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for study_progress
DROP POLICY IF EXISTS "Users can view own study progress" ON study_progress;
CREATE POLICY "Users can view own study progress"
  ON study_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own study progress" ON study_progress;
CREATE POLICY "Users can create own study progress"
  ON study_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own study progress" ON study_progress;
CREATE POLICY "Users can update own study progress"
  ON study_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INITIALIZE CARD COUNTS
-- ============================================================================

-- Update card_count for existing decks
UPDATE flashcard_decks fd
SET card_count = (
  SELECT COUNT(*) 
  FROM flashcards f 
  WHERE f.deck_id = fd.id
);

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Set default values for existing cards
UPDATE flashcards 
SET 
  difficulty = 0.3,
  stability = interval,
  lapses = 0,
  review_history = '[]'
WHERE difficulty IS NULL;
