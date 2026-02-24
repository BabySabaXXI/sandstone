-- ============================================
-- SANDSTONE DATABASE PERFORMANCE MONITORING
-- ============================================
-- Run these queries in Supabase SQL Editor or connect via psql

-- ============================================
-- 1. TABLE SIZE AND GROWTH MONITORING
-- ============================================

-- View table sizes and row counts
CREATE OR REPLACE VIEW monitoring_table_sizes AS
SELECT 
    schemaname,
    relname AS table_name,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_indexes_size(relid)) AS index_size,
    pg_total_relation_size(relid) AS total_bytes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC;

-- Table growth over time (requires pg_stat_statements extension)
CREATE TABLE IF NOT EXISTS monitoring_table_size_history (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    row_count BIGINT,
    total_bytes BIGINT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to capture table sizes periodically
CREATE OR REPLACE FUNCTION capture_table_sizes()
RETURNS void AS $$
BEGIN
    INSERT INTO monitoring_table_size_history (table_name, row_count, total_bytes)
    SELECT relname, n_live_tup, pg_total_relation_size(relid)
    FROM pg_stat_user_tables
    WHERE schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. INDEX HEALTH MONITORING
-- ============================================

-- View index usage statistics
CREATE OR REPLACE VIEW monitoring_index_usage AS
SELECT 
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find unused indexes (potential candidates for removal)
CREATE OR REPLACE VIEW monitoring_unused_indexes AS
SELECT 
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
    AND idx_scan = 0
    AND indexrelname NOT LIKE 'pg_toast%'
    AND indexrelname NOT LIKE 'pg_stat%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find missing indexes (tables with high sequential scans)
CREATE OR REPLACE VIEW monitoring_missing_indexes AS
SELECT 
    schemaname,
    relname AS table_name,
    seq_scan AS sequential_scans,
    idx_scan AS index_scans,
    n_live_tup AS row_count,
    CASE 
        WHEN seq_scan > 0 AND idx_scan > 0 
        THEN round(seq_scan::numeric / (seq_scan + idx_scan) * 100, 2)
        ELSE 0 
    END AS seq_scan_ratio
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND seq_scan > 100
    AND n_live_tup > 1000
ORDER BY seq_scan DESC;

-- ============================================
-- 3. DATABASE BLOAT MONITORING
-- ============================================

-- Check table bloat (dead tuples ratio)
CREATE OR REPLACE VIEW monitoring_table_bloat AS
SELECT 
    schemaname,
    relname AS table_name,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    CASE 
        WHEN n_live_tup > 0 
        THEN round(n_dead_tup::numeric / n_live_tup * 100, 2)
        ELSE 0 
    END AS dead_tuple_ratio,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND n_live_tup > 0
ORDER BY n_dead_tup DESC;

-- ============================================
-- 4. VACUUM AND ANALYZE MONITORING
-- ============================================

-- Tables needing vacuum attention
CREATE OR REPLACE VIEW monitoring_vacuum_needed AS
SELECT 
    schemaname,
    relname AS table_name,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    last_vacuum,
    last_autovacuum,
    ROUND(100 * n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_pct,
    CASE 
        WHEN last_autovacuum IS NULL AND last_vacuum IS NULL THEN 'Never vacuumed'
        WHEN last_autovacuum > COALESCE(last_vacuum, '1970-01-01') THEN last_autovacuum::text
        ELSE last_vacuum::text
    END AS last_vacuum_info
FROM pg_stat_user_tables
WHERE schemaname = 'public'
    AND (n_dead_tup > 1000 OR last_autovacuum IS NULL)
ORDER BY n_dead_tup DESC;

-- ============================================
-- 5. LOCK MONITORING
-- ============================================

-- Current locks in the database
CREATE OR REPLACE VIEW monitoring_current_locks AS
SELECT 
    l.locktype,
    l.relation::regclass AS table_name,
    l.mode,
    l.granted,
    l.pid,
    a.usename,
    a.query,
    a.state,
    a.wait_event_type,
    a.wait_event
FROM pg_locks l
LEFT JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation IS NOT NULL
    AND l.relation::regclass::text NOT LIKE 'pg_%'
ORDER BY l.granted, l.relation::regclass::text;

-- Blocking queries
CREATE OR REPLACE VIEW monitoring_blocking_queries AS
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_query,
    blocking_activity.query AS blocking_query,
    blocked_activity.state AS blocked_state,
    blocking_activity.state AS blocking_state
FROM pg_locks blocked_locks
JOIN pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.relation = blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- ============================================
-- 6. CACHE HIT RATIO
-- ============================================

-- Database cache hit ratio
CREATE OR REPLACE VIEW monitoring_cache_hit_ratio AS
SELECT 
    'index hit ratio' AS name,
    CASE 
        WHEN sum(idx_blks_hit) + sum(idx_blks_read) = 0 THEN 0
        ELSE round(100 * sum(idx_blks_hit)::numeric / (sum(idx_blks_hit) + sum(idx_blks_read)), 2)
    END AS ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT 
    'table hit ratio' AS name,
    CASE 
        WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 0
        ELSE round(100 * sum(heap_blks_hit)::numeric / (sum(heap_blks_hit) + sum(heap_blks_read)), 2)
    END AS ratio
FROM pg_statio_user_tables;

-- Per-table cache statistics
CREATE OR REPLACE VIEW monitoring_table_cache_stats AS
SELECT 
    schemaname,
    relname AS table_name,
    heap_blks_read AS blocks_read,
    heap_blks_hit AS blocks_hit,
    CASE 
        WHEN heap_blks_hit + heap_blks_read = 0 THEN 0
        ELSE round(100 * heap_blks_hit::numeric / (heap_blks_hit + heap_blks_read), 2)
    END AS cache_hit_ratio
FROM pg_statio_user_tables
WHERE schemaname = 'public'
ORDER BY heap_blks_read DESC;

-- ============================================
-- 7. TRANSACTION AND COMMIT RATIO
-- ============================================

-- Database transaction stats
CREATE OR REPLACE VIEW monitoring_transaction_stats AS
SELECT 
    datname AS database_name,
    xact_commit AS transactions_committed,
    xact_rollback AS transactions_rolled_back,
    CASE 
        WHEN xact_commit + xact_rollback = 0 THEN 0
        ELSE round(100 * xact_commit::numeric / (xact_commit + xact_rollback), 2)
    END AS commit_ratio,
    blks_read AS blocks_read,
    blks_hit AS blocks_hit,
    tup_returned AS tuples_returned,
    tup_fetched AS tuples_fetched,
    tup_inserted AS tuples_inserted,
    tup_updated AS tuples_updated,
    tup_deleted AS tuples_deleted,
    conflicts,
    temp_files,
    pg_size_pretty(temp_bytes) AS temp_bytes
FROM pg_stat_database
WHERE datname = current_database();

-- ============================================
-- 8. SANDSTONE-SPECIFIC TABLE METRICS
-- ============================================

-- Active users in last 24 hours
CREATE OR REPLACE VIEW monitoring_active_users_24h AS
SELECT COUNT(DISTINCT user_id) AS active_users
FROM (
    SELECT user_id FROM essays WHERE created_at > NOW() - INTERVAL '24 hours'
    UNION
    SELECT user_id FROM ai_chats WHERE updated_at > NOW() - INTERVAL '24 hours'
    UNION
    SELECT user_id FROM quiz_attempts WHERE created_at > NOW() - INTERVAL '24 hours'
) active_users;

-- Daily activity metrics
CREATE OR REPLACE VIEW monitoring_daily_activity AS
SELECT 
    DATE(created_at) AS date,
    COUNT(*) FILTER (WHERE table_name = 'essays') AS essays_created,
    COUNT(*) FILTER (WHERE table_name = 'ai_chats') AS chat_messages,
    COUNT(*) FILTER (WHERE table_name = 'quiz_attempts') AS quiz_attempts,
    COUNT(*) FILTER (WHERE table_name = 'flashcards') AS flashcards_reviewed
FROM (
    SELECT 'essays' AS table_name, created_at, user_id FROM essays
    UNION ALL
    SELECT 'ai_chats' AS table_name, updated_at AS created_at, user_id FROM ai_chats
    UNION ALL
    SELECT 'quiz_attempts' AS table_name, created_at, user_id FROM quiz_attempts
    UNION ALL
    SELECT 'flashcards' AS table_name, last_reviewed AS created_at, 
        (SELECT user_id FROM flashcard_decks WHERE id = flashcards.deck_id) AS user_id 
    FROM flashcards WHERE last_reviewed IS NOT NULL
) combined
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Storage usage by feature
CREATE OR REPLACE VIEW monitoring_feature_storage AS
SELECT 
    'essays' AS feature,
    COUNT(*) AS record_count,
    pg_size_pretty(pg_total_relation_size('essays')) AS storage_size
FROM essays
UNION ALL
SELECT 
    'ai_chats' AS feature,
    COUNT(*) AS record_count,
    pg_size_pretty(pg_total_relation_size('ai_chats')) AS storage_size
FROM ai_chats
UNION ALL
SELECT 
    'flashcards' AS feature,
    COUNT(*) AS record_count,
    pg_size_pretty(pg_total_relation_size('flashcards') + pg_total_relation_size('flashcard_decks')) AS storage_size
FROM flashcards
UNION ALL
SELECT 
    'documents' AS feature,
    COUNT(*) AS record_count,
    pg_size_pretty(pg_total_relation_size('documents')) AS storage_size
FROM documents
UNION ALL
SELECT 
    'quizzes' AS feature,
    COUNT(*) AS record_count,
    pg_size_pretty(pg_total_relation_size('quizzes') + pg_total_relation_size('quiz_attempts')) AS storage_size
FROM quizzes;
