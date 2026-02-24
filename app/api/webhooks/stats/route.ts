/**
 * Webhook Stats API Route
 * Get webhook statistics
 * 
 * GET /api/webhooks/stats - Get webhook statistics
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
 * GET handler - Get webhook statistics
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
    const subscriptionId = searchParams.get('subscription_id');
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user's subscription IDs if no specific subscription requested
    let subscriptionIds: string[] = [];
    if (subscriptionId) {
      // Verify ownership
      const { data: webhook } = await supabase
        .from('webhook_subscriptions')
        .select('id')
        .eq('id', subscriptionId)
        .eq('user_id', user.id)
        .single();
      
      if (!webhook) {
        throw new APIError('Webhook not found', ErrorCodes.NOT_FOUND);
      }
      subscriptionIds = [subscriptionId];
    } else {
      const { data: webhooks } = await supabase
        .from('webhook_subscriptions')
        .select('id')
        .eq('user_id', user.id);
      
      subscriptionIds = (webhooks || []).map(w => w.id);
    }

    // Get event stats
    const { data: eventStats, error: eventError } = await supabase
      .from('webhook_events')
      .select('status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('source_record_id', subscriptionIds.length > 0 ? subscriptionIds : ['none']);

    if (eventError) {
      console.error('Failed to get event stats:', eventError);
    }

    // Get delivery stats
    const { data: deliveryStats, error: deliveryError } = await supabase
      .from('webhook_deliveries')
      .select('status, duration_ms')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .in('subscription_id', subscriptionIds.length > 0 ? subscriptionIds : ['none']);

    if (deliveryError) {
      console.error('Failed to get delivery stats:', deliveryError);
    }

    // Calculate statistics
    const eventsByStatus: Record<string, number> = {};
    (eventStats || []).forEach(e => {
      eventsByStatus[e.status] = (eventsByStatus[e.status] || 0) + 1;
    });

    const deliveriesByStatus: Record<string, number> = {};
    let totalDuration = 0;
    let deliveryCount = 0;
    
    (deliveryStats || []).forEach(d => {
      deliveriesByStatus[d.status] = (deliveriesByStatus[d.status] || 0) + 1;
      if (d.duration_ms) {
        totalDuration += d.duration_ms;
        deliveryCount++;
      }
    });

    const avgResponseTime = deliveryCount > 0 ? Math.round(totalDuration / deliveryCount) : 0;

    // Get recent events breakdown by type
    const { data: eventsByType } = await supabase
      .from('webhook_events')
      .select('event_type')
      .gte('created_at', startDate.toISOString())
      .limit(1000);

    const typeBreakdown: Record<string, number> = {};
    (eventsByType || []).forEach(e => {
      typeBreakdown[e.event_type] = (typeBreakdown[e.event_type] || 0) + 1;
    });

    // Get subscription summary
    const { data: subscriptions } = await supabase
      .from('webhook_subscriptions')
      .select('status, total_delivered, total_failed')
      .eq('user_id', user.id);

    const subscriptionSummary = {
      total: subscriptions?.length || 0,
      active: (subscriptions || []).filter(s => s.status === 'active').length,
      inactive: (subscriptions || []).filter(s => s.status === 'inactive').length,
      total_delivered: (subscriptions || []).reduce((sum, s) => sum + (s.total_delivered || 0), 0),
      total_failed: (subscriptions || []).reduce((sum, s) => sum + (s.total_failed || 0), 0),
    };

    const result = {
      period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        days,
      },
      events: {
        total: eventStats?.length || 0,
        by_status: eventsByStatus,
        by_type: typeBreakdown,
      },
      deliveries: {
        total: deliveryStats?.length || 0,
        by_status: deliveriesByStatus,
        avg_response_time_ms: avgResponseTime,
        success_rate: deliveryStats?.length 
          ? Math.round(((deliveriesByStatus['delivered'] || 0) / deliveryStats.length) * 10000) / 100
          : 0,
      },
      subscriptions: subscriptionSummary,
    };

    let response = success(result, 200, { requestId }, requestId);
    
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response = withSecurityHeaders(response);
    response = withCache(response, { maxAge: 60, private: true }); // 1 min cache

    return response;

  } catch (error) {
    console.error(`[${requestId}] Webhook stats GET error:`, error);
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
