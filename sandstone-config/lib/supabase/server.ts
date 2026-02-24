// =============================================================================
// SANDSTONE APP - SUPABASE SERVER CLIENT
// =============================================================================
// Server-side Supabase client with connection pooling and error handling
// =============================================================================

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// Environment variable names
const SUPABASE_URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_VAR = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SUPABASE_SERVICE_KEY_VAR = "SUPABASE_SERVICE_ROLE_KEY";

// Connection pooling configuration
const POOL_CONFIG = {
  // Maximum number of connections in the pool
  maxConnections: parseInt(process.env.DATABASE_POOL_SIZE || "10", 10),
  // Connection timeout in milliseconds
  connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || "30000", 10),
  // Idle timeout in milliseconds
  idleTimeout: 300000, // 5 minutes
  // Retry attempts for failed connections
  retryAttempts: 3,
  // Delay between retries in milliseconds
  retryDelay: 1000,
};

/**
 * Validates server-side Supabase configuration
 */
function validateServerConfig(useServiceRole = false): { 
  url: string; 
  key: string; 
  isValid: boolean;
  errors: string[];
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  const errors: string[] = [];
  
  if (!url) errors.push(`${SUPABASE_URL_VAR} is missing`);
  if (!url.startsWith("https://")) errors.push(`${SUPABASE_URL_VAR} must start with https://`);
  
  const key = useServiceRole ? serviceKey : anonKey;
  
  if (!key) {
    errors.push(
      useServiceRole 
        ? `${SUPABASE_SERVICE_KEY_VAR} is missing` 
        : `${SUPABASE_ANON_KEY_VAR} is missing`
    );
  }
  
  const isValid = url.startsWith("https://") && key.length > 20;
  
  return { url, key, isValid, errors };
}

/**
 * Creates cookie handlers for the server client
 */
function createCookieHandlers(cookieStore: ReturnType<typeof cookies>) {
  return {
    get(name: string): string | undefined {
      try {
        return cookieStore.get(name)?.value;
      } catch (error) {
        // Handle cases where cookies() is called outside request context
        console.warn(`[Supabase] Failed to get cookie "${name}":`, error);
        return undefined;
      }
    },
    
    set(name: string, value: string, options: CookieOptions): void {
      try {
        cookieStore.set({ name, value, ...options });
      } catch (error) {
        // Silent fail in middleware context or when cookies are read-only
        if (process.env.NODE_ENV === "development") {
          console.warn(`[Supabase] Failed to set cookie "${name}":`, error);
        }
      }
    },
    
    remove(name: string, options: CookieOptions): void {
      try {
        cookieStore.set({ name, value: "", ...options });
      } catch (error) {
        // Silent fail in middleware context
        if (process.env.NODE_ENV === "development") {
          console.warn(`[Supabase] Failed to remove cookie "${name}":`, error);
        }
      }
    },
  };
}

/**
 * Creates a server-side Supabase client
 * Use this in Server Components, API routes, and Server Actions
 */
export function createClient(useServiceRole = false): SupabaseClient {
  const { url, key, isValid, errors } = validateServerConfig(useServiceRole);

  if (!isValid) {
    throw new Error(
      `Supabase server configuration error:\n${errors.join("\n")}\n\n` +
      `Please check your environment variables.`
    );
  }

  const cookieStore = cookies();
  const cookieHandlers = createCookieHandlers(cookieStore);

  return createServerClient(url, key, {
    cookies: cookieHandlers,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      debug: process.env.NODE_ENV === "development",
    },
    global: {
      headers: {
        "X-Client-Info": "sandstone-server@1.0.0",
      },
    },
    // Database connection options
    db: {
      schema: "public",
    },
  });
}

/**
 * Creates an admin client with service role key
 * WARNING: This bypasses RLS! Use with extreme caution.
 */
export function createAdminClient(): SupabaseClient {
  return createClient(true);
}

/**
 * Gets the current user from the server context
 * Use this in Server Components and API routes
 */
export async function getServerUser() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("[Supabase] Error getting server user:", error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("[Supabase] Failed to get server user:", error);
    return null;
  }
}

/**
 * Gets the current session from the server context
 */
export async function getServerSession() {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("[Supabase] Error getting server session:", error.message);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("[Supabase] Failed to get server session:", error);
    return null;
  }
}

/**
 * Executes a database operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    attempts?: number;
    delay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { 
    attempts = POOL_CONFIG.retryAttempts, 
    delay = POOL_CONFIG.retryDelay,
    onRetry 
  } = options;

  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < attempts - 1) {
        onRetry?.(i + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}

/**
 * Checks if the database connection is healthy
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    const { error } = await supabase.from("_healthcheck").select("*").limit(1).maybeSingle();
    
    // If the table doesn't exist, that's okay - we still connected
    const latency = Date.now() - startTime;
    
    if (error && error.code !== "PGRST116") { // PGRST116 = no rows or table not found
      return {
        healthy: false,
        latency,
        error: error.message,
      };
    }
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Gets server configuration status for debugging
 */
export function getServerConfigStatus(): {
  configured: boolean;
  url: string;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  poolSize: number;
  connectionTimeout: number;
  errors: string[];
} {
  const { isValid, errors } = validateServerConfig();
  const serviceConfig = validateServerConfig(true);
  
  return {
    configured: isValid,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    poolSize: POOL_CONFIG.maxConnections,
    connectionTimeout: POOL_CONFIG.connectionTimeout,
    errors: [...errors, ...serviceConfig.errors],
  };
}

/**
 * Middleware-compatible client creator
 * For use in Next.js middleware where cookie handling is different
 */
export function createMiddlewareClient(
  request: { cookies: { get: (name: string) => { value?: string } | undefined } },
  response: { cookies: { set: (options: { name: string; value: string } & CookieOptions) => void } }
): SupabaseClient {
  const { url, key, isValid } = validateServerConfig();

  if (!isValid) {
    throw new Error("Supabase not configured for middleware");
  }

  return createServerClient(url, key, {
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
}
