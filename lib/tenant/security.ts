/**
 * Multi-Tenant Security Utilities for Sandstone
 * 
 * This module provides client-side and server-side utilities for enforcing
 * tenant isolation between subjects (Economics, Geography).
 */

import { createClient } from "@/lib/supabase/server";
import { supabase as browserSupabase } from "@/lib/supabase/client";

// Valid subjects in the system
export const VALID_SUBJECTS = ["economics", "geography"] as const;
export type ValidSubject = (typeof VALID_SUBJECTS)[number];

/**
 * Validate if a subject ID is valid
 */
export function isValidSubject(subject: string): subject is ValidSubject {
  return VALID_SUBJECTS.includes(subject as ValidSubject);
}

/**
 * Server-side: Get subjects the current user has access to
 */
export async function getUserSubjectsServer(): Promise<string[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .rpc("get_user_subjects", { user_uuid: user.id });
  
  if (error) {
    console.error("Error fetching user subjects:", error);
    return [];
  }
  
  return data || [];
}

/**
 * Client-side: Get subjects the current user has access to
 */
export async function getUserSubjectsClient(): Promise<string[]> {
  const { data: { user } } = await browserSupabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await browserSupabase
    .rpc("get_user_subjects", { user_uuid: user.id });
  
  if (error) {
    console.error("Error fetching user subjects:", error);
    return [];
  }
  
  return data || [];
}

/**
 * Server-side: Check if user has access to a specific subject
 */
export async function userHasSubjectAccessServer(subject: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }
  
  const { data, error } = await supabase
    .rpc("user_has_subject_access", { 
      user_uuid: user.id, 
      subject_id: subject 
    });
  
  if (error) {
    console.error("Error checking subject access:", error);
    return false;
  }
  
  return data || false;
}

/**
 * Client-side: Check if user has access to a specific subject
 */
export async function userHasSubjectAccessClient(subject: string): Promise<boolean> {
  const { data: { user } } = await browserSupabase.auth.getUser();
  if (!user) {
    return false;
  }
  
  const { data, error } = await browserSupabase
    .rpc("user_has_subject_access", { 
      user_uuid: user.id, 
      subject_id: subject 
    });
  
  if (error) {
    console.error("Error checking subject access:", error);
    return false;
  }
  
  return data || false;
}

/**
 * Validate subject parameter and throw error if invalid or no access
 */
export async function validateSubject(
  subject: string, 
  context: "server" | "client" = "server"
): Promise<ValidSubject> {
  // Check if subject is valid
  if (!isValidSubject(subject)) {
    throw new Error(`Invalid subject: ${subject}. Valid subjects are: ${VALID_SUBJECTS.join(", ")}`);
  }
  
  // Check if user has access to the subject
  const hasAccess = context === "server" 
    ? await userHasSubjectAccessServer(subject)
    : await userHasSubjectAccessClient(subject);
  
  if (!hasAccess) {
    throw new Error(`Access denied: You do not have access to subject "${subject}"`);
  }
  
  return subject;
}

/**
 * Filter to ensure queries only access allowed subjects
 */
export function createSubjectFilter(
  allowedSubjects: string[]
): { subject: { in: string[] } } {
  return {
    subject: {
      in: allowedSubjects,
    },
  };
}

/**
 * Build a secure query filter with subject isolation
 */
export async function buildSecureQueryFilter(
  context: "server" | "client" = "server"
): Promise<{ subject: { in: string[] } } | null> {
  const subjects = context === "server" 
    ? await getUserSubjectsServer()
    : await getUserSubjectsClient();
  
  if (subjects.length === 0) {
    return null;
  }
  
  return createSubjectFilter(subjects);
}
