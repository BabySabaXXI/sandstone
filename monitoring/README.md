# Sandstone Database Monitoring Setup

Complete monitoring solution for the Sandstone application's Supabase PostgreSQL database.

## Overview

This monitoring setup provides:
- **Database Performance Monitoring** - Table sizes, index usage, cache hit ratios
- **Query Performance Tracking** - Slow queries, execution times, query plans
- **Connection Monitoring** - Pool usage, idle connections, blocking queries
- **Error Tracking** - Comprehensive error logging and analysis
- **Health Check Endpoints** - REST API endpoints for health monitoring
- **Dashboard Queries** - Pre-built views for monitoring dashboards
- **Alerting System** - Configurable alerts with thresholds

## Quick Start

### 1. Run the Setup Script

Execute the setup script in your Supabase SQL Editor:

```sql
-- Run files in order
\i 01_database_performance.sql
\i 02_query_performance.sql
\i 03_connection_monitoring.sql
\i 04_error_tracking.sql
\i 05_dashboard_queries.sql
\i 06_alerting_thresholds.sql
\i health-check-database.sql
\i setup-monitoring.sql
```

Or use the Supabase Dashboard SQL Editor and run each file.

### 2. Add Health Check Endpoints

Copy the health check API routes to your Next.js app:

```bash
# Copy health check routes
cp app-api-health-route.ts app/api/health/route.ts
cp app-api-health-detailed-route.ts app/api/health/detailed/route.ts
```

### 3. Configure Environment Variables

Add to your `.env.local`:

```env
# Monitoring
MONITORING_ENABLED=true
ALERT_EMAIL_ENABLED=true
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/...
```

## Files Overview

| File | Description |
|------|-------------|
| `01_database_performance.sql` | Table sizes, index usage, bloat monitoring |
| `02_query_performance.sql` | Slow queries, execution stats, query plans |
| `03_connection_monitoring.sql` | Connection pool, idle connections |
| `04_error_tracking.sql` | Error logging, error analysis |
| `05_dashboard_queries.sql` | Dashboard views and API functions |
| `06_alerting_thresholds.sql` | Alert rules and thresholds |
| `health-check-database.sql` | Database health check functions |
| `setup-monitoring.sql` | Complete setup script |
| `alert-config.yaml` | External alert configuration |

## Health Check Endpoints

### Basic Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": { "status": "healthy", "responseTime": 45 },
    "connectionPool": { "status": "healthy", "usagePercent": 25 },
    "auth": { "status": "healthy" }
  }
}
```

### Detailed Health Report
```
GET /api/health/detailed
```

### Readiness Probe
```
GET /api/health/ready
```

### Liveness Probe
```
GET /api/health/live
```

### Prometheus Metrics
```
GET /api/health/metrics
```

## Key Monitoring Views

### Database Overview
```sql
SELECT * FROM dashboard_overview;
```

### Real-time Metrics
```sql
SELECT * FROM dashboard_realtime_metrics;
```

### Connection Status
```sql
SELECT * FROM monitoring_connection_dashboard;
```

### Active Alerts
```sql
SELECT * FROM get_active_alerts();
```

### Error Summary
```sql
SELECT * FROM monitoring_error_summary;
```

## Alert Configuration

### Default Alert Thresholds

| Alert | Metric | Threshold | Severity |
|-------|--------|-----------|----------|
| high_connection_usage | connection_usage_percent | > 70% | warning |
| critical_connection_usage | connection_usage_percent | > 90% | critical |
| slow_query_detected | slow_query_count | > 5 | warning |
| high_avg_query_time | avg_query_time_ms | > 500 | warning |
| critical_query_time | avg_query_time_ms | > 1000 | critical |
| low_cache_hit_ratio | cache_hit_ratio | < 95% | warning |
| error_rate_high | errors_per_minute | > 10 | warning |
| critical_errors | critical_error_count | > 0 | critical |

### Customizing Alerts

```sql
-- Add custom alert
INSERT INTO monitoring_alert_config (
    alert_name, alert_type, severity, metric_name, 
    threshold_operator, threshold_value, description
) VALUES (
    'custom_alert', 'performance', 'warning', 'custom_metric',
    '>', 100, 'Custom alert description'
);

-- Disable an alert
UPDATE monitoring_alert_config 
SET enabled = false 
WHERE alert_name = 'alert_name';

-- Update threshold
UPDATE monitoring_alert_config 
SET threshold_value = 50 
WHERE alert_name = 'high_connection_usage';
```

## Scheduled Monitoring

### Using pg_cron (if available)

```sql
-- Capture metrics every 5 minutes
SELECT cron.schedule('monitoring-capture', '*/5 * * * *', 'SELECT run_monitoring_capture()');

-- Clean up old data daily
SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 
    'DELETE FROM monitoring_error_logs WHERE created_at < NOW() - INTERVAL ''90 days''');
```

### Using External Scheduler

Set up a cron job or scheduled function to call:
```sql
SELECT run_monitoring_capture();
```

## Error Tracking

### Log an Error

```sql
SELECT log_error(
    'error_type',
    'Error message description',
    'error',  -- severity
    'ERR001', -- error_code
    'table_name',
    'INSERT', -- operation
    'SELECT * FROM...', -- query_preview
    'user_uuid'::uuid,
    '{"key": "value"}'::jsonb
);
```

### View Recent Errors

```sql
SELECT * FROM monitoring_recent_errors;
```

### Error Statistics

```sql
SELECT * FROM monitoring_error_summary;
```

## Dashboard Integration

### Grafana

Import the provided dashboard JSON or use these queries:

```sql
-- Connection usage over time
SELECT recorded_at, total_connections, active_connections 
FROM monitoring_connection_history 
WHERE recorded_at > NOW() - INTERVAL '24 hours';

-- Error count by hour
SELECT DATE_TRUNC('hour', created_at) AS hour, COUNT(*) 
FROM monitoring_error_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour;
```

### Datadog

Configure the PostgreSQL integration and use custom queries from the dashboard views.

## Performance Optimization

### Index Recommendations

```sql
-- Find missing indexes
SELECT * FROM monitoring_missing_indexes;

-- Find unused indexes
SELECT * FROM monitoring_unused_indexes;
```

### Table Maintenance

```sql
-- Check table bloat
SELECT * FROM monitoring_table_bloat;

-- Tables needing vacuum
SELECT * FROM monitoring_vacuum_needed;
```

## Troubleshooting

### High Connection Usage

```sql
-- Check current connections
SELECT * FROM monitoring_connection_dashboard;

-- Find idle connections
SELECT * FROM monitoring_long_idle_connections;

-- Terminate idle connections (use with caution)
SELECT * FROM terminate_idle_connections(30);
```

### Slow Queries

```sql
-- Top slow queries
SELECT * FROM monitoring_slow_queries;

-- Queries by average time
SELECT * FROM monitoring_high_avg_time_queries;

-- Long running queries
SELECT * FROM monitoring_long_running_queries;
```

### Blocking Queries

```sql
-- Check for blocking queries
SELECT * FROM monitoring_blocking_queries;
```

## Security Considerations

1. **Restrict access** to monitoring functions to admin users only
2. **Sanitize query previews** in error logs (avoid logging sensitive data)
3. **Rotate credentials** used for monitoring access
4. **Encrypt notification channels** (use HTTPS webhooks, TLS for email)

## Maintenance

### Data Retention

```sql
-- Clean up old error logs (keep 90 days)
DELETE FROM monitoring_error_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up old connection history (keep 30 days)
DELETE FROM monitoring_connection_history 
WHERE recorded_at < NOW() - INTERVAL '30 days';

-- Clean up old alert history (keep 180 days)
DELETE FROM monitoring_alert_history 
WHERE fired_at < NOW() - INTERVAL '180 days';
```

### Reset Statistics

```sql
-- Reset query statistics (use with caution)
SELECT reset_query_stats();
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the views in `dashboard_*` for relevant metrics
3. Check `monitoring_error_logs` for system errors
4. Run `SELECT get_monitoring_summary()` for a quick overview

## License

MIT License - Part of the Sandstone project
