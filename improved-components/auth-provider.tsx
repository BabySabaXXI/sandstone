"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import { User, Provider } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

// =============================================================================
// TYPES
// =============================================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = memo(function AuthProvider({
  children,
}: AuthProviderProps) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configured] = useState(() => isSupabaseConfigured());

  // =============================================================================
  // AUTH STATE LISTENER
  // =============================================================================

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      setError("Supabase not configured. Please set environment variables.");
      return;
    }

    let mounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("Session error:", error);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        toast.success("Signed in successfully");
      } else if (event === "SIGNED_OUT") {
        toast.success("Signed out");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  // =============================================================================
  // AUTH METHODS (MEMOIZED)
  // =============================================================================

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split("@")[0],
          },
        },
      });
      if (error) {
        toast.error(error.message);
        throw error;
      }
      toast.success("Check your email to confirm your account");
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success("Verification code sent to your phone");
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // =============================================================================
  // CONTEXT VALUE (MEMOIZED)
  // =============================================================================

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      signInWithProvider,
      signInWithPhone,
      verifyPhoneOtp,
    }),
    [user, loading, error, signIn, signUp, signOut, signInWithProvider, signInWithPhone, verifyPhoneOtp]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
});

// =============================================================================
// HOOK
// =============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Optional: Create a selector hook for better performance
export function useAuthUser(): User | null {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthUser must be used within an AuthProvider");
  }
  return context.user;
}

export function useAuthLoading(): boolean {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthLoading must be used within an AuthProvider");
  }
  return context.loading;
}
