// ============================================
// FILE: app/api/health/route.ts
// Place in: app/api/health/route.ts
// ============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
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
    storage: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message?: string;
    };
  };
  version: string;
  environment: string;
}

// Simple in-memory uptime tracking
const startTime = Date.now();

export async function GET() {
  const requestStartTime = Date.now();
  
  const results: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: { status: 'healthy', responseTime: 0 },
      connectionPool: { status: 'healthy', activeConnections: 0, maxConnections: 0, usagePercent: 0 },
      auth: { status: 'healthy' },
      storage: { status: 'healthy' },
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    const supabase = await createClient();

    // ===== DATABASE HEALTH CHECK =====
    const dbStartTime = Date.now();
    const { error: dbError } = await supabase.rpc('health_check');
    
    results.checks.database.responseTime = Date.now() - dbStartTime;
    
    if (dbError) {
      results.checks.database.status = 'unhealthy';
      results.checks.database.message = dbError.message;
      results.status = 'unhealthy';
    } else if (results.checks.database.responseTime > 5000) {
      results.checks.database.status = 'degraded';
      results.checks.database.message = `Slow response time: ${results.checks.database.responseTime}ms`;
      if (results.status === 'healthy') results.status = 'degraded';
    }

    // ===== CONNECTION POOL CHECK =====
    const { data: connData, error: connError } = await supabase.rpc('get_connection_stats');
    
    if (connError) {
      results.checks.connectionPool.status = 'unhealthy';
      results.checks.connectionPool.message = connError.message;
      results.status = 'unhealthy';
    } else if (connData) {
      results.checks.connectionPool.activeConnections = connData.total_connections || 0;
      results.checks.connectionPool.maxConnections = connData.max_connections || 100;
      results.checks.connectionPool.usagePercent = Math.round(
        (results.checks.connectionPool.activeConnections / results.checks.connectionPool.maxConnections) * 100
      );

      if (results.checks.connectionPool.usagePercent > 90) {
        results.checks.connectionPool.status = 'unhealthy';
        results.checks.connectionPool.message = `Connection pool near capacity: ${results.checks.connectionPool.usagePercent}%`;
        results.status = 'unhealthy';
      } else if (results.checks.connectionPool.usagePercent > 70) {
        results.checks.connectionPool.status = 'degraded';
        results.checks.connectionPool.message = `Connection pool usage high: ${results.checks.connectionPool.usagePercent}%`;
        if (results.status === 'healthy') results.status = 'degraded';
      }
    }

    // ===== AUTH SERVICE CHECK =====
    const { error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      results.checks.auth.status = 'unhealthy';
      results.checks.auth.message = authError.message;
      results.status = 'unhealthy';
    }

    // ===== STORAGE CHECK =====
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      results.checks.storage.status = 'unhealthy';
      results.checks.storage.message = storageError.message;
      results.status = 'unhealthy';
    }

  } catch (error) {
    results.status = 'unhealthy';
    results.checks.database.status = 'unhealthy';
    results.checks.database.message = error instanceof Error ? error.message : 'Unknown error';
  }

  // Determine HTTP status code
  const statusCode = results.status === 'healthy' ? 200 : results.status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(results, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    }
  });
}
