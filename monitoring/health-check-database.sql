-- ============================================
-- SANDSTONE HEALTH CHECK DATABASE FUNCTIONS
-- ============================================

-- ============================================
-- 1. BASIC HEALTH CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION health_check()
RETURNS TABLE (
    status text,
    database_name text,
    server_version text,
    current_time timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'healthy'::text,
        current_database(),
        version(),
        NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. DETAILED HEALTH CHECK FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION health_check_detailed()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
    v_db_status text;
    v_connection_status text;
    v_storage_status text;
    v_performance_status text;
BEGIN
    -- Check database connectivity
    BEGIN
        PERFORM 1;
        v_db_status := 'healthy';
    EXCEPTION WHEN OTHERS THEN
        v_db_status := 'unhealthy';
    END;

    -- Check connection pool
    DECLARE
        v_current_conn integer;
        v_max_conn integer;
        v_usage_pct numeric;
    BEGIN
        SELECT COUNT(*) INTO v_current_conn FROM pg_stat_activity;
        SELECT setting::int INTO v_max_conn FROM pg_settings WHERE name = 'max_connections';
        v_usage_pct := (v_current_conn::numeric / v_max_conn) * 100;
        
        v_connection_status := CASE
            WHEN v_usage_pct > 90 THEN 'critical'
            WHEN v_usage_pct > 70 THEN 'warning'
            ELSE 'healthy'
        END;
    EXCEPTION WHEN OTHERS THEN
        v_connection_status := 'unknown';
    END;

    -- Check storage (table bloat)
    DECLARE
        v_bloat_ratio numeric;
    BEGIN
        SELECT AVG(n_dead_tup::numeric / NULLIF(n_live_tup, 0)) * 100
        INTO v_bloat_ratio
        FROM pg_stat_user_tables
        WHERE n_live_tup > 0;
        
        v_storage_status := CASE
            WHEN v_bloat_ratio > 50 THEN 'critical'
            WHEN v_bloat_ratio > 20 THEN 'warning'
            ELSE 'healthy'
        END;
    EXCEPTION WHEN OTHERS THEN
        v_storage_status := 'unknown';
    END;

    -- Check performance
    DECLARE
        v_avg_query_time numeric;
    BEGIN
        SELECT AVG(mean_exec_time)
        INTO v_avg_query_time
        FROM pg_stat_statements
        WHERE calls > 10;
        
        v_performance_status := CASE
            WHEN v_avg_query_time > 1000 THEN 'critical'
            WHEN v_avg_query_time > 500 THEN 'warning'
            ELSE 'healthy'
        END;
    EXCEPTION WHEN OTHERS THEN
        v_performance_status := 'unknown';
    END;

    v_result := jsonb_build_object(
        'status', CASE 
            WHEN v_db_status = 'unhealthy' OR v_connection_status = 'critical' OR v_storage_status = 'critical' 
            THEN 'unhealthy'
            WHEN v_connection_status = 'warning' OR v_storage_status = 'warning' OR v_performance_status = 'warning'
            THEN 'degraded'
            ELSE 'healthy'
        END,
        'timestamp', NOW(),
        'checks', jsonb_build_object(
            'database', jsonb_build_object('status', v_db_status),
            'connections', jsonb_build_object('status', v_connection_status),
            'storage', jsonb_build_object('status', v_storage_status),
            'performance', jsonb_build_object('status', v_performance_status)
        )
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. CONNECTION STATS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'total_connections', (SELECT COUNT(*) FROM pg_stat_activity),
        'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
        'idle_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle'),
        'idle_in_transaction', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle in transaction'),
        'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections'),
        'waiting_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE wait_event_type IS NOT NULL),
        'unique_users', (SELECT COUNT(DISTINCT usename) FROM pg_stat_activity),
        'unique_applications', (SELECT COUNT(DISTINCT application_name) FROM pg_stat_activity)
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. TABLE HEALTH CHECK
-- ============================================

CREATE OR REPLACE FUNCTION check_table_health()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    dead_tuple_ratio numeric,
    last_vacuum timestamptz,
    health_status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::text,
        c.n_live_tup,
        CASE 
            WHEN c.n_live_tup > 0 THEN round(c.n_dead_tup::numeric / c.n_live_tup * 100, 2)
            ELSE 0 
        END,
        COALESCE(c.last_autovacuum, c.last_vacuum),
        CASE 
            WHEN c.n_live_tup > 0 AND c.n_dead_tup::numeric / c.n_live_tup > 0.5 THEN 'critical'
            WHEN c.n_live_tup > 0 AND c.n_dead_tup::numeric / c.n_live_tup > 0.2 THEN 'warning'
            ELSE 'healthy'
        END
    FROM pg_stat_user_tables c
    WHERE c.schemaname = 'public'
    ORDER BY c.n_dead_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. PERFORMANCE HEALTH CHECK
-- ============================================

CREATE OR REPLACE FUNCTION check_performance_health()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
    v_slow_queries bigint;
    v_avg_time numeric;
    v_cache_hit numeric;
BEGIN
    -- Count slow queries
    SELECT COUNT(*) INTO v_slow_queries
    FROM pg_stat_statements
    WHERE mean_exec_time > 1000 AND calls > 10;

    -- Get average query time
    SELECT AVG(mean_exec_time) INTO v_avg_time
    FROM pg_stat_statements
    WHERE calls > 10;

    -- Get cache hit ratio
    SELECT round(100 * sum(heap_blks_hit)::numeric / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0), 2)
    INTO v_cache_hit
    FROM pg_statio_user_tables;

    v_result := jsonb_build_object(
        'slow_queries', v_slow_queries,
        'avg_query_time_ms', round(v_avg_time::numeric, 2),
        'cache_hit_ratio', v_cache_hit,
        'status', CASE
            WHEN v_slow_queries > 10 OR v_avg_time > 1000 THEN 'critical'
            WHEN v_slow_queries > 5 OR v_avg_time > 500 THEN 'warning'
            ELSE 'healthy'
        END
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. READINESS CHECK
-- ============================================

CREATE OR REPLACE FUNCTION readiness_check()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
    v_tables_ok boolean;
    v_extensions_ok boolean;
BEGIN
    -- Check critical tables exist
    SELECT COUNT(*) = 11 INTO v_tables_ok
    FROM information_schema.tables
    WHERE table_schema = 'public'
        AND table_name IN (
            'profiles', 'essays', 'examiner_scores', 'flashcard_decks',
            'flashcards', 'documents', 'folders', 'quizzes',
            'quiz_attempts', 'ai_chats', 'user_settings'
        );

    -- Check required extensions
    SELECT COUNT(*) >= 1 INTO v_extensions_ok
    FROM pg_extension
    WHERE extname IN ('uuid-ossp', 'pg_stat_statements');

    v_result := jsonb_build_object(
        'ready', v_tables_ok AND v_extensions_ok,
        'checks', jsonb_build_object(
            'tables', CASE WHEN v_tables_ok THEN 'ok' ELSE 'missing' END,
            'extensions', CASE WHEN v_extensions_ok THEN 'ok' ELSE 'missing' END
        ),
        'timestamp', NOW()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. LIVENESS CHECK
-- ============================================

CREATE OR REPLACE FUNCTION liveness_check()
RETURNS boolean AS $$
BEGIN
    PERFORM 1;
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. COMPREHENSIVE HEALTH REPORT
-- ============================================

CREATE OR REPLACE FUNCTION generate_health_report()
RETURNS jsonb AS $$
DECLARE
    v_report jsonb;
BEGIN
    SELECT jsonb_build_object(
        'timestamp', NOW(),
        'database', jsonb_build_object(
            'name', current_database(),
            'version', version()
        ),
        'health', health_check_detailed(),
        'connections', get_connection_stats(),
        'performance', check_performance_health(),
        'readiness', readiness_check(),
        'tables', (
            SELECT jsonb_agg(jsonb_build_object(
                'name', table_name,
                'rows', row_count,
                'status', health_status
            ))
            FROM check_table_health()
        ),
        'errors', (
            SELECT jsonb_build_object(
                'last_24h', COUNT(*),
                'critical', COUNT(*) FILTER (WHERE severity = 'critical'),
                'unresolved', COUNT(*) FILTER (WHERE resolved_at IS NULL)
            )
            FROM monitoring_error_logs
            WHERE created_at > NOW() - INTERVAL '24 hours'
        )
    ) INTO v_report;

    RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
