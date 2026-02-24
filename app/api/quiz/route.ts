/**
 * Quiz API Route for Sandstone
 * Quiz generation, session management, and scoring
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

// Quiz types
const QUESTION_TYPES = ["mcq", "multiple_select", "short_answer", "essay"] as const;

// Validation schemas
const generateQuizSchema = z.object({
  subject: CommonSchemas.subject,
  unit: CommonSchemas.economicsUnit.optional(),
  topic: z.string().max(200).optional(),
  questionCount: z.number().min(1).max(50).default(10),
  questionTypes: z.array(z.enum(QUESTION_TYPES)).default(["mcq"]),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
  timeLimit: z.number().min(1).max(180).optional(), // minutes
  includeExplanations: z.boolean().default(true),
});

const startQuizSchema = z.object({
  quizId: z.string().uuid(),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answer: z.union([z.string(), z.array(z.string())]),
  timeSpent: z.number().min(0).optional(), // seconds
});

const completeQuizSchema = z.object({
  sessionId: z.string().uuid(),
});

// Query schemas
const listQuizzesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: CommonSchemas.subject.optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional(),
});

const getSessionQuerySchema = z.object({
  sessionId: z.string().uuid(),
});

// Kimi API configuration
const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
const KIMI_MODEL = "kimi-latest";
const KIMI_TIMEOUT = 45000;

// Question type configurations
const QUESTION_TYPE_PROMPTS: Record<string, string> = {
  mcq: `Multiple Choice Questions:
- Provide 4 options (A, B, C, D)
- Only one correct answer
- Include brief explanation of why the answer is correct`,

  multiple_select: `Multiple Select Questions:
- Provide 4-6 options
- Multiple correct answers possible
- Indicate which options are correct
- Explain why each correct option applies`,

  short_answer: `Short Answer Questions:
- Questions requiring 1-3 sentence answers
- Provide model answer
- Include key points that should be mentioned`,

  essay: `Essay Questions:
- Questions requiring detailed written responses
- Provide marking criteria and model answer structure
- Include key points and evaluation requirements`,
};

/**
 * GET handler - List quizzes or get session
 */
export async function GET(request: NextRequest) {
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
    
    // Check if getting a specific session
    const sessionId = searchParams.get("sessionId");
    if (sessionId) {
      return getQuizSession(sessionId, user.id, rateLimitResult, requestId);
    }

    // List quizzes
    const query = validateQuery(request, listQuizzesQuerySchema);
    const { page, limit, subject, difficulty } = query;

    let dbQuery = supabase
      .from("quizzes")
      .select("*, quiz_sessions(id, status, score, started_at, completed_at)", { count: "exact" })
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (subject) dbQuery = dbQuery.eq("subject", subject);
    if (difficulty) dbQuery = dbQuery.eq("difficulty", difficulty);

    const { data: quizzes, error, count } = await dbQuery;

    if (error) {
      throw new APIError(
        "Failed to fetch quizzes",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    const transformedQuizzes = quizzes?.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      unit: quiz.unit,
      topic: quiz.topic,
      questionCount: quiz.question_count,
      questionTypes: quiz.question_types,
      difficulty: quiz.difficulty,
      timeLimit: quiz.time_limit,
      isPublic: quiz.is_public,
      isOwner: quiz.user_id === user.id,
      sessions: quiz.quiz_sessions?.map((s: any) => ({
        id: s.id,
        status: s.status,
        score: s.score,
        startedAt: s.started_at,
        completedAt: s.completed_at,
      })),
      createdAt: quiz.created_at,
    })) || [];

    let response = paginated(
      transformedQuizzes,
      page,
      limit,
      count || 0,
      { requestId },
      requestId
    );

    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);
    response = withCache(response, { maxAge: 60, private: true });

    return response;

  } catch (error) {
    console.error(`[${requestId}] Quiz GET error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * POST handler - Generate quiz or manage session
 */
export async function POST(request: NextRequest) {
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

    switch (body.action) {
      case "generate":
        return generateQuiz(body, user.id, rateLimitResult, requestId);
      case "start":
        return startQuiz(body, user.id, rateLimitResult, requestId);
      case "submit-answer":
        return submitAnswer(body, user.id, rateLimitResult, requestId);
      case "complete":
        return completeQuiz(body, user.id, rateLimitResult, requestId);
      default:
        throw new APIError(
          "Invalid action. Supported: generate, start, submit-answer, complete",
          ErrorCodes.VALIDATION_ERROR
        );
    }

  } catch (error) {
    console.error(`[${requestId}] Quiz POST error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * DELETE handler - Delete quiz
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
      throw new APIError("Quiz ID is required", ErrorCodes.INVALID_QUERY);
    }

    const { error } = await supabase
      .from("quizzes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new APIError(
        "Failed to delete quiz",
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
    console.error(`[${requestId}] Quiz DELETE error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * Generate quiz with AI
 */
async function generateQuiz(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = generateQuizSchema.parse(body);
  const { 
    subject, 
    unit, 
    topic, 
    questionCount, 
    questionTypes, 
    difficulty, 
    timeLimit,
    includeExplanations 
  } = validated;

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new APIError("AI service not configured", ErrorCodes.CONFIGURATION_ERROR);
  }

  const subjectConfig: Record<string, { name: string; topics: string }> = {
    economics: {
      name: "A-Level Economics",
      topics: unit 
        ? `Unit ${unit}: Microeconomics, Macroeconomics, Market Structures, Government Intervention`
        : "Microeconomics, Macroeconomics, Market Structures, Government Intervention, International Trade",
    },
    geography: {
      name: "A-Level Geography",
      topics: "Physical Geography, Human Geography, Fieldwork, Case Studies",
    },
  };

  const questionTypePrompts = questionTypes
    .map(type => QUESTION_TYPE_PROMPTS[type])
    .join("\n\n");

  const prompt = `Generate a ${subjectConfig[subject].name} quiz with ${questionCount} questions.

${topic ? `Focus topic: ${topic}` : `Topics: ${subjectConfig[subject].topics}`}
Difficulty: ${difficulty}
Question types to include:
${questionTypePrompts}

For each question, provide in JSON format:
{
  "type": "mcq" | "multiple_select" | "short_answer" | "essay",
  "question": "question text",
  "options": ["A. option", "B. option", ...] (for mcq/multiple_select),
  "correctAnswer": "A" or ["A", "B"] or "model answer text",
  "explanation": "explanation text",
  "marks": number,
  "difficulty": "easy" | "medium" | "hard"
}

Respond with ONLY a JSON array of questions.`;

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
          { role: "system", content: "You are an expert at creating educational assessment questions for A-Level students." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000 + (questionCount * 300),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new APIError(
        "Failed to generate quiz",
        ErrorCodes.AI_SERVICE_ERROR,
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new APIError("Empty response from AI service", ErrorCodes.AI_SERVICE_ERROR);
    }

    // Parse questions
    let questions: unknown[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      questions = [];
    }

    // Save quiz
    const supabase = createClient();
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        title: topic ? `${subject} Quiz: ${topic}` : `${subject} Quiz`,
        description: `${questions.length} questions on ${topic || subject}`,
        subject,
        unit,
        topic,
        question_count: questions.length,
        question_types: questionTypes,
        difficulty,
        time_limit: timeLimit,
        questions: questions,
        include_explanations: includeExplanations,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      throw new APIError(
        "Failed to save quiz",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    const result = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      unit: quiz.unit,
      topic: quiz.topic,
      questionCount: quiz.question_count,
      questionTypes: quiz.question_types,
      difficulty: quiz.difficulty,
      timeLimit: quiz.time_limit,
      questions: quiz.questions.map((q: any) => ({
        id: q.id || crypto.randomUUID(),
        type: q.type,
        question: q.question,
        options: q.options,
        marks: q.marks,
        difficulty: q.difficulty,
        // Don't include correct answers in initial response
      })),
      createdAt: quiz.created_at,
    };

    let nextResponse = created(result, 201, { requestId }, requestId);
    
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
 * Start quiz session
 */
async function startQuiz(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = startQuizSchema.parse(body);
  const { quizId } = validated;

  const supabase = createClient();

  // Get quiz
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .single();

  if (!quiz) {
    throw new APIError("Quiz not found", ErrorCodes.NOT_FOUND);
  }

  // Create session
  const { data: session, error } = await supabase
    .from("quiz_sessions")
    .insert({
      user_id: userId,
      quiz_id: quizId,
      status: "in_progress",
      started_at: new Date().toISOString(),
      answers: [],
    })
    .select()
    .single();

  if (error) {
    throw new APIError(
      "Failed to start quiz session",
      ErrorCodes.DATABASE_ERROR,
      { details: error }
    );
  }

  const result = {
    sessionId: session.id,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.question_count,
      timeLimit: quiz.time_limit,
      questions: quiz.questions.map((q: any) => ({
        id: q.id || crypto.randomUUID(),
        type: q.type,
        question: q.question,
        options: q.options,
        marks: q.marks,
      })),
    },
    startedAt: session.started_at,
  };

  let response = created(result, 201, { requestId }, requestId);
  
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response = withSecurityHeaders(response);

  return response;
}

/**
 * Submit answer
 */
async function submitAnswer(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = submitAnswerSchema.parse(body);
  const { sessionId, questionId, answer, timeSpent } = validated;

  const supabase = createClient();

  // Get session
  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("*, quizzes(questions)")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    throw new APIError("Session not found", ErrorCodes.NOT_FOUND);
  }

  if (session.status !== "in_progress") {
    throw new APIError(
      "Quiz session is not active",
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // Find question
  const question = session.quizzes.questions.find((q: any) => q.id === questionId);
  if (!question) {
    throw new APIError("Question not found in this quiz", ErrorCodes.NOT_FOUND);
  }

  // Check answer
  const isCorrect = checkAnswer(answer, question.correctAnswer, question.type);
  const marksAwarded = isCorrect ? question.marks : 0;

  // Update session
  const currentAnswers = session.answers || [];
  const answerIndex = currentAnswers.findIndex((a: any) => a.questionId === questionId);
  
  const answerRecord = {
    questionId,
    answer,
    isCorrect,
    marksAwarded,
    timeSpent,
    submittedAt: new Date().toISOString(),
  };

  if (answerIndex >= 0) {
    currentAnswers[answerIndex] = answerRecord;
  } else {
    currentAnswers.push(answerRecord);
  }

  const { error } = await supabase
    .from("quiz_sessions")
    .update({ answers: currentAnswers })
    .eq("id", sessionId);

  if (error) {
    throw new APIError(
      "Failed to save answer",
      ErrorCodes.DATABASE_ERROR,
      { details: error }
    );
  }

  const result = {
    isCorrect,
    marksAwarded,
    totalMarks: question.marks,
    explanation: session.quizzes.include_explanations ? question.explanation : undefined,
    progress: {
      answered: currentAnswers.length,
      total: session.quizzes.questions.length,
    },
  };

  let response = success(result, 200, { requestId }, requestId);
  
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response = withSecurityHeaders(response);

  return response;
}

/**
 * Complete quiz and calculate score
 */
async function completeQuiz(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = completeQuizSchema.parse(body);
  const { sessionId } = validated;

  const supabase = createClient();

  // Get session
  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("*, quizzes(questions, question_count)")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    throw new APIError("Session not found", ErrorCodes.NOT_FOUND);
  }

  if (session.status !== "in_progress") {
    throw new APIError(
      "Quiz session already completed",
      ErrorCodes.VALIDATION_ERROR
    );
  }

  // Calculate score
  const answers = session.answers || [];
  const totalMarks = session.quizzes.questions.reduce((sum: number, q: any) => sum + q.marks, 0);
  const earnedMarks = answers.reduce((sum: number, a: any) => sum + (a.marksAwarded || 0), 0);
  const percentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;

  // Update session
  const { data: updatedSession, error } = await supabase
    .from("quiz_sessions")
    .update({
      status: "completed",
      score: earnedMarks,
      total_marks: totalMarks,
      percentage: Number(percentage.toFixed(1)),
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw new APIError(
      "Failed to complete quiz",
      ErrorCodes.DATABASE_ERROR,
      { details: error }
    );
  }

  const result = {
    sessionId: updatedSession.id,
    score: earnedMarks,
    totalMarks,
    percentage: Number(percentage.toFixed(1)),
    correctAnswers: answers.filter((a: any) => a.isCorrect).length,
    totalQuestions: session.quizzes.question_count,
    answeredQuestions: answers.length,
    completedAt: updatedSession.completed_at,
    answers: answers.map((a: any) => ({
      questionId: a.questionId,
      isCorrect: a.isCorrect,
      marksAwarded: a.marksAwarded,
    })),
  };

  let response = success(result, 200, { requestId }, requestId);
  
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response = withSecurityHeaders(response);

  return response;
}

/**
 * Get quiz session details
 */
async function getQuizSession(
  sessionId: string,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const supabase = createClient();

  const { data: session } = await supabase
    .from("quiz_sessions")
    .select("*, quizzes(*)")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    throw new APIError("Session not found", ErrorCodes.NOT_FOUND);
  }

  const result = {
    id: session.id,
    status: session.status,
    quiz: {
      id: session.quizzes.id,
      title: session.quizzes.title,
      subject: session.quizzes.subject,
    },
    score: session.score,
    totalMarks: session.total_marks,
    percentage: session.percentage,
    startedAt: session.started_at,
    completedAt: session.completed_at,
    answers: session.answers,
  };

  let response = success(result, 200, { requestId }, requestId);
  
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response = withSecurityHeaders(response);

  return response;
}

/**
 * Check if answer is correct
 */
function checkAnswer(
  userAnswer: string | string[],
  correctAnswer: string | string[],
  questionType: string
): boolean {
  switch (questionType) {
    case "mcq":
      return String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
    
    case "multiple_select":
      const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
      const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      const normalizedUser = userArr.map(a => String(a).toLowerCase().trim()).sort();
      const normalizedCorrect = correctArr.map(a => String(a).toLowerCase().trim()).sort();
      return JSON.stringify(normalizedUser) === JSON.stringify(normalizedCorrect);
    
    case "short_answer":
    case "essay":
      // For text answers, we'd need AI evaluation
      // For now, mark as needing review
      return false;
    
    default:
      return false;
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
