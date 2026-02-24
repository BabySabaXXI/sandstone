-- ============================================
-- SANDSTONE ERROR TRACKING AND LOGGING
-- ============================================

-- ============================================
-- 1. ERROR LOGGING TABLE
-- ============================================

-- Main error log table
CREATE TABLE IF NOT EXISTS monitoring_error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    error_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'error', -- 'critical', 'error', 'warning', 'info'
    error_code TEXT,
    error_message TEXT NOT NULL,
    error_detail TEXT,
    error_hint TEXT,
    
    -- Context information
    table_name TEXT,
    operation TEXT, -- INSERT, UPDATE, DELETE, SELECT, etc.
    query_preview TEXT,
    
    -- User and session info
    user_id UUID,
    session_user TEXT,
    application_name TEXT,
    client_addr INET,
    
    -- PostgreSQL error fields
    sqlstate TEXT,
    schema_name TEXT,
    column_name TEXT,
    constraint_name TEXT,
    datatype_name TEXT,
    
    -- Custom metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolution_notes TEXT
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at 
ON monitoring_error_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_error_logs_error_type 
ON monitoring_error_logs(error_type);

CREATE INDEX IF NOT EXISTS idx_error_logs_severity 
ON monitoring_error_logs(severity);

CREATE INDEX IF NOT EXISTS idx_error_logs_user_id 
ON monitoring_error_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_error_logs_table_name 
ON monitoring_error_logs(table_name);

CREATE INDEX IF NOT EXISTS idx_error_logs_metadata 
ON monitoring_error_logs USING GIN(metadata);

-- ============================================
-- 2. ERROR LOGGING FUNCTION
-- ==========================================

-- Function to log errors
CREATE OR REPLACE FUNCTION log_error(
    p_error_type TEXT,
    p_error_message TEXT,
    p_severity TEXT DEFAULT 'error',
    p_error_code TEXT DEFAULT NULL,
    p_table_name TEXT DEFAULT NULL,
    p_operation TEXT DEFAULT NULL,
    p_query_preview TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_error_id UUID;
BEGIN
    INSERT INTO monitoring_error_logs (
        error_type,
        error_message,
        severity,
        error_code,
        table_name,
        operation,
        query_preview,
        user_id,
        session_user,
        application_name,
        client_addr,
        metadata
    ) VALUES (
        p_error_type,
        p_error_message,
        p_severity,
        p_error_code,
        p_table_name,
        p_operation,
        p_query_preview,
        p_user_id,
        session_user,
        current_setting('application_name', true),
        inet_client_addr(),
        p_metadata
    )
    RETURNING id INTO v_error_id;
    
    RETURN v_error_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. ERROR TRACKING VIEWS
-- ============================================

-- Recent errors view
CREATE OR REPLACE VIEW monitoring_recent_errors AS
SELECT 
    id,
    error_type,
    severity,
    error_code,
    LEFT(error_message, 200) AS error_message_preview,
    table_name,
    operation,
    user_id,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at))::integer AS seconds_ago,
    resolved_at IS NOT NULL AS is_resolved
FROM monitoring_error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Error summary by type
CREATE OR REPLACE VIEW monitoring_error_summary AS
SELECT 
    error_type,
    severity,
    COUNT(*) AS error_count,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') AS last_hour,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS last_24h,
    MIN(created_at) AS first_occurrence,
    MAX(created_at) AS last_occurrence,
    COUNT(DISTINCT user_id) AS affected_users
FROM monitoring_error_logs
WHERE resolved_at IS NULL
GROUP BY error_type, severity
ORDER BY error_count DESC;

-- Error trends by hour
CREATE OR REPLACE VIEW monitoring_error_trends AS
SELECT 
    DATE_TRUNC('hour', created_at) AS hour,
    error_type,
    severity,
    COUNT(*) AS error_count
FROM monitoring_error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), error_type, severity
ORDER BY hour DESC, error_count DESC;

-- Errors by table
CREATE OR REPLACE VIEW monitoring_errors_by_table AS
SELECT 
    COALESCE(table_name, 'N/A') AS table_name,
    COUNT(*) AS total_errors,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_errors,
    COUNT(*) FILTER (WHERE severity = 'error') AS error_count,
    COUNT(*) FILTER (WHERE severity = 'warning') AS warning_count,
    COUNT(DISTINCT error_type) AS unique_error_types
FROM monitoring_error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY table_name
ORDER BY total_errors DESC;

-- User error summary
CREATE OR REPLACE VIEW monitoring_user_errors AS
SELECT 
    user_id,
    COUNT(*) AS error_count,
    COUNT(DISTINCT error_type) AS unique_errors,
    MAX(created_at) AS last_error_at,
    array_agg(DISTINCT error_type) AS error_types
FROM monitoring_error_logs
WHERE user_id IS NOT NULL
    AND created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY error_count DESC;

-- ============================================
-- 4. DATABASE ERROR CAPTURE
-- ============================================

-- Function to capture PostgreSQL errors from pg_stat_statements
CREATE OR REPLACE FUNCTION capture_statement_errors()
RETURNS void AS $$
BEGIN
    -- Log slow queries as warnings
    INSERT INTO monitoring_error_logs (
        error_type,
        severity,
        error_message,
        query_preview,
        metadata
    )
    SELECT 
        'slow_query',
        'warning',
        'Query exceeded performance threshold',
        LEFT(query, 200),
        jsonb_build_object(
            'queryid', queryid,
            'calls', calls,
            'mean_time_ms', round(mean_exec_time::numeric, 2),
            'total_time_ms', round(total_exec_time::numeric, 2)
        )
    FROM pg_stat_statements
    WHERE mean_exec_time > 5000
        AND calls > 5
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. SANDSTONE-SPECIFIC ERROR TRACKING
-- ============================================

-- Track RLS policy violations
CREATE OR REPLACE VIEW monitoring_rls_violations AS
SELECT 
    'rls_violation' AS error_type,
    'error' AS severity,
    'Row Level Security policy violation' AS error_message,
    table_name,
    operation,
    user_id,
    created_at
FROM monitoring_error_logs
WHERE error_type = 'rls_violation'
    AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Track authentication errors
CREATE OR REPLACE VIEW monitoring_auth_errors AS
SELECT 
    error_type,
    severity,
    error_message,
    user_id,
    metadata->>'auth_provider' AS auth_provider,
    created_at
FROM monitoring_error_logs
WHERE error_type LIKE 'auth_%'
    AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Track API errors
CREATE OR REPLACE VIEW monitoring_api_errors AS
SELECT 
    error_type,
    severity,
    error_code,
    LEFT(error_message, 100) AS error_preview,
    metadata->>'endpoint' AS endpoint,
    metadata->>'method' AS method,
    (metadata->>'status_code')::int AS status_code,
    created_at
FROM monitoring_error_logs
WHERE error_type LIKE 'api_%'
    AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- ============================================
-- 6. ERROR ALERTS AND THRESHOLDS
-- ============================================

-- Function to check error thresholds
CREATE OR REPLACE FUNCTION check_error_thresholds()
RETURNS TABLE (
    alert_type text,
    severity text,
    message text,
    current_count bigint,
    threshold bigint,
    details jsonb
) AS $$
DECLARE
    v_critical_count BIGINT;
    v_error_count BIGINT;
    v_error_rate NUMERIC;
BEGIN
    -- Check critical errors in last hour
    SELECT COUNT(*) INTO v_critical_count
    FROM monitoring_error_logs
    WHERE severity = 'critical'
        AND created_at > NOW() - INTERVAL '1 hour'
        AND resolved_at IS NULL;
    
    IF v_critical_count > 0 THEN
        RETURN QUERY SELECT 
            'critical_errors'::text,
            'critical'::text,
            'Critical errors detected in the last hour'::text,
            v_critical_count,
            0::bigint,
            (SELECT jsonb_agg(jsonb_build_object('id', id, 'type', error_type, 'message', LEFT(error_message, 100)))
             FROM monitoring_error_logs 
             WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '1 hour' AND resolved_at IS NULL);
    END IF;
    
    -- Check error rate (errors per minute)
    SELECT COUNT(*) INTO v_error_count
    FROM monitoring_error_logs
    WHERE created_at > NOW() - INTERVAL '5 minutes'
        AND severity IN ('error', 'critical')
        AND resolved_at IS NULL;
    
    v_error_rate := v_error_count::numeric / 5;
    
    IF v_error_rate > 10 THEN
        RETURN QUERY SELECT 
            'high_error_rate'::text,
            'warning'::text,
            'High error rate detected'::text,
            v_error_count,
            50::bigint,
            jsonb_build_object('error_rate_per_minute', round(v_error_rate, 2));
    END IF;
    
    -- Check for repeated errors
    RETURN QUERY
    SELECT 
        'repeated_errors'::text,
        'warning'::text,
        'Repeated errors of same type detected'::text,
        COUNT(*)::bigint,
        10::bigint,
        jsonb_build_object('error_type', error_type, 'count', COUNT(*))
    FROM monitoring_error_logs
    WHERE created_at > NOW() - INTERVAL '1 hour'
        AND resolved_at IS NULL
    GROUP BY error_type
    HAVING COUNT(*) > 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. ERROR RESOLUTION WORKFLOW
-- ============================================

-- Function to mark error as resolved
CREATE OR REPLACE FUNCTION resolve_error(
    p_error_id UUID,
    p_resolution_notes TEXT DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
    UPDATE monitoring_error_logs
    SET resolved_at = NOW(),
        resolved_by = auth.uid(),
        resolution_notes = p_resolution_notes
    WHERE id = p_error_id
        AND resolved_at IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to bulk resolve errors
CREATE OR REPLACE FUNCTION bulk_resolve_errors(
    p_error_type TEXT,
    p_resolution_notes TEXT DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE monitoring_error_logs
    SET resolved_at = NOW(),
        resolved_by = auth.uid(),
        resolution_notes = p_resolution_notes
    WHERE error_type = p_error_type
        AND resolved_at IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. ERROR NOTIFICATION SYSTEM
-- ============================================

-- Table for error notifications
CREATE TABLE IF NOT EXISTS monitoring_error_notifications (
    id SERIAL PRIMARY KEY,
    error_id UUID REFERENCES monitoring_error_logs(id),
    notification_type TEXT NOT NULL, -- 'email', 'slack', 'webhook'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    response TEXT
);

-- Function to queue error notification
CREATE OR REPLACE FUNCTION queue_error_notification(
    p_error_id UUID,
    p_notification_type TEXT
)
RETURNS void AS $$
BEGIN
    INSERT INTO monitoring_error_notifications (error_id, notification_type)
    VALUES (p_error_id, p_notification_type);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-notify on critical errors
CREATE OR REPLACE FUNCTION notify_on_critical_error()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.severity = 'critical' THEN
        PERFORM queue_error_notification(NEW.id, 'email');
        PERFORM queue_error_notification(NEW.id, 'slack');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_critical_error_notification ON monitoring_error_logs;
CREATE TRIGGER trigger_critical_error_notification
    AFTER INSERT ON monitoring_error_logs
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_critical_error();

-- ============================================
-- 9. ERROR ANALYSIS REPORTS
-- ============================================

-- Daily error report
CREATE OR REPLACE VIEW monitoring_daily_error_report AS
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS total_errors,
    COUNT(*) FILTER (WHERE severity = 'critical') AS critical_count,
    COUNT(*) FILTER (WHERE severity = 'error') AS error_count,
    COUNT(*) FILTER (WHERE severity = 'warning') AS warning_count,
    COUNT(DISTINCT error_type) AS unique_error_types,
    COUNT(DISTINCT user_id) AS affected_users,
    COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) AS resolved_count
FROM monitoring_error_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top errors report
CREATE OR REPLACE VIEW monitoring_top_errors AS
SELECT 
    error_type,
    severity,
    COUNT(*) AS occurrence_count,
    COUNT(DISTINCT user_id) AS affected_users,
    MIN(created_at) AS first_seen,
    MAX(created_at) AS last_seen,
    MODE() WITHIN GROUP (ORDER BY error_message) AS most_common_message
FROM monitoring_error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
    AND resolved_at IS NULL
GROUP BY error_type, severity
ORDER BY occurrence_count DESC
LIMIT 20;
