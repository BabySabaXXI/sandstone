/**
 * Webhook Configuration
 * Default settings and configuration for the webhook system
 */

import type { WebhookConfig } from '@/types/webhooks';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const defaultWebhookConfig: WebhookConfig = {
  maxRetries: 3,
  retryInterval: 60,
  timeout: 30000,
  batchSize: 100,
  retentionDays: 30,
};

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export function getWebhookConfig(): WebhookConfig {
  return {
    maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '3', 10),
    retryInterval: parseInt(process.env.WEBHOOK_RETRY_INTERVAL || '60', 10),
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000', 10),
    batchSize: parseInt(process.env.WEBHOOK_BATCH_SIZE || '100', 10),
    retentionDays: parseInt(process.env.WEBHOOK_RETENTION_DAYS || '30', 10),
  };
}

// ============================================================================
// RATE LIMITS
// ============================================================================

export const webhookRateLimits = {
  create: { requests: 10, window: 60 },    // 10 per minute
  update: { requests: 30, window: 60 },    // 30 per minute
  delete: { requests: 10, window: 60 },    // 10 per minute
  test: { requests: 5, window: 60 },       // 5 per minute
  list: { requests: 60, window: 60 },      // 60 per minute
  deliveries: { requests: 30, window: 60 }, // 30 per minute
};

// ============================================================================
// LIMITS
// ============================================================================

export const webhookLimits = {
  maxWebhooksPerUser: 10,
  maxEventsPerPage: 100,
  maxDeliveriesPerPage: 100,
  maxSecretLength: 500,
  maxNameLength: 100,
  maxDescriptionLength: 500,
  maxUrlLength: 500,
  maxCustomHeaders: 10,
};

// ============================================================================
// EVENT TYPE GROUPS
// ============================================================================

export const webhookEventGroups = {
  user: ['user.created', 'user.updated', 'user.deleted'] as const,
  essay: ['essay.submitted', 'essay.updated', 'essay.deleted'] as const,
  grading: ['grading.started', 'grading.completed', 'grading.failed'] as const,
  document: ['document.created', 'document.updated', 'document.deleted'] as const,
  flashcard: ['flashcard.deck_created', 'flashcard.card_reviewed'] as const,
  quiz: ['quiz.completed', 'quiz.attempt_submitted'] as const,
};

export const allWebhookEvents = [
  ...webhookEventGroups.user,
  ...webhookEventGroups.essay,
  ...webhookEventGroups.grading,
  ...webhookEventGroups.document,
  ...webhookEventGroups.flashcard,
  ...webhookEventGroups.quiz,
] as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const retryableStatusCodes = [
  408, // Request Timeout
  409, // Conflict
  425, // Too Early
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

export const nonRetryableStatusCodes = [
  400, // Bad Request
  401, // Unauthorized
  403, // Forbidden
  404, // Not Found
  405, // Method Not Allowed
  410, // Gone
  422, // Unprocessable Entity
];

// ============================================================================
// HEADERS
// ============================================================================

export const webhookHeaders = {
  id: 'X-Webhook-Id',
  timestamp: 'X-Webhook-Timestamp',
  signature: 'X-Webhook-Signature',
  event: 'X-Webhook-Event',
  version: 'X-Webhook-Version',
};

// ============================================================================
// USER AGENT
// ============================================================================

export const webhookUserAgent = 'Sandstone-Webhook/1.0';

// ============================================================================
// SIGNATURE VERSION
// ============================================================================

export const signatureVersion = 'v1';

// ============================================================================
// MAX TIMESTAMP AGE (for replay protection)
// ============================================================================

export const maxTimestampAgeMs = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// RETRY DELAYS (exponential backoff)
// ============================================================================

export function getRetryDelay(attempt: number, baseDelay: number = 60000): number {
  // Exponential backoff: baseDelay * 2^attempt
  return baseDelay * Math.pow(2, attempt);
}

// ============================================================================
// WEBHOOK URL VALIDATION
// ============================================================================

export const blockedPorts = [
  '22',   // SSH
  '25',   // SMTP
  '3306', // MySQL
  '5432', // PostgreSQL
  '6379', // Redis
  '27017', // MongoDB
];

export const blockedHostnames = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
];

// ============================================================================
// CRON SCHEDULES
// ============================================================================

export const webhookCronSchedules = {
  processPending: '* * * * *',     // Every minute
  retryFailed: '*/5 * * * *',      // Every 5 minutes
  cleanup: '0 0 * * *',            // Daily at midnight
};
