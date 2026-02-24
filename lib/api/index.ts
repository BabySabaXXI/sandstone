/**
 * Sandstone API Utilities
 * Centralized exports for all API-related utilities
 */

// Error Handling
export {
  APIError,
  ErrorCodes,
  generateRequestId,
  formatZodError,
  handleAPIError,
  createSuccessResponse,
  createErrorResponse,
  withErrorHandler,
} from "./enhanced-error-handler";
export type { ErrorCode } from "./enhanced-error-handler";

// Rate Limiting
export {
  RateLimitTiers,
  checkRateLimit,
  checkCustomRateLimit,
  getRateLimitHeaders,
  applyRateLimit,
  withRateLimit,
  getClientIdentifier,
  resetRateLimit,
  getRateLimitStatus,
} from "./enhanced-rate-limit";
export type {
  RateLimitConfig,
  RateLimitTier,
  RateLimitResult,
} from "./enhanced-rate-limit";

// Validation
export {
  validateBody,
  validateQuery,
  validateParams,
  CommonSchemas,
  checkRequestSize,
  validateContentType,
  safeJsonParse,
  withValidation,
} from "./validation";
export type { ValidationResult } from "./validation";

// Response Utilities
export {
  success,
  created,
  noContent,
  paginated,
  error,
  httpErrors,
  withCORS,
  corsPreflight,
  withSecurityHeaders,
  withCache,
  buildResponse,
  createPaginationMeta,
  createMeta,
} from "./response";
export type {
  PaginationMeta,
  ResponseMeta,
  SuccessResponse,
  ErrorResponse,
} from "./response";

// Legacy exports for backward compatibility
export { handleAPIError as legacyHandleError } from "./error-handler";
