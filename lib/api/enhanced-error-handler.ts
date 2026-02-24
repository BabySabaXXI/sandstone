/**
 * Enhanced Error Handler for Sandstone API
 * Provides standardized error handling with detailed error codes and logging
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Error codes for different types of errors
export const ErrorCodes = {
  // Authentication errors (4xx)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  
  // Validation errors (4xx)
  INVALID_BODY: "INVALID_BODY",
  INVALID_QUERY: "INVALID_QUERY",
  INVALID_PARAMS: "INVALID_PARAMS",
  MISSING_FIELD: "MISSING_FIELD",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  
  // Resource errors (4xx)
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  
  // External service errors (5xx)
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
  
  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// HTTP status codes mapping
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INVALID_BODY]: 400,
  [ErrorCodes.INVALID_QUERY]: 400,
  [ErrorCodes.INVALID_PARAMS]: 400,
  [ErrorCodes.MISSING_FIELD]: 400,
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.AI_SERVICE_ERROR]: 503,
  [ErrorCodes.DATABASE_ERROR]: 503,
  [ErrorCodes.EXTERNAL_API_ERROR]: 502,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.TIMEOUT_ERROR]: 504,
  [ErrorCodes.CONFIGURATION_ERROR]: 500,
};

// Custom API Error class
export class APIError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly requestId: string;

  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message);
    this.name = "APIError";
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code] || 500;
    this.details = details;
    this.requestId = requestId || generateRequestId();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      requestId: this.requestId,
    };
  }
}

// Generate unique request ID for tracing
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format Zod validation errors
export function formatZodError(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });
  
  return formatted;
}

// Main error handler function
export function handleAPIError(error: unknown, requestId?: string): NextResponse {
  const reqId = requestId || generateRequestId();
  
  // Handle known API errors
  if (error instanceof APIError) {
    console.error(`[API Error ${reqId}]`, {
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        requestId: reqId,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors = formatZodError(error);
    
    console.error(`[Validation Error ${reqId}]`, formattedErrors);
    
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        code: ErrorCodes.VALIDATION_ERROR,
        requestId: reqId,
        details: {
          fields: formattedErrors,
        },
      },
      { status: 400 }
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    console.error(`[Unhandled Error ${reqId}]`, {
      message: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        code: ErrorCodes.INTERNAL_ERROR,
        requestId: reqId,
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  console.error(`[Unknown Error ${reqId}]`, error);
  
  return NextResponse.json(
    {
      success: false,
      error: "An unknown error occurred",
      code: ErrorCodes.UNKNOWN_ERROR,
      requestId: reqId,
    },
    { status: 500 }
  );
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status: statusCode }
  );
}

// Error response helper
export function createErrorResponse(
  message: string,
  code: ErrorCode,
  statusCode?: number,
  details?: Record<string, unknown>,
  requestId?: string
): NextResponse {
  const reqId = requestId || generateRequestId();
  const httpStatus = statusCode || ERROR_STATUS_MAP[code] || 500;
  
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      requestId: reqId,
      details,
    },
    { status: httpStatus }
  );
}

// Async handler wrapper for API routes
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<NextResponse> => {
    const requestId = generateRequestId();
    
    try {
      // Add requestId to the request object for tracking
      const request = args[0] as Request;
      (request as any).requestId = requestId;
      
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error, requestId);
    }
  }) as T;
}

// Unknown error code for fallback
const UNKNOWN_ERROR = "UNKNOWN_ERROR" as ErrorCode;
