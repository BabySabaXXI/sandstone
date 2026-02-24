/**
 * User API Route for Sandstone
 * User profile, settings, and activity management
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  APIError,
  ErrorCodes,
  handleAPIError,
  generateRequestId,
  checkRateLimit,
  getRateLimitHeaders,
  validateBody,
  success,
  withSecurityHeaders,
  withCache,
} from "@/lib/api";

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional(),
  subjects: z.array(z.enum(["economics", "geography"])).optional(),
  targetGrade: z.string().max(10).optional(),
  examDate: z.string().datetime().optional().nullable(),
});

const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en"]).optional(),
  emailNotifications: z.boolean().optional(),
  studyReminders: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  defaultSubject: z.enum(["economics", "geography"]).optional().nullable(),
  accessibility: z.object({
    highContrast: z.boolean().optional(),
    largeText: z.boolean().optional(),
    reduceMotion: z.boolean().optional(),
  }).optional(),
});

const updatePreferencesSchema = z.object({
  gradingUnits: z.record(z.boolean()).optional(),
  chatHistoryEnabled: z.boolean().optional(),
  autoSaveEssays: z.boolean().optional(),
  defaultQuestionType: z.string().optional(),
});

/**
 * GET handler - Get user profile and settings
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const rateLimitResult = await checkRateLimit(request, "STANDARD");
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new APIError("Authentication required", ErrorCodes.UNAUTHORIZED);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw new APIError(
        "Failed to fetch profile",
        ErrorCodes.DATABASE_ERROR,
        { details: profileError }
      );
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError && settingsError.code !== "PGRST116") {
      throw new APIError(
        "Failed to fetch settings",
        ErrorCodes.DATABASE_ERROR,
        { details: settingsError }
      );
    }

    // Get user stats
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from("activity_log")
      .select("action, subject, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const result = {
      profile: {
        id: user.id,
        email: user.email,
        displayName: profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0],
        avatarUrl: profile?.avatar_url,
        bio: profile?.bio,
        subjects: profile?.subjects || [],
        targetGrade: profile?.target_grade,
        examDate: profile?.exam_date,
        createdAt: profile?.created_at || user.created_at,
        updatedAt: profile?.updated_at,
      },
      settings: {
        theme: settings?.theme || "system",
        language: settings?.language || "en",
        emailNotifications: settings?.email_notifications ?? true,
        studyReminders: settings?.study_reminders ?? true,
        weeklyReport: settings?.weekly_report ?? true,
        defaultSubject: settings?.default_subject,
        accessibility: settings?.accessibility || {
          highContrast: false,
          largeText: false,
          reduceMotion: false,
        },
      },
      preferences: {
        gradingUnits: settings?.grading_units || {
          WEC11: true,
          WEC12: true,
          WEC13: true,
          WEC14: true,
        },
        chatHistoryEnabled: settings?.chat_history_enabled ?? true,
        autoSaveEssays: settings?.auto_save_essays ?? true,
        defaultQuestionType: settings?.default_question_type || "14-mark",
      },
      stats: stats ? {
        totalEssaysGraded: stats.total_essays_graded || 0,
        totalChatMessages: stats.total_chat_messages || 0,
        totalFlashcardsCreated: stats.total_flashcards_created || 0,
        totalQuizzesTaken: stats.total_quizzes_taken || 0,
        totalStudyTime: stats.total_study_time || 0, // minutes
        currentStreak: stats.current_streak || 0,
        longestStreak: stats.longest_streak || 0,
        lastStudyDate: stats.last_study_date,
      } : null,
      recentActivity: recentActivity?.map(a => ({
        action: a.action,
        subject: a.subject,
        timestamp: a.created_at,
      })) || [],
    };

    let response = success(result, 200, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);
    response = withCache(response, { maxAge: 30, private: true }); // 30s cache

    return response;

  } catch (error) {
    console.error(`[${requestId}] User GET error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * PATCH handler - Update user profile
 */
export async function PATCH(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const rateLimitResult = await checkRateLimit(request, "STANDARD");
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new APIError("Authentication required", ErrorCodes.UNAUTHORIZED);
    }

    const body = await request.json();
    const { section = "profile" } = body;

    let result;

    switch (section) {
      case "profile":
        result = await updateProfile(supabase, user.id, body);
        break;
      case "settings":
        result = await updateSettings(supabase, user.id, body);
        break;
      case "preferences":
        result = await updatePreferences(supabase, user.id, body);
        break;
      default:
        throw new APIError(
          "Invalid section. Use: profile, settings, preferences",
          ErrorCodes.VALIDATION_ERROR
        );
    }

    let response = success(result, 200, { requestId, section }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] User PATCH error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * Update user profile
 */
async function updateProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: unknown
): Promise<Record<string, unknown>> {
  const validated = updateProfileSchema.parse(body);

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.displayName !== undefined) updates.display_name = validated.displayName;
  if (validated.avatarUrl !== undefined) updates.avatar_url = validated.avatarUrl;
  if (validated.bio !== undefined) updates.bio = validated.bio;
  if (validated.subjects !== undefined) updates.subjects = validated.subjects;
  if (validated.targetGrade !== undefined) updates.target_grade = validated.targetGrade;
  if (validated.examDate !== undefined) updates.exam_date = validated.examDate;

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...updates,
    })
    .select()
    .single();

  if (error) {
    throw new APIError(
      "Failed to update profile",
      ErrorCodes.DATABASE_ERROR,
      { details: error }
    );
  }

  return {
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    subjects: profile.subjects,
    targetGrade: profile.target_grade,
    examDate: profile.exam_date,
    updatedAt: profile.updated_at,
  };
}

/**
 * Update user settings
 */
async function updateSettings(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: unknown
): Promise<Record<string, unknown>> {
  const validated = updateSettingsSchema.parse(body);

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.theme !== undefined) updates.theme = validated.theme;
  if (validated.language !== undefined) updates.language = validated.language;
  if (validated.emailNotifications !== undefined) updates.email_notifications = validated.emailNotifications;
  if (validated.studyReminders !== undefined) updates.study_reminders = validated.studyReminders;
  if (validated.weeklyReport !== undefined) updates.weekly_report = validated.weeklyReport;
  if (validated.defaultSubject !== undefined) updates.default_subject = validated.defaultSubject;
  if (validated.accessibility !== undefined) updates.accessibility = validated.accessibility;

  const { data: settings, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      ...updates,
    })
    .select()
    .single();

  if (error) {
    throw new APIError(
      "Failed to update settings",
      ErrorCodes.DATABASE_ERROR,
      { details: error }
    );
  }

  return {
    theme: settings.theme,
    language: settings.language,
    emailNotifications: settings.email_notifications,
    studyReminders: settings.study_reminders,
    weeklyReport: settings.weekly_report,
    defaultSubject: settings.default_subject,
    accessibility: settings.accessibility,
    updatedAt: settings.updated_at,
  };
}

/**
 * Update user preferences
 */
async function updatePreferences(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: unknown
): Promise<Record<string, unknown>> {
  const validated = updatePreferencesSchema.parse(body);

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (validated.gradingUnits !== undefined) updates.grading_units = validated.gradingUnits;
  if (validated.chatHistoryEnabled !== undefined) updates.chat_history_enabled = validated.chatHistoryEnabled;
  if (validated.autoSaveEssays !== undefined) updates.auto_save_essays = validated.autoSaveEssays;
  if (validated.defaultQuestionType !== undefined) updates.default_question_type = validated.defaultQuestionType;

  const { data: settings, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      ...updates,
    })
    .select()
    .single();

  if (error) {
    throw new APIError(
      "Failed to update preferences",
      ErrorCodes.DATABASE_ERROR,
      { details: error }
    );
  }

  return {
    gradingUnits: settings.grading_units,
    chatHistoryEnabled: settings.chat_history_enabled,
    autoSaveEssays: settings.auto_save_essays,
    defaultQuestionType: settings.default_question_type,
    updatedAt: settings.updated_at,
  };
}

/**
 * DELETE handler - Delete user account
 */
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const rateLimitResult = await checkRateLimit(request, "STRICT");
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new APIError("Authentication required", ErrorCodes.UNAUTHORIZED);
    }

    // Note: Actual user deletion should be handled carefully
    // This marks the account for deletion rather than immediate deletion
    const { error } = await supabase
      .from("profiles")
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .eq("id", user.id);

    if (error) {
      throw new APIError(
        "Failed to schedule account deletion",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    let response = success(
      {
        message: "Account deletion scheduled. Your account will be deleted in 30 days.",
        scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      200,
      { requestId },
      requestId
    );
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] User DELETE error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(
  rateLimitResult: { allowed: boolean; retryAfter?: number },
  requestId: string
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
      requestId,
      retryAfter: rateLimitResult.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...(rateLimitResult.retryAfter && {
          "Retry-After": String(rateLimitResult.retryAfter),
        }),
      },
    }
  );
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
