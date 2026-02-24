/**
 * Webhook Client
 * HTTP client for delivering webhooks to external endpoints
 */

import type { 
  WebhookSubscription, 
  WebhookPayload,
  WebhookDelivery,
  WebhookTestResult,
  WebhookEventType 
} from '@/types/webhooks';
import { 
  buildWebhookHeaders, 
  generateWebhookEventId,
  validateWebhookUrl 
} from './security';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface WebhookClientConfig {
  timeout: number;
  maxRedirects: number;
  userAgent: string;
}

const defaultConfig: WebhookClientConfig = {
  timeout: 30000, // 30 seconds
  maxRedirects: 2,
  userAgent: 'Sandstone-Webhook/1.0',
};

// ============================================================================
// WEBHOOK DELIVERY RESULT
// ============================================================================

export interface WebhookDeliveryResult {
  success: boolean;
  httpStatus?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  durationMs: number;
  error?: string;
  retryable: boolean;
}

// ============================================================================
// DELIVERY FUNCTION
// ============================================================================

/**
 * Deliver webhook to external endpoint
 * 
 * @param subscription - Webhook subscription configuration
 * @param payload - Webhook payload
 * @param config - Optional client configuration
 * @returns Delivery result
 */
export async function deliverWebhook(
  subscription: WebhookSubscription,
  payload: WebhookPayload,
  config: Partial<WebhookClientConfig> = {}
): Promise<WebhookDeliveryResult> {
  const mergedConfig = { ...defaultConfig, ...config };
  const startTime = Date.now();
  
  try {
    // Validate URL
    const urlValidation = validateWebhookUrl(subscription.url);
    if (!urlValidation.valid) {
      return {
        success: false,
        durationMs: Date.now() - startTime,
        error: urlValidation.error,
        retryable: false,
      };
    }
    
    // Generate webhook event ID
    const webhookId = generateWebhookEventId();
    
    // Build headers
    const headers = buildWebhookHeaders(
      payload.event,
      webhookId,
      subscription.secret,
      payload as Record<string, unknown>
    );
    
    // Add custom headers from subscription
    if (subscription.headers) {
      Object.entries(subscription.headers).forEach(([key, value]) => {
        headers[key] = value;
      });
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout);
    
    try {
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
        redirect: 'follow',
      });
      
      clearTimeout(timeoutId);
      
      const durationMs = Date.now() - startTime;
      const responseBody = await response.text();
      
      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Success: 2xx status codes
      if (response.ok) {
        return {
          success: true,
          httpStatus: response.status,
          responseBody,
          responseHeaders,
          durationMs,
          retryable: false,
        };
      }
      
      // Determine if error is retryable
      const retryable = isRetryableStatus(response.status);
      
      return {
        success: false,
        httpStatus: response.status,
        responseBody,
        responseHeaders,
        durationMs,
        error: `HTTP ${response.status}: ${response.statusText}`,
        retryable,
      };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      const durationMs = Date.now() - startTime;
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return {
            success: false,
            durationMs,
            error: 'Request timeout',
            retryable: true,
          };
        }
        
        // Network errors are retryable
        const retryable = isNetworkError(fetchError);
        return {
          success: false,
          durationMs,
          error: fetchError.message,
          retryable,
        };
      }
      
      return {
        success: false,
        durationMs,
        error: 'Unknown error',
        retryable: true,
      };
    }
    
  } catch (error) {
    return {
      success: false,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      retryable: false,
    };
  }
}

// ============================================================================
// BATCH DELIVERY
// ============================================================================

/**
 * Deliver webhooks to multiple subscriptions
 * 
 * @param subscriptions - Array of webhook subscriptions
 * @param payload - Webhook payload
 * @returns Array of delivery results
 */
export async function deliverWebhookToMultiple(
  subscriptions: WebhookSubscription[],
  payload: WebhookPayload
): Promise<Array<{ subscriptionId: string; result: WebhookDeliveryResult }>> {
  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      const result = await deliverWebhook(subscription, payload);
      return { subscriptionId: subscription.id, result };
    })
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    
    return {
      subscriptionId: subscriptions[index]?.id || 'unknown',
      result: {
        success: false,
        durationMs: 0,
        error: result.reason instanceof Error ? result.reason.message : 'Promise rejected',
        retryable: true,
      },
    };
  });
}

// ============================================================================
// WEBHOOK TESTING
// ============================================================================

/**
 * Test webhook endpoint
 * 
 * @param url - Webhook URL to test
 * @param secret - Optional secret for signature
 * @returns Test result
 */
export async function testWebhookEndpoint(
  url: string,
  secret?: string
): Promise<WebhookTestResult> {
  const startTime = Date.now();
  
  try {
    // Validate URL first
    const urlValidation = validateWebhookUrl(url);
    if (!urlValidation.valid) {
      return {
        success: false,
        error: urlValidation.error,
      };
    }
    
    // Create test payload
    const testPayload = {
      event: 'test.webhook' as WebhookEventType,
      timestamp: new Date().toISOString(),
      webhookId: generateWebhookEventId(),
      data: {
        message: 'This is a test webhook from Sandstone',
        test: true,
      },
    };
    
    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': defaultConfig.userAgent,
      'X-Webhook-Id': testPayload.webhookId,
      'X-Webhook-Timestamp': Math.floor(Date.now() / 1000).toString(),
      'X-Webhook-Event': 'test.webhook',
      'X-Webhook-Version': '1.0',
    };
    
    // Add signature if secret provided
    if (secret) {
      const { signature } = await import('./security').then(m => 
        m.generateSignatureWithTimestamp(testPayload, secret)
      );
      headers['X-Webhook-Signature'] = signature;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), defaultConfig.timeout);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const durationMs = Date.now() - startTime;
    const responseBody = await response.text();
    
    return {
      success: response.ok,
      http_status: response.status,
      response_time_ms: durationMs,
      response_body: responseBody.substring(0, 1000), // Limit response size
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Check if HTTP status code is retryable
 * 
 * @param status - HTTP status code
 * @returns Whether the error is retryable
 */
function isRetryableStatus(status: number): boolean {
  // Retry on server errors (5xx) and specific client errors
  const retryableStatuses = [
    408, // Request Timeout
    409, // Conflict
    425, // Too Early
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ];
  
  return status >= 500 || retryableStatuses.includes(status);
}

/**
 * Check if error is a network error that should be retried
 * 
 * @param error - Error object
 * @returns Whether the error is retryable
 */
function isNetworkError(error: Error): boolean {
  const networkErrorPatterns = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'network',
    'fetch failed',
    'unable to verify',
  ];
  
  const errorMessage = error.message.toLowerCase();
  return networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern.toLowerCase())
  );
}

/**
 * Calculate retry delay with exponential backoff
 * 
 * @param attempt - Attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 60000
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const delay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.min(delay + jitter, maxDelay);
}

// ============================================================================
// DELIVERY RECORDING
// ============================================================================

/**
 * Record webhook delivery attempt to database
 * 
 * @param supabase - Supabase client
 * @param delivery - Delivery record
 * @returns Whether recording was successful
 */
export async function recordWebhookDelivery(
  supabase: any, // Supabase client type
  delivery: Partial<WebhookDelivery>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('webhook_deliveries')
      .insert(delivery);
    
    if (error) {
      console.error('Failed to record webhook delivery:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error recording webhook delivery:', error);
    return false;
  }
}

/**
 * Update subscription stats after delivery
 * 
 * @param supabase - Supabase client
 * @param subscriptionId - Subscription ID
 * @param success - Whether delivery was successful
 * @param error - Error message if failed
 */
export async function updateSubscriptionStats(
  supabase: any,
  subscriptionId: string,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    const updates: Record<string, unknown> = success
      ? { 
          total_delivered: supabase.rpc('increment', { amount: 1 }),
          last_delivered_at: new Date().toISOString(),
        }
      : { 
          total_failed: supabase.rpc('increment', { amount: 1 }),
          last_failed_at: new Date().toISOString(),
          last_error: error,
        };
    
    await supabase
      .from('webhook_subscriptions')
      .update(updates)
      .eq('id', subscriptionId);
      
  } catch (err) {
    console.error('Failed to update subscription stats:', err);
  }
}

// ============================================================================
// WEBHOOK PAYLOAD BUILDERS
// ============================================================================

/**
 * Build user.created payload
 */
export function buildUserCreatedPayload(
  userId: string,
  email: string,
  metadata?: Record<string, unknown>
): WebhookPayload {
  return {
    event: 'user.created',
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookEventId(),
    data: {
      id: userId,
      email,
      created_at: new Date().toISOString(),
      metadata,
    },
  };
}

/**
 * Build essay.submitted payload
 */
export function buildEssaySubmittedPayload(data: {
  essayId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  subject: string;
  question: string;
  questionType?: string;
  wordCount?: number;
}): WebhookPayload {
  return {
    event: 'essay.submitted',
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookEventId(),
    data: {
      essay_id: data.essayId,
      user_id: data.userId,
      user_email: data.userEmail,
      user_name: data.userName,
      subject: data.subject,
      question: data.question,
      question_type: data.questionType,
      word_count: data.wordCount,
      created_at: new Date().toISOString(),
    },
  };
}

/**
 * Build grading.completed payload
 */
export function buildGradingCompletedPayload(data: {
  essayId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  subject: string;
  question: string;
  questionType?: string;
  overallScore: number;
  grade?: string;
  feedback?: unknown[];
  summary?: string;
  improvements?: unknown[];
}): WebhookPayload {
  return {
    event: 'grading.completed',
    timestamp: new Date().toISOString(),
    webhookId: generateWebhookEventId(),
    data: {
      essay_id: data.essayId,
      user_id: data.userId,
      user_email: data.userEmail,
      user_name: data.userName,
      subject: data.subject,
      question: data.question,
      question_type: data.questionType,
      overall_score: data.overallScore,
      grade: data.grade,
      feedback: data.feedback,
      summary: data.summary,
      improvements: data.improvements,
      graded_at: new Date().toISOString(),
    },
  };
}
