/**
 * Individual Webhook API Route
 * Manage specific webhook subscription
 * 
 * GET /api/webhooks/[id] - Get webhook details
 * PATCH /api/webhooks/[id] - Update webhook
 * DELETE /api/webhooks/[id] - Delete webhook
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
  success,
  withSecurityHeaders,
} from '@/lib/api';
import {
  validateWebhookUrl,
  testWebhookEndpoint,
  generateWebhookSecret,
} from '@/lib/webhooks';
import type { WebhookEventType } from '@/types/webhooks';

// Validation schema for updating webhooks
const updateWebhookSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  url: z.string()
    .min(1, 'URL is required')
    .max(500, 'URL too long')
    .optional(),
  events: z.array(z.string())
    .min(1, 'At least one event type is required')
    .optional(),
  secret: z.string()
    .max(500, 'Secret too long')
    .optional(),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  headers: z.record(z.string())
    .optional(),
  status: z.enum(['active', 'inactive', 'suspended'])
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

interface RouteParams {
  params: { id: string };
}

/**
 * GET handler - Get webhook details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const { id } = params;
  
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

    // Get webhook
    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError('Webhook not found', ErrorCodes.NOT_FOUND);
      }
      throw new APIError(
        'Failed to fetch webhook',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    // Mask secret
    const result = {
      ...data,
      secret: data.secret ? `${data.secret.substring(0, 8)}...${data.secret.substring(data.secret.length - 4)}` : null,
    };

    let response = success(result, 200, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhook GET error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * PATCH handler - Update webhook
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const { id } = params;
  
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

    // Check ownership
    const { data: existing, error: checkError } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      throw new APIError('Webhook not found', ErrorCodes.NOT_FOUND);
    }

    // Parse and validate body
    const body = await request.json();
    const validated = updateWebhookSchema.parse(body);

    // Validate URL if provided
    if (validated.url) {
      const urlValidation = validateWebhookUrl(validated.url);
      if (!urlValidation.valid) {
        throw new APIError(
          urlValidation.error || 'Invalid webhook URL',
          ErrorCodes.VALIDATION_ERROR
        );
      }
    }

    // Validate event types if provided
    if (validated.events) {
      const invalidEvents = validated.events.filter(e => !VALID_EVENT_TYPES.includes(e as WebhookEventType));
      if (invalidEvents.length > 0) {
        throw new APIError(
          `Invalid event types: ${invalidEvents.join(', ')}`,
          ErrorCodes.VALIDATION_ERROR,
          { validEvents: VALID_EVENT_TYPES }
        );
      }
    }

    // Build updates
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.name !== undefined) updates.name = validated.name;
    if (validated.url !== undefined) updates.url = validated.url;
    if (validated.events !== undefined) updates.events = validated.events;
    if (validated.secret !== undefined) updates.secret = validated.secret;
    if (validated.description !== undefined) updates.description = validated.description;
    if (validated.headers !== undefined) updates.headers = validated.headers;
    if (validated.status !== undefined) updates.status = validated.status;
    if (validated.max_retries !== undefined) updates.max_retries = validated.max_retries;
    if (validated.retry_interval !== undefined) updates.retry_interval = validated.retry_interval;

    // Update webhook
    const { data, error } = await supabase
      .from('webhook_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new APIError(
        'Failed to update webhook',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    // Mask secret in response
    const result = {
      ...data,
      secret: data.secret ? `${data.secret.substring(0, 8)}...${data.secret.substring(data.secret.length - 4)}` : null,
    };

    let response = success(result, 200, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhook PATCH error:`, error);
    return handleAPIError(error, requestId);
  }
}

/**
 * DELETE handler - Delete webhook
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const { id } = params;
  
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

    // Check ownership
    const { data: existing, error: checkError } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existing) {
      throw new APIError('Webhook not found', ErrorCodes.NOT_FOUND);
    }

    // Delete webhook
    const { error } = await supabase
      .from('webhook_subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new APIError(
        'Failed to delete webhook',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    let response = success(
      { message: 'Webhook deleted successfully' },
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
    console.error(`[${requestId}] Webhook DELETE error:`, error);
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
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
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
