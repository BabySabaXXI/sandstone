"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Provider, AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Auth context type definition
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  
  // Utility methods
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Error message mapping for user-friendly errors
const getErrorMessage = (error: AuthError | Error | unknown): string => {
  if (!error) return "An unknown error occurred";
  
  const message = error instanceof Error ? error.message : String(error);
  
  // Map common errors to user-friendly messages
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password. Please try again.",
    "Email not confirmed": "Please confirm your email address before signing in.",
    "User already registered": "An account with this email already exists.",
    "Password should be at least 6 characters": "Password must be at least 6 characters long.",
    "Unable to validate email address": "Please enter a valid email address.",
    "Rate limit exceeded": "Too many attempts. Please try again later.",
    "fetch failed": "Connection error. Please check your internet connection.",
    "Network error": "Network error. Please check your internet connection.",
  };
  
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return message;
};

/**
 * Auth Provider Component
 * 
 * Provides authentication state and methods to the application.
 * Handles:
 * - Session initialization and monitoring
 * - Token refresh
 * - Auth state changes across tabs
 * - Error handling and user feedback
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured] = useState(() => isSupabaseConfigured());

  // Get Supabase client
  const supabase = isConfigured ? getSupabaseBrowserClient() : null;

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        setUser(null);
      } else {
        setUser(data.session?.user ?? null);
      }
    } catch (err) {
      console.error("Unexpected error refreshing session:", err);
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      setError("Supabase not configured. Please set environment variables.");
      return;
    }

    let mounted = true;

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error("Session error:", error);
          setError(getErrorMessage(error));
        } else {
          setUser(data.session?.user ?? null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) {
          setError("Failed to initialize authentication");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      setUser(session?.user ?? null);

      switch (event) {
        case "SIGNED_IN":
          toast.success("Signed in successfully");
          setError(null);
          break;
        case "SIGNED_OUT":
          toast.success("Signed out");
          setError(null);
          break;
        case "USER_UPDATED":
          toast.success("Profile updated");
          break;
        case "PASSWORD_RECOVERY":
          toast.info("Password recovery initiated");
          break;
        case "TOKEN_REFRESHED":
          console.log("Token refreshed successfully");
          break;
        case "USER_DELETED":
          toast.info("Account deleted");
          break;
      }
    });

    // Handle visibility change for cross-tab sync
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Refresh session when tab becomes visible
        refreshSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isConfigured, supabase, refreshSession]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        throw error;
      }
    },
    [supabase, clearError]
  );

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        throw error;
      }

      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.info("Please check your email to confirm your account");
      } else {
        toast.success("Account created successfully!");
      }
    },
    [supabase, clearError]
  );

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    clearError();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, [supabase, clearError]);

  /**
   * Sign in with OAuth provider (Google, GitHub, etc.)
   */
  const signInWithProvider = useCallback(
    async (provider: Provider) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      
      // Get the current URL for redirect
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          // Use PKCE for enhanced security
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        const message = getErrorMessage(error);
        toast.error(message);
        throw error;
      }
    },
    [supabase, clearError]
  );

  /**
   * Sign in with phone (OTP)
   */
  const signInWithPhone = useCallback(
    async (phone: string) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }

      toast.success("Verification code sent to your phone");
    },
    [supabase, clearError]
  );

  /**
   * Verify phone OTP
   */
  const verifyPhoneOtp = useCallback(
    async (phone: string, token: string) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }

      toast.success("Phone verified successfully");
    },
    [supabase, clearError]
  );

  /**
   * Request password reset email
   */
  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }

      toast.success("Password reset email sent. Please check your inbox.");
    },
    [supabase, clearError]
  );

  /**
   * Update user password
   */
  const updatePassword = useCallback(
    async (newPassword: string) => {
      if (!supabase) {
        throw new Error("Supabase not configured");
      }

      clearError();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }

      toast.success("Password updated successfully");
    },
    [supabase, clearError]
  );

  const value: AuthContextType = {
    user,
    loading,
    error,
    isConfigured,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    signInWithPhone,
    verifyPhoneOtp,
    resetPassword,
    updatePassword,
    refreshSession,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * 
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Hook to check if user is authenticated
 * 
 * Returns { isAuthenticated, isLoading } for easy conditional rendering
 */
export function useIsAuthenticated(): { isAuthenticated: boolean; isLoading: boolean } {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, isLoading: loading };
}

/**
 * Hook to get the current user
 * 
 * Returns null if not authenticated
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}
