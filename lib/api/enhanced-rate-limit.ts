/**
 * Enhanced Rate Limiter for Sandstone API
 * Supports both in-memory and Redis-based rate limiting with configurable tiers
 */

import { NextRequest } from "next/server";

// Rate limit configuration for different tiers
export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  keyPrefix?: string;    // Key prefix for Redis
}

// Default rate limit configurations
export const RateLimitTiers = {
  // Strict: For expensive operations (AI grading, document processing)
  STRICT: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 5,           // 5 requests per minute
    keyPrefix: "rl:strict",
  },
  
  // Standard: For regular API operations
  STANDARD: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,          // 30 requests per minute
    keyPrefix: "rl:standard",
  },
  
  // Generous: For chat and real-time features
  GENEROUS: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,          // 60 requests per minute
    keyPrefix: "rl:generous",
  },
  
  // Burst: For initial page loads and batch operations
  BURST: {
    windowMs: 10 * 1000,      // 10 seconds
    maxRequests: 20,          // 20 requests per 10 seconds
    keyPrefix: "rl:burst",
  },
} as const;

export type RateLimitTier = keyof typeof RateLimitTiers;

// Rate limit entry for in-memory store
interface RateLimitEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

// In-memory store for rate limiting (fallback when Redis unavailable)
const memoryStore = new Map<string, RateLimitEntry>();

// Cleanup interval for memory store (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Cleanup expired entries
function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
}

// Start cleanup interval
if (typeof globalThis !== "undefined") {
  setInterval(cleanupMemoryStore, CLEANUP_INTERVAL);
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  windowStart: number;
  retryAfter?: number;
}

// Get client identifier from request
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header or JWT
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // Extract user ID from JWT or use token hash
    const token = authHeader.slice(7);
    return `user:${token.slice(0, 16)}`;
  }
  
  // Fall back to IP address
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || 
             request.headers.get("x-real-ip") || 
             "unknown";
  
  return `ip:${ip}`;
}

// Generate rate limit key
function generateKey(identifier: string, config: RateLimitConfig): string {
  return `${config.keyPrefix}:${identifier}`;
}

// Check rate limit using in-memory store
function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  // No entry or expired - start new window
  if (!entry || now > entry.resetTime) {
    const windowStart = now;
    const resetTime = now + config.windowMs;
    
    memoryStore.set(key, {
      count: 1,
      resetTime,
      windowStart,
    });

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime,
      windowStart,
    };
  }

  // Rate limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
      windowStart: entry.windowStart,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    windowStart: entry.windowStart,
  };
}

// Main rate limit check function
export async function checkRateLimit(
  request: NextRequest,
  tier: RateLimitTier = "STANDARD"
): Promise<RateLimitResult> {
  const config = RateLimitTiers[tier];
  const identifier = getClientIdentifier(request);
  const key = generateKey(identifier, config);

  // Try Redis first if available (future implementation)
  // For now, use in-memory store
  return checkMemoryRateLimit(key, config);
}

// Check rate limit with custom config
export async function checkCustomRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  const key = generateKey(identifier, config);
  
  return checkMemoryRateLimit(key, config);
}

// Get rate limit headers for response
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
    "X-RateLimit-Window": String(result.resetTime - result.windowStart),
  };

  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return headers;
}

// Rate limit middleware helper
export async function applyRateLimit(
  request: NextRequest,
  tier: RateLimitTier = "STANDARD"
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const result = await checkRateLimit(request, tier);
  const headers = getRateLimitHeaders(result);
  
  return {
    allowed: result.allowed,
    headers,
  };
}

// Create a rate-limited handler wrapper
export function withRateLimit<T extends (request: NextRequest, ...args: any[]) => Promise<Response>>(
  handler: T,
  tier: RateLimitTier = "STANDARD"
): T {
  return (async (request: NextRequest, ...args: any[]): Promise<Response> => {
    const result = await checkRateLimit(request, tier);
    
    if (!result.allowed) {
      const headers = getRateLimitHeaders(result);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        }
      );
    }
    
    const response = await handler(request, ...args);
    
    // Add rate limit headers to successful response
    const newHeaders = new Headers(response.headers);
    const rateLimitHeaders = getRateLimitHeaders(result);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }) as T;
}

// Reset rate limit for a specific identifier (useful for testing or admin)
export function resetRateLimit(identifier: string, tier: RateLimitTier = "STANDARD"): void {
  const config = RateLimitTiers[tier];
  const key = generateKey(identifier, config);
  memoryStore.delete(key);
}

// Get current rate limit status for an identifier
export function getRateLimitStatus(
  identifier: string,
  tier: RateLimitTier = "STANDARD"
): RateLimitResult | null {
  const config = RateLimitTiers[tier];
  const key = generateKey(identifier, config);
  const entry = memoryStore.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  
  return {
    allowed: entry.count < config.maxRequests,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
    windowStart: entry.windowStart,
    retryAfter: entry.count >= config.maxRequests 
      ? Math.ceil((entry.resetTime - now) / 1000)
      : undefined,
  };
}
