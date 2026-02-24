/**
 * Flashcards API Route for Sandstone
 * CRUD operations for flashcards with AI generation
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
  validateQuery,
  success,
  created,
  paginated,
  noContent,
  withSecurityHeaders,
  withCache,
  CommonSchemas,
} from "@/lib/api";

// Flashcard validation schemas
const flashcardSchema = z.object({
  id: z.string().uuid().optional(),
  front: z.string().min(1, "Front content is required").max(1000, "Front content too long"),
  back: z.string().min(1, "Back content is required").max(2000, "Back content too long"),
  subject: CommonSchemas.subject,
  topic: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  source: z.enum(["manual", "ai-generated", "imported"]).optional().default("manual"),
});

const generateFlashcardsSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(500),
  subject: CommonSchemas.subject,
  count: z.number().min(1).max(20).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  unit: CommonSchemas.economicsUnit.optional(),
});

const updateProgressSchema = z.object({
  flashcardId: z.string().uuid(),
  confidence: z.enum(["again", "hard", "good", "easy"]),
  timeSpent: z.number().min(0).optional(), // seconds
});

// Query schemas
const listFlashcardsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: CommonSchemas.subject.optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  search: z.string().optional(),
  tags: z.string().optional(), // comma-separated
});

// Kimi API configuration
const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
const KIMI_MODEL = "kimi-latest";
const KIMI_TIMEOUT = 30000;

/**
 * GET handler - List flashcards
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, "STANDARD");
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    // Authenticate
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new APIError("Authentication required", ErrorCodes.UNAUTHORIZED);
    }

    // Parse query parameters
    const query = validateQuery(request, listFlashcardsQuerySchema);
    const { page, limit, subject, topic, difficulty, search, tags } = query;

    // Build database query
    let dbQuery = supabase
      .from("flashcards")
      .select("*, flashcard_progress(confidence, review_count, last_reviewed)", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (subject) dbQuery = dbQuery.eq("subject", subject);
    if (topic) dbQuery = dbQuery.ilike("topic", `%${topic}%`);
    if (difficulty) dbQuery = dbQuery.eq("difficulty", difficulty);
    if (search) {
      dbQuery = dbQuery.or(`front.ilike.%${search}%,back.ilike.%${search}%`);
    }
    if (tags) {
      const tagList = tags.split(",").map(t => t.trim());
      dbQuery = dbQuery.contains("tags", tagList);
    }

    const { data: flashcards, error, count } = await dbQuery;

    if (error) {
      throw new APIError(
        "Failed to fetch flashcards",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    // Transform data
    const transformedFlashcards = flashcards?.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      subject: card.subject,
      topic: card.topic,
      tags: card.tags || [],
      difficulty: card.difficulty,
      source: card.source,
      progress: card.flashcard_progress?.[0] || null,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
    })) || [];

    let response = paginated(
      transformedFlashcards,
      page,
      limit,
      count || 0,
      { requestId },
      requestId
    );

    // Add headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);
    response = withCache(response, { maxAge: 60, private: true }); // 1 minute cache

    return response;

  } catch (error) {
    console.error(`[${requestId}] Flashcards GET error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * POST handler - Create flashcard or generate with AI
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, "STANDARD");
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    // Authenticate
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new APIError("Authentication required", ErrorCodes.UNAUTHORIZED);
    }

    // Parse body to determine action
    const body = await request.json();

    // Check if this is a generation request
    if (body.action === "generate") {
      return generateFlashcards(body, user.id, rateLimitResult, requestId);
    }

    // Regular create
    const validated = flashcardSchema.parse(body);
    const { id, ...flashcardData } = validated;

    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: user.id,
        front: flashcardData.front,
        back: flashcardData.back,
        subject: flashcardData.subject,
        topic: flashcardData.topic,
        tags: flashcardData.tags,
        difficulty: flashcardData.difficulty,
        source: flashcardData.source,
      })
      .select()
      .single();

    if (error) {
      throw new APIError(
        "Failed to create flashcard",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    let response = created(
      {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        subject: flashcard.subject,
        topic: flashcard.topic,
        tags: flashcard.tags,
        difficulty: flashcard.difficulty,
        source: flashcard.source,
        createdAt: flashcard.created_at,
      },
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
    console.error(`[${requestId}] Flashcards POST error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * PATCH handler - Update flashcard
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

    const body = await validateBody(request, flashcardSchema.partial().extend({
      id: z.string().uuid(),
    }));
    const { id, ...updates } = body;

    // Verify ownership
    const { data: existing } = await supabase
      .from("flashcards")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      throw new APIError("Flashcard not found", ErrorCodes.NOT_FOUND);
    }

    const { data: flashcard, error } = await supabase
      .from("flashcards")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new APIError(
        "Failed to update flashcard",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    let response = success(
      {
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        subject: flashcard.subject,
        topic: flashcard.topic,
        tags: flashcard.tags,
        difficulty: flashcard.difficulty,
        updatedAt: flashcard.updated_at,
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
    console.error(`[${requestId}] Flashcards PATCH error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * DELETE handler - Delete flashcard
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new APIError("Flashcard ID is required", ErrorCodes.INVALID_QUERY);
    }

    // Soft delete
    const { error } = await supabase
      .from("flashcards")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new APIError(
        "Failed to delete flashcard",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    let response = noContent();
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] Flashcards DELETE error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * Generate flashcards with AI
 */
async function generateFlashcards(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = generateFlashcardsSchema.parse(body);
  const { topic, subject, count, difficulty, unit } = validated;

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new APIError(
      "AI service not configured",
      ErrorCodes.CONFIGURATION_ERROR
    );
  }

  const subjectPrompts: Record<string, string> = {
    economics: `You are an A-Level Economics expert. Create flashcards for the topic: "${topic}"${unit ? ` (Unit: ${unit})` : ""}.

Each flashcard should have:
- Front: A key concept, term, or question
- Back: A clear, concise explanation or answer

Focus on:
- Precise economic terminology
- Real-world examples where applicable
- Connections to the Edexcel IAL syllabus
- Both knowledge and application`,

    geography: `You are an A-Level Geography expert. Create flashcards for the topic: "${topic}".

Each flashcard should have:
- Front: A key concept, term, case study, or question
- Back: A clear, concise explanation with specific examples

Focus on:
- Accurate geographical terminology
- Specific place-based examples and case studies
- Relevant data and statistics
- Both physical and human geography concepts`,
  };

  const prompt = `${subjectPrompts[subject]}

Generate exactly ${count} flashcards at ${difficulty} difficulty level.

Respond ONLY with a JSON array in this exact format:
[
  {
    "front": "Question or term on front",
    "back": "Answer or explanation on back",
    "topic": "Sub-topic category",
    "tags": ["tag1", "tag2"]
  }
]`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), KIMI_TIMEOUT);

  try {
    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Generate ${count} flashcards about ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 2000 + (count * 200),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new APIError(
        "Failed to generate flashcards",
        ErrorCodes.AI_SERVICE_ERROR,
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new APIError(
        "Empty response from AI service",
        ErrorCodes.AI_SERVICE_ERROR
      );
    }

    // Parse generated flashcards
    let generatedFlashcards: Array<{
      front: string;
      back: string;
      topic?: string;
      tags?: string[];
    }> = [];

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedFlashcards = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback parsing
      generatedFlashcards = parseFlashcardsFromText(content);
    }

    // Save generated flashcards
    const supabase = createClient();
    const flashcardsToInsert = generatedFlashcards.map(card => ({
      user_id: userId,
      front: card.front,
      back: card.back,
      subject,
      topic: card.topic || topic,
      tags: card.tags || [topic.toLowerCase().replace(/\s+/g, "-")],
      difficulty,
      source: "ai-generated",
    }));

    const { data: savedFlashcards, error } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select();

    if (error) {
      console.error("Failed to save generated flashcards:", error);
      // Return generated flashcards without saving
    }

    const result = {
      generated: generatedFlashcards.length,
      flashcards: (savedFlashcards || generatedFlashcards).map((card: any) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        subject,
        topic: card.topic,
        tags: card.tags,
        difficulty,
        source: "ai-generated",
      })),
    };

    let nextResponse = success(result, 200, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });
    nextResponse = withSecurityHeaders(nextResponse);

    return nextResponse;

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Parse flashcards from text fallback
 */
function parseFlashcardsFromText(content: string): Array<{ front: string; back: string }> {
  const flashcards: Array<{ front: string; back: string }> = [];
  const lines = content.split("\n");
  
  let currentCard: { front?: string; back?: string } = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.toLowerCase().startsWith("front:") || trimmed.toLowerCase().startsWith("q:")) {
      if (currentCard.front && currentCard.back) {
        flashcards.push({ front: currentCard.front, back: currentCard.back });
      }
      currentCard = { front: trimmed.replace(/^[^:]+:/, "").trim() };
    } else if (trimmed.toLowerCase().startsWith("back:") || trimmed.toLowerCase().startsWith("a:")) {
      currentCard.back = trimmed.replace(/^[^:]+:/, "").trim();
    }
  }
  
  if (currentCard.front && currentCard.back) {
    flashcards.push({ front: currentCard.front, back: currentCard.back });
  }
  
  return flashcards;
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
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
