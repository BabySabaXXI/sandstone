// Supabase Client Exports - Centralized Supabase exports

// Browser/client-side Supabase client
export {
  supabase,
  isSupabaseConfigured,
} from "./client";

// Server-side Supabase client (for API routes)
export { createClient } from "./server";
