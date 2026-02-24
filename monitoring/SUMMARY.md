# Sandstone Database Monitoring - Complete Setup Summary

## Overview

Complete monitoring solution for the Sandstone application's Supabase PostgreSQL database has been created.

## Created Files

### SQL Monitoring Files

| File | Path | Description |
|------|------|-------------|
| Database Performance | `/mnt/okcomputer/monitoring/01_database_performance.sql` | Table sizes, index usage, bloat, vacuum stats |
| Query Performance | `/mnt/okcomputer/monitoring/02_query_performance.sql` | Slow queries, execution stats, query plans |
| Connection Monitoring | `/mnt/okcomputer/monitoring/03_connection_monitoring.sql` | Pool usage, idle connections, blocking queries |
| Error Tracking | `/mnt/okcomputer/monitoring/04_error_tracking.sql` | Error logging, error analysis, notifications |
| Dashboard Queries | `/mnt/okcomputer/monitoring/05_dashboard_queries.sql` | Dashboard views and API functions |
| Alerting Thresholds | `/mnt/okcomputer/monitoring/06_alerting_thresholds.sql` | Alert rules and threshold configuration |
| Health Check DB Functions | `/mnt/okcomputer/monitoring/health-check-database.sql` | Database health check functions |
| Setup Script | `/mnt/okcomputer/monitoring/setup-monitoring.sql` | Complete setup script |

### API Route Files

| File | Path | Description |
|------|------|-------------|
| Health Check Route | `/mnt/okcomputer/monitoring/app-api-health-route.ts` | Basic health check endpoint |
| Detailed Health Route | `/mnt/okcomputer/monitoring/app-api-health-detailed-route.ts` | Detailed health report endpoint |
| Readiness/Liveness | `/mnt/okcomputer/monitoring/app-api-readiness-liveness.ts` | K8s probes endpoints |
| Dashboard API | `/mnt/okcomputer/monitoring/app-api-dashboard-route.ts` | Dashboard data API |
| Alerts API | `/mnt/okcomputer/monitoring/app-api-alerts-route.ts` | Alerts management API |

### Configuration Files

| File | Path | Description |
|------|------|-------------|
| Alert Config YAML | `/mnt/okcomputer/monitoring/alert-config.yaml` | External alert configuration |
| Prometheus Config | `/mnt/okcomputer/monitoring/prometheus.yml` | Prometheus scraping configuration |
| Grafana Datasource | `/mnt/okcomputer/monitoring/grafana-datasource.yml` | Grafana datasource config |
| Grafana Dashboard | `/mnt/okcomputer/monitoring/grafana-dashboard.json` | Pre-built Grafana dashboard |
| Docker Compose | `/mnt/okcomputer/monitoring/docker-compose.monitoring.yml` | Local monitoring stack |

### React Components

| File | Path | Description |
|------|------|-------------|
| Monitoring Dashboard | `/mnt/okcomputer/monitoring/MonitoringDashboard.tsx` | React dashboard component |

### Documentation

| File | Path | Description |
|------|------|-------------|
| README | `/mnt/okcomputer/monitoring/README.md` | Complete documentation |
| Installation Guide | `/mnt/okcomputer/monitoring/INSTALLATION_GUIDE.md` | Step-by-step installation |
| This Summary | `/mnt/okcomputer/monitoring/SUMMARY.md` | Setup summary |

## Key Features Implemented

### 1. Database Performance Monitoring
- Table size tracking with history
- Index usage analysis (used/unused indexes)
- Table bloat detection
- Vacuum and analyze monitoring
- Cache hit ratio tracking
- Lock monitoring
- Blocking query detection

### 2. Query Performance Monitoring
- Slow query identification (>1000ms)
- Query execution statistics
- Query plan analysis
- Long-running query detection
- Query error tracking
- pg_stat_statements integration

### 3. Connection Monitoring
- Connection pool usage tracking
- Active/idle connection counts
- Idle in transaction detection
- Connection history tracking
- Connection cleanup procedures
- Usage statistics by application/user

### 4. Error Tracking
- Comprehensive error logging table
- Error categorization by type/severity
- Error trend analysis
- User error tracking
- API error tracking
- RLS violation detection
- Alert notification system

### 5. Health Check Endpoints
- `/api/health` - Basic health status
- `/api/health/detailed` - Detailed health report
- `/api/health/ready` - Kubernetes readiness probe
- `/api/health/live` - Kubernetes liveness probe
- `/api/health/metrics` - Prometheus metrics endpoint

### 6. Dashboard Queries
- Real-time metrics view
- User activity tracking
- Feature usage analytics
- Performance dashboard
- Error dashboard
- Storage dashboard
- Overview dashboard

### 7. Alerting System
- 15+ pre-configured alert rules
- Configurable thresholds
- Multiple severity levels (info, warning, critical)
- Alert acknowledgment workflow
- Alert history tracking
- Notification channels (email, Slack, PagerDuty)

## Default Alert Thresholds

| Alert | Metric | Threshold | Severity |
|-------|--------|-----------|----------|
| high_connection_usage | connection_usage_percent | > 70% | warning |
| critical_connection_usage | connection_usage_percent | > 90% | critical |
| slow_query_detected | slow_query_count | > 5 | warning |
| high_avg_query_time | avg_query_time_ms | > 500 | warning |
| critical_query_time | avg_query_time_ms | > 1000 | critical |
| low_cache_hit_ratio | cache_hit_ratio | < 95% | warning |
| table_bloat_warning | dead_tuple_ratio | > 20% | warning |
| table_bloat_critical | dead_tuple_ratio | > 50% | critical |
| error_rate_high | errors_per_minute | > 10 | warning |
| critical_errors | critical_error_count | > 0 | critical |
| database_size_warning | database_size_gb | > 8 | warning |

## Key Database Functions

### Health Checks
- `health_check()` - Basic health check
- `health_check_detailed()` - Detailed health report
- `get_connection_stats()` - Connection statistics
- `readiness_check()` - Readiness probe
- `liveness_check()` - Liveness probe
- `generate_health_report()` - Complete health report

### Monitoring
- `get_monitoring_summary()` - Quick monitoring overview
- `get_dashboard_data(section)` - Dashboard data API
- `run_monitoring_capture()` - Automated data capture
- `capture_connection_stats()` - Capture connection stats
- `capture_table_sizes()` - Capture table sizes
- `capture_query_performance()` - Capture query stats

### Error Management
- `log_error(...)` - Log an error
- `get_active_alerts()` - Get active alerts
- `acknowledge_alert(id)` - Acknowledge an alert
- `evaluate_alerts()` - Evaluate alert thresholds

### Utilities
- `reset_query_stats()` - Reset pg_stat_statements
- `terminate_idle_connections(minutes)` - Cleanup idle connections
- `terminate_long_queries(seconds)` - Kill long-running queries

## Key Monitoring Views

### Overview
- `dashboard_overview` - System overview
- `monitoring_connection_dashboard` - Connection status
- `monitoring_table_sizes` - Table sizes
- `monitoring_cache_hit_ratio` - Cache statistics

### Performance
- `monitoring_slow_queries` - Slow queries
- `monitoring_high_avg_time_queries` - High avg time queries
- `monitoring_long_running_queries` - Long-running queries
- `monitoring_index_usage` - Index usage stats
- `monitoring_missing_indexes` - Missing index candidates

### Connections
- `monitoring_connection_summary` - Connection summary
- `monitoring_connections_by_app` - Connections by app
- `monitoring_idle_connections` - Idle connections
- `monitoring_long_idle_connections` - Long idle connections
- `monitoring_blocking_queries` - Blocking queries

### Errors
- `monitoring_recent_errors` - Recent errors
- `monitoring_error_summary` - Error summary
- `monitoring_error_trends` - Error trends
- `monitoring_errors_by_table` - Errors by table
- `monitoring_active_alerts_summary` - Active alerts

## Installation Steps

1. **Run SQL Setup**
   ```sql
   \i setup-monitoring.sql
   ```

2. **Add API Routes**
   - Copy health check routes to `app/api/health/`
   - Copy monitoring routes to `app/api/monitoring/`

3. **Add Dashboard Component**
   - Copy `MonitoringDashboard.tsx` to `components/monitoring/`
   - Create monitoring page at `app/monitoring/page.tsx`

4. **Configure Environment**
   - Add monitoring environment variables
   - Set up notification channels

5. **Set Up Scheduled Jobs**
   - Enable pg_cron extension
   - Schedule `run_monitoring_capture()` every 5 minutes

6. **Verify Setup**
   - Test health endpoints
   - Verify data collection
   - Check dashboard functionality

## Integration Options

### External Monitoring Tools
- **Datadog** - PostgreSQL integration
- **Grafana** - Import dashboard JSON
- **Prometheus** - Scrape metrics endpoint
- **New Relic** - Custom metrics
- **PagerDuty** - Alert routing

### Notification Channels
- Email (SMTP)
- Slack (Webhooks)
- PagerDuty (API)
- Custom Webhooks

## Next Steps

1. Deploy monitoring setup to production
2. Configure notification channels
3. Set up external monitoring (Grafana/Datadog)
4. Create custom dashboards
5. Define SLOs and SLIs
6. Document runbooks for common issues

## Support Resources

- Check `README.md` for detailed documentation
- See `INSTALLATION_GUIDE.md` for step-by-step setup
- Review `monitoring_error_logs` for system errors
- Run `SELECT get_monitoring_summary()` for quick diagnostics
