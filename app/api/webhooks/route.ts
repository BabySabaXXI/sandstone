/**
 * Webhooks API Route
 * CRUD operations for webhook subscriptions
 * 
 * GET /api/webhooks - List user's webhooks
 * POST /api/webhooks - Create new webhook
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
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
} from '@/lib/api';
import {
  generateWebhookSecret,
  validateWebhookUrl,
  testWebhookEndpoint,
} from '@/lib/webhooks';
import type { WebhookEventType, CreateWebhookRequest } from '@/types/webhooks';

// Validation schema for creating webhooks
const createWebhookSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long (max 100 characters)'),
  url: z.string()
    .min(1, 'URL is required')
    .max(500, 'URL too long')
    .refine((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid URL format'),
  events: z.array(z.string())
    .min(1, 'At least one event type is required'),
  secret: z.string()
    .max(500, 'Secret too long')
    .optional(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  headers: z.record(z.string())
    .optional(),
  max_retries: z.number()
    .int()
    .min(0)
    .max(10)
    .optional(),
  retry_interval: z.number()
    .int()
    .min(10)
    .optional(),
});

// Valid event types
const VALID_EVENT_TYPES: WebhookEventType[] = [
  'user.created', 'user.updated', 'user.deleted',
  'essay.submitted', 'essay.updated', 'essay.deleted',
  'grading.started', 'grading.completed', 'grading.failed',
  'document.created', 'document.updated', 'document.deleted',
  'flashcard.deck_created', 'flashcard.card_reviewed',
  'quiz.completed', 'quiz.attempt_submitted',
];

/**
 * GET handler - List user's webhook subscriptions
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(request, 'STANDARD');
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    // Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new APIError('Authentication required', ErrorCodes.UNAUTHORIZED);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('webhook_subscriptions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    // Execute query
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new APIError(
        'Failed to fetch webhooks',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    // Mask secrets in response
    const maskedData = (data || []).map((webhook: any) => ({
      ...webhook,
      secret: webhook.secret ? `${webhook.secret.substring(0, 8)}...${webhook.secret.substring(webhook.secret.length - 4)}` : null,
    }));

    const result = {
      webhooks: maskedData,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
    };

    let response = success(result, 200, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);
    response = withCache(response, { maxAge: 0, private: true }); // No cache

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhooks GET error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * POST handler - Create new webhook subscription
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Check rate limit (strict for creation)
    const rateLimitResult = await checkRateLimit(request, 'STRICT');
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, requestId);
    }

    // Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new APIError('Authentication required', ErrorCodes.UNAUTHORIZED);
    }

    // Validate request body
    const body = await validateBody(request, createWebhookSchema);

    // Validate URL
    const urlValidation = validateWebhookUrl(body.url);
    if (!urlValidation.valid) {
      throw new APIError(
        urlValidation.error || 'Invalid webhook URL',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Validate event types
    const invalidEvents = body.events.filter(e => !VALID_EVENT_TYPES.includes(e as WebhookEventType));
    if (invalidEvents.length > 0) {
      throw new APIError(
        `Invalid event types: ${invalidEvents.join(', ')}`,
        ErrorCodes.VALIDATION_ERROR,
        { validEvents: VALID_EVENT_TYPES }
      );
    }

    // Check webhook limit per user (max 10)
    const { count, error: countError } = await supabase
      .from('webhook_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      throw new APIError(
        'Failed to check webhook limit',
        ErrorCodes.DATABASE_ERROR
      );
    }

    if ((count || 0) >= 10) {
      throw new APIError(
        'Maximum number of webhooks (10) reached. Delete an existing webhook to create a new one.',
        ErrorCodes.RATE_LIMIT_EXCEEDED
      );
    }

    // Generate secret if not provided
    const secret = body.secret || generateWebhookSecret();

    // Create webhook subscription
    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .insert({
        user_id: user.id,
        name: body.name,
        url: body.url,
        secret,
        events: body.events,
        description: body.description,
        headers: body.headers || {},
        max_retries: body.max_retries || 3,
        retry_interval: body.retry_interval || 60,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new APIError(
        'Failed to create webhook',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    const result = {
      ...data,
      secret, // Return full secret only on creation
      message: 'Webhook created successfully. Save the secret - it will not be shown again.',
    };

    let response = success(result, 201, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhooks POST error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
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
      error: 'Rate limit exceeded. Please try again later.',
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
      requestId,
      retryAfter: rateLimitResult.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...(rateLimitResult.retryAfter && {
          'Retry-After': String(rateLimitResult.retryAfter),
        }),
      },
    }
  );
}
