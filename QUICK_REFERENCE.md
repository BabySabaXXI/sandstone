# Sandstone DB Optimization - Quick Reference

## Quick Start

### 1. Run the Optimization Script
```bash
# Connect to your Supabase database and run:
psql -h YOUR_DB_HOST -d postgres -f sandstone_db_optimization.sql
```

### 2. Update Application Code

#### Essay Store - Replace fetchEssays()
```typescript
// BEFORE
fetchEssays: async () => {
  const { data, error } = await supabase
    .from("essays")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
}

// AFTER
fetchEssays: async (page = 1, limit = 20) => {
  const { data, error } = await supabase
    .rpc('get_user_essays_paginated', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: (page - 1) * limit,
      p_subject: null  // or specific subject
    });
}
```

#### Flashcard Store - Fix N+1 Problem
```typescript
// BEFORE - N+1 queries
fetchDecks: async () => {
  const { data: decks } = await supabase.from("flashcard_decks").select("*").eq("user_id", user.id);
  for (const deck of decks) {
    const { data: cards } = await supabase.from("flashcards").select("*").eq("deck_id", deck.id);
  }
}

// AFTER - Single query
fetchDecks: async () => {
  const { data, error } = await supabase
    .rpc('get_user_flashcards', { p_user_id: user.id });
  // Group by deck in application code
}
```

#### Due Cards Query
```typescript
// BEFORE - Client-side filtering
getDueCards: (deckId) => {
  const deck = get().decks.find((d) => d.id === deckId);
  const now = new Date();
  return deck.cards.filter((c) => !c.nextReview || c.nextReview <= now);
}

// AFTER - Database query with index
getDueCards: async (deckId) => {
  const { data, error } = await supabase
    .rpc('get_due_flashcards', { 
      p_deck_id: deckId,
      p_limit: 50 
    });
  return data;
}
```

#### Search Essays
```typescript
// BEFORE - Client-side filtering
searchEssays: (query) => {
  return essays.filter(e => 
    e.question.includes(query) || e.content.includes(query)
  );
}

// AFTER - Full-text search
searchEssays: async (query) => {
  const { data, error } = await supabase
    .rpc('search_essays', {
      p_user_id: user.id,
      p_search_query: query,
      p_limit: 20
    });
  return data;
}
```

---

## Index Quick Reference

| Index Name | Table | Columns | Use Case |
|------------|-------|---------|----------|
| idx_essays_user_created | essays | user_id, created_at DESC | User's essay list |
| idx_essays_user_subject | essays | user_id, subject | Filter by subject |
| idx_flashcards_deck_next_review | flashcards | deck_id, next_review | Due cards query |
| idx_documents_user_subject | documents | user_id, subject | Document list |
| idx_ai_chats_user_pinned_updated | ai_chats | user_id, is_pinned, updated_at | Chat history |
| idx_quizzes_user_subject | quizzes | user_id, subject | Quiz list |
| idx_quiz_attempts_user_quiz | quiz_attempts | user_id, quiz_id | Quiz results |

---

## Performance Functions

| Function | Parameters | Returns | Use Case |
|----------|------------|---------|----------|
| get_user_essays_paginated | user_id, limit, offset, subject | Essays | Paginated essay loading |
| get_due_flashcards | deck_id, limit | Flashcards | Study mode cards |
| get_user_dashboard_stats | user_id | JSONB | Dashboard data |
| search_essays | user_id, query, limit | Essays | Full-text search |
| get_user_flashcards | user_id | Flashcards | All user cards |
| get_user_stats_cached | user_id | JSONB | User statistics |

---

## Monitoring Commands

```sql
-- Check index usage
SELECT * FROM get_index_stats();

-- Check table sizes
SELECT * FROM get_table_stats();

-- Check query performance
SELECT * FROM query_performance_stats;

-- Check for sequential scans (should be low)
SELECT relname, seq_scan, idx_scan 
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY seq_scan DESC;
```

---

## Expected Performance Gains

| Operation | Before | After | Gain |
|-----------|--------|-------|------|
| Dashboard Load | 2-3s | 0.3-0.5s | 85% |
| Essay List | 1-2s | 0.2-0.3s | 80% |
| Study Start | 1.5s | 0.4s | 75% |
| Search | 2s+ | 0.2s | 90% |
| Query Count | N+1 | 1 | 90% |

---

## Troubleshooting

### Index Not Being Used?
```sql
-- Force index usage (for testing)
SET enable_seqscan = off;
EXPLAIN ANALYZE SELECT * FROM essays WHERE user_id = 'uuid';
SET enable_seqscan = on;
```

### Slow Query?
```sql
-- Analyze the query
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM essays WHERE user_id = 'uuid' ORDER BY created_at DESC;
```

### Update Statistics
```sql
ANALYZE essays;
ANALYZE flashcards;
ANALYZE documents;
```

---

## Files

- `sandstone_db_optimization.sql` - Complete optimization script
- `PERFORMANCE_REPORT.md` - Detailed performance report
- `QUICK_REFERENCE.md` - This file
