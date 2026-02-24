-- ============================================
-- SANDSTONE MONITORING DASHBOARD QUERIES
-- ============================================
-- These views and functions power the monitoring dashboard

-- ============================================
-- 1. OVERVIEW DASHBOARD VIEW
-- ============================================

CREATE OR REPLACE VIEW dashboard_overview AS
SELECT
    jsonb_build_object(
        'database_status', (
            SELECT CASE 
                WHEN COUNT(*) FILTER (WHERE state = 'active') > 50 THEN 'warning'
                WHEN COUNT(*) FILTER (WHERE state = 'active') > 80 THEN 'critical'
                ELSE 'healthy'
            END
            FROM pg_stat_activity
        ),
        'connection_usage', (
            SELECT ROUND(100.0 * COUNT(*) / NULLIF((SELECT setting::int FROM pg_settings WHERE name = 'max_connections'), 0), 2)
            FROM pg_stat_activity
        ),
        'active_users_today', (
            SELECT COUNT(DISTINCT user_id) FROM (
                SELECT user_id FROM essays WHERE created_at > CURRENT_DATE
                UNION
                SELECT user_id FROM ai_chats WHERE updated_at > CURRENT_DATE
                UNION
                SELECT user_id FROM quiz_attempts WHERE created_at > CURRENT_DATE
            ) u
        ),
        'total_essays_today', (
            SELECT COUNT(*) FROM essays WHERE created_at > CURRENT_DATE
        ),
        'total_chats_today', (
            SELECT COUNT(*) FROM ai_chats WHERE updated_at > CURRENT_DATE
        ),
        'errors_last_hour', (
            SELECT COUNT(*) FROM monitoring_error_logs 
            WHERE created_at > NOW() - INTERVAL '1 hour' AND resolved_at IS NULL
        ),
        'slow_queries', (
            SELECT COUNT(*) FROM pg_stat_statements 
            WHERE mean_exec_time > 1000 AND calls > 10
        ),
        'cache_hit_ratio', (
            SELECT ROUND(100 * SUM(heap_blks_hit)::numeric / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2)
            FROM pg_statio_user_tables
        ),
        'database_size', (
            SELECT pg_size_pretty(pg_database_size(current_database()))
        ),
        'last_updated', NOW()
    ) AS overview_data;

-- ============================================
-- 2. REAL-TIME METRICS VIEW
-- ============================================

CREATE OR REPLACE VIEW dashboard_realtime_metrics AS
SELECT
    'connections' AS metric_name,
    jsonb_build_object(
        'total', (SELECT COUNT(*) FROM pg_stat_activity),
        'active', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
        'idle', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle'),
        'idle_in_transaction', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle in transaction'),
        'waiting', (SELECT COUNT(*) FROM pg_stat_activity WHERE wait_event_type IS NOT NULL)
    ) AS metric_value,
    NOW() AS timestamp
UNION ALL
SELECT
    'query_performance' AS metric_name,
    jsonb_build_object(
        'avg_time_ms', COALESCE((SELECT AVG(mean_exec_time)::numeric(10,2) FROM pg_stat_statements WHERE calls > 10), 0),
        'total_queries', COALESCE((SELECT SUM(calls) FROM pg_stat_statements), 0),
        'slow_queries', COALESCE((SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 1000), 0)
    ) AS metric_value,
    NOW() AS timestamp
UNION ALL
SELECT
    'cache_stats' AS metric_name,
    jsonb_build_object(
        'table_hit_ratio', COALESCE((
            SELECT ROUND(100 * SUM(heap_blks_hit)::numeric / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2)
            FROM pg_statio_user_tables
        ), 0),
        'index_hit_ratio', COALESCE((
            SELECT ROUND(100 * SUM(idx_blks_hit)::numeric / NULLIF(SUM(idx_blks_hit) + SUM(idx_blks_read), 0), 2)
            FROM pg_statio_user_indexes
        ), 0)
    ) AS metric_value,
    NOW() AS timestamp
UNION ALL
SELECT
    'table_stats' AS metric_name,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'table_name', relname,
            'row_count', n_live_tup,
            'dead_tuples', n_dead_tup,
            'size', pg_size_pretty(pg_total_relation_size(relid))
        ) ORDER BY pg_total_relation_size(relid) DESC)
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        LIMIT 10
    ) AS metric_value,
    NOW() AS timestamp;

-- ============================================
-- 3. USER ACTIVITY DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW dashboard_user_activity AS
SELECT
    DATE_TRUNC('hour', created_at) AS hour,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(*) AS total_actions,
    jsonb_build_object(
        'essays', COUNT(*) FILTER (WHERE source_table = 'essays'),
        'chats', COUNT(*) FILTER (WHERE source_table = 'ai_chats'),
        'quizzes', COUNT(*) FILTER (WHERE source_table = 'quiz_attempts'),
        'flashcards', COUNT(*) FILTER (WHERE source_table = 'flashcards')
    ) AS actions_by_type
FROM (
    SELECT user_id, created_at, 'essays' AS source_table FROM essays
    UNION ALL
    SELECT user_id, updated_at AS created_at, 'ai_chats' AS source_table FROM ai_chats
    UNION ALL
    SELECT user_id, created_at, 'quiz_attempts' AS source_table FROM quiz_attempts
    UNION ALL
    SELECT d.user_id, f.last_reviewed AS created_at, 'flashcards' AS source_table 
    FROM flashcards f JOIN flashcard_decks d ON f.deck_id = d.id WHERE f.last_reviewed IS NOT NULL
) combined
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- ============================================
-- 4. DAILY ACTIVITY SUMMARY
-- ============================================

CREATE OR REPLACE VIEW dashboard_daily_summary AS
SELECT
    DATE(created_at) AS date,
    COUNT(DISTINCT user_id) AS daily_active_users,
    COUNT(*) FILTER (WHERE source_table = 'essays') AS essays_created,
    COUNT(*) FILTER (WHERE source_table = 'ai_chats') AS chat_sessions,
    COUNT(*) FILTER (WHERE source_table = 'quiz_attempts') AS quiz_attempts,
    COUNT(*) FILTER (WHERE source_table = 'flashcards') AS flashcard_reviews,
    COUNT(DISTINCT user_id) FILTER (WHERE source_table = 'essays') AS users_with_essays,
    COUNT(DISTINCT user_id) FILTER (WHERE source_table = 'ai_chats') AS users_with_chats
FROM (
    SELECT user_id, created_at, 'essays' AS source_table FROM essays
    UNION ALL
    SELECT user_id, updated_at AS created_at, 'ai_chats' AS source_table FROM ai_chats
    UNION ALL
    SELECT user_id, created_at, 'quiz_attempts' AS source_table FROM quiz_attempts
    UNION ALL
    SELECT d.user_id, f.last_reviewed AS created_at, 'flashcards' AS source_table 
    FROM flashcards f JOIN flashcard_decks d ON f.deck_id = d.id WHERE f.last_reviewed IS NOT NULL
) combined
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- 5. FEATURE USAGE ANALYTICS
-- ============================================

CREATE OR REPLACE VIEW dashboard_feature_usage AS
SELECT
    'essays' AS feature,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE) AS today_count,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days') AS last_7_days,
    COUNT(DISTINCT user_id) AS unique_users,
    AVG(LENGTH(content))::bigint AS avg_content_length,
    pg_size_pretty(pg_total_relation_size('essays')) AS storage_size
FROM essays
UNION ALL
SELECT
    'ai_chats' AS feature,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE updated_at > CURRENT_DATE) AS today_count,
    COUNT(*) FILTER (WHERE updated_at > CURRENT_DATE - INTERVAL '7 days') AS last_7_days,
    COUNT(DISTINCT user_id) AS unique_users,
    AVG(jsonb_array_length(messages))::bigint AS avg_messages_per_chat,
    pg_size_pretty(pg_total_relation_size('ai_chats')) AS storage_size
FROM ai_chats
UNION ALL
SELECT
    'flashcards' AS feature,
    (SELECT COUNT(*) FROM flashcards) AS total_count,
    (SELECT COUNT(*) FROM flashcards WHERE last_reviewed > CURRENT_DATE) AS today_count,
    (SELECT COUNT(*) FROM flashcards WHERE last_reviewed > CURRENT_DATE - INTERVAL '7 days') AS last_7_days,
    (SELECT COUNT(DISTINCT d.user_id) FROM flashcards f JOIN flashcard_decks d ON f.deck_id = d.id) AS unique_users,
    NULL::bigint AS avg_content_length,
    pg_size_pretty(pg_total_relation_size('flashcards') + pg_total_relation_size('flashcard_decks')) AS storage_size
UNION ALL
SELECT
    'quizzes' AS feature,
    (SELECT COUNT(*) FROM quizzes) AS total_count,
    (SELECT COUNT(*) FROM quizzes WHERE created_at > CURRENT_DATE) AS today_count,
    (SELECT COUNT(*) FROM quizzes WHERE created_at > CURRENT_DATE - INTERVAL '7 days') AS last_7_days,
    (SELECT COUNT(DISTINCT user_id) FROM quizzes) AS unique_users,
    (SELECT AVG(jsonb_array_length(questions))::bigint FROM quizzes) AS avg_content_length,
    pg_size_pretty(pg_total_relation_size('quizzes') + pg_total_relation_size('quiz_attempts')) AS storage_size
UNION ALL
SELECT
    'documents' AS feature,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE) AS today_count,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days') AS last_7_days,
    COUNT(DISTINCT user_id) AS unique_users,
    NULL::bigint AS avg_content_length,
    pg_size_pretty(pg_total_relation_size('documents')) AS storage_size
FROM documents;

-- ============================================
-- 6. PERFORMANCE DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW dashboard_performance AS
SELECT
    'query_stats' AS category,
    jsonb_build_object(
        'total_queries', (SELECT SUM(calls) FROM pg_stat_statements),
        'avg_time_ms', (SELECT ROUND(AVG(mean_exec_time)::numeric, 2) FROM pg_stat_statements WHERE calls > 10),
        'max_time_ms', (SELECT ROUND(MAX(max_exec_time)::numeric, 2) FROM pg_stat_statements),
        'slow_query_count', (SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 1000)
    ) AS data
UNION ALL
SELECT
    'table_stats' AS category,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'table', relname,
            'seq_scans', seq_scan,
            'idx_scans', idx_scan,
            'n_tup_ins', n_tup_ins,
            'n_tup_upd', n_tup_upd,
            'n_tup_del', n_tup_del
        ) ORDER BY seq_scan DESC)
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        LIMIT 10
    ) AS data
UNION ALL
SELECT
    'index_stats' AS category,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'index', indexrelname,
            'table', relname,
            'scans', idx_scan,
            'tuples_read', idx_tup_read
        ) ORDER BY idx_scan DESC)
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        LIMIT 10
    ) AS data;

-- ============================================
-- 7. ERROR DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW dashboard_errors AS
SELECT
    jsonb_build_object(
        'summary', (
            SELECT jsonb_build_object(
                'total_last_24h', COUNT(*),
                'critical', COUNT(*) FILTER (WHERE severity = 'critical'),
                'error', COUNT(*) FILTER (WHERE severity = 'error'),
                'warning', COUNT(*) FILTER (WHERE severity = 'warning'),
                'unresolved', COUNT(*) FILTER (WHERE resolved_at IS NULL)
            )
            FROM monitoring_error_logs
            WHERE created_at > NOW() - INTERVAL '24 hours'
        ),
        'by_type', (
            SELECT jsonb_agg(jsonb_build_object(
                'type', error_type,
                'count', cnt,
                'severity', max_severity
            ))
            FROM (
                SELECT 
                    error_type,
                    COUNT(*) AS cnt,
                    MAX(severity) AS max_severity
                FROM monitoring_error_logs
                WHERE created_at > NOW() - INTERVAL '24 hours'
                GROUP BY error_type
                ORDER BY COUNT(*) DESC
                LIMIT 10
            ) sub
        ),
        'recent', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'type', error_type,
                'severity', severity,
                'message', LEFT(error_message, 100),
                'created_at', created_at
            ))
            FROM (
                SELECT id, error_type, severity, error_message, created_at
                FROM monitoring_error_logs
                WHERE resolved_at IS NULL
                ORDER BY created_at DESC
                LIMIT 10
            ) sub
        ),
        'trend', (
            SELECT jsonb_agg(jsonb_build_object(
                'hour', hour,
                'count', cnt
            ))
            FROM (
                SELECT 
                    DATE_TRUNC('hour', created_at) AS hour,
                    COUNT(*) AS cnt
                FROM monitoring_error_logs
                WHERE created_at > NOW() - INTERVAL '24 hours'
                GROUP BY DATE_TRUNC('hour', created_at)
                ORDER BY hour
            ) sub
        )
    ) AS error_data;

-- ============================================
-- 8. STORAGE DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW dashboard_storage AS
SELECT
    jsonb_build_object(
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'database_size_bytes', pg_database_size(current_database()),
        'tables', (
            SELECT jsonb_agg(jsonb_build_object(
                'name', relname,
                'rows', n_live_tup,
                'total_size', pg_size_pretty(pg_total_relation_size(relid)),
                'table_size', pg_size_pretty(pg_relation_size(relid)),
                'index_size', pg_size_pretty(pg_indexes_size(relid)),
                'total_bytes', pg_total_relation_size(relid)
            ) ORDER BY pg_total_relation_size(relid) DESC)
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
        ),
        'total_table_size', (
            SELECT pg_size_pretty(SUM(pg_total_relation_size(relid)))
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
        ),
        'index_usage', (
            SELECT jsonb_agg(jsonb_build_object(
                'index', indexrelname,
                'table', relname,
                'scans', idx_scan,
                'size', pg_size_pretty(pg_relation_size(indexrelid))
            ) ORDER BY idx_scan DESC NULLS LAST)
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            LIMIT 20
        )
    ) AS storage_data;

-- ============================================
-- 9. DASHBOARD API FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_dashboard_data(p_section TEXT DEFAULT 'all')
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    v_result := jsonb_build_object(
        'timestamp', NOW(),
        'section', p_section
    );

    IF p_section = 'all' OR p_section = 'overview' THEN
        v_result := v_result || jsonb_build_object('overview', (
            SELECT overview_data FROM dashboard_overview
        ));
    END IF;

    IF p_section = 'all' OR p_section = 'realtime' THEN
        v_result := v_result || jsonb_build_object('realtime', (
            SELECT jsonb_agg(jsonb_build_object(
                'metric', metric_name,
                'value', metric_value,
                'timestamp', timestamp
            )) FROM dashboard_realtime_metrics
        ));
    END IF;

    IF p_section = 'all' OR p_section = 'users' THEN
        v_result := v_result || jsonb_build_object('users', (
            SELECT jsonb_agg(to_jsonb(dashboard_user_activity.*))
            FROM dashboard_user_activity
            LIMIT 24
        ));
    END IF;

    IF p_section = 'all' OR p_section = 'features' THEN
        v_result := v_result || jsonb_build_object('features', (
            SELECT jsonb_agg(to_jsonb(dashboard_feature_usage.*))
            FROM dashboard_feature_usage
        ));
    END IF;

    IF p_section = 'all' OR p_section = 'performance' THEN
        v_result := v_result || jsonb_build_object('performance', (
            SELECT jsonb_agg(to_jsonb(dashboard_performance.*))
            FROM dashboard_performance
        ));
    END IF;

    IF p_section = 'all' OR p_section = 'errors' THEN
        v_result := v_result || jsonb_build_object('errors', (
            SELECT error_data FROM dashboard_errors
        ));
    END IF;

    IF p_section = 'all' OR p_section = 'storage' THEN
        v_result := v_result || jsonb_build_object('storage', (
            SELECT storage_data FROM dashboard_storage
        ));
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
