/**
 * Webhook Deliveries API Route
 * Get delivery history for a webhook
 * 
 * GET /api/webhooks/[id]/deliveries - List deliveries
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
  withCache,
} from '@/lib/api';

interface RouteParams {
  params: { id: string };
}

/**
 * GET handler - Get webhook delivery history
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

    // Check ownership
    const { data: webhook, error: webhookError } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (webhookError || !webhook) {
      throw new APIError('Webhook not found', ErrorCodes.NOT_FOUND);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    let query = supabase
      .from('webhook_deliveries')
      .select('*', { count: 'exact' })
      .eq('subscription_id', id);

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('started_at', startDate);
    }

    if (endDate) {
      query = query.lte('started_at', endDate);
    }

    // Execute query
    const { data, error, count } = await query
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new APIError(
        'Failed to fetch deliveries',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    // Calculate success rate
    const successCount = (data || []).filter(d => d.status === 'delivered').length;
    const totalCount = data?.length || 0;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

    const result = {
      deliveries: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      summary: {
        success_count: successCount,
        failed_count: totalCount - successCount,
        success_rate: Math.round(successRate * 100) / 100,
      },
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
    console.error(`[${requestId}] Webhook deliveries GET error:`, error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
