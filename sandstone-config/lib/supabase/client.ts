// =============================================================================
// SANDSTONE APP - SUPABASE BROWSER CLIENT
// =============================================================================
// Client-side Supabase client with fallback handling and error recovery
// =============================================================================

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Environment variable names
const SUPABASE_URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_ANON_KEY_VAR = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

// Fallback values for development (should be overridden in production)
const FALLBACK_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const FALLBACK_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Client singleton
let browserClient: SupabaseClient | null = null;

/**
 * Configuration options for the browser client
 */
export interface BrowserClientOptions {
  /** Enable realtime subscriptions */
  realtime?: boolean;
  /** Persist session in localStorage */
  persistSession?: boolean;
  /** Auto refresh tokens */
  autoRefreshToken?: boolean;
  /** Detect session in URL */
  detectSessionInUrl?: boolean;
}

/**
 * Default client options
 */
const defaultOptions: BrowserClientOptions = {
  realtime: true,
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};

/**
 * Validates Supabase configuration
 */
function validateConfig(): { url: string; anonKey: string; isValid: boolean } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

  const isValid = Boolean(
    url && 
    anonKey && 
    url.startsWith("https://") && 
    anonKey.length > 20
  );

  if (!isValid && typeof window !== "undefined") {
    console.warn(
      "[Supabase] Invalid or missing configuration. " +
      "Please check your environment variables:",
      {
        url: url ? "✓ Set" : "✗ Missing",
        anonKey: anonKey ? "✓ Set" : "✗ Missing",
      }
    );
  }

  return { url, anonKey, isValid };
}

/**
 * Creates a new browser client instance
 */
function createBrowserInstance(
  options: BrowserClientOptions = {}
): SupabaseClient {
  const { url, anonKey, isValid } = validateConfig();

  if (!isValid) {
    throw new Error(
      `Supabase configuration error. Missing or invalid:\n` +
      `- ${SUPABASE_URL_VAR}: ${url ? "Set" : "Missing/Invalid"}\n` +
      `- ${SUPABASE_ANON_KEY_VAR}: ${anonKey ? "Set" : "Missing/Invalid"}\n` +
      `Please check your .env.local file.`
    );
  }

  const mergedOptions = { ...defaultOptions, ...options };

  return createBrowserClient(url, anonKey, {
    realtime: {
      enabled: mergedOptions.realtime,
    },
    auth: {
      persistSession: mergedOptions.persistSession,
      autoRefreshToken: mergedOptions.autoRefreshToken,
      detectSessionInUrl: mergedOptions.detectSessionInUrl,
      flowType: "pkce",
      debug: process.env.NODE_ENV === "development",
    },
    global: {
      headers: {
        "X-Client-Info": "sandstone-app@1.0.0",
      },
    },
  });
}

/**
 * Gets or creates the singleton browser client
 * Use this for all client-side Supabase operations
 */
export function createClient(
  options?: BrowserClientOptions
): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "createClient() should only be called in browser environment. " +
      "Use createServerClient() for server-side operations."
    );
  }

  // Return existing instance if available and no new options
  if (browserClient && !options) {
    return browserClient;
  }

  // Create new instance
  browserClient = createBrowserInstance(options);
  return browserClient;
}

/**
 * Gets the current user session (client-side only)
 */
export async function getCurrentUser() {
  try {
    const client = createClient();
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
      console.error("[Supabase] Error getting user:", error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("[Supabase] Failed to get current user:", error);
    return null;
  }
}

/**
 * Gets the current session (client-side only)
 */
export async function getCurrentSession() {
  try {
    const client = createClient();
    const { data: { session }, error } = await client.auth.getSession();
    
    if (error) {
      console.error("[Supabase] Error getting session:", error.message);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("[Supabase] Failed to get current session:", error);
    return null;
  }
}

/**
 * Checks if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const { isValid } = validateConfig();
  return isValid;
}

/**
 * Gets configuration status for debugging
 */
export function getConfigStatus(): {
  configured: boolean;
  url: string;
  anonKey: string;
  errors: string[];
} {
  const { url, anonKey, isValid } = validateConfig();
  const errors: string[] = [];

  if (!url) errors.push(`${SUPABASE_URL_VAR} is missing`);
  if (!anonKey) errors.push(`${SUPABASE_ANON_KEY_VAR} is missing`);
  if (url && !url.startsWith("https://")) {
    errors.push(`${SUPABASE_URL_VAR} must start with https://`);
  }
  if (anonKey && anonKey.length < 20) {
    errors.push(`${SUPABASE_ANON_KEY_VAR} appears to be invalid`);
  }

  return {
    configured: isValid,
    url: url ? "✓ Set" : "✗ Missing",
    anonKey: anonKey ? "✓ Set" : "✗ Missing",
    errors,
  };
}

/**
 * Resets the client (useful for testing)
 */
export function resetClient(): void {
  browserClient = null;
}

// Export for direct access
export { browserClient };
