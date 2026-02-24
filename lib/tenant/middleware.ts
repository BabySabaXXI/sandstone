/**
 * Multi-Tenant Middleware Extensions for Sandstone
 * 
 * This module provides middleware functions for enforcing tenant isolation
 * at the request level.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Valid subjects
const VALID_SUBJECTS = ["economics", "geography"];

/**
 * Validate subject parameter in request
 */
export function validateSubjectParam(subject: string | null): boolean {
  if (!subject) return false;
  return VALID_SUBJECTS.includes(subject);
}

/**
 * Middleware to validate subject access
 * Use this in route handlers that accept subject parameters
 */
export async function validateSubjectMiddleware(
  request: NextRequest,
  subjectParam: string = "subject"
): Promise<{ valid: boolean; subject?: string; error?: string }> {
  const subject = request.nextUrl.searchParams.get(subjectParam);
  
  if (!subject) {
    return { valid: false, error: "Subject parameter is required" };
  }
  
  if (!validateSubjectParam(subject)) {
    return { valid: false, error: `Invalid subject: ${subject}` };
  }
  
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return { valid: false, error: "Authentication service not configured" };
  }
  
  let response = NextResponse.next();
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { valid: false, error: "User not authenticated" };
  }
  
  // Check if user has access to the subject
  const { data: hasAccess, error } = await supabase.rpc("user_has_subject_access", {
    user_uuid: user.id,
    subject_id: subject,
  });
  
  if (error) {
    console.error("Error checking subject access:", error);
    return { valid: false, error: "Error validating subject access" };
  }
  
  if (!hasAccess) {
    return { valid: false, error: `Access denied to subject: ${subject}` };
  }
  
  return { valid: true, subject };
}

/**
 * Higher-order function to wrap API routes with subject validation
 */
export function withSubjectValidation(
  handler: (req: NextRequest, subject: string) => Promise<NextResponse>,
  subjectParam: string = "subject"
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await validateSubjectMiddleware(request, subjectParam);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error?.includes("Access denied") ? 403 : 400 }
      );
    }
    
    return handler(request, validation.subject!);
  };
}

/**
 * Middleware to add subject context to request headers
 * This helps downstream handlers know the validated subject
 */
export async function subjectContextMiddleware(
  request: NextRequest,
  subject: string
): Promise<NextRequest> {
  const headers = new Headers(request.headers);
  headers.set("x-validated-subject", subject);
  
  return new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body,
  });
}

/**
 * Get validated subject from request headers
 */
export function getValidatedSubjectFromHeaders(request: NextRequest): string | null {
  return request.headers.get("x-validated-subject");
}

/**
 * Create a response with subject isolation error
 */
export function createSubjectIsolationError(
  message: string,
  status: number = 403
): NextResponse {
  return NextResponse.json(
    { 
      error: message,
      code: "SUBJECT_ISOLATION_VIOLATION",
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
