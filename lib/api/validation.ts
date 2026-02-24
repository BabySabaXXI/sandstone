/**
 * Request Validation Utilities for Sandstone API
 * Provides Zod-based validation with detailed error messages
 */

import { z, ZodSchema, ZodError } from "zod";
import { NextRequest } from "next/server";
import { APIError, ErrorCodes, formatZodError } from "./enhanced-error-handler";

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

// Validate request body against Zod schema
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new APIError(
        "Request body validation failed",
        ErrorCodes.VALIDATION_ERROR,
        { fields: formatZodError(error) }
      );
    }
    
    if (error instanceof SyntaxError) {
      throw new APIError(
        "Invalid JSON in request body",
        ErrorCodes.INVALID_BODY
      );
    }
    
    throw new APIError(
      "Failed to parse request body",
      ErrorCodes.INVALID_BODY,
      { originalError: String(error) }
    );
  }
}

// Validate query parameters against Zod schema
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, unknown> = {};
    
    // Convert search params to object
    for (const [key, value] of searchParams.entries()) {
      // Handle array values
      if (query[key]) {
        if (Array.isArray(query[key])) {
          (query[key] as string[]).push(value);
        } else {
          query[key] = [query[key] as string, value];
        }
      } else {
        query[key] = value;
      }
    }
    
    return schema.parse(query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new APIError(
        "Query parameter validation failed",
        ErrorCodes.INVALID_QUERY,
        { fields: formatZodError(error) }
      );
    }
    
    throw new APIError(
      "Failed to parse query parameters",
      ErrorCodes.INVALID_QUERY,
      { originalError: String(error) }
    );
  }
}

// Validate URL parameters (for dynamic routes)
export function validateParams<T>(
  params: Record<string, string>,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new APIError(
        "URL parameter validation failed",
        ErrorCodes.INVALID_PARAMS,
        { fields: formatZodError(error) }
      );
    }
    
    throw new APIError(
      "Failed to parse URL parameters",
      ErrorCodes.INVALID_PARAMS,
      { originalError: String(error) }
    );
  }
}

// Common validation schemas
export const CommonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
  
  // UUID
  uuid: z.string().uuid(),
  
  // ID parameter
  idParam: z.object({
    id: z.string().uuid(),
  }),
  
  // Subject enum
  subject: z.enum(["economics", "geography"]),
  
  // Unit codes for economics
  economicsUnit: z.enum(["WEC11", "WEC12", "WEC13", "WEC14"]),
  
  // Question types
  questionType: z.enum([
    "4-mark",
    "6-mark",
    "8-mark",
    "10-mark",
    "12-mark",
    "14-mark",
    "16-mark",
    "20-mark",
  ]),
  
  // Non-empty string
  nonEmptyString: z.string().min(1),
  
  // Optional string
  optionalString: z.string().optional(),
  
  // Boolean string (for query params)
  booleanString: z.enum(["true", "false"]).transform((val) => val === "true"),
};

// Request size limit checker
export async function checkRequestSize(
  request: NextRequest,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): Promise<void> {
  const contentLength = request.headers.get("content-length");
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSizeBytes) {
      throw new APIError(
        `Request body too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`,
        ErrorCodes.INVALID_BODY,
        { maxSize: maxSizeBytes, actualSize: size }
      );
    }
  }
  
  // Also check body size when reading
  const clonedRequest = request.clone();
  const body = await clonedRequest.text();
  
  if (body.length > maxSizeBytes) {
    throw new APIError(
      `Request body too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`,
      ErrorCodes.INVALID_BODY,
      { maxSize: maxSizeBytes, actualSize: body.length }
    );
  }
}

// Content type validator
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[] = ["application/json"]
): void {
  const contentType = request.headers.get("content-type") || "";
  
  const isAllowed = allowedTypes.some((type) => 
    contentType.toLowerCase().includes(type.toLowerCase())
  );
  
  if (!isAllowed) {
    throw new APIError(
      `Invalid content type. Allowed types: ${allowedTypes.join(", ")}`,
      ErrorCodes.INVALID_BODY,
      { received: contentType, allowed: allowedTypes }
    );
  }
}

// Safe JSON parser with size limit
export async function safeJsonParse<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
  maxSizeBytes: number = 10 * 1024 * 1024
): Promise<T> {
  await checkRequestSize(request, maxSizeBytes);
  validateContentType(request);
  return validateBody(request, schema);
}

// Create a validation middleware
export function withValidation<T>(
  schema: ZodSchema<T>,
  source: "body" | "query" | "params" = "body"
) {
  return function <R extends (validated: T, ...args: any[]) => Promise<Response>>(
    handler: R
  ): (request: NextRequest, ...args: any[]) => Promise<Response> {
    return async (request: NextRequest, ...args: any[]): Promise<Response> => {
      let validated: T;
      
      try {
        if (source === "body") {
          validated = await validateBody(request, schema);
        } else if (source === "query") {
          validated = validateQuery(request, schema);
        } else {
          // For params, expect them in the args (from Next.js dynamic routes)
          const params = args[0]?.params || {};
          validated = validateParams(params, schema);
        }
      } catch (error) {
        if (error instanceof APIError) {
          return new Response(
            JSON.stringify({
              success: false,
              error: error.message,
              code: error.code,
              details: error.details,
            }),
            {
              status: error.statusCode,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        throw error;
      }
      
      return handler(validated, ...args);
    };
  };
}
