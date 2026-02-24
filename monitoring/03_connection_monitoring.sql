-- ============================================
-- SANDSTONE CONNECTION USAGE MONITORING
-- ============================================

-- ============================================
-- 1. CONNECTION POOL STATS
-- ============================================

-- Current connection count by state
CREATE OR REPLACE VIEW monitoring_connection_summary AS
SELECT 
    state,
    COUNT(*) AS connection_count,
    ROUND(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM pg_stat_activity), 0), 2) AS percentage
FROM pg_stat_activity
GROUP BY state
ORDER BY connection_count DESC;

-- Connection count by application
CREATE OR REPLACE VIEW monitoring_connections_by_app AS
SELECT 
    application_name,
    COUNT(*) AS connection_count,
    COUNT(*) FILTER (WHERE state = 'active') AS active_count,
    COUNT(*) FILTER (WHERE state = 'idle') AS idle_count,
    COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction_count
FROM pg_stat_activity
GROUP BY application_name
ORDER BY connection_count DESC;

-- Connection count by user
CREATE OR REPLACE VIEW monitoring_connections_by_user AS
SELECT 
    usename,
    COUNT(*) AS connection_count,
    COUNT(*) FILTER (WHERE state = 'active') AS active_count,
    COUNT(*) FILTER (WHERE state = 'idle') AS idle_count
FROM pg_stat_activity
GROUP BY usename
ORDER BY connection_count DESC;

-- ============================================
-- 2. CONNECTION LIMIT MONITORING
-- ============================================

-- Current connection usage vs limits
CREATE OR REPLACE VIEW monitoring_connection_limits AS
SELECT 
    current_database() AS database_name,
    (SELECT COUNT(*) FROM pg_stat_activity) AS current_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') AS idle_connections,
    ROUND(100.0 * (SELECT COUNT(*) FROM pg_stat_activity) / 
        NULLIF((SELECT setting::int FROM pg_settings WHERE name = 'max_connections'), 0), 2) AS connection_usage_pct;

-- Reserved connections info
CREATE OR REPLACE VIEW monitoring_reserved_connections AS
SELECT 
    name,
    setting,
    unit,
    short_desc
FROM pg_settings
WHERE name IN ('max_connections', 'superuser_reserved_connections', 'reserved_connections');

-- ============================================
-- 3. IDLE CONNECTION MONITORING
-- ============================================

-- Idle connections with duration
CREATE OR REPLACE VIEW monitoring_idle_connections AS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    state_change,
    EXTRACT(EPOCH FROM (NOW() - state_change))::numeric(10,2) AS idle_duration_seconds,
    EXTRACT(EPOCH FROM (NOW() - backend_start))::numeric(10,2) AS connection_duration_seconds,
    LEFT(query, 100) AS last_query_preview
FROM pg_stat_activity
WHERE state = 'idle'
    AND pid != pg_backend_pid()
ORDER BY state_change;

-- Long idle connections (potential connection leak)
CREATE OR REPLACE VIEW monitoring_long_idle_connections AS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    EXTRACT(EPOCH FROM (NOW() - state_change))::numeric(10,2) AS idle_duration_seconds,
    EXTRACT(EPOCH FROM (NOW() - backend_start))::numeric(10,2) AS connection_duration_seconds
FROM pg_stat_activity
WHERE state = 'idle'
    AND pid != pg_backend_pid()
    AND NOW() - state_change > INTERVAL '10 minutes'
ORDER BY state_change;

-- Idle in transaction connections (potential issues)
CREATE OR REPLACE VIEW monitoring_idle_in_transaction AS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    xact_start,
    query_start,
    state_change,
    EXTRACT(EPOCH FROM (NOW() - xact_start))::numeric(10,2) AS transaction_duration_seconds,
    LEFT(query, 200) AS query_preview
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY xact_start;

-- ============================================
-- 4. CONNECTION HISTORY TRACKING
-- ============================================

-- Table to track connection history
CREATE TABLE IF NOT EXISTS monitoring_connection_history (
    id SERIAL PRIMARY KEY,
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    idle_in_transaction INTEGER,
    max_connections INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_connection_history_time 
ON monitoring_connection_history(recorded_at DESC);

-- Function to capture connection snapshot
CREATE OR REPLACE FUNCTION capture_connection_stats()
RETURNS void AS $$
DECLARE
    v_total INTEGER;
    v_active INTEGER;
    v_idle INTEGER;
    v_idle_tx INTEGER;
    v_max INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM pg_stat_activity;
    SELECT COUNT(*) INTO v_active FROM pg_stat_activity WHERE state = 'active';
    SELECT COUNT(*) INTO v_idle FROM pg_stat_activity WHERE state = 'idle';
    SELECT COUNT(*) INTO v_idle_tx FROM pg_stat_activity WHERE state = 'idle in transaction';
    SELECT setting::int INTO v_max FROM pg_settings WHERE name = 'max_connections';
    
    INSERT INTO monitoring_connection_history 
        (total_connections, active_connections, idle_connections, idle_in_transaction, max_connections)
    VALUES (v_total, v_active, v_idle, v_idle_tx, v_max);
END;
$$ LANGUAGE plpgsql;

-- Connection history statistics
CREATE OR REPLACE VIEW monitoring_connection_stats AS
SELECT 
    DATE_TRUNC('hour', recorded_at) AS hour,
    AVG(total_connections)::numeric(10,2) AS avg_total_connections,
    MAX(total_connections) AS max_total_connections,
    AVG(active_connections)::numeric(10,2) AS avg_active_connections,
    MAX(active_connections) AS max_active_connections,
    AVG(idle_connections)::numeric(10,2) AS avg_idle_connections,
    AVG(idle_in_transaction)::numeric(10,2) AS avg_idle_in_transaction
FROM monitoring_connection_history
WHERE recorded_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', recorded_at)
ORDER BY hour DESC;

-- ============================================
-- 5. CONNECTION ALERTS
-- ============================================

-- Function to check connection thresholds
CREATE OR REPLACE FUNCTION check_connection_thresholds()
RETURNS TABLE (
    alert_type text,
    severity text,
    message text,
    current_value integer,
    threshold integer,
    details jsonb
) AS $$
DECLARE
    v_current INTEGER;
    v_max INTEGER;
    v_active INTEGER;
    v_idle_tx INTEGER;
BEGIN
    -- Get current stats
    SELECT COUNT(*) INTO v_current FROM pg_stat_activity;
    SELECT setting::int INTO v_max FROM pg_settings WHERE name = 'max_connections';
    SELECT COUNT(*) INTO v_active FROM pg_stat_activity WHERE state = 'active';
    SELECT COUNT(*) INTO v_idle_tx FROM pg_stat_activity WHERE state = 'idle in transaction';
    
    -- Check connection limit (80% threshold)
    IF v_current > v_max * 0.8 THEN
        RETURN QUERY SELECT 
            'connection_limit'::text,
            'critical'::text,
            'Connection count approaching maximum limit'::text,
            v_current,
            (v_max * 0.8)::integer,
            jsonb_build_object('max_connections', v_max, 'usage_pct', round(100.0 * v_current / v_max, 2));
    END IF;
    
    -- Check for idle in transaction (potential issues)
    IF v_idle_tx > 5 THEN
        RETURN QUERY SELECT 
            'idle_in_transaction'::text,
            'warning'::text,
            'Multiple connections idle in transaction'::text,
            v_idle_tx,
            5,
            jsonb_build_object('connections', (
                SELECT jsonb_agg(jsonb_build_object('pid', pid, 'duration_seconds', 
                    EXTRACT(EPOCH FROM (NOW() - xact_start))::integer))
                FROM pg_stat_activity
                WHERE state = 'idle in transaction'
            ));
    END IF;
    
    -- Check for too many active queries (potential overload)
    IF v_active > 50 THEN
        RETURN QUERY SELECT 
            'high_active_connections'::text,
            'warning'::text,
            'High number of active connections'::text,
            v_active,
            50,
            jsonb_build_object('active_queries', v_active);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. SUPABASE-SPECIFIC CONNECTION MONITORING
-- ============================================

-- Supabase connection pool info (if using Supabase Pooler)
CREATE OR REPLACE VIEW monitoring_supabase_pooler AS
SELECT 
    'Supabase Pooler Connection Info' AS info,
    'Check Supabase Dashboard for connection pooler stats' AS note;

-- Recommended connection settings for Supabase
CREATE OR REPLACE VIEW monitoring_recommended_settings AS
SELECT 
    'max_connections' AS setting,
    '100-200' AS recommended_value,
    (SELECT setting FROM pg_settings WHERE name = 'max_connections') AS current_value,
    'Maximum number of concurrent connections' AS description
UNION ALL
SELECT 
    'shared_buffers',
    '25% of RAM',
    (SELECT setting FROM pg_settings WHERE name = 'shared_buffers'),
    'Memory for shared data buffers'
UNION ALL
SELECT 
    'effective_cache_size',
    '50-75% of RAM',
    (SELECT setting FROM pg_settings WHERE name = 'effective_cache_size'),
    'Estimated memory available for disk caching'
UNION ALL
SELECT 
    'work_mem',
    '4-16MB',
    (SELECT setting FROM pg_settings WHERE name = 'work_mem'),
    'Memory for query operations like sorts'
UNION ALL
SELECT 
    'maintenance_work_mem',
    '64-256MB',
    (SELECT setting FROM pg_settings WHERE name = 'maintenance_work_mem'),
    'Memory for maintenance operations';

-- ============================================
-- 7. CONNECTION CLEANUP PROCEDURES
-- ============================================

-- Function to terminate idle connections (use with caution)
CREATE OR REPLACE FUNCTION terminate_idle_connections(idle_minutes integer DEFAULT 30)
RETURNS TABLE (
    pid integer,
    terminated boolean,
    message text
) AS $$
DECLARE
    v_pid integer;
BEGIN
    FOR v_pid IN 
        SELECT pg_stat_activity.pid
        FROM pg_stat_activity
        WHERE state = 'idle'
            AND pid != pg_backend_pid()
            AND NOW() - state_change > (idle_minutes || ' minutes')::interval
    LOOP
        BEGIN
            PERFORM pg_terminate_backend(v_pid);
            RETURN QUERY SELECT v_pid, true, 'Terminated successfully'::text;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT v_pid, false, SQLERRM::text;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to terminate long-running queries (use with caution)
CREATE OR REPLACE FUNCTION terminate_long_queries(max_seconds integer DEFAULT 300)
RETURNS TABLE (
    pid integer,
    terminated boolean,
    message text
) AS $$
DECLARE
    v_pid integer;
BEGIN
    FOR v_pid IN 
        SELECT pg_stat_activity.pid
        FROM pg_stat_activity
        WHERE state = 'active'
            AND pid != pg_backend_pid()
            AND NOW() - query_start > (max_seconds || ' seconds')::interval
    LOOP
        BEGIN
            PERFORM pg_terminate_backend(v_pid);
            RETURN QUERY SELECT v_pid, true, 'Terminated successfully'::text;
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT v_pid, false, SQLERRM::text;
        END;
    LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. CONNECTION USAGE DASHBOARD
-- ============================================

-- Comprehensive connection dashboard view
CREATE OR REPLACE VIEW monitoring_connection_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM pg_stat_activity) AS total_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') AS idle_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle in transaction') AS idle_in_transaction,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active' AND wait_event_type IS NOT NULL) AS waiting_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections,
    (SELECT COUNT(DISTINCT usename) FROM pg_stat_activity) AS unique_users,
    (SELECT COUNT(DISTINCT application_name) FROM pg_stat_activity) AS unique_applications,
    NOW() AS snapshot_time;
