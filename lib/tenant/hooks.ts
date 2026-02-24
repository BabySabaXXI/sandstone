/**
 * Multi-Tenant React Hooks for Sandstone
 * 
 * This module provides React hooks for secure, subject-isolated data access.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Valid subjects
const VALID_SUBJECTS = ["economics", "geography"] as const;
export type ValidSubject = (typeof VALID_SUBJECTS)[number];

/**
 * Hook to get subjects the current user has access to
 */
export function useUserSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSubjects() {
      if (!user) {
        setSubjects([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_user_subjects", {
          user_uuid: user.id,
        });

        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch subjects"));
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [user]);

  return { subjects, loading, error };
}

/**
 * Hook to check if user has access to a specific subject
 */
export function useSubjectAccess(subject: string) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("user_has_subject_access", {
          user_uuid: user.id,
          subject_id: subject,
        });

        if (error) throw error;
        setHasAccess(data || false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to check access"));
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [user, subject]);

  return { hasAccess, loading, error };
}

/**
 * Hook to fetch essays with subject isolation
 */
export function useSecureEssays(subject?: string) {
  const { user } = useAuth();
  const { subjects: allowedSubjects, loading: subjectsLoading } = useUserSubjects();
  const [essays, setEssays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEssays = useCallback(async () => {
    if (!user || subjectsLoading) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("essays")
        .select("*")
        .eq("user_id", user.id);

      // Apply subject filter
      if (subject) {
        // Validate subject access
        if (!allowedSubjects.includes(subject)) {
          throw new Error(`Access denied to subject: ${subject}`);
        }
        query = query.eq("subject", subject);
      } else {
        // Filter by allowed subjects
        query = query.in("subject", allowedSubjects);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setEssays(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch essays"));
      setEssays([]);
    } finally {
      setLoading(false);
    }
  }, [user, subject, allowedSubjects, subjectsLoading]);

  useEffect(() => {
    fetchEssays();
  }, [fetchEssays]);

  return { essays, loading: loading || subjectsLoading, error, refetch: fetchEssays };
}

/**
 * Hook to fetch flashcard decks with subject isolation
 */
export function useSecureFlashcardDecks(subject?: string) {
  const { user } = useAuth();
  const { subjects: allowedSubjects, loading: subjectsLoading } = useUserSubjects();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDecks = useCallback(async () => {
    if (!user || subjectsLoading) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("flashcard_decks")
        .select("*")
        .eq("user_id", user.id);

      // Apply subject filter
      if (subject) {
        if (!allowedSubjects.includes(subject)) {
          throw new Error(`Access denied to subject: ${subject}`);
        }
        query = query.eq("subject", subject);
      } else {
        query = query.in("subject", allowedSubjects);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setDecks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch decks"));
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, [user, subject, allowedSubjects, subjectsLoading]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  return { decks, loading: loading || subjectsLoading, error, refetch: fetchDecks };
}

/**
 * Hook to fetch documents with subject isolation
 */
export function useSecureDocuments(subject?: string) {
  const { user } = useAuth();
  const { subjects: allowedSubjects, loading: subjectsLoading } = useUserSubjects();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user || subjectsLoading) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id);

      // Apply subject filter
      if (subject) {
        if (!allowedSubjects.includes(subject)) {
          throw new Error(`Access denied to subject: ${subject}`);
        }
        query = query.eq("subject", subject);
      } else {
        query = query.in("subject", allowedSubjects);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch documents"));
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user, subject, allowedSubjects, subjectsLoading]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading: loading || subjectsLoading, error, refetch: fetchDocuments };
}

/**
 * Hook to fetch quizzes with subject isolation
 */
export function useSecureQuizzes(subject?: string) {
  const { user } = useAuth();
  const { subjects: allowedSubjects, loading: subjectsLoading } = useUserSubjects();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuizzes = useCallback(async () => {
    if (!user || subjectsLoading) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", user.id);

      // Apply subject filter
      if (subject) {
        if (!allowedSubjects.includes(subject)) {
          throw new Error(`Access denied to subject: ${subject}`);
        }
        query = query.eq("subject", subject);
      } else {
        query = query.in("subject", allowedSubjects);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch quizzes"));
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [user, subject, allowedSubjects, subjectsLoading]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, loading: loading || subjectsLoading, error, refetch: fetchQuizzes };
}

/**
 * Hook to fetch AI chats with subject isolation
 */
export function useSecureAIChats(subject?: string) {
  const { user } = useAuth();
  const { subjects: allowedSubjects, loading: subjectsLoading } = useUserSubjects();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChats = useCallback(async () => {
    if (!user || subjectsLoading) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("ai_chats")
        .select("*")
        .eq("user_id", user.id);

      // Apply subject filter
      if (subject) {
        if (!allowedSubjects.includes(subject)) {
          throw new Error(`Access denied to subject: ${subject}`);
        }
        query = query.eq("subject", subject);
      } else {
        query = query.in("subject", allowedSubjects);
      }

      const { data, error } = await query.order("updated_at", { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch chats"));
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user, subject, allowedSubjects, subjectsLoading]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return { chats, loading: loading || subjectsLoading, error, refetch: fetchChats };
}

/**
 * Hook to create a new item with subject validation
 */
export function useSecureCreate<T extends { subject: string }>(
  tableName: string,
  defaultSubject: string = "economics"
) {
  const { user } = useAuth();
  const { subjects: allowedSubjects } = useUserSubjects();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (data: Omit<T, "user_id" | "created_at" | "updated_at">) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const subject = data.subject || defaultSubject;

      // Validate subject access
      if (!allowedSubjects.includes(subject)) {
        throw new Error(`Access denied to subject: ${subject}`);
      }

      setLoading(true);
      setError(null);

      try {
        const { data: result, error: supabaseError } = await supabase
          .from(tableName)
          .insert({
            ...data,
            user_id: user.id,
            subject,
          })
          .select()
          .single();

        if (supabaseError) throw supabaseError;
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create item");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, allowedSubjects, tableName, defaultSubject]
  );

  return { create, loading, error };
}

/**
 * Hook to update an item with subject validation
 */
export function useSecureUpdate<T extends { subject: string }>(tableName: string) {
  const { user } = useAuth();
  const { subjects: allowedSubjects } = useUserSubjects();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // If subject is being updated, validate access
      if (data.subject && !allowedSubjects.includes(data.subject)) {
        throw new Error(`Access denied to subject: ${data.subject}`);
      }

      setLoading(true);
      setError(null);

      try {
        const { data: result, error: supabaseError } = await supabase
          .from(tableName)
          .update(data)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (supabaseError) throw supabaseError;
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update item");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, allowedSubjects, tableName]
  );

  return { update, loading, error };
}

/**
 * Hook to delete an item with subject validation
 */
export function useSecureDelete(tableName: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteItem = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      try {
        const { error: supabaseError } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (supabaseError) throw supabaseError;
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete item");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, tableName]
  );

  return { delete: deleteItem, loading, error };
}
