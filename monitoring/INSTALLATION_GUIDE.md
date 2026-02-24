# Sandstone Monitoring - Installation Guide

## Prerequisites

- Supabase project with PostgreSQL database
- Next.js application with Supabase client configured
- Node.js 18+ and npm/yarn

## Step 1: Database Setup

### 1.1 Run SQL Setup Files

Execute the following SQL files in your Supabase SQL Editor (in order):

```sql
-- 1. Database Performance Monitoring
\i 01_database_performance.sql

-- 2. Query Performance Monitoring
\i 02_query_performance.sql

-- 3. Connection Monitoring
\i 03_connection_monitoring.sql

-- 4. Error Tracking
\i 04_error_tracking.sql

-- 5. Dashboard Queries
\i 05_dashboard_queries.sql

-- 6. Alerting Thresholds
\i 06_alerting_thresholds.sql

-- 7. Health Check Functions
\i health-check-database.sql

-- 8. Complete Setup
\i setup-monitoring.sql
```

Or run the complete setup:
```sql
\i setup-monitoring.sql
```

### 1.2 Verify Setup

```sql
-- Check health
SELECT * FROM health_check();

-- Get monitoring summary
SELECT * FROM get_monitoring_summary();

-- Check views were created
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' AND table_name LIKE 'monitoring_%';
```

## Step 2: API Routes Setup

### 2.1 Create Health Check Endpoints

Create the following files in your Next.js app:

```bash
# Create directories
mkdir -p app/api/health/detailed
mkdir -p app/api/health/ready
mkdir -p app/api/health/live
mkdir -p app/api/monitoring/dashboard
mkdir -p app/api/monitoring/alerts

# Copy files
cp app-api-health-route.ts app/api/health/route.ts
cp app-api-health-detailed-route.ts app/api/health/detailed/route.ts
cp app-api-readiness-liveness.ts app/api/health/ready/route.ts
cp app-api-readiness-liveness.ts app/api/health/live/route.ts
cp app-api-dashboard-route.ts app/api/monitoring/dashboard/route.ts
cp app-api-alerts-route.ts app/api/monitoring/alerts/route.ts
```

**Note:** You'll need to split `app-api-readiness-liveness.ts` into two separate files:

**app/api/health/ready/route.ts:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('readiness_check');
    
    if (error || !data?.ready) {
      return NextResponse.json({ ready: false }, { status: 503 });
    }
    
    return NextResponse.json({ ready: true });
  } catch (error) {
    return NextResponse.json({ ready: false }, { status: 503 });
  }
}
```

**app/api/health/live/route.ts:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc('liveness_check');
    
    if (!data) {
      return NextResponse.json({ alive: false }, { status: 503 });
    }
    
    return NextResponse.json({ alive: true });
  } catch (error) {
    return NextResponse.json({ alive: false }, { status: 503 });
  }
}
```

### 2.2 Test Endpoints

```bash
# Test basic health
curl http://localhost:3000/api/health

# Test detailed health
curl http://localhost:3000/api/health/detailed

# Test readiness
curl http://localhost:3000/api/health/ready

# Test liveness
curl http://localhost:3000/api/health/live

# Test metrics (Prometheus format)
curl http://localhost:3000/api/health/metrics
```

## Step 3: Dashboard Component

### 3.1 Install Dependencies

```bash
npm install recharts date-fns
```

### 3.2 Create Dashboard Component

Copy `MonitoringDashboard.tsx` to your components folder:

```bash
mkdir -p components/monitoring
cp MonitoringDashboard.tsx components/monitoring/
```

### 3.3 Create Dashboard Page

Create `app/monitoring/page.tsx`:

```typescript
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <MonitoringDashboard />
    </div>
  );
}
```

### 3.4 Add Navigation Link

Add to your navigation or admin panel:

```typescript
<Link href="/monitoring">Database Monitoring</Link>
```

## Step 4: Environment Variables

Add to your `.env.local`:

```env
# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_API_KEY=your-secure-api-key

# Alert Notifications (optional)
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_FROM=alerts@sandstone.app
ALERT_EMAIL_TO=admin@sandstone.app

ALERT_SLACK_ENABLED=true
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...

ALERT_PAGERDUTY_ENABLED=false
ALERT_PAGERDUTY_KEY=your-pagerduty-key
```

## Step 5: Scheduled Monitoring

### 5.1 Using Supabase Cron (Recommended)

Enable pg_cron extension and schedule monitoring:

```sql
-- Enable cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule monitoring capture every 5 minutes
SELECT cron.schedule('monitoring-capture', '*/5 * * * *', 'SELECT run_monitoring_capture()');

-- Schedule daily cleanup
SELECT cron.schedule('monitoring-cleanup', '0 2 * * *', 
    'DELETE FROM monitoring_error_logs WHERE created_at < NOW() - INTERVAL ''90 days'';
     DELETE FROM monitoring_connection_history WHERE recorded_at < NOW() - INTERVAL ''30 days'';');

-- View scheduled jobs
SELECT * FROM cron.job;

-- Unschedule if needed
-- SELECT cron.unschedule('monitoring-capture');
```

### 5.2 Using External Scheduler

If pg_cron is not available, use an external scheduler:

**Vercel Cron Jobs (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/monitoring/capture",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Create `app/api/monitoring/capture/route.ts`:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    await supabase.rpc('run_monitoring_capture');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## Step 6: External Monitoring Integration

### 6.1 Datadog Integration

1. Install Datadog agent
2. Configure PostgreSQL integration:

```yaml
# datadog/conf.d/postgres.d/conf.yaml
init_config:

instances:
  - host: your-project.supabase.co
    port: 5432
    username: datadog
    password: <PASSWORD>
    dbname: postgres
    ssl: require
```

### 6.2 Grafana Cloud Integration

1. Sign up for Grafana Cloud
2. Add PostgreSQL data source
3. Import the dashboard JSON from `grafana-dashboard.json`

### 6.3 Local Grafana Setup

```bash
# Start local monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana at http://localhost:3001
# Default credentials: admin/admin
```

## Step 7: Alert Configuration

### 7.1 Configure Alert Channels

Update `alert-config.yaml` with your notification settings:

```yaml
notification_channels:
  slack:
    enabled: true
    webhook_url: ${SLACK_WEBHOOK_URL}
    
  email:
    enabled: true
    smtp_server: smtp.gmail.com
    from_address: alerts@sandstone.app
    to_addresses:
      - admin@sandstone.app
```

### 7.2 Customize Alert Thresholds

```sql
-- Update existing alert threshold
UPDATE monitoring_alert_config 
SET threshold_value = 80 
WHERE alert_name = 'high_connection_usage';

-- Add custom alert
INSERT INTO monitoring_alert_config (
    alert_name, alert_type, severity, metric_name,
    threshold_operator, threshold_value, description
) VALUES (
    'custom_metric_alert', 'performance', 'warning',
    'custom_metric', '>', 100, 'Custom alert'
);
```

## Step 8: Security

### 8.1 Restrict Monitoring Access

Add middleware to protect monitoring endpoints:

```typescript
// middleware.ts or app/api/monitoring/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for API key or admin role
  const apiKey = request.headers.get('x-api-key');
  
  if (apiKey !== process.env.MONITORING_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/monitoring/:path*'
};
```

### 8.2 Row Level Security

Ensure monitoring tables have appropriate RLS:

```sql
-- Enable RLS on monitoring tables
ALTER TABLE monitoring_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alert_history ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view
CREATE POLICY "Only admins can view error logs"
ON monitoring_error_logs FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM admin_users));
```

## Step 9: Verification

### 9.1 Test All Components

```bash
# 1. Test health endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/detailed

# 2. Test dashboard API
curl http://localhost:3000/api/monitoring/dashboard

# 3. Test alerts API
curl http://localhost:3000/api/monitoring/alerts

# 4. Verify database functions
psql $DATABASE_URL -c "SELECT * FROM health_check();"
psql $DATABASE_URL -c "SELECT * FROM get_monitoring_summary();"
```

### 9.2 Verify Data Collection

```sql
-- Check if data is being collected
SELECT COUNT(*) FROM monitoring_connection_history;
SELECT COUNT(*) FROM monitoring_error_logs;
SELECT * FROM monitoring_alert_history LIMIT 5;
```

## Step 10: Troubleshooting

### Common Issues

**1. pg_stat_statements not available**
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

**2. Permission denied on functions**
```sql
-- Grant execute permissions
GRANT EXECUTE ON FUNCTION health_check() TO authenticated;
```

**3. Health check returns 503**
- Check database connection
- Verify Supabase URL and key
- Check function exists: `SELECT * FROM health_check();`

**4. No data in monitoring tables**
- Verify scheduled job is running
- Run manually: `SELECT run_monitoring_capture();`
- Check for errors in `monitoring_error_logs`

## Next Steps

1. **Set up alerting** - Configure Slack/Email notifications
2. **Create custom dashboards** - Build Grafana dashboards for your needs
3. **Add custom metrics** - Track business-specific metrics
4. **Set up SLOs** - Define service level objectives
5. **Document runbooks** - Create procedures for common issues

## Support

For issues or questions:
- Check the troubleshooting section above
- Review logs in `monitoring_error_logs`
- Run `SELECT get_monitoring_summary()` for quick diagnostics
