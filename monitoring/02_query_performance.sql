-- ============================================
-- SANDSTONE QUERY PERFORMANCE MONITORING
-- ============================================

-- ============================================
-- 1. ENABLE PG_STAT_STATEMENTS EXTENSION
-- ============================================
-- Note: This requires superuser access and may need to be enabled
-- in postgresql.conf: shared_preload_libraries = 'pg_stat_statements'

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================
-- 2. TOP SLOW QUERIES
-- ============================================

-- Most time-consuming queries
CREATE OR REPLACE VIEW monitoring_slow_queries AS
SELECT 
    queryid,
    LEFT(query, 100) AS query_preview,
    calls AS execution_count,
    round(total_exec_time::numeric, 2) AS total_time_ms,
    round(mean_exec_time::numeric, 2) AS avg_time_ms,
    round(stddev_exec_time::numeric, 2) AS stddev_time_ms,
    round(max_exec_time::numeric, 2) AS max_time_ms,
    rows AS total_rows,
    round(rows::numeric / NULLIF(calls, 0), 2) AS avg_rows_per_call
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
    AND calls > 0
ORDER BY total_exec_time DESC
LIMIT 50;

-- Queries with highest average execution time
CREATE OR REPLACE VIEW monitoring_high_avg_time_queries AS
SELECT 
    queryid,
    LEFT(query, 100) AS query_preview,
    calls AS execution_count,
    round(mean_exec_time::numeric, 2) AS avg_time_ms,
    round(total_exec_time::numeric, 2) AS total_time_ms,
    rows AS total_rows
FROM pg_stat_statements
WHERE calls > 10
    AND query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 30;

-- Most frequently called queries
CREATE OR REPLACE VIEW monitoring_frequent_queries AS
SELECT 
    queryid,
    LEFT(query, 100) AS query_preview,
    calls AS execution_count,
    round(total_exec_time::numeric, 2) AS total_time_ms,
    round(mean_exec_time::numeric, 2) AS avg_time_ms,
    round(100 * total_exec_time / NULLIF((SELECT sum(total_exec_time) FROM pg_stat_statements), 0), 2) AS time_percentage
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY calls DESC
LIMIT 30;

-- ============================================
-- 3. QUERY PERFORMANCE HISTORY
-- ============================================

-- Table to track query performance over time
CREATE TABLE IF NOT EXISTS monitoring_query_performance_history (
    id SERIAL PRIMARY KEY,
    queryid BIGINT,
    query_preview TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    avg_time_ms NUMERIC,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to capture query performance snapshot
CREATE OR REPLACE FUNCTION capture_query_performance()
RETURNS void AS $$
BEGIN
    INSERT INTO monitoring_query_performance_history (queryid, query_preview, calls, total_time_ms, avg_time_ms)
    SELECT 
        queryid,
        LEFT(query, 200),
        calls,
        round(total_exec_time::numeric, 2),
        round(mean_exec_time::numeric, 2)
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%'
        AND calls > 0
    ORDER BY total_exec_time DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. SANDSTONE-SPECIFIC QUERY MONITORING
-- ============================================

-- Monitor essay grading queries
CREATE OR REPLACE VIEW monitoring_essay_queries AS
SELECT 
    'essays' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') AS last_hour,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS last_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS last_7d,
    AVG(LENGTH(content)) AS avg_content_length,
    MAX(LENGTH(content)) AS max_content_length
FROM essays;

-- Monitor AI chat usage patterns
CREATE OR REPLACE VIEW monitoring_chat_queries AS
SELECT 
    DATE_TRUNC('hour', updated_at) AS hour,
    COUNT(*) AS chat_updates,
    COUNT(DISTINCT user_id) AS unique_users,
    AVG(jsonb_array_length(messages)) AS avg_messages_per_chat
FROM ai_chats
WHERE updated_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', updated_at)
ORDER BY hour DESC;

-- Monitor flashcard review patterns
CREATE OR REPLACE VIEW monitoring_flashcard_reviews AS
SELECT 
    DATE(last_reviewed) AS review_date,
    COUNT(*) AS cards_reviewed,
    COUNT(DISTINCT deck_id) AS decks_accessed,
    AVG(ease_factor) AS avg_ease_factor,
    AVG(repetition_count) AS avg_repetition_count
FROM flashcards
WHERE last_reviewed > NOW() - INTERVAL '30 days'
GROUP BY DATE(last_reviewed)
ORDER BY review_date DESC;

-- Monitor quiz performance
CREATE OR REPLACE VIEW monitoring_quiz_performance AS
SELECT 
    q.id AS quiz_id,
    q.title,
    q.subject,
    COUNT(qa.id) AS attempt_count,
    AVG(qa.score::numeric / NULLIF(qa.total_questions, 0) * 100) AS avg_score_pct,
    MAX(qa.score) AS highest_score,
    MIN(qa.score) AS lowest_score
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
GROUP BY q.id, q.title, q.subject
ORDER BY attempt_count DESC;

-- ============================================
-- 5. QUERY PLAN MONITORING
-- ============================================

-- Function to analyze query plans for common queries
CREATE OR REPLACE FUNCTION analyze_table_query_plan(table_name text)
RETURNS TABLE (
    query_type text,
    estimated_cost numeric,
    estimated_rows bigint,
    actual_time numeric,
    actual_rows bigint,
    node_type text
) AS $$
DECLARE
    query text;
    plan json;
BEGIN
    query := format('EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS) SELECT * FROM %I LIMIT 100', table_name);
    EXECUTE query INTO plan;
    
    RETURN QUERY
    SELECT 
        'Sequential Scan'::text,
        (plan->0->'Plan'->>'Total Cost')::numeric,
        (plan->0->'Plan'->>'Plan Rows')::bigint,
        (plan->0->>'Execution Time')::numeric,
        (plan->0->'Plan'->>'Actual Rows')::bigint,
        plan->0->'Plan'->>'Node Type';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. LONG-RUNNING QUERIES MONITORING
-- ============================================

-- Currently running queries
CREATE OR REPLACE VIEW monitoring_active_queries AS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    EXTRACT(EPOCH FROM (NOW() - query_start))::numeric(10,2) AS query_duration_seconds,
    EXTRACT(EPOCH FROM (NOW() - state_change))::numeric(10,2) AS state_duration_seconds,
    LEFT(query, 200) AS query_preview,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE state != 'idle'
    AND pid != pg_backend_pid()
ORDER BY query_start;

-- Long-running queries (over 5 seconds)
CREATE OR REPLACE VIEW monitoring_long_running_queries AS
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    EXTRACT(EPOCH FROM (NOW() - query_start))::numeric(10,2) AS duration_seconds,
    LEFT(query, 300) AS query_preview
FROM pg_stat_activity
WHERE state != 'idle'
    AND pid != pg_backend_pid()
    AND NOW() - query_start > INTERVAL '5 seconds'
ORDER BY query_start;

-- ============================================
-- 7. QUERY ERROR TRACKING
-- ============================================

-- Table to track query errors
CREATE TABLE IF NOT EXISTS monitoring_query_errors (
    id SERIAL PRIMARY KEY,
    query_preview TEXT,
    error_message TEXT,
    error_code TEXT,
    user_id UUID,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster error lookups
CREATE INDEX IF NOT EXISTS idx_query_errors_time 
ON monitoring_query_errors(occurred_at DESC);

-- View recent query errors
CREATE OR REPLACE VIEW monitoring_recent_errors AS
SELECT 
    id,
    query_preview,
    error_message,
    error_code,
    occurred_at,
    EXTRACT(EPOCH FROM (NOW() - occurred_at))::integer AS seconds_ago
FROM monitoring_query_errors
WHERE occurred_at > NOW() - INTERVAL '24 hours'
ORDER BY occurred_at DESC;

-- Error statistics by hour
CREATE OR REPLACE VIEW monitoring_error_stats AS
SELECT 
    DATE_TRUNC('hour', occurred_at) AS hour,
    COUNT(*) AS error_count,
    COUNT(DISTINCT error_code) AS unique_errors
FROM monitoring_query_errors
WHERE occurred_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', occurred_at)
ORDER BY hour DESC;

-- ============================================
-- 8. PERFORMANCE THRESHOLD ALERTS
-- ============================================

-- Function to check query performance thresholds
CREATE OR REPLACE FUNCTION check_query_performance_thresholds()
RETURNS TABLE (
    alert_type text,
    severity text,
    message text,
    details jsonb
) AS $$
BEGIN
    -- Check for queries with avg time > 1000ms
    RETURN QUERY
    SELECT 
        'slow_query'::text,
        'warning'::text,
        'Query with high average execution time detected'::text,
        jsonb_build_object(
            'queryid', queryid,
            'avg_time_ms', round(mean_exec_time::numeric, 2),
            'calls', calls
        )
    FROM pg_stat_statements
    WHERE mean_exec_time > 1000
        AND calls > 10
    LIMIT 5;
    
    -- Check for long-running queries
    RETURN QUERY
    SELECT 
        'long_running_query'::text,
        'critical'::text,
        'Query running longer than 30 seconds'::text,
        jsonb_build_object(
            'pid', pid,
            'duration_seconds', EXTRACT(EPOCH FROM (NOW() - query_start))::numeric(10,2),
            'query_preview', LEFT(query, 100)
        )
    FROM pg_stat_activity
    WHERE state != 'idle'
        AND pid != pg_backend_pid()
        AND NOW() - query_start > INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;
