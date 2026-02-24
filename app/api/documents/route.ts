/**
 * Documents API Route for Sandstone
 * Document upload, processing, and management
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
  validateQuery,
  success,
  created,
  paginated,
  noContent,
  withSecurityHeaders,
  withCache,
  CommonSchemas,
} from "@/lib/api";

// Document types
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Validation schemas
const documentMetadataSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  subject: CommonSchemas.subject.optional(),
  topic: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  isPublic: z.boolean().optional().default(false),
});

const generateSummarySchema = z.object({
  documentId: z.string().uuid(),
  maxLength: z.number().min(100).max(2000).default(500),
});

const generateQuestionsSchema = z.object({
  documentId: z.string().uuid(),
  count: z.number().min(1).max(20).default(5),
  questionTypes: z.array(z.enum(["mcq", "short", "essay"])).default(["mcq", "short"]),
});

// Query schemas
const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  subject: CommonSchemas.subject.optional(),
  search: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(["created_at", "title", "file_size"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Kimi API configuration
const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
const KIMI_MODEL = "kimi-latest";
const KIMI_TIMEOUT = 45000;

/**
 * GET handler - List documents
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

    const query = validateQuery(request, listDocumentsQuerySchema);
    const { page, limit, subject, search, tags, sortBy, sortOrder } = query;

    let dbQuery = supabase
      .from("documents")
      .select("*", { count: "exact" })
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .is("deleted_at", null)
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range((page - 1) * limit, page * limit - 1);

    if (subject) dbQuery = dbQuery.eq("subject", subject);
    if (search) {
      dbQuery = dbQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (tags) {
      const tagList = tags.split(",").map(t => t.trim());
      dbQuery = dbQuery.contains("tags", tagList);
    }

    const { data: documents, error, count } = await dbQuery;

    if (error) {
      throw new APIError(
        "Failed to fetch documents",
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    const transformedDocuments = documents?.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileName: doc.file_name,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      subject: doc.subject,
      topic: doc.topic,
      tags: doc.tags || [],
      isPublic: doc.is_public,
      isOwner: doc.user_id === user.id,
      summary: doc.summary,
      processingStatus: doc.processing_status,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    })) || [];

    let response = paginated(
      transformedDocuments,
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
    console.error(`[${requestId}] Documents GET error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * POST handler - Upload document or process action
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

    const contentType = request.headers.get("content-type") || "";

    // Handle multipart form data (file upload)
    if (contentType.includes("multipart/form-data")) {
      return handleFileUpload(request, user.id, rateLimitResult, requestId);
    }

    // Handle JSON actions
    const body = await request.json();

    switch (body.action) {
      case "generate-summary":
        return generateDocumentSummary(body, user.id, rateLimitResult, requestId);
      case "generate-questions":
        return generateDocumentQuestions(body, user.id, rateLimitResult, requestId);
      default:
        throw new APIError(
          "Invalid action. Supported: generate-summary, generate-questions",
          ErrorCodes.VALIDATION_ERROR
        );
    }

  } catch (error) {
    console.error(`[${requestId}] Documents POST error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * DELETE handler - Delete document
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
      throw new APIError("Document ID is required", ErrorCodes.INVALID_QUERY);
    }

    // Get document to delete file from storage
    const { data: document } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!document) {
      throw new APIError("Document not found", ErrorCodes.NOT_FOUND);
    }

    // Delete from storage
    if (document.file_path) {
      await supabase.storage
        .from("documents")
        .remove([document.file_path]);
    }

    // Soft delete record
    const { error } = await supabase
      .from("documents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw new APIError(
        "Failed to delete document",
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
    console.error(`[${requestId}] Documents DELETE error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * Handle file upload
 */
async function handleFileUpload(
  request: NextRequest,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const formData = await request.formData();
  
  const file = formData.get("file") as File | null;
  const metadataJson = formData.get("metadata") as string | null;
  
  if (!file) {
    throw new APIError("No file provided", ErrorCodes.INVALID_BODY);
  }

  // Validate file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    throw new APIError(
      `Invalid file type. Allowed: PDF, DOC, DOCX, TXT, MD`,
      ErrorCodes.VALIDATION_ERROR,
      { received: file.type }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new APIError(
      `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      ErrorCodes.VALIDATION_ERROR,
      { maxSize: MAX_FILE_SIZE, actualSize: file.size }
    );
  }

  // Parse metadata
  let metadata: z.infer<typeof documentMetadataSchema>;
  try {
    metadata = documentMetadataSchema.parse(
      metadataJson ? JSON.parse(metadataJson) : {}
    );
  } catch {
    metadata = { title: file.name.replace(/\.[^/.]+$/, "") };
  }

  const supabase = createClient();

  // Upload to storage
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new APIError(
      "Failed to upload file",
      ErrorCodes.DATABASE_ERROR,
      { details: uploadError }
    );
  }

  // Create document record
  const { data: document, error: dbError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: metadata.title,
      description: metadata.description,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_path: filePath,
      subject: metadata.subject,
      topic: metadata.topic,
      tags: metadata.tags,
      is_public: metadata.isPublic,
      processing_status: "pending",
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup storage on DB error
    await supabase.storage.from("documents").remove([filePath]);
    throw new APIError(
      "Failed to create document record",
      ErrorCodes.DATABASE_ERROR,
      { details: dbError }
    );
  }

  // Trigger async processing
  processDocument(document.id, filePath, file.type).catch(console.error);

  let response = created(
    {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.file_name,
      fileType: document.file_type,
      fileSize: document.file_size,
      subject: document.subject,
      topic: document.topic,
      tags: document.tags,
      isPublic: document.is_public,
      processingStatus: document.processing_status,
      createdAt: document.created_at,
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
}

/**
 * Process uploaded document (extract text, generate summary)
 */
async function processDocument(
  documentId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  const supabase = createClient();
  
  try {
    // Update status to processing
    await supabase
      .from("documents")
      .update({ processing_status: "processing" })
      .eq("id", documentId);

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error("Failed to download file");
    }

    // Extract text based on file type
    let extractedText = "";
    
    if (fileType === "text/plain" || fileType === "text/markdown") {
      extractedText = await fileData.text();
    } else {
      // For PDF/DOCX, we'd need additional processing
      // For now, mark as needing manual processing
      await supabase
        .from("documents")
        .update({ 
          processing_status: "needs_manual_processing",
          processing_note: "PDF/DOCX files require manual text extraction"
        })
        .eq("id", documentId);
      return;
    }

    // Truncate if too long
    const maxLength = 10000;
    const truncatedText = extractedText.length > maxLength 
      ? extractedText.substring(0, maxLength) + "..."
      : extractedText;

    // Store extracted content
    await supabase
      .from("documents")
      .update({
        extracted_text: truncatedText,
        processing_status: "completed",
      })
      .eq("id", documentId);

  } catch (error) {
    console.error("Document processing error:", error);
    
    await supabase
      .from("documents")
      .update({
        processing_status: "failed",
        processing_error: String(error),
      })
      .eq("id", documentId);
  }
}

/**
 * Generate document summary with AI
 */
async function generateDocumentSummary(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = generateSummarySchema.parse(body);
  const { documentId, maxLength } = validated;

  const supabase = createClient();

  // Get document
  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .single();

  if (!document) {
    throw new APIError("Document not found", ErrorCodes.NOT_FOUND);
  }

  if (!document.extracted_text) {
    throw new APIError(
      "Document not yet processed",
      ErrorCodes.VALIDATION_ERROR,
      { processingStatus: document.processing_status }
    );
  }

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new APIError("AI service not configured", ErrorCodes.CONFIGURATION_ERROR);
  }

  const prompt = `Summarize the following educational content in approximately ${maxLength} characters. Focus on:
- Main concepts and key points
- Important definitions
- Practical applications
- Connections to A-Level curriculum

Content:
${document.extracted_text.substring(0, 8000)}`;

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
          { role: "system", content: "You are an expert at summarizing educational content for A-Level students." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: Math.ceil(maxLength / 2),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new APIError(
        "Failed to generate summary",
        ErrorCodes.AI_SERVICE_ERROR,
        { status: response.status }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    // Save summary
    await supabase
      .from("documents")
      .update({ summary })
      .eq("id", documentId);

    let nextResponse = success({ summary }, 200, { requestId }, requestId);
    
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
 * Generate practice questions from document
 */
async function generateDocumentQuestions(
  body: unknown,
  userId: string,
  rateLimitResult: { allowed: boolean; limit: number; remaining: number; resetTime: number; windowStart: number },
  requestId: string
): Promise<Response> {
  const validated = generateQuestionsSchema.parse(body);
  const { documentId, count, questionTypes } = validated;

  const supabase = createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .or(`user_id.eq.${userId},is_public.eq.true`)
    .single();

  if (!document) {
    throw new APIError("Document not found", ErrorCodes.NOT_FOUND);
  }

  if (!document.extracted_text) {
    throw new APIError(
      "Document not yet processed",
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new APIError("AI service not configured", ErrorCodes.CONFIGURATION_ERROR);
  }

  const prompt = `Based on the following educational content, generate ${count} practice questions.
Question types to include: ${questionTypes.join(", ")}

For each question, provide:
- type: "mcq" | "short" | "essay"
- question: the question text
- answer: the correct answer
- explanation: brief explanation (for MCQ, explain why other options are wrong)

Content:
${document.extracted_text.substring(0, 8000)}

Respond with ONLY a JSON array.`;

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
          { role: "system", content: "You are an expert at creating educational assessment questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000 + (count * 200),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new APIError(
        "Failed to generate questions",
        ErrorCodes.AI_SERVICE_ERROR
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let questions: unknown[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      questions = [];
    }

    let nextResponse = success({ questions, count: questions.length }, 200, { requestId }, requestId);
    
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
