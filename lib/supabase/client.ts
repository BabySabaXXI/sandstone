import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Creates a Supabase client for browser/client-side usage.
 * This is a singleton to prevent multiple client instances.
 */
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Gets or creates a Supabase browser client instance.
 * This function is safe to call multiple times as it caches the instance.
 * 
 * @returns Supabase client configured for browser usage
 */
export function createClient(): SupabaseClient<Database> {
  if (clientInstance) {
    return clientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file."
    );
  }

  clientInstance = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return clientInstance;
}

/**
 * Hook-friendly wrapper for the Supabase client.
 * Use this in React components and hooks.
 * 
 * @returns Supabase client
 */
export function useSupabaseClient(): SupabaseClient<Database> {
  return createClient();
}

/**
 * Subscribes to auth state changes.
 * 
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (event: string, session: { user: { id: string; email?: string } } | null) => void
) {
  const supabase = createClient();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription.unsubscribe;
}

/**
 * Gets the current session from the browser client.
 * 
 * @returns The current session or null
 */
export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  
  return session;
}

/**
 * Gets the current user from the browser client.
 * 
 * @returns The current user or null
 */
export async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  
  return user;
}

/**
 * Signs out the current user.
 * 
 * @returns True if successful, false otherwise
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    return false;
  }
  
  return true;
}
