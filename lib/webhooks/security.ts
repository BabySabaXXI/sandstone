/**
 * Webhook Security Utilities
 * HMAC signature verification and payload validation
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { 
  WebhookPayload, 
  WebhookSignature, 
  WebhookVerificationResult,
  WebhookEventType 
} from '@/types/webhooks';

// ============================================================================
// CONSTANTS
// ============================================================================

export const WEBHOOK_VERSION = '1.0';
export const WEBHOOK_USER_AGENT = `Sandstone-Webhook/${WEBHOOK_VERSION}`;
export const SIGNATURE_VERSION = 'v1';
export const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// SIGNATURE GENERATION
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for webhook payload
 * Uses Stripe-style signature format: timestamp.payload
 * 
 * @param payload - The webhook payload object
 * @param secret - The webhook secret key
 * @param timestamp - Unix timestamp in seconds
 * @returns The generated signature
 */
export function generateWebhookSignature(
  payload: Record<string, unknown>,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): string {
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  
  const signature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return `${SIGNATURE_VERSION}=${signature}`;
}

/**
 * Generate signature with timestamp header
 * 
 * @param payload - The webhook payload
 * @param secret - The webhook secret
 * @returns Object containing timestamp and signature
 */
export function generateSignatureWithTimestamp(
  payload: Record<string, unknown>,
  secret: string
): WebhookSignature {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateWebhookSignature(payload, secret, parseInt(timestamp));
  
  return {
    timestamp,
    signature,
  };
}

// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verify webhook signature
 * 
 * @param payload - The raw request body
 * @param signature - The signature from X-Webhook-Signature header
 * @param secret - The webhook secret key
 * @param timestamp - The timestamp from X-Webhook-Timestamp header
 * @returns Verification result
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): WebhookVerificationResult {
  try {
    // Validate timestamp
    const timestampNum = parseInt(timestamp, 10);
    if (isNaN(timestampNum)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }
    
    // Check timestamp age (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    const age = Math.abs(now - timestampNum);
    if (age > MAX_TIMESTAMP_AGE_MS / 1000) {
      return { 
        valid: false, 
        error: `Timestamp too old (age: ${age}s, max: ${MAX_TIMESTAMP_AGE_MS / 1000}s)` 
      };
    }
    
    // Parse signature version
    const signatureParts = signature.split('=');
    if (signatureParts.length !== 2 || signatureParts[0] !== SIGNATURE_VERSION) {
      return { valid: false, error: 'Invalid signature format' };
    }
    
    const providedSignature = signatureParts[1];
    
    // Generate expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (providedBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Signature mismatch' };
    }
    
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { valid: false, error: 'Signature mismatch' };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Verify webhook signature from headers
 * 
 * @param body - Raw request body
 * @param headers - Request headers object
 * @param secret - Webhook secret
 * @returns Verification result
 */
export function verifyWebhookFromHeaders(
  body: string,
  headers: Record<string, string | string[] | undefined>,
  secret: string
): WebhookVerificationResult {
  const signature = getHeaderValue(headers, 'x-webhook-signature');
  const timestamp = getHeaderValue(headers, 'x-webhook-timestamp');
  
  if (!signature) {
    return { valid: false, error: 'Missing X-Webhook-Signature header' };
  }
  
  if (!timestamp) {
    return { valid: false, error: 'Missing X-Webhook-Timestamp header' };
  }
  
  return verifyWebhookSignature(body, signature, secret, timestamp);
}

// ============================================================================
// PAYLOAD VALIDATION
// ============================================================================

/**
 * Validate webhook payload structure
 * 
 * @param payload - The parsed payload object
 * @returns Validation result
 */
export function validateWebhookPayload(
  payload: unknown
): WebhookVerificationResult {
  try {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: 'Invalid payload: must be an object' };
    }
    
    const p = payload as Record<string, unknown>;
    
    // Check required fields
    if (!p.event || typeof p.event !== 'string') {
      return { valid: false, error: 'Invalid payload: missing or invalid event type' };
    }
    
    if (!p.timestamp || typeof p.timestamp !== 'string') {
      return { valid: false, error: 'Invalid payload: missing or invalid timestamp' };
    }
    
    if (!p.webhookId || typeof p.webhookId !== 'string') {
      return { valid: false, error: 'Invalid payload: missing or invalid webhookId' };
    }
    
    if (!p.data || typeof p.data !== 'object') {
      return { valid: false, error: 'Invalid payload: missing or invalid data' };
    }
    
    // Validate event type
    const validEvents: WebhookEventType[] = [
      'user.created', 'user.updated', 'user.deleted',
      'essay.submitted', 'essay.updated', 'essay.deleted',
      'grading.started', 'grading.completed', 'grading.failed',
      'document.created', 'document.updated', 'document.deleted',
      'flashcard.deck_created', 'flashcard.card_reviewed',
      'quiz.completed', 'quiz.attempt_submitted'
    ];
    
    if (!validEvents.includes(p.event as WebhookEventType)) {
      return { valid: false, error: `Invalid event type: ${p.event}` };
    }
    
    return { valid: true, payload: payload as WebhookPayload };
  } catch (error) {
    return { 
      valid: false, 
      error: `Payload validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// ============================================================================
// WEBHOOK ID GENERATION
// ============================================================================

/**
 * Generate unique webhook event ID
 * Format: evt_<timestamp>_<random>
 * 
 * @returns Unique webhook event ID
 */
export function generateWebhookEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `evt_${timestamp}_${random}`;
}

/**
 * Generate unique webhook delivery ID
 * 
 * @returns Unique delivery ID
 */
export function generateDeliveryId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `del_${timestamp}_${random}`;
}

// ============================================================================
// SECRET GENERATION
// ============================================================================

/**
 * Generate a secure webhook secret
 * Format: whsec_<64 random hex chars>
 * 
 * @returns Secure webhook secret
 */
export function generateWebhookSecret(): string {
  const randomBytes = Buffer.from(
    Array(32).fill(0).map(() => Math.floor(Math.random() * 256))
  );
  return `whsec_${randomBytes.toString('hex')}`;
}

/**
 * Generate a shorter secret for display purposes
 * 
 * @param secret - Full secret
 * @returns Masked secret for display
 */
export function maskWebhookSecret(secret: string): string {
  if (secret.length <= 12) return '***';
  return `${secret.substring(0, 8)}...${secret.substring(secret.length - 4)}`;
}

// ============================================================================
// HEADER UTILITIES
// ============================================================================

/**
 * Get header value (case-insensitive)
 * 
 * @param headers - Headers object
 * @param name - Header name
 * @returns Header value or undefined
 */
function getHeaderValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const lowerName = name.toLowerCase();
  
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName) {
      return Array.isArray(value) ? value[0] : value;
    }
  }
  
  return undefined;
}

/**
 * Build webhook request headers
 * 
 * @param eventType - Webhook event type
 * @param webhookId - Webhook event ID
 * @param secret - Webhook secret
 * @param payload - Webhook payload
 * @returns Headers object
 */
export function buildWebhookHeaders(
  eventType: WebhookEventType,
  webhookId: string,
  secret: string,
  payload: Record<string, unknown>
): Record<string, string> {
  const { timestamp, signature } = generateSignatureWithTimestamp(payload, secret);
  
  return {
    'Content-Type': 'application/json',
    'User-Agent': WEBHOOK_USER_AGENT,
    'X-Webhook-Id': webhookId,
    'X-Webhook-Timestamp': timestamp,
    'X-Webhook-Signature': signature,
    'X-Webhook-Event': eventType,
    'X-Webhook-Version': WEBHOOK_VERSION,
  };
}

// ============================================================================
// IP ALLOWLIST/DENYLIST
// ============================================================================

/**
 * Check if IP address is in allowed list
 * 
 * @param ip - Client IP address
 * @param allowlist - List of allowed IPs/CIDR ranges
 * @returns Whether IP is allowed
 */
export function isIpAllowed(ip: string, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  
  return allowlist.some(allowed => {
    // Exact match
    if (allowed === ip) return true;
    
    // CIDR range (simplified - for production use a proper CIDR library)
    if (allowed.includes('/')) {
      const [rangeIp, prefix] = allowed.split('/');
      const prefixLength = parseInt(prefix, 10);
      
      if (isNaN(prefixLength)) return false;
      
      // Simple IPv4 CIDR check
      const ipParts = ip.split('.').map(Number);
      const rangeParts = rangeIp.split('.').map(Number);
      
      if (ipParts.length !== 4 || rangeParts.length !== 4) return false;
      
      const mask = 0xFFFFFFFF << (32 - prefixLength);
      const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
      const rangeNum = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3];
      
      return (ipNum & mask) === (rangeNum & mask);
    }
    
    return false;
  });
}

// ============================================================================
// WEBHOOK URL VALIDATION
// ============================================================================

/**
 * Validate webhook URL
 * 
 * @param url - Webhook URL to validate
 * @returns Validation result
 */
export function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    
    // Must use HTTPS in production
    if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Webhook URL must use HTTPS in production' };
    }
    
    // Must be HTTP or HTTPS
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: 'Webhook URL must use HTTP or HTTPS' };
    }
    
    // Block localhost in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return { valid: false, error: 'Private IP addresses not allowed in production' };
      }
    }
    
    // Block common internal ports
    const port = parsed.port;
    if (port && ['22', '25', '3306', '5432', '6379', '27017'].includes(port)) {
      return { valid: false, error: 'Port not allowed for security reasons' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
