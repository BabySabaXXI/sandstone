"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, Provider } from "@supabase/supabase-js";
import { toast } from "sonner";

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
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key && !url.includes('your-project') && !key.includes('your-key');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setError("Supabase not configured. Please check environment variables.");
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        setError("Failed to check authentication status");
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        toast.success('Signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        toast.success('Signed out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured. Please contact support.");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured. Please contact support.");
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Check your email to confirm your account');
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured");
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured. Please contact support.");
    }
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
  };

  const signInWithPhone = async (phone: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured. Please contact support.");
    }
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Verification code sent to your phone');
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured");
    }
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured");
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Password reset email sent');
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Authentication not configured");
    }
    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    toast.success('Password updated successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      signIn, 
      signUp, 
      signOut,
      signInWithProvider,
      signInWithPhone,
      verifyPhoneOtp,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
