/**
 * Sandstone Webhooks Library
 * Centralized exports for webhook functionality
 */

// Security utilities
export {
  generateWebhookSignature,
  generateSignatureWithTimestamp,
  verifyWebhookSignature,
  verifyWebhookFromHeaders,
  validateWebhookPayload,
  generateWebhookEventId,
  generateDeliveryId,
  generateWebhookSecret,
  maskWebhookSecret,
  buildWebhookHeaders,
  isIpAllowed,
  validateWebhookUrl,
  WEBHOOK_VERSION,
  WEBHOOK_USER_AGENT,
  SIGNATURE_VERSION,
  MAX_TIMESTAMP_AGE_MS,
} from './security';

export type { WebhookVerificationResult } from './security';

// Client utilities
export {
  deliverWebhook,
  deliverWebhookToMultiple,
  testWebhookEndpoint,
  calculateRetryDelay,
  recordWebhookDelivery,
  updateSubscriptionStats,
  buildUserCreatedPayload,
  buildEssaySubmittedPayload,
  buildGradingCompletedPayload,
} from './client';

export type { WebhookDeliveryResult } from './client';

// Server utilities
export {
  getSubscription,
  getSubscriptionsForEvent,
  getUserSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getPendingEvents,
  getEvent,
  updateEventStatus,
  scheduleEventRetry,
  processWebhookEvent,
  processPendingEvents,
  getWebhookStats,
  getSubscriptionDeliveries,
  cleanupOldWebhookData,
} from './server';

// Configuration
export {
  defaultWebhookConfig,
  getWebhookConfig,
  webhookRateLimits,
  webhookLimits,
  webhookEventGroups,
  allWebhookEvents,
  retryableStatusCodes,
  nonRetryableStatusCodes,
  webhookHeaders,
  webhookUserAgent,
  signatureVersion,
  maxTimestampAgeMs,
  getRetryDelay,
  blockedPorts,
  blockedHostnames,
  webhookCronSchedules,
} from './config';
