-- ============================================
-- SANDSTONE ALERTING THRESHOLDS AND RULES
-- ============================================

-- ============================================
-- 1. ALERT CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS monitoring_alert_config (
    id SERIAL PRIMARY KEY,
    alert_name TEXT NOT NULL UNIQUE,
    alert_type TEXT NOT NULL, -- 'performance', 'connection', 'error', 'storage'
    severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
    metric_name TEXT NOT NULL,
    threshold_operator TEXT NOT NULL DEFAULT '>', -- '>', '<', '>=', '<=', '=', '!='
    threshold_value NUMERIC NOT NULL,
    duration_minutes INTEGER DEFAULT 0, -- How long condition must persist
    enabled BOOLEAN DEFAULT TRUE,
    notification_channels TEXT[] DEFAULT ARRAY['email'],
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_alert_config_type ON monitoring_alert_config(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_config_enabled ON monitoring_alert_config(enabled);

-- ============================================
-- 2. DEFAULT ALERT CONFIGURATIONS
-- ============================================

INSERT INTO monitoring_alert_config (alert_name, alert_type, severity, metric_name, threshold_operator, threshold_value, duration_minutes, notification_channels, description)
VALUES
    -- Connection Alerts
    ('high_connection_usage', 'connection', 'warning', 'connection_usage_percent', '>', 70, 5, ARRAY['email', 'slack'], 'Connection pool usage exceeds 70%'),
    ('critical_connection_usage', 'connection', 'critical', 'connection_usage_percent', '>', 90, 2, ARRAY['email', 'slack', 'pagerduty'], 'Connection pool usage exceeds 90%'),
    ('idle_in_transaction', 'connection', 'warning', 'idle_in_transaction_count', '>', 5, 10, ARRAY['email'], 'Multiple connections idle in transaction'),
    ('long_idle_connections', 'connection', 'warning', 'long_idle_count', '>', 10, 30, ARRAY['email'], 'Too many idle connections for extended period'),
    
    -- Performance Alerts
    ('slow_query_detected', 'performance', 'warning', 'slow_query_count', '>', 5, 0, ARRAY['email'], 'More than 5 slow queries detected'),
    ('high_avg_query_time', 'performance', 'warning', 'avg_query_time_ms', '>', 500, 10, ARRAY['email'], 'Average query time exceeds 500ms'),
    ('critical_query_time', 'performance', 'critical', 'avg_query_time_ms', '>', 1000, 5, ARRAY['email', 'slack'], 'Average query time exceeds 1000ms'),
    ('low_cache_hit_ratio', 'performance', 'warning', 'cache_hit_ratio', '<', 95, 15, ARRAY['email'], 'Cache hit ratio below 95%'),
    ('table_bloat_detected', 'performance', 'warning', 'dead_tuple_ratio', '>', 20, 60, ARRAY['email'], 'Table bloat exceeds 20%'),
    
    -- Error Alerts
    ('error_rate_high', 'error', 'warning', 'errors_per_minute', '>', 10, 5, ARRAY['email'], 'Error rate exceeds 10 per minute'),
    ('critical_errors', 'error', 'critical', 'critical_error_count', '>', 0, 0, ARRAY['email', 'slack', 'pagerduty'], 'Critical errors detected'),
    ('repeated_errors', 'error', 'warning', 'repeated_error_count', '>', 10, 30, ARRAY['email'], 'Same error type repeated more than 10 times'),
    
    -- Storage Alerts
    ('database_size_warning', 'storage', 'warning', 'database_size_gb', '>', 8, 0, ARRAY['email'], 'Database size approaching limit'),
    ('table_growth_spike', 'storage', 'warning', 'table_growth_percent', '>', 50, 60, ARRAY['email'], 'Table size grew by more than 50% in an hour')
ON CONFLICT (alert_name) DO UPDATE SET
    severity = EXCLUDED.severity,
    threshold_value = EXCLUDED.threshold_value,
    duration_minutes = EXCLUDED.duration_minutes,
    notification_channels = EXCLUDED.notification_channels,
    description = EXCLUDED.description;

-- ============================================
-- 3. ALERT HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS monitoring_alert_history (
    id SERIAL PRIMARY KEY,
    alert_config_id INTEGER REFERENCES monitoring_alert_config(id),
    alert_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'firing', -- 'firing', 'resolved', 'acknowledged'
    metric_value NUMERIC,
    threshold_value NUMERIC,
    message TEXT,
    details JSONB DEFAULT '{}',
    fired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_channels TEXT[]
);

-- Indexes for alert history
CREATE INDEX IF NOT EXISTS idx_alert_history_status ON monitoring_alert_history(status);
CREATE INDEX IF NOT EXISTS idx_alert_history_fired_at ON monitoring_alert_history(fired_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_history_config ON monitoring_alert_history(alert_config_id);

-- ============================================
-- 4. ALERT EVALUATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION evaluate_alerts()
RETURNS TABLE (
    alert_triggered BOOLEAN,
    alert_name TEXT,
    severity TEXT,
    message TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC
) AS $$
DECLARE
    v_config RECORD;
    v_current_value NUMERIC;
    v_alert_id INTEGER;
    v_existing_alert INTEGER;
BEGIN
    FOR v_config IN 
        SELECT * FROM monitoring_alert_config WHERE enabled = TRUE
    LOOP
        v_current_value := NULL;
        
        -- Get current metric value based on metric_name
        CASE v_config.metric_name
            WHEN 'connection_usage_percent' THEN
                SELECT ROUND(100.0 * COUNT(*) / NULLIF((SELECT setting::int FROM pg_settings WHERE name = 'max_connections'), 0), 2)
                INTO v_current_value
                FROM pg_stat_activity;
                
            WHEN 'idle_in_transaction_count' THEN
                SELECT COUNT(*) INTO v_current_value
                FROM pg_stat_activity
                WHERE state = 'idle in transaction';
                
            WHEN 'long_idle_count' THEN
                SELECT COUNT(*) INTO v_current_value
                FROM pg_stat_activity
                WHERE state = 'idle'
                    AND NOW() - state_change > INTERVAL '10 minutes';
                    
            WHEN 'slow_query_count' THEN
                SELECT COUNT(*) INTO v_current_value
                FROM pg_stat_statements
                WHERE mean_exec_time > 1000 AND calls > 10;
                
            WHEN 'avg_query_time_ms' THEN
                SELECT AVG(mean_exec_time)::numeric INTO v_current_value
                FROM pg_stat_statements
                WHERE calls > 10;
                
            WHEN 'cache_hit_ratio' THEN
                SELECT ROUND(100 * SUM(heap_blks_hit)::numeric / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2)
                INTO v_current_value
                FROM pg_statio_user_tables;
                
            WHEN 'dead_tuple_ratio' THEN
                SELECT AVG(n_dead_tup::numeric / NULLIF(n_live_tup, 0)) * 100
                INTO v_current_value
                FROM pg_stat_user_tables
                WHERE n_live_tup > 0;
                
            WHEN 'errors_per_minute' THEN
                SELECT COUNT(*)::numeric / 5 INTO v_current_value
                FROM monitoring_error_logs
                WHERE created_at > NOW() - INTERVAL '5 minutes'
                    AND severity IN ('error', 'critical');
                    
            WHEN 'critical_error_count' THEN
                SELECT COUNT(*) INTO v_current_value
                FROM monitoring_error_logs
                WHERE severity = 'critical'
                    AND created_at > NOW() - INTERVAL '1 hour'
                    AND resolved_at IS NULL;
                    
            WHEN 'database_size_gb' THEN
                SELECT pg_database_size(current_database())::numeric / 1024 / 1024 / 1024
                INTO v_current_value;
        END CASE;
        
        -- Evaluate threshold condition
        IF v_current_value IS NOT NULL THEN
            IF (
                (v_config.threshold_operator = '>' AND v_current_value > v_config.threshold_value) OR
                (v_config.threshold_operator = '<' AND v_current_value < v_config.threshold_value) OR
                (v_config.threshold_operator = '>=' AND v_current_value >= v_config.threshold_value) OR
                (v_config.threshold_operator = '<=' AND v_current_value <= v_config.threshold_value) OR
                (v_config.threshold_operator = '=' AND v_current_value = v_config.threshold_value) OR
                (v_config.threshold_operator = '!=' AND v_current_value != v_config.threshold_value)
            ) THEN
                -- Check if alert already firing
                SELECT id INTO v_existing_alert
                FROM monitoring_alert_history
                WHERE alert_config_id = v_config.id
                    AND status = 'firing'
                    AND fired_at > NOW() - (v_config.duration_minutes || ' minutes')::interval;
                
                -- Only trigger if not already firing or duration has passed
                IF v_existing_alert IS NULL THEN
                    -- Insert new alert
                    INSERT INTO monitoring_alert_history (
                        alert_config_id,
                        alert_name,
                        severity,
                        metric_value,
                        threshold_value,
                        message,
                        details,
                        notification_channels
                    ) VALUES (
                        v_config.id,
                        v_config.alert_name,
                        v_config.severity,
                        v_current_value,
                        v_config.threshold_value,
                        v_config.description || ' (Current: ' || v_current_value || ', Threshold: ' || v_config.threshold_operator || ' ' || v_config.threshold_value || ')',
                        jsonb_build_object('metric_name', v_config.metric_name),
                        v_config.notification_channels
                    )
                    RETURNING id INTO v_alert_id;
                    
                    alert_triggered := TRUE;
                    alert_name := v_config.alert_name;
                    severity := v_config.severity;
                    message := v_config.description;
                    current_value := v_current_value;
                    threshold_value := v_config.threshold_value;
                    RETURN NEXT;
                END IF;
            ELSE
                -- Resolve any existing firing alerts for this config
                UPDATE monitoring_alert_history
                SET status = 'resolved',
                    resolved_at = NOW()
                WHERE alert_config_id = v_config.id
                    AND status = 'firing';
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ALERT MANAGEMENT FUNCTIONS
-- ============================================

-- Function to acknowledge an alert
CREATE OR REPLACE FUNCTION acknowledge_alert(
    p_alert_id INTEGER,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE monitoring_alert_history
    SET status = 'acknowledged',
        acknowledged_at = NOW(),
        acknowledged_by = COALESCE(p_user_id, auth.uid())
    WHERE id = p_alert_id
        AND status = 'firing';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to silence an alert
CREATE OR REPLACE FUNCTION silence_alert(
    p_alert_name TEXT,
    p_duration_minutes INTEGER DEFAULT 60
)
RETURNS void AS $$
BEGIN
    UPDATE monitoring_alert_config
    SET enabled = FALSE,
        updated_at = NOW()
    WHERE alert_name = p_alert_name;
    
    -- Schedule re-enable (requires pg_cron extension)
    -- This is a placeholder - actual implementation depends on your scheduling setup
    PERFORM log_error(
        'alert_silenced',
        'Alert ' || p_alert_name || ' silenced for ' || p_duration_minutes || ' minutes',
        'info'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get active alerts
CREATE OR REPLACE FUNCTION get_active_alerts()
RETURNS TABLE (
    alert_id INTEGER,
    alert_name TEXT,
    severity TEXT,
    status TEXT,
    message TEXT,
    metric_value NUMERIC,
    threshold_value NUMERIC,
    fired_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.alert_name,
        h.severity,
        h.status,
        h.message,
        h.metric_value,
        h.threshold_value,
        h.fired_at,
        EXTRACT(EPOCH FROM (NOW() - h.fired_at))::integer / 60
    FROM monitoring_alert_history h
    WHERE h.status IN ('firing', 'acknowledged')
    ORDER BY 
        CASE h.severity 
            WHEN 'critical' THEN 1 
            WHEN 'warning' THEN 2 
            ELSE 3 
        END,
        h.fired_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. ALERT NOTIFICATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION send_alert_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Log notification attempt
    INSERT INTO monitoring_error_logs (
        error_type,
        severity,
        error_message,
        metadata
    ) VALUES (
        'alert_notification',
        NEW.severity,
        'Alert triggered: ' || NEW.alert_name,
        jsonb_build_object(
            'alert_id', NEW.id,
            'alert_name', NEW.alert_name,
            'severity', NEW.severity,
            'metric_value', NEW.metric_value,
            'threshold_value', NEW.threshold_value,
            'channels', NEW.notification_channels
        )
    );
    
    -- Mark as notification sent
    NEW.notification_sent := TRUE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for notifications
DROP TRIGGER IF EXISTS trigger_alert_notification ON monitoring_alert_history;
CREATE TRIGGER trigger_alert_notification
    AFTER INSERT ON monitoring_alert_history
    FOR EACH ROW
    EXECUTE FUNCTION send_alert_notification();

-- ============================================
-- 7. ALERT SUMMARY VIEWS
-- ============================================

-- Active alerts summary
CREATE OR REPLACE VIEW monitoring_active_alerts_summary AS
SELECT 
    severity,
    COUNT(*) AS alert_count,
    MIN(fired_at) AS oldest_alert,
    MAX(fired_at) AS newest_alert,
    jsonb_agg(jsonb_build_object(
        'id', id,
        'name', alert_name,
        'message', message,
        'metric_value', metric_value,
        'fired_at', fired_at
    )) AS alerts
FROM monitoring_alert_history
WHERE status IN ('firing', 'acknowledged')
GROUP BY severity
ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'warning' THEN 2 
        ELSE 3 
    END;

-- Alert history summary
CREATE OR REPLACE VIEW monitoring_alert_history_summary AS
SELECT 
    DATE(fired_at) AS date,
    alert_name,
    severity,
    COUNT(*) AS trigger_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - fired_at)))::integer / 60 AS avg_duration_minutes
FROM monitoring_alert_history
WHERE fired_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(fired_at), alert_name, severity
ORDER BY date DESC, trigger_count DESC;

-- Alert configuration view
CREATE OR REPLACE VIEW monitoring_alert_config_view AS
SELECT 
    alert_name,
    alert_type,
    severity,
    metric_name,
    threshold_operator || ' ' || threshold_value AS threshold,
    duration_minutes,
    enabled,
    notification_channels,
    description
FROM monitoring_alert_config
ORDER BY alert_type, severity;
