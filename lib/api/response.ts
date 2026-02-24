/**
 * API Response Utilities for Sandstone API
 * Standardized response formatting with metadata and pagination
 */

import { NextResponse } from "next/server";
import { generateRequestId } from "./enhanced-error-handler";

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API response metadata
export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

// Success response structure
export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  requestId: string;
  details?: Record<string, unknown>;
}

// Create pagination metadata
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Create base metadata
export function createMeta(
  additionalMeta?: Record<string, unknown>,
  requestId?: string
): ResponseMeta {
  return {
    requestId: requestId || generateRequestId(),
    timestamp: new Date().toISOString(),
    ...additionalMeta,
  };
}

// Success response helper
export function success<T>(
  data: T,
  statusCode: number = 200,
  additionalMeta?: Record<string, unknown>,
  requestId?: string
): NextResponse<SuccessResponse<T>> {
  const meta = createMeta(additionalMeta, requestId);
  
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status: statusCode }
  );
}

// Created response helper (201)
export function created<T>(
  data: T,
  additionalMeta?: Record<string, unknown>,
  requestId?: string
): NextResponse<SuccessResponse<T>> {
  return success(data, 201, additionalMeta, requestId);
}

// No content response (204)
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// Paginated response helper
export function paginated<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  additionalMeta?: Record<string, unknown>,
  requestId?: string
): NextResponse<SuccessResponse<T[]>> {
  const pagination = createPaginationMeta(page, limit, total);
  const meta = createMeta({ ...additionalMeta, pagination }, requestId);
  
  return NextResponse.json(
    {
      success: true,
      data: items,
      meta,
    },
    { status: 200 }
  );
}

// Error response helper
export function error(
  message: string,
  code: string,
  statusCode: number,
  details?: Record<string, unknown>,
  requestId?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      requestId: requestId || generateRequestId(),
      details,
    },
    { status: statusCode }
  );
}

// Common HTTP error responses
export const httpErrors = {
  badRequest: (message: string, details?: Record<string, unknown>, requestId?: string) =>
    error(message, "BAD_REQUEST", 400, details, requestId),
    
  unauthorized: (message: string = "Unauthorized", requestId?: string) =>
    error(message, "UNAUTHORIZED", 401, undefined, requestId),
    
  forbidden: (message: string = "Forbidden", requestId?: string) =>
    error(message, "FORBIDDEN", 403, undefined, requestId),
    
  notFound: (resource: string = "Resource", requestId?: string) =>
    error(`${resource} not found`, "NOT_FOUND", 404, undefined, requestId),
    
  conflict: (message: string, requestId?: string) =>
    error(message, "CONFLICT", 409, undefined, requestId),
    
  tooManyRequests: (retryAfter?: number, requestId?: string) =>
    error(
      "Rate limit exceeded. Please try again later.",
      "RATE_LIMIT_EXCEEDED",
      429,
      retryAfter ? { retryAfter } : undefined,
      requestId
    ),
    
  internalError: (message: string = "Internal server error", requestId?: string) =>
    error(message, "INTERNAL_ERROR", 500, undefined, requestId),
    
  serviceUnavailable: (message: string = "Service temporarily unavailable", requestId?: string) =>
    error(message, "SERVICE_UNAVAILABLE", 503, undefined, requestId),
};

// Add CORS headers to response
export function withCORS(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  
  return response;
}

// Create CORS preflight response
export function corsPreflight(): NextResponse {
  return withCORS(new NextResponse(null, { status: 204 }));
}

// Add security headers to response
export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  return response;
}

// Add cache headers to response
export function withCache(
  response: NextResponse,
  options: {
    maxAge?: number;     // seconds
    staleWhileRevalidate?: number;  // seconds
    private?: boolean;
    noStore?: boolean;
  } = {}
): NextResponse {
  if (options.noStore) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  } else {
    const directives: string[] = [];
    
    if (options.private) {
      directives.push("private");
    } else {
      directives.push("public");
    }
    
    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }
    
    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }
    
    response.headers.set("Cache-Control", directives.join(", "));
  }
  
  return response;
}

// Complete response builder
export function buildResponse<T>(
  data: T,
  options: {
    statusCode?: number;
    requestId?: string;
    pagination?: { page: number; limit: number; total: number };
    meta?: Record<string, unknown>;
    cors?: boolean;
    security?: boolean;
    cache?: {
      maxAge?: number;
      staleWhileRevalidate?: number;
      private?: boolean;
      noStore?: boolean;
    };
  } = {}
): NextResponse {
  const statusCode = options.statusCode || 200;
  
  // Build metadata
  let meta: ResponseMeta = createMeta(options.meta, options.requestId);
  
  if (options.pagination) {
    meta.pagination = createPaginationMeta(
      options.pagination.page,
      options.pagination.limit,
      options.pagination.total
    );
  }
  
  let response = NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status: statusCode }
  );
  
  // Apply optional headers
  if (options.cors) {
    response = withCORS(response);
  }
  
  if (options.security !== false) {
    response = withSecurityHeaders(response);
  }
  
  if (options.cache) {
    response = withCache(response, options.cache);
  }
  
  return response;
}
