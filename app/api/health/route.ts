/**
 * Health Check API Route for Sandstone
 * Provides system status and diagnostics
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  success,
  withSecurityHeaders,
  withCache,
  generateRequestId,
} from "@/lib/api";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    auth: ServiceHealth;
    ai: ServiceHealth;
    storage: ServiceHealth;
  };
  metrics: {
    uptime: number;
    memory: MemoryMetrics;
  };
}

interface ServiceHealth {
  status: "up" | "down" | "degraded";
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
}

// App version - should match package.json
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";

// Start time for uptime calculation
const START_TIME = Date.now();

/**
 * GET handler - Health check
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();
  
  // Run health checks in parallel
  const [databaseHealth, authHealth, aiHealth, storageHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkAuthHealth(),
    checkAIHealth(),
    checkStorageHealth(),
  ]);

  // Determine overall status
  const services = {
    database: databaseHealth,
    auth: authHealth,
    ai: aiHealth,
    storage: storageHealth,
  };

  const failedServices = Object.values(services).filter(s => s.status === "down");
  const degradedServices = Object.values(services).filter(s => s.status === "degraded");

  let status: HealthCheck["status"] = "healthy";
  if (failedServices.length > 0) {
    status = "unhealthy";
  } else if (degradedServices.length > 0) {
    status = "degraded";
  }

  // Calculate memory metrics (if available)
  const memoryMetrics = getMemoryMetrics();

  const healthCheck: HealthCheck = {
    status,
    timestamp,
    version: APP_VERSION,
    environment: process.env.NODE_ENV || "development",
    services,
    metrics: {
      uptime: Date.now() - START_TIME,
      memory: memoryMetrics,
    },
  };

  const statusCode = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

  let response = success(healthCheck, statusCode, { requestId }, requestId);
  
  response = withSecurityHeaders(response);
  // Short cache for health checks
  response = withCache(response, { maxAge: 10, public: true });

  return response;
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    
    // Simple query to check connection
    const { error } = await supabase
      .from("profiles")
      .select("count", { count: "exact", head: true });

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: "down",
        responseTime,
        message: `Database error: ${error.message}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: responseTime > 1000 ? "degraded" : "up",
      responseTime,
      lastChecked: new Date().toISOString(),
    };

  } catch (error) {
    return {
      status: "down",
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check authentication service health
 */
async function checkAuthHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    
    // Check if auth is accessible
    const { error } = await supabase.auth.getSession();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: "down",
        responseTime,
        message: `Auth error: ${error.message}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: "up",
      responseTime,
      lastChecked: new Date().toISOString(),
    };

  } catch (error) {
    return {
      status: "down",
      message: `Auth service error: ${error instanceof Error ? error.message : "Unknown error"}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check AI service health
 */
async function checkAIHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const apiKey = process.env.KIMI_API_KEY;
    
    if (!apiKey) {
      return {
        status: "down",
        message: "Kimi API key not configured",
        lastChecked: new Date().toISOString(),
      };
    }

    // Simple check - verify API is reachable
    const response = await fetch("https://api.moonshot.cn/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: "down",
        responseTime,
        message: `AI API error: ${response.status} ${response.statusText}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: responseTime > 3000 ? "degraded" : "up",
      responseTime,
      lastChecked: new Date().toISOString(),
    };

  } catch (error) {
    return {
      status: "down",
      message: `AI service error: ${error instanceof Error ? error.message : "Unknown error"}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check storage service health
 */
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    
    // List buckets to check storage
    const { data: buckets, error } = await supabase.storage.listBuckets();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: "down",
        responseTime,
        message: `Storage error: ${error.message}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: "up",
      responseTime,
      message: `${buckets?.length || 0} buckets available`,
      lastChecked: new Date().toISOString(),
    };

  } catch (error) {
    return {
      status: "down",
      message: `Storage service error: ${error instanceof Error ? error.message : "Unknown error"}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Get memory metrics
 */
function getMemoryMetrics(): MemoryMetrics {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    const total = usage.heapTotal;
    const used = usage.heapUsed;
    
    return {
      used,
      total,
      percentage: Math.round((used / total) * 100),
    };
  }

  return {
    used: 0,
    total: 0,
    percentage: 0,
  };
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
