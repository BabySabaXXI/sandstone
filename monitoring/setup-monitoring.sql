-- ============================================
-- SANDSTONE MONITORING SETUP SCRIPT
-- ============================================
-- Run this script to set up complete monitoring for Sandstone database
-- Execute in Supabase SQL Editor or via psql

-- ============================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================
-- STEP 2: CREATE MONITORING SCHEMA
-- ============================================

-- Create a dedicated schema for monitoring objects (optional)
-- CREATE SCHEMA IF NOT EXISTS monitoring;

-- ============================================
-- STEP 3: RUN ALL MONITORING SETUP FILES
-- ============================================

-- Note: In production, run each file separately in order:
-- 1. 01_database_performance.sql
-- 2. 02_query_performance.sql
-- 3. 03_connection_monitoring.sql
-- 4. 04_error_tracking.sql
-- 5. 05_dashboard_queries.sql
-- 6. 06_alerting_thresholds.sql
-- 7. health-check-database.sql

-- ============================================
-- STEP 4: CREATE HELPER FUNCTIONS
-- ============================================

-- Function to reset pg_stat_statements (for maintenance)
CREATE OR REPLACE FUNCTION reset_query_stats()
RETURNS void AS $$
BEGIN
    PERFORM pg_stat_statements_reset();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monitoring summary
CREATE OR REPLACE FUNCTION get_monitoring_summary()
RETURNS jsonb AS $$
DECLARE
    v_summary jsonb;
BEGIN
    SELECT jsonb_build_object(
        'database', jsonb_build_object(
            'name', current_database(),
            'size', pg_size_pretty(pg_database_size(current_database())),
            'version', version()
        ),
        'connections', (
            SELECT jsonb_build_object(
                'total', COUNT(*),
                'active', COUNT(*) FILTER (WHERE state = 'active'),
                'idle', COUNT(*) FILTER (WHERE state = 'idle'),
                'max', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections')
            )
            FROM pg_stat_activity
        ),
        'performance', (
            SELECT jsonb_build_object(
                'cache_hit_ratio', ROUND(100 * SUM(heap_blks_hit)::numeric / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0), 2),
                'table_scans', SUM(seq_scan),
                'index_scans', SUM(idx_scan)
            )
            FROM pg_statio_user_tables
        ),
        'tables', (
            SELECT jsonb_agg(jsonb_build_object(
                'name', relname,
                'rows', n_live_tup,
                'size', pg_size_pretty(pg_total_relation_size(relid))
            ) ORDER BY pg_total_relation_size(relid) DESC)
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            LIMIT 10
        ),
        'errors_last_24h', (
            SELECT COUNT(*) FROM monitoring_error_logs 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        ),
        'slow_queries', (
            SELECT COUNT(*) FROM pg_stat_statements 
            WHERE mean_exec_time > 1000 AND calls > 10
        )
    ) INTO v_summary;

    RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 5: SETUP AUTOMATED MONITORING
-- ============================================

-- Create a table to track monitoring job runs
CREATE TABLE IF NOT EXISTS monitoring_job_runs (
    id SERIAL PRIMARY KEY,
    job_name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'running', -- 'running', 'success', 'failed'
    error_message TEXT,
    records_processed INTEGER
);

-- Function to run periodic monitoring capture
CREATE OR REPLACE FUNCTION run_monitoring_capture()
RETURNS void AS $$
DECLARE
    v_job_id INTEGER;
BEGIN
    -- Log job start
    INSERT INTO monitoring_job_runs (job_name, status)
    VALUES ('monitoring_capture', 'running')
    RETURNING id INTO v_job_id;

    BEGIN
        -- Capture connection stats
        PERFORM capture_connection_stats();
        
        -- Capture table sizes
        PERFORM capture_table_sizes();
        
        -- Capture query performance
        PERFORM capture_query_performance();
        
        -- Capture statement errors
        PERFORM capture_statement_errors();
        
        -- Evaluate alerts
        PERFORM evaluate_alerts();

        -- Update job as successful
        UPDATE monitoring_job_runs
        SET status = 'success',
            completed_at = NOW()
        WHERE id = v_job_id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Update job as failed
        UPDATE monitoring_job_runs
        SET status = 'failed',
            completed_at = NOW(),
            error_message = SQLERRM
        WHERE id = v_job_id;
        
        -- Log the error
        PERFORM log_error(
            'monitoring_capture_failed',
            SQLERRM,
            'error',
            SQLSTATE
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users (adjust as needed)
GRANT EXECUTE ON FUNCTION health_check() TO authenticated;
GRANT EXECUTE ON FUNCTION health_check_detailed() TO authenticated;
GRANT EXECUTE ON FUNCTION get_connection_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monitoring_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_health_report() TO authenticated;
GRANT EXECUTE ON FUNCTION readiness_check() TO authenticated;
GRANT EXECUTE ON FUNCTION liveness_check() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_alerts() TO authenticated;

-- ============================================
-- STEP 7: INITIAL DATA CAPTURE
-- ============================================

-- Run initial captures
SELECT capture_connection_stats();
SELECT capture_table_sizes();

-- ============================================
-- STEP 8: VERIFICATION
-- ============================================

-- Verify setup by running health check
DO $$
DECLARE
    v_health jsonb;
BEGIN
    v_health := health_check_detailed();
    RAISE NOTICE 'Health check result: %', v_health;
END;
$$;

-- Print setup completion message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SANDSTONE MONITORING SETUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Created objects:';
    RAISE NOTICE '  - Views: 20+ monitoring views';
    RAISE NOTICE '  - Tables: monitoring_error_logs, monitoring_alert_history, etc.';
    RAISE NOTICE '  - Functions: 30+ monitoring functions';
    RAISE NOTICE '  - Alerts: 15+ pre-configured alert rules';
    RAISE NOTICE '';
    RAISE NOTICE 'Health check endpoints:';
    RAISE NOTICE '  - /api/health - Basic health check';
    RAISE NOTICE '  - /api/health/detailed - Detailed health report';
    RAISE NOTICE '  - /api/health/ready - Readiness probe';
    RAISE NOTICE '  - /api/health/live - Liveness probe';
    RAISE NOTICE '  - /api/health/metrics - Prometheus metrics';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Set up scheduled job for monitoring_capture()';
    RAISE NOTICE '  2. Configure notification channels';
    RAISE NOTICE '  3. Add health check endpoints to your app';
    RAISE NOTICE '  4. Set up external monitoring (Datadog, Grafana, etc.)';
    RAISE NOTICE '========================================';
END;
$$;
