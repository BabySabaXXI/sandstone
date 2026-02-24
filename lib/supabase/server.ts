import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for server components and server actions.
 * This function should be called in Server Components, Server Actions, and API routes.
 * 
 * @returns Supabase client configured for server-side usage
 */
export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file."
    );
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // This can happen in Server Components where cookies are read-only
          // The middleware will handle cookie updates
          console.warn(`Failed to set cookie ${name}:`, error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // This can happen in Server Components where cookies are read-only
          console.warn(`Failed to remove cookie ${name}:`, error);
        }
      },
    },
  });
}

/**
 * Creates a Supabase admin client for privileged operations.
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable.
 * 
 * @returns Supabase admin client
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase service role key. This should only be used server-side."
    );
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {
        // Admin client doesn't need cookie handling
      },
      remove() {
        // Admin client doesn't need cookie handling
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Helper function to get the current user in server components.
 * Returns null if no user is authenticated.
 * 
 * @returns The current user or null
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }
  
  return user;
}

/**
 * Helper function to check if the current user is authenticated.
 * 
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Helper function to require authentication in server components.
 * Throws an error if not authenticated.
 * 
 * @returns The current user
 * @throws Error if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
}
