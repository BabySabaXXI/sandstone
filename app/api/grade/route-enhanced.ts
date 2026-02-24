/**
 * Enhanced Grade API Route
 * Sandstone App - AI Essay Grading Endpoint
 * 
 * Provides secure, rate-limited essay grading with comprehensive feedback.
 * Optimized for Edexcel A-Level Economics and Geography.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { 
  gradeEssay, 
  validateGradingRequest,
  GradingError,
  type GradingRequest,
} from "@/lib/examiners/grading-service";
import { 
  QuestionType, 
  UnitCode,
  getQuestionTypeConfig,
  calculateGrade,
} from "@/lib/examiners/config";

// ============================================================================
// Validation Schema
// ============================================================================

const gradeRequestSchema = z.object({
  question: z.string()
    .min(1, "Question is required")
    .max(2000, "Question too long (max 2000 characters)"),
  essay: z.string()
    .min(1, "Essay response is required")
    .max(10000, "Response too long (max 10000 characters)"),
  subject: z.enum(["economics", "geography"], {
    errorMap: () => ({ message: "Subject must be 'economics' or 'geography'" }),
  }),
  unit: z.enum(["WEC11", "WEC12", "WEC13", "WEC14"]).optional(),
  questionType: z.enum([
    "4-mark", "6-mark", "8-mark", "10-mark", 
    "12-mark", "14-mark", "16-mark", "20-mark"
  ]).optional(),
  hasDiagram: z.boolean().optional(),
  contextData: z.string().max(5000).optional(),
  extractInfo: z.string().max(5000).optional(),
});

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
  requests: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const RATE_LIMITS = {
  free: { maxRequests: 5, windowMs: 60000 },      // 5 requests per minute
  basic: { maxRequests: 15, windowMs: 60000 },    // 15 requests per minute
  premium: { maxRequests: 50, windowMs: 60000 },  // 50 requests per minute
};

function checkRateLimit(identifier: string, tier: keyof typeof RATE_LIMITS = "free"): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
} {
  const now = Date.now();
  const limit = RATE_LIMITS[tier];
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + limit.windowMs,
      requests: [now],
    };
    rateLimitMap.set(identifier, newRecord);
    return { allowed: true, remaining: limit.maxRequests - 1, resetTime: newRecord.resetTime };
  }

  // Clean old requests outside window
  record.requests = record.requests.filter(time => now - time < limit.windowMs);
  
  if (record.requests.length >= limit.maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.requests.push(now);
  record.count++;
  
  return { 
    allowed: true, 
    remaining: limit.maxRequests - record.requests.length,
    resetTime: record.resetTime,
  };
}

// ============================================================================
// Authentication Helper
// ============================================================================

async function authenticateRequest(request: NextRequest): Promise<{
  user: { id: string; email?: string } | null;
  error?: string;
  status?: number;
}> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: "Unauthorized. Please sign in.", status: 401 };
    }

    return { user: { id: user.id, email: user.email } };
  } catch (error) {
    console.error("Auth error:", error);
    return { user: null, error: "Authentication failed", status: 500 };
  }
}

// ============================================================================
// Request Logging
// ============================================================================

function logGradingRequest(
  userId: string,
  questionType: string,
  duration: number,
  success: boolean,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    userId: userId.slice(0, 8) + "...",
    questionType,
    duration: `${duration}ms`,
    success,
    error: error || undefined,
  };
  
  if (success) {
    console.log("[GRADE]", JSON.stringify(logEntry));
  } else {
    console.error("[GRADE ERROR]", JSON.stringify(logEntry));
  }
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authenticate
    const auth = await authenticateRequest(request);
    if (!auth.user) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status || 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(auth.user.id, "free");
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          retryAfter,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000)),
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validationResult = gradeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request format", 
          details: validationResult.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Additional validation
    const validationErrors = validateGradingRequest(data as GradingRequest);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.KIMI_API_KEY) {
      console.error("KIMI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 503 }
      );
    }

    // Get question type config for validation
    const qtConfig = getQuestionTypeConfig(data.questionType as QuestionType);
    if (data.questionType && !qtConfig) {
      return NextResponse.json(
        { error: `Invalid question type: ${data.questionType}` },
        { status: 400 }
      );
    }

    // Perform grading
    const gradingResult = await gradeEssay({
      question: data.question,
      essay: data.essay,
      subject: data.subject,
      unit: data.unit as UnitCode,
      questionType: data.questionType as QuestionType,
      hasDiagram: data.hasDiagram,
      contextData: data.contextData,
      extractInfo: data.extractInfo,
    });

    const duration = Date.now() - startTime;
    logGradingRequest(auth.user.id, data.questionType || "unknown", duration, true);

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: gradingResult,
        meta: {
          processedAt: new Date().toISOString(),
          processingTime: duration,
          rateLimit: {
            remaining: rateLimit.remaining,
            resetTime: new Date(rateLimit.resetTime).toISOString(),
          },
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Handle specific error types
    if (error instanceof GradingError) {
      logGradingRequest("unknown", "unknown", duration, false, error.message);
      
      const statusCode = error.code === "VALIDATION_ERROR" ? 400 
        : error.code === "CONFIG_ERROR" ? 503 
        : 500;
      
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: statusCode }
      );
    }

    // Handle generic errors
    console.error("Grade API error:", error);
    logGradingRequest("unknown", "unknown", duration, false, String(error));
    
    return NextResponse.json(
      { 
        error: "An unexpected error occurred. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET Handler - Status Check
// ============================================================================

export async function GET(request: NextRequest) {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { 
        status: "unavailable",
        message: "AI grading service not configured",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  // Test Kimi API connectivity
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch("https://api.moonshot.cn/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      return NextResponse.json({
        status: "available",
        message: "AI grading service is operational",
        timestamp: new Date().toISOString(),
        features: {
          subjects: ["economics", "geography"],
          questionTypes: ["4-mark", "6-mark", "8-mark", "10-mark", "12-mark", "14-mark", "16-mark", "20-mark"],
          assessmentObjectives: ["AO1", "AO2", "AO3", "AO4"],
          multiExaminer: true,
          annotations: true,
          diagramFeedback: true,
        },
      });
    } else {
      return NextResponse.json(
        { 
          status: "degraded",
          message: "AI service experiencing issues",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { 
        status: "unavailable",
        message: "Cannot connect to AI service",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

// ============================================================================
// OPTIONS Handler - CORS
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
