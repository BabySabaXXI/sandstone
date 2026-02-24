/**
 * User Data Fetching Hooks with SWR
 * Features: caching, profile management, settings, stats
 */

'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cacheKeys, userSWRConfig, cacheMutations } from '@/lib/swr/config';
import type { User } from '@supabase/supabase-js';

const supabase = createClient();

// ============================================================================
// Types
// ============================================================================

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    studyReminders: boolean;
  };
  studyPreferences: {
    defaultSubject: string;
    dailyGoal: number;
    sessionLength: number;
  };
}

interface UserStats {
  totalDocuments: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalStudyTime: number; // in minutes
  streakDays: number;
  lastStudyDate?: Date;
}

interface UpdateProfileParams {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
}

interface UpdateSettingsParams {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: Partial<UserSettings['notifications']>;
  studyPreferences?: Partial<UserSettings['studyPreferences']>;
}

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch current user
 */
async function fetchUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Fetch user profile
 */
async function fetchUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const now = new Date();
      const newProfile: UserProfile = {
        id: user.id,
        email: user.email!,
        createdAt: now,
        updatedAt: now,
      };

      await supabase.from('profiles').insert({
        id: newProfile.id,
        email: newProfile.email,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });

      return newProfile;
    }
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    timezone: data.timezone,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Fetch user settings
 */
async function fetchUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Settings don't exist, create defaults
      const defaultSettings: UserSettings = {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          studyReminders: true,
        },
        studyPreferences: {
          defaultSubject: 'economics',
          dailyGoal: 30,
          sessionLength: 25,
        },
      };

      await supabase.from('user_settings').insert({
        user_id: user.id,
        theme: defaultSettings.theme,
        language: defaultSettings.language,
        notifications: defaultSettings.notifications,
        study_preferences: defaultSettings.studyPreferences,
      });

      return defaultSettings;
    }
    throw error;
  }

  return {
    theme: data.theme || 'system',
    language: data.language || 'en',
    notifications: {
      email: data.notifications?.email ?? true,
      push: data.notifications?.push ?? true,
      studyReminders: data.notifications?.study_reminders ?? true,
    },
    studyPreferences: {
      defaultSubject: data.study_preferences?.default_subject || 'economics',
      dailyGoal: data.study_preferences?.daily_goal || 30,
      sessionLength: data.study_preferences?.session_length || 25,
    },
  };
}

/**
 * Fetch user stats
 */
async function fetchUserStats(): Promise<UserStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get document count
  const { count: documentCount, error: docError } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (docError) throw docError;

  // Get flashcard count
  const { count: flashcardCount, error: cardError } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (cardError) throw cardError;

  // Get quiz count
  const { count: quizCount, error: quizError } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (quizError) throw quizError;

  // Get study stats
  const { data: stats, error: statsError } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (statsError && statsError.code !== 'PGRST116') throw statsError;

  return {
    totalDocuments: documentCount || 0,
    totalFlashcards: flashcardCount || 0,
    totalQuizzes: quizCount || 0,
    totalStudyTime: stats?.total_study_time || 0,
    streakDays: stats?.streak_days || 0,
    lastStudyDate: stats?.last_study_date ? new Date(stats.last_study_date) : undefined,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Update user profile
 */
async function updateProfile(
  url: string,
  { arg }: { arg: UpdateProfileParams }
): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: arg.fullName,
      avatar_url: arg.avatarUrl,
      bio: arg.bio,
      timezone: arg.timezone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw error;

  // Fetch updated profile
  const updated = await fetchUserProfile();
  if (!updated) throw new Error('Profile not found after update');
  
  return updated;
}

/**
 * Update user settings
 */
async function updateSettings(
  url: string,
  { arg }: { arg: UpdateSettingsParams }
): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch current settings
  const { data: current, error: fetchError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (arg.theme !== undefined) updates.theme = arg.theme;
  if (arg.language !== undefined) updates.language = arg.language;
  if (arg.notifications !== undefined) {
    updates.notifications = {
      ...current?.notifications,
      ...arg.notifications,
    };
  }
  if (arg.studyPreferences !== undefined) {
    updates.study_preferences = {
      ...current?.study_preferences,
      ...arg.studyPreferences,
    };
  }

  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: user.id,
      ...updates,
    });

  if (error) throw error;

  // Fetch updated settings
  const updated = await fetchUserSettings();
  if (!updated) throw new Error('Settings not found after update');
  
  return updated;
}

/**
 * Update avatar
 */
async function updateAvatar(
  url: string,
  { arg }: { arg: File }
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = arg.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arg, {
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  return publicUrl;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch current user
 */
export function useUser() {
  return useSWR<User | null>(
    cacheKeys.user,
    fetchUser,
    userSWRConfig
  );
}

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  return useSWR<UserProfile | null>(
    cacheKeys.userProfile,
    fetchUserProfile,
    userSWRConfig
  );
}

/**
 * Hook to fetch user settings
 */
export function useUserSettings() {
  return useSWR<UserSettings | null>(
    cacheKeys.userSettings,
    fetchUserSettings,
    userSWRConfig
  );
}

/**
 * Hook to fetch user stats
 */
export function useUserStats() {
  return useSWR<UserStats | null>(
    cacheKeys.userStats,
    fetchUserStats,
    { ...userSWRConfig, refreshInterval: 60000 } // Refresh every minute
  );
}

/**
 * Hook to update profile with optimistic updates
 */
export function useUpdateProfile() {
  return useSWRMutation<UserProfile, Error, string, UpdateProfileParams>(
    cacheKeys.userProfile,
    updateProfile,
    {
      onSuccess: (data) => {
        toast.success('Profile updated successfully');
        
        globalMutate(cacheKeys.userProfile, data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to update profile: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update settings with optimistic updates
 */
export function useUpdateSettings() {
  return useSWRMutation<UserSettings, Error, string, UpdateSettingsParams>(
    cacheKeys.userSettings,
    updateSettings,
    {
      onSuccess: (data) => {
        toast.success('Settings updated successfully');
        
        globalMutate(cacheKeys.userSettings, data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to update settings: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update avatar
 */
export function useUpdateAvatar() {
  return useSWRMutation<string, Error, string, File>(
    cacheKeys.userProfile,
    updateAvatar,
    {
      onSuccess: (data) => {
        toast.success('Avatar updated successfully');
        
        // Revalidate profile to get updated avatar URL
        globalMutate(cacheKeys.userProfile);
      },
      onError: (error) => {
        toast.error(`Failed to update avatar: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to sign out
 */
export function useSignOut() {
  return useSWRMutation<void, Error, string>(
    cacheKeys.user,
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    {
      onSuccess: () => {
        // Clear all user-related caches
        globalMutate(cacheKeys.user, null, { revalidate: false });
        globalMutate(cacheKeys.userProfile, null, { revalidate: false });
        globalMutate(cacheKeys.userSettings, null, { revalidate: false });
        globalMutate(cacheKeys.userStats, null, { revalidate: false });
        
        toast.success('Signed out successfully');
      },
      onError: (error) => {
        toast.error(`Failed to sign out: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Revalidation Helpers
// ============================================================================

/**
 * Revalidate user data
 */
export function revalidateUser(): Promise<void> {
  return globalMutate(cacheKeys.user);
}

/**
 * Revalidate user profile
 */
export function revalidateUserProfile(): Promise<void> {
  return globalMutate(cacheKeys.userProfile);
}

/**
 * Revalidate user stats
 */
export function revalidateUserStats(): Promise<void> {
  return globalMutate(cacheKeys.userStats);
}

// ============================================================================
// Exports
// ============================================================================

export type {
  UserProfile,
  UserSettings,
  UserStats,
  UpdateProfileParams,
  UpdateSettingsParams,
};
