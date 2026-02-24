/**
 * Webhook Events API Route
 * View webhook events
 * 
 * GET /api/webhooks/events - List webhook events
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

/**
 * GET handler - Get webhook events
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
    const eventType = searchParams.get('event_type');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get user's subscription IDs
    const { data: subscriptions } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('user_id', user.id);

    const subscriptionIds = (subscriptions || []).map(s => s.id);

    // Build query
    let query = supabase
      .from('webhook_events')
      .select('*', { count: 'exact' });

    // Filter by user's subscriptions (via deliveries) or user's own events
    if (subscriptionIds.length > 0) {
      // Get events that have deliveries to user's subscriptions
      const { data: deliveryEvents } = await supabase
        .from('webhook_deliveries')
        .select('event_id')
        .in('subscription_id', subscriptionIds);
      
      const eventIds = [...new Set((deliveryEvents || []).map(d => d.event_id))];
      
      if (eventIds.length > 0) {
        query = query.or(`id.in.(${eventIds.join(',')}),user_id.eq.${user.id}`);
      } else {
        query = query.eq('user_id', user.id);
      }
    } else {
      query = query.eq('user_id', user.id);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Execute query
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new APIError(
        'Failed to fetch events',
        ErrorCodes.DATABASE_ERROR,
        { details: error }
      );
    }

    const result = {
      events: data || [],
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
    response = withCache(response, { maxAge: 10, private: true }); // 10s cache

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhook events GET error:`, error);
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
