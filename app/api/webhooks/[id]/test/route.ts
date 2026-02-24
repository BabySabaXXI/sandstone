/**
 * Webhook Test API Route
 * Test webhook endpoint by sending a test event
 * 
 * POST /api/webhooks/[id]/test - Send test webhook
 */

import { NextRequest } from 'next/server';
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
import { testWebhookEndpoint } from '@/lib/webhooks';

interface RouteParams {
  params: { id: string };
}

/**
 * POST handler - Test webhook endpoint
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const { id } = params;
  
  try {
    // Check rate limit (strict for testing)
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

    // Get webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (webhookError || !webhook) {
      throw new APIError('Webhook not found', ErrorCodes.NOT_FOUND);
    }

    // Send test webhook
    const testResult = await testWebhookEndpoint(webhook.url, webhook.secret);

    // Record test in delivery log
    await supabase
      .from('webhook_deliveries')
      .insert({
        event_id: null,
        subscription_id: id,
        status: testResult.success ? 'delivered' : 'failed',
        http_status: testResult.http_status,
        response_body: testResult.response_body,
        duration_ms: testResult.response_time_ms,
        error_message: testResult.error,
        started_at: new Date(Date.now() - (testResult.response_time_ms || 0)).toISOString(),
        completed_at: new Date().toISOString(),
        attempt_number: 1,
      });

    // Update subscription last tested info
    if (testResult.success) {
      await supabase
        .from('webhook_subscriptions')
        .update({
          last_delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } else {
      await supabase
        .from('webhook_subscriptions')
        .update({
          last_failed_at: new Date().toISOString(),
          last_error: testResult.error,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    const result = {
      success: testResult.success,
      http_status: testResult.http_status,
      response_time_ms: testResult.response_time_ms,
      error: testResult.error,
      response_preview: testResult.response_body 
        ? testResult.response_body.substring(0, 500) 
        : null,
    };

    let response = success(result, testResult.success ? 200 : 422, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhook test error:`, error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
