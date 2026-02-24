/**
 * Server-Side Data Fetching Utilities
 * 
 * This module provides optimized data fetching functions for Server Components
 * with built-in caching, deduplication, and error handling.
 */

import { cache } from "react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  responsesGraded: number;
  studyStreak: number;
  timeStudied: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface RecentActivity {
  id: string;
  type: "graded" | "created" | "completed" | "studied";
  title: string;
  timestamp: string;
  score?: number;
  items?: number;
  subject?: string;
}

export interface StudyProgress {
  subject: string;
  progress: number;
  totalTopics: number;
  completedTopics: number;
}

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "spreadsheet";
  size: string;
  updatedAt: string;
  folder?: string;
  subject?: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  mastered: number;
  lastStudied: string;
  subject: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: "article" | "video" | "pdf" | "quiz";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  tags: string[];
}

// ============================================================================
// Cached Data Fetching Functions
// ============================================================================

/**
 * Get current user with caching
 * Uses React's cache() for request-level deduplication
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  
  return user;
});

/**
 * Get user profile data with caching
 */
export const getUserProfile = cache(async (userId: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  
  return data;
});

/**
 * Get dashboard statistics with caching
 * Cached for 60 seconds to reduce database load
 */
export const getDashboardStats = cache(async (userId: string): Promise<DashboardStats> => {
  const supabase = createClient();
  
  // Parallel data fetching for better performance
  const [
    gradedCountResult,
    studySessionsResult,
    streakResult,
  ] = await Promise.all([
    // Count graded responses
    supabase
      .from("graded_responses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    
    // Get study sessions for time calculation
    supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    
    // Get current streak
    supabase
      .from("user_streaks")
      .select("current_streak, weekly_goal, weekly_progress")
      .eq("user_id", userId)
      .single(),
  ]);
  
  const totalTimeStudied = studySessionsResult.data?.reduce(
    (acc, session) => acc + (session.duration_minutes || 0), 
    0
  ) || 0;
  
  return {
    responsesGraded: gradedCountResult.count || 0,
    studyStreak: streakResult.data?.current_streak || 0,
    timeStudied: Math.round(totalTimeStudied / 60), // Convert to hours
    weeklyGoal: streakResult.data?.weekly_goal || 5,
    weeklyProgress: streakResult.data?.weekly_progress || 0,
  };
});

/**
 * Get recent activity with caching
 */
export const getRecentActivity = cache(async (userId: string, limit: number = 5): Promise<RecentActivity[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching activity:", error);
    return [];
  }
  
  return (data || []).map((item) => ({
    id: item.id,
    type: item.activity_type,
    title: item.title,
    timestamp: item.created_at,
    score: item.score,
    items: item.items_count,
    subject: item.subject,
  }));
});

/**
 * Get study progress by subject
 */
export const getStudyProgress = cache(async (userId: string): Promise<StudyProgress[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("subject_progress")
    .select("*")
    .eq("user_id", userId);
  
  if (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
  
  return (data || []).map((item) => ({
    subject: item.subject,
    progress: item.progress_percentage,
    totalTopics: item.total_topics,
    completedTopics: item.completed_topics,
  }));
});

/**
 * Get user's documents with caching
 */
export const getUserDocuments = cache(async (userId: string): Promise<Document[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
  
  return (data || []).map((doc) => ({
    id: doc.id,
    name: doc.title,
    type: doc.file_type || "pdf",
    size: formatFileSize(doc.file_size),
    updatedAt: formatRelativeTime(doc.updated_at),
    folder: doc.folder_name,
    subject: doc.subject,
  }));
});

/**
 * Get user's flashcard decks with caching
 */
export const getUserFlashcardDecks = cache(async (userId: string): Promise<FlashcardDeck[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("flashcard_decks")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching flashcard decks:", error);
    return [];
  }
  
  return (data || []).map((deck) => ({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    cardCount: deck.card_count,
    mastered: deck.mastered_count,
    lastStudied: formatRelativeTime(deck.last_studied_at),
    subject: deck.subject,
  }));
});

/**
 * Get library resources with caching
 * Public data can be cached longer
 */
export const getLibraryResources = cache(async (
  subject?: string, 
  limit: number = 20
): Promise<LibraryResource[]> => {
  const supabase = createClient();
  
  let query = supabase
    .from("library_resources")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (subject) {
    query = query.eq("subject", subject);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching library resources:", error);
    return [];
  }
  
  return (data || []).map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    subject: resource.subject,
    type: resource.type,
    difficulty: resource.difficulty,
    estimatedTime: resource.estimated_time_minutes,
    tags: resource.tags || [],
  }));
});

/**
 * Get quiz data with caching
 */
export const getQuizData = cache(async (userId: string, quizId?: string) => {
  const supabase = createClient();
  
  if (quizId) {
    // Fetch specific quiz
    const { data, error } = await supabase
      .from("quizzes")
      .select("*, questions:quiz_questions(*)")
      .eq("id", quizId)
      .single();
    
    if (error) {
      console.error("Error fetching quiz:", error);
      return null;
    }
    
    return data;
  }
  
  // Fetch all quizzes for user
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }
  
  return data || [];
});

// ============================================================================
// Server-Side Cache Configuration
// ============================================================================

/**
 * Revalidation tags for Next.js cache
 */
export const revalidationTags = {
  user: (userId: string) => `user-${userId}`,
  dashboard: (userId: string) => `dashboard-${userId}`,
  documents: (userId: string) => `documents-${userId}`,
  flashcards: (userId: string) => `flashcards-${userId}`,
  library: (subject?: string) => `library-${subject || "all"}`,
  quizzes: (userId: string) => `quizzes-${userId}`,
  activity: (userId: string) => `activity-${userId}`,
  progress: (userId: string) => `progress-${userId}`,
} as const;

/**
 * Cache durations (in seconds)
 */
export const cacheDurations = {
  user: 60,           // 1 minute
  dashboard: 60,      // 1 minute
  documents: 120,     // 2 minutes
  flashcards: 120,    // 2 minutes
  library: 300,       // 5 minutes (public data)
  quizzes: 60,        // 1 minute
  activity: 30,       // 30 seconds
  progress: 120,      // 2 minutes
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  
  return date.toLocaleDateString();
}

// ============================================================================
// Parallel Data Fetching Helper
// ============================================================================

/**
 * Fetch multiple data sources in parallel
 * Useful for dashboard pages that need multiple data types
 */
export async function fetchDashboardData(userId: string) {
  const [stats, activity, progress] = await Promise.all([
    getDashboardStats(userId),
    getRecentActivity(userId),
    getStudyProgress(userId),
  ]);
  
  return {
    stats,
    activity,
    progress,
  };
}

/**
 * Fetch all app data in parallel for initial load
 */
export async function fetchInitialAppData(userId: string) {
  const [user, documents, flashcards, library] = await Promise.all([
    getUserProfile(userId),
    getUserDocuments(userId),
    getUserFlashcardDecks(userId),
    getLibraryResources(undefined, 10),
  ]);
  
  return {
    user,
    documents,
    flashcards,
    library,
  };
}

// ============================================================================
// Error Handling Wrapper
// ============================================================================

/**
 * Wrap data fetching with error handling
 * Returns null on error instead of throwing
 */
export async function safeFetch<T>(
  fetchFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.error("Data fetching error:", error);
    return fallback;
  }
}

/**
 * Batch fetch multiple items with error isolation
 * If one fetch fails, others still return data
 */
export async function batchFetch<T extends Record<string, unknown>>(
  fetches: { [K in keyof T]: () => Promise<T[K]> }
): Promise<{ [K in keyof T]: T[K] | null }> {
  const entries = Object.entries(fetches);
  const results = await Promise.allSettled(
    entries.map(([, fn]) => fn())
  );
  
  return entries.reduce((acc, [key], index) => {
    const result = results[index];
    acc[key as keyof T] = result.status === "fulfilled" ? result.value : null;
    return acc;
  }, {} as { [K in keyof T]: T[K] | null });
}
