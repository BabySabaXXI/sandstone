"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  ReactNode,
} from "react";
import { User, Provider } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useNotification } from "./notification-context";

// =============================================================================
// Types
// =============================================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

function AuthProviderComponent({ children }: AuthProviderProps) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configured] = useState(() => isSupabaseConfigured());
  
  const { showSuccess, showError } = useNotification();

  // =============================================================================
  // Session Management
  // =============================================================================

  const refreshUser = useCallback(async () => {
    if (!configured) return;
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      setUser(session?.user ?? null);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      setError("Supabase not configured. Please set environment variables.");
      return;
    }

    let mounted = true;

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (!mounted) return;
      
      if (sessionError) {
        console.error("Session error:", sessionError);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setUser(session?.user ?? null);
        
        switch (event) {
          case "SIGNED_IN":
            showSuccess("Signed in successfully");
            break;
          case "SIGNED_OUT":
            showSuccess("Signed out");
            break;
          case "USER_UPDATED":
            showSuccess("Profile updated");
            break;
          case "PASSWORD_RECOVERY":
            showSuccess("Password recovery email sent");
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured, showSuccess]);

  // =============================================================================
  // Auth Actions
  // =============================================================================

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
      showError(message);
      throw err;
    }
  }, [showError]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split("@")[0],
          },
        },
      });
      if (signUpError) throw signUpError;
      showSuccess("Check your email to confirm your account");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      setError(message);
      showError(message);
      throw err;
    }
  }, [showError, showSuccess]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      setError(message);
      showError(message);
      throw err;
    }
  }, [showError]);

  const signInWithProvider = useCallback(async (provider: Provider) => {
    setError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in with provider";
      setError(message);
      showError(message);
      throw err;
    }
  }, [showError]);

  const signInWithPhone = useCallback(async (phone: string) => {
    setError(null);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
      if (otpError) throw otpError;
      showSuccess("Verification code sent to your phone");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      setError(message);
      showError(message);
      throw err;
    }
  }, [showError, showSuccess]);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (verifyError) throw verifyError;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify phone";
      setError(message);
      showError(message);
      throw err;
    }
  }, [showError]);

  // =============================================================================
  // Memoized Value
  // =============================================================================

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isConfigured: configured,
      signIn,
      signUp,
      signOut,
      signInWithProvider,
      signInWithPhone,
      verifyPhoneOtp,
      refreshUser,
    }),
    [
      user,
      loading,
      error,
      configured,
      signIn,
      signUp,
      signOut,
      signInWithProvider,
      signInWithPhone,
      verifyPhoneOtp,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Memoize the provider to prevent unnecessary re-renders
export const AuthProvider = memo(AuthProviderComponent);
AuthProvider.displayName = "AuthProvider";

// =============================================================================
// Hook
// =============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// =============================================================================
// Selector Hooks for Fine-Grained Subscriptions
// =============================================================================

/**
 * Hook to check if user is authenticated
 * Use this instead of useAuth() when you only need the auth status
 */
export function useIsAuthenticated(): boolean {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useIsAuthenticated must be used within an AuthProvider");
  }
  return context.isAuthenticated;
}

/**
 * Hook to get only the user object
 * Use this instead of useAuth() when you only need the user
 */
export function useUser(): User | null {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context.user;
}

/**
 * Hook to get only the auth loading state
 * Use this instead of useAuth() when you only need the loading state
 */
export function useAuthLoading(): boolean {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthLoading must be used within an AuthProvider");
  }
  return context.loading;
}

export default AuthContext;
