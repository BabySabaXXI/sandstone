// ============================================
// FILE: app/api/health/ready/route.ts
// Readiness Probe - Check if app is ready to receive traffic
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check database readiness
    const { data: readyData, error: readyError } = await supabase.rpc('readiness_check');

    if (readyError || !readyData?.ready) {
      return NextResponse.json(
        { 
          ready: false,
          reason: readyError?.message || 'Database not ready',
          checks: readyData?.checks || {},
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        ready: true,
        checks: readyData.checks,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        ready: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

// ============================================
// FILE: app/api/health/live/route.ts
// Liveness Probe - Check if app is alive
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Simple liveness check
    const { data: alive, error } = await supabase.rpc('liveness_check');

    if (error || !alive) {
      return NextResponse.json(
        { 
          alive: false,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        alive: true,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { 
        alive: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

// ============================================
// FILE: app/api/health/metrics/route.ts
// Prometheus-style metrics endpoint
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get connection stats
    const { data: connStats } = await supabase.rpc('get_connection_stats');
    
    // Get performance stats
    const { data: perfStats } = await supabase.rpc('check_performance_health');

    // Get error stats
    const { data: errorStats } = await supabase
      .from('monitoring_error_logs')
      .select('severity')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const criticalErrors = errorStats?.filter(e => e.severity === 'critical').length || 0;
    const totalErrors = errorStats?.length || 0;

    // Build Prometheus-style metrics
    const metrics = [
      '# HELP sandstone_db_connections_total Total database connections',
      '# TYPE sandstone_db_connections_total gauge',
      `sandstone_db_connections_total{state="total"} ${connStats?.total_connections || 0}`,
      `sandstone_db_connections_total{state="active"} ${connStats?.active_connections || 0}`,
      `sandstone_db_connections_total{state="idle"} ${connStats?.idle_connections || 0}`,
      `sandstone_db_connections_total{state="idle_in_transaction"} ${connStats?.idle_in_transaction || 0}`,
      '',
      '# HELP sandstone_db_connections_max Maximum allowed connections',
      '# TYPE sandstone_db_connections_max gauge',
      `sandstone_db_connections_max ${connStats?.max_connections || 100}`,
      '',
      '# HELP sandstone_db_connection_usage_percent Connection pool usage percentage',
      '# TYPE sandstone_db_connection_usage_percent gauge',
      `sandstone_db_connection_usage_percent ${connStats ? 
        Math.round((connStats.total_connections / connStats.max_connections) * 100) : 0}`,
      '',
      '# HELP sandstone_query_performance_avg_time_ms Average query execution time',
      '# TYPE sandstone_query_performance_avg_time_ms gauge',
      `sandstone_query_performance_avg_time_ms ${perfStats?.avg_query_time_ms || 0}`,
      '',
      '# HELP sandstone_query_performance_slow_queries Number of slow queries',
      '# TYPE sandstone_query_performance_slow_queries gauge',
      `sandstone_query_performance_slow_queries ${perfStats?.slow_queries || 0}`,
      '',
      '# HELP sandstone_query_performance_cache_hit_ratio Cache hit ratio percentage',
      '# TYPE sandstone_query_performance_cache_hit_ratio gauge',
      `sandstone_query_performance_cache_hit_ratio ${perfStats?.cache_hit_ratio || 0}`,
      '',
      '# HELP sandstone_errors_total Total errors in last 24h',
      '# TYPE sandstone_errors_total gauge',
      `sandstone_errors_total ${totalErrors}`,
      '',
      '# HELP sandstone_errors_critical Critical errors in last 24h',
      '# TYPE sandstone_errors_critical gauge',
      `sandstone_errors_critical ${criticalErrors}`,
      '',
      '# HELP sandstone_health_status Health status (1=healthy, 0=unhealthy)',
      '# TYPE sandstone_health_status gauge',
      `sandstone_health_status ${perfStats?.status === 'healthy' ? 1 : 0}`,
    ].join('\n');

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}
