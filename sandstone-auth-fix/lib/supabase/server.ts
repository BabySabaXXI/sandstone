import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Create a Supabase server client
 * 
 * This function creates a server-side Supabase client that handles
 * cookies for session management. It should be used in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 * 
 * Features:
 * - Automatic cookie handling
 * - Session validation
 * - Type-safe database queries
 */
export function createClient(): SupabaseClient {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are not configured. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          // In server components/server actions, we can set cookies
          cookieStore.set({
            name,
            value,
            ...options,
            // Ensure secure cookie settings
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        } catch (error) {
          // This will throw in Server Components where cookies are read-only
          // The middleware will handle setting the cookies
          console.debug("Could not set cookie in server context:", name);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: "",
            ...options,
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 0,
          });
        } catch (error) {
          console.debug("Could not remove cookie in server context:", name);
        }
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

/**
 * Get the current user from the server
 * 
 * Use this in Server Components to check authentication
 * 
 * @example
 * ```tsx
 * const user = await getUser();
 * if (!user) {
 *   redirect('/login');
 * }
 * ```
 */
export async function getUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error getting user:", error);
      return null;
    }

    return user;
  } catch (err) {
    console.error("Unexpected error getting user:", err);
    return null;
  }
}

/**
 * Get the current session from the server
 * 
 * Use this in Server Components or Server Actions
 * to access the current session
 */
export async function getSession() {
  try {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    return session;
  } catch (err) {
    console.error("Unexpected error getting session:", err);
    return null;
  }
}

/**
 * Check if the user is authenticated
 * 
 * Returns true if the user has a valid session
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

/**
 * Require authentication
 * 
 * Throws an error if the user is not authenticated
 * Use this in Server Actions that require auth
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
