/**
 * Multi-Tenant Server-Side API Utilities for Sandstone
 * 
 * This module provides server-side utilities for secure API routes
 * with tenant isolation.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Valid subjects
const VALID_SUBJECTS = ["economics", "geography"] as const;
export type ValidSubject = (typeof VALID_SUBJECTS)[number];

/**
 * Validate subject parameter
 */
export function validateSubject(subject: unknown): subject is ValidSubject {
  return typeof subject === "string" && VALID_SUBJECTS.includes(subject as ValidSubject);
}

/**
 * Subject validation schema for Zod
 */
export const subjectSchema = z.enum(["economics", "geography"]);

/**
 * Get current authenticated user with subject access info
 */
export async function getAuthenticatedUserWithSubjects() {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { user: null, subjects: [], error: "Unauthorized" };
  }
  
  // Get user's accessible subjects
  const { data: subjects, error: subjectsError } = await supabase.rpc(
    "get_user_subjects", 
    { user_uuid: user.id }
  );
  
  if (subjectsError) {
    console.error("Error fetching user subjects:", subjectsError);
    return { user, subjects: [], error: null };
  }
  
  return { user, subjects: subjects || [], error: null };
}

/**
 * Check if user has access to a specific subject
 */
export async function checkSubjectAccess(userId: string, subject: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc("user_has_subject_access", {
    user_uuid: userId,
    subject_id: subject,
  });
  
  if (error) {
    console.error("Error checking subject access:", error);
    return false;
  }
  
  return data || false;
}

/**
 * Create a subject-isolated query builder
 */
export function createSubjectIsolatedQuery(
  supabase: ReturnType<typeof createClient>,
  tableName: string,
  userId: string,
  allowedSubjects: string[]
) {
  return supabase
    .from(tableName)
    .select("*")
    .eq("user_id", userId)
    .in("subject", allowedSubjects);
}

/**
 * API route handler wrapper with subject validation
 */
export function withSubjectIsolation<T extends { subject?: string }>(
  handler: (
    req: NextRequest,
    context: {
      user: { id: string; email?: string };
      subjects: string[];
      validatedSubject?: string;
    }
  ) => Promise<NextResponse>,
  options: {
    requireSubject?: boolean;
    allowAnySubject?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { user, subjects, error } = await getAuthenticatedUserWithSubjects();
      
      if (error || !user) {
        return NextResponse.json(
          { error: "Unauthorized", code: "UNAUTHORIZED" },
          { status: 401 }
        );
      }
      
      // Parse request body if present
      let body: T | null = null;
      if (request.method !== "GET" && request.method !== "HEAD") {
        try {
          body = await request.json();
        } catch {
          // No body or invalid JSON
        }
      }
      
      // Validate subject if required
      let validatedSubject: string | undefined;
      
      if (options.requireSubject && body?.subject) {
        if (!validateSubject(body.subject)) {
          return NextResponse.json(
            { 
              error: `Invalid subject: ${body.subject}`, 
              code: "INVALID_SUBJECT",
              validSubjects: VALID_SUBJECTS,
            },
            { status: 400 }
          );
        }
        
        if (!subjects.includes(body.subject)) {
          return NextResponse.json(
            { 
              error: `Access denied to subject: ${body.subject}`, 
              code: "SUBJECT_ACCESS_DENIED",
            },
            { status: 403 }
          );
        }
        
        validatedSubject = body.subject;
      }
      
      // Call the handler
      return await handler(request, { user, subjects, validatedSubject });
    } catch (error) {
      console.error("Subject isolation middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  };
}

/**
 * Create standardized error response for subject isolation violations
 */
export function createSubjectIsolationError(
  message: string,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: "SUBJECT_ISOLATION_VIOLATION",
      timestamp: new Date().toISOString(),
      ...details,
    },
    { status: 403 }
  );
}

/**
 * Create standardized error response for invalid subject
 */
export function createInvalidSubjectError(subject: string): NextResponse {
  return NextResponse.json(
    {
      error: `Invalid subject: ${subject}`,
      code: "INVALID_SUBJECT",
      validSubjects: VALID_SUBJECTS,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

/**
 * Secure database operations with subject isolation
 */
export class SecureDatabaseOperations {
  private supabase: ReturnType<typeof createClient>;
  private userId: string;
  private allowedSubjects: string[];

  constructor(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    allowedSubjects: string[]
  ) {
    this.supabase = supabase;
    this.userId = userId;
    this.allowedSubjects = allowedSubjects;
  }

  /**
   * Validate subject access
   */
  validateSubject(subject: string): void {
    if (!this.allowedSubjects.includes(subject)) {
      throw new Error(`Access denied to subject: ${subject}`);
    }
  }

  /**
   * Secure SELECT query
   */
  async select<T = any>(
    tableName: string,
    options: {
      subject?: string;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      let query = this.supabase
        .from(tableName)
        .select("*")
        .eq("user_id", this.userId);

      // Apply subject filter
      if (options.subject) {
        this.validateSubject(options.subject);
        query = query.eq("subject", options.subject);
      } else {
        query = query.in("subject", this.allowedSubjects);
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as T[], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Secure INSERT operation
   */
  async insert<T = any>(
    tableName: string,
    data: Omit<T, "user_id" | "created_at" | "updated_at"> & { subject: string }
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      this.validateSubject(data.subject);

      const { data: result, error } = await this.supabase
        .from(tableName)
        .insert({
          ...data,
          user_id: this.userId,
        })
        .select()
        .single();

      if (error) throw error;
      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Secure UPDATE operation
   */
  async update<T = any>(
    tableName: string,
    id: string,
    data: Partial<T> & { subject?: string }
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      // Validate new subject if provided
      if (data.subject) {
        this.validateSubject(data.subject);
      }

      const { data: result, error } = await this.supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .eq("user_id", this.userId)
        .select()
        .single();

      if (error) throw error;
      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  /**
   * Secure DELETE operation
   */
  async delete(tableName: string, id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .eq("id", id)
        .eq("user_id", this.userId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Secure single item fetch
   */
  async getById<T = any>(
    tableName: string,
    id: string
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .eq("user_id", this.userId)
        .single();

      if (error) throw error;
      
      // Verify subject access
      if (data && data.subject && !this.allowedSubjects.includes(data.subject)) {
        throw new Error("Access denied to this item's subject");
      }

      return { data: data as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

/**
 * Create secure database operations instance
 */
export async function createSecureDBOps(
  userId?: string,
  allowedSubjects?: string[]
): Promise<SecureDatabaseOperations | null> {
  const supabase = createClient();
  
  // Get user if not provided
  let targetUserId = userId;
  let targetSubjects = allowedSubjects;
  
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    targetUserId = user.id;
  }
  
  // Get subjects if not provided
  if (!targetSubjects) {
    const { data } = await supabase.rpc("get_user_subjects", {
      user_uuid: targetUserId,
    });
    targetSubjects = data || [];
  }
  
  return new SecureDatabaseOperations(supabase, targetUserId, targetSubjects);
}
