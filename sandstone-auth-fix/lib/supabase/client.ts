import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton instance for the browser client
let browserClient: SupabaseClient | null = null;

/**
 * Get or create a Supabase browser client
 * 
 * This function creates a singleton browser client that persists
 * across component re-renders. It should only be used in client components.
 * 
 * Features:
 * - Automatic token refresh
 * - Session persistence
 * - Real-time auth state changes
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are not configured. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  browserClient = createBrowserClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Important for OAuth callback handling
    },
  });

  return browserClient;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getSupabaseBrowserClient() instead
 */
export const supabase = getSupabaseBrowserClient();

/**
 * Check if Supabase is properly configured
 * 
 * Use this to conditionally render auth features when
 * Supabase is not configured (e.g., during development)
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && url.startsWith("http");
}

/**
 * Get the current session from the browser client
 * 
 * Useful for checking auth state in client components
 */
export async function getCurrentSession() {
  if (!isSupabaseConfigured()) {
    return { session: null, error: null };
  }

  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client.auth.getSession();
    return { session: data.session, error };
  } catch (err) {
    console.error("Error getting session:", err);
    return { session: null, error: err };
  }
}

/**
 * Get the current user from the browser client
 * 
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const { session, error } = await getCurrentSession();
  if (error || !session) {
    return null;
  }
  return session.user;
}
