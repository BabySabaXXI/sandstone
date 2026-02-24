// ============================================
// SANDSTONE HEALTH CHECK ENDPOINTS
// ============================================
// Add these files to your Next.js app

// ============================================
// FILE: app/api/health/route.ts
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      message?: string;
    };
    connectionPool: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      activeConnections: number;
      maxConnections: number;
      usagePercent: number;
      message?: string;
    };
    auth: {
      status: 'healthy' | 'unhealthy';
      message?: string;
    };
    storage?: {
      status: 'healthy' | 'unhealthy';
      message?: string;
    };
  };
  version: string;
  environment: string;
}

export async function GET() {
  const startTime = Date.now();
  const results: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'healthy', responseTime: 0 },
      connectionPool: { status: 'healthy', activeConnections: 0, maxConnections: 0, usagePercent: 0 },
      auth: { status: 'healthy' },
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    const supabase = await createClient();

    // Database health check
    const dbStartTime = Date.now();
    const { data: dbData, error: dbError } = await supabase
      .rpc('health_check');
    
    results.checks.database.responseTime = Date.now() - dbStartTime;
    
    if (dbError) {
      results.checks.database.status = 'unhealthy';
      results.checks.database.message = dbError.message;
      results.status = 'unhealthy';
    } else if (results.checks.database.responseTime > 5000) {
      results.checks.database.status = 'degraded';
      results.checks.database.message = 'Slow response time';
      if (results.status === 'healthy') results.status = 'degraded';
    }

    // Connection pool check
    const { data: connData, error: connError } = await supabase
      .rpc('get_connection_stats');
    
    if (connError) {
      results.checks.connectionPool.status = 'unhealthy';
      results.checks.connectionPool.message = connError.message;
      results.status = 'unhealthy';
    } else if (connData) {
      results.checks.connectionPool.activeConnections = connData.active_connections || 0;
      results.checks.connectionPool.maxConnections = connData.max_connections || 100;
      results.checks.connectionPool.usagePercent = Math.round(
        (results.checks.connectionPool.activeConnections / results.checks.connectionPool.maxConnections) * 100
      );

      if (results.checks.connectionPool.usagePercent > 90) {
        results.checks.connectionPool.status = 'unhealthy';
        results.checks.connectionPool.message = 'Connection pool near capacity';
        results.status = 'unhealthy';
      } else if (results.checks.connectionPool.usagePercent > 70) {
        results.checks.connectionPool.status = 'degraded';
        results.checks.connectionPool.message = 'Connection pool usage high';
        if (results.status === 'healthy') results.status = 'degraded';
      }
    }

    // Auth service check
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      results.checks.auth.status = 'unhealthy';
      results.checks.auth.message = authError.message;
      results.status = 'unhealthy';
    }

  } catch (error) {
    results.status = 'unhealthy';
    results.checks.database.status = 'unhealthy';
    results.checks.database.message = error instanceof Error ? error.message : 'Unknown error';
  }

  const statusCode = results.status === 'healthy' ? 200 : results.status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(results, { status: statusCode });
}
