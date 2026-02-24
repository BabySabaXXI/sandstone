// ============================================
// FILE: app/api/health/detailed/route.ts
// Place in: app/api/health/detailed/route.ts
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface DetailedHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: string;
      responseTime: number;
      version: string;
      name: string;
    };
    connections: {
      status: string;
      total: number;
      active: number;
      idle: number;
      idleInTransaction: number;
      max: number;
      usagePercent: number;
    };
    performance: {
      status: string;
      slowQueries: number;
      avgQueryTime: number;
      cacheHitRatio: number;
    };
    tables: Array<{
      name: string;
      rows: number;
      deadTupleRatio: number;
      status: string;
    }>;
    errors: {
      last24h: number;
      critical: number;
      unresolved: number;
    };
  };
  metadata: {
    version: string;
    environment: string;
    nodeVersion: string;
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();

    // Get comprehensive health report from database
    const { data: healthReport, error } = await supabase.rpc('generate_health_report');

    if (error) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    const responseTime = Date.now() - startTime;

    const result: DetailedHealthCheck = {
      status: healthReport.health?.status || 'unknown',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: healthReport.health?.checks?.database?.status || 'unknown',
          responseTime,
          version: healthReport.database?.version || 'unknown',
          name: healthReport.database?.name || 'unknown',
        },
        connections: {
          status: healthReport.health?.checks?.connections?.status || 'unknown',
          total: healthReport.connections?.total_connections || 0,
          active: healthReport.connections?.active_connections || 0,
          idle: healthReport.connections?.idle_connections || 0,
          idleInTransaction: healthReport.connections?.idle_in_transaction || 0,
          max: healthReport.connections?.max_connections || 100,
          usagePercent: Math.round(
            ((healthReport.connections?.total_connections || 0) / 
             (healthReport.connections?.max_connections || 100)) * 100
          ),
        },
        performance: {
          status: healthReport.performance?.status || 'unknown',
          slowQueries: healthReport.performance?.slow_queries || 0,
          avgQueryTime: healthReport.performance?.avg_query_time_ms || 0,
          cacheHitRatio: healthReport.performance?.cache_hit_ratio || 0,
        },
        tables: healthReport.tables || [],
        errors: {
          last24h: healthReport.errors?.last_24h || 0,
          critical: healthReport.errors?.critical || 0,
          unresolved: healthReport.errors?.unresolved || 0,
        },
      },
      metadata: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      },
    };

    const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;

    return NextResponse.json(result, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
