/**
 * Webhook Server-Side Utilities
 * Database operations and event processing for webhooks
 */

import { createClient } from '@/lib/supabase/server';
import type { 
  WebhookSubscription, 
  WebhookEvent,
  WebhookDelivery,
  WebhookStats,
  WebhookEventType 
} from '@/types/webhooks';
import { deliverWebhook, WebhookDeliveryResult } from './client';

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Get webhook subscription by ID
 * 
 * @param subscriptionId - Subscription ID
 * @returns Subscription or null
 */
export async function getSubscription(subscriptionId: string): Promise<WebhookSubscription | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();
  
  if (error || !data) {
    console.error('Failed to get subscription:', error);
    return null;
  }
  
  return data as WebhookSubscription;
}

/**
 * Get all active subscriptions for an event type
 * 
 * @param eventType - Event type to filter by
 * @returns Array of matching subscriptions
 */
export async function getSubscriptionsForEvent(
  eventType: WebhookEventType
): Promise<WebhookSubscription[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('status', 'active')
    .or(`events.cs.{${eventType}},events.eq.{}`);
  
  if (error) {
    console.error('Failed to get subscriptions:', error);
    return [];
  }
  
  return (data || []) as WebhookSubscription[];
}

/**
 * Get user's webhook subscriptions
 * 
 * @param userId - User ID
 * @returns Array of subscriptions
 */
export async function getUserSubscriptions(userId: string): Promise<WebhookSubscription[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to get user subscriptions:', error);
    return [];
  }
  
  return (data || []) as WebhookSubscription[];
}

/**
 * Create new webhook subscription
 * 
 * @param userId - User ID
 * @param subscription - Subscription data
 * @returns Created subscription or null
 */
export async function createSubscription(
  userId: string,
  subscription: Omit<WebhookSubscription, 'id' | 'created_at' | 'updated_at' | 'total_delivered' | 'total_failed'>
): Promise<WebhookSubscription | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .insert({
      ...subscription,
      user_id: userId,
      created_by: userId,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to create subscription:', error);
    return null;
  }
  
  return data as WebhookSubscription;
}

/**
 * Update webhook subscription
 * 
 * @param subscriptionId - Subscription ID
 * @param updates - Updates to apply
 * @returns Updated subscription or null
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<WebhookSubscription>
): Promise<WebhookSubscription | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();
  
  if (error) {
    console.error('Failed to update subscription:', error);
    return null;
  }
  
  return data as WebhookSubscription;
}

/**
 * Delete webhook subscription
 * 
 * @param subscriptionId - Subscription ID
 * @returns Whether deletion was successful
 */
export async function deleteSubscription(subscriptionId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('webhook_subscriptions')
    .delete()
    .eq('id', subscriptionId);
  
  if (error) {
    console.error('Failed to delete subscription:', error);
    return false;
  }
  
  return true;
}

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

/**
 * Get pending webhook events
 * 
 * @param limit - Maximum number of events to fetch
 * @returns Array of pending events
 */
export async function getPendingEvents(limit: number = 100): Promise<WebhookEvent[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .in('status', ['pending', 'retrying'])
    .lte('next_attempt_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Failed to get pending events:', error);
    return [];
  }
  
  return (data || []) as WebhookEvent[];
}

/**
 * Get webhook event by ID
 * 
 * @param eventId - Event ID
 * @returns Event or null
 */
export async function getEvent(eventId: string): Promise<WebhookEvent | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (error || !data) {
    console.error('Failed to get event:', error);
    return null;
  }
  
  return data as WebhookEvent;
}

/**
 * Update event status
 * 
 * @param eventId - Event ID
 * @param status - New status
 * @param error - Optional error message
 */
export async function updateEventStatus(
  eventId: string,
  status: WebhookEvent['status'],
  error?: string
): Promise<void> {
  const supabase = createClient();
  
  const updates: Record<string, unknown> = {
    status,
    processed_at: new Date().toISOString(),
  };
  
  if (error) {
    updates.last_error = error;
  }
  
  await supabase
    .from('webhook_events')
    .update(updates)
    .eq('id', eventId);
}

/**
 * Schedule event retry
 * 
 * @param eventId - Event ID
 * @param attemptCount - Current attempt count
 * @param retryInterval - Base retry interval in seconds
 */
export async function scheduleEventRetry(
  eventId: string,
  attemptCount: number,
  retryInterval: number = 60
): Promise<void> {
  const supabase = createClient();
  
  // Exponential backoff
  const delayMs = retryInterval * Math.pow(2, attemptCount) * 1000;
  const nextAttempt = new Date(Date.now() + delayMs);
  
  await supabase
    .from('webhook_events')
    .update({
      status: 'retrying',
      attempts: attemptCount + 1,
      next_attempt_at: nextAttempt.toISOString(),
    })
    .eq('id', eventId);
}

// ============================================================================
// DELIVERY PROCESSING
// ============================================================================

/**
 * Process a single webhook event
 * Delivers to all matching subscriptions
 * 
 * @param event - Webhook event to process
 * @returns Processing results
 */
export async function processWebhookEvent(
  event: WebhookEvent
): Promise<{
  success: boolean;
  deliveries: Array<{ subscriptionId: string; result: WebhookDeliveryResult }>;
}> {
  try {
    // Get matching subscriptions
    const subscriptions = await getSubscriptionsForEvent(event.event_type);
    
    if (subscriptions.length === 0) {
      // No subscriptions, mark as delivered
      await updateEventStatus(event.id, 'delivered');
      return { success: true, deliveries: [] };
    }
    
    // Build payload
    const payload = {
      event: event.event_type,
      timestamp: event.created_at,
      webhookId: event.id,
      data: event.payload,
    };
    
    // Deliver to all subscriptions
    const deliveryResults: Array<{ subscriptionId: string; result: WebhookDeliveryResult }> = [];
    
    for (const subscription of subscriptions) {
      const result = await deliverWebhook(subscription, payload);
      deliveryResults.push({ subscriptionId: subscription.id, result });
      
      // Record delivery
      await recordDelivery(event.id, subscription.id, result);
      
      // Update subscription stats
      await updateSubscriptionDeliveryStats(subscription.id, result);
    }
    
    // Check if all deliveries succeeded
    const allSucceeded = deliveryResults.every(d => d.result.success);
    
    // Update event status
    if (allSucceeded) {
      await updateEventStatus(event.id, 'delivered');
    } else {
      const failedCount = deliveryResults.filter(d => !d.result.success).length;
      await updateEventStatus(
        event.id, 
        'failed',
        `${failedCount}/${deliveryResults.length} deliveries failed`
      );
    }
    
    return { success: allSucceeded, deliveries: deliveryResults };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateEventStatus(event.id, 'failed', errorMessage);
    
    return { 
      success: false, 
      deliveries: [] 
    };
  }
}

/**
 * Record delivery attempt
 * 
 * @param eventId - Event ID
 * @param subscriptionId - Subscription ID
 * @param result - Delivery result
 */
async function recordDelivery(
  eventId: string,
  subscriptionId: string,
  result: WebhookDeliveryResult
): Promise<void> {
  const supabase = createClient();
  
  try {
    await supabase
      .from('webhook_deliveries')
      .insert({
        event_id: eventId,
        subscription_id: subscriptionId,
        status: result.success ? 'delivered' : 'failed',
        http_status: result.httpStatus,
        response_body: result.responseBody,
        response_headers: result.responseHeaders,
        duration_ms: result.durationMs,
        error_message: result.error,
        started_at: new Date(Date.now() - result.durationMs).toISOString(),
        completed_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to record delivery:', error);
  }
}

/**
 * Update subscription delivery stats
 * 
 * @param subscriptionId - Subscription ID
 * @param result - Delivery result
 */
async function updateSubscriptionDeliveryStats(
  subscriptionId: string,
  result: WebhookDeliveryResult
): Promise<void> {
  const supabase = createClient();
  
  try {
    if (result.success) {
      await supabase.rpc('increment_webhook_stats', {
        p_subscription_id: subscriptionId,
        p_field: 'total_delivered',
      });
      
      await supabase
        .from('webhook_subscriptions')
        .update({ last_delivered_at: new Date().toISOString() })
        .eq('id', subscriptionId);
    } else {
      await supabase.rpc('increment_webhook_stats', {
        p_subscription_id: subscriptionId,
        p_field: 'total_failed',
      });
      
      await supabase
        .from('webhook_subscriptions')
        .update({
          last_failed_at: new Date().toISOString(),
          last_error: result.error,
        })
        .eq('id', subscriptionId);
    }
  } catch (error) {
    console.error('Failed to update subscription stats:', error);
  }
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process pending webhook events in batch
 * 
 * @param batchSize - Number of events to process
 * @returns Processing summary
 */
export async function processPendingEvents(batchSize: number = 100): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const events = await getPendingEvents(batchSize);
  
  let succeeded = 0;
  let failed = 0;
  
  for (const event of events) {
    const result = await processWebhookEvent(event);
    
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }
  
  return {
    processed: events.length,
    succeeded,
    failed,
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get webhook statistics
 * 
 * @param subscriptionId - Optional subscription ID filter
 * @param startDate - Start date for stats
 * @param endDate - End date for stats
 * @returns Statistics
 */
export async function getWebhookStats(
  subscriptionId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<WebhookStats | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_webhook_stats', {
    p_subscription_id: subscriptionId,
    p_start_date: startDate?.toISOString(),
    p_end_date: endDate?.toISOString(),
  });
  
  if (error) {
    console.error('Failed to get webhook stats:', error);
    return null;
  }
  
  return data as WebhookStats;
}

/**
 * Get subscription delivery history
 * 
 * @param subscriptionId - Subscription ID
 * @param limit - Maximum number of deliveries
 * @returns Array of deliveries
 */
export async function getSubscriptionDeliveries(
  subscriptionId: string,
  limit: number = 50
): Promise<WebhookDelivery[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('started_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Failed to get deliveries:', error);
    return [];
  }
  
  return (data || []) as WebhookDelivery[];
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clean up old webhook data
 * 
 * @param retentionDays - Number of days to retain
 * @returns Cleanup results
 */
export async function cleanupOldWebhookData(
  retentionDays: number = 30
): Promise<{
  eventsDeleted: number;
  deliveriesDeleted: number;
  attemptsDeleted: number;
}> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('cleanup_old_webhook_data', {
    p_retention_days: retentionDays,
  });
  
  if (error) {
    console.error('Failed to cleanup webhook data:', error);
    return { eventsDeleted: 0, deliveriesDeleted: 0, attemptsDeleted: 0 };
  }
  
  return {
    eventsDeleted: data.events_deleted || 0,
    deliveriesDeleted: data.deliveries_deleted || 0,
    attemptsDeleted: data.attempts_deleted || 0,
  };
}
