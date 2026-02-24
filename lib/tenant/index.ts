/**
 * Multi-Tenant Security Module for Sandstone
 * 
 * This module provides comprehensive tenant isolation for the Sandstone app,
 * ensuring data separation between subjects (Economics, Geography).
 * 
 * @module tenant
 */

// Security utilities
export {
  isValidSubject,
  getUserSubjectsServer,
  getUserSubjectsClient,
  userHasSubjectAccessServer,
  userHasSubjectAccessClient,
  validateSubject,
  createSubjectFilter,
  buildSecureQueryFilter,
  type ValidSubject,
} from "./security";

// Middleware utilities
export {
  validateSubjectParam,
  validateSubjectMiddleware,
  withSubjectValidation,
  subjectContextMiddleware,
  getValidatedSubjectFromHeaders,
  createSubjectIsolationError,
} from "./middleware";

// React hooks
export {
  useUserSubjects,
  useSubjectAccess,
  useSecureEssays,
  useSecureFlashcardDecks,
  useSecureDocuments,
  useSecureQuizzes,
  useSecureAIChats,
  useSecureCreate,
  useSecureUpdate,
  useSecureDelete,
  type ValidSubject as HookValidSubject,
} from "./hooks";

// Server-side API utilities
export {
  validateSubject as validateSubjectServer,
  subjectSchema,
  getAuthenticatedUserWithSubjects,
  checkSubjectAccess,
  createSubjectIsolatedQuery,
  withSubjectIsolation,
  createSubjectIsolationError as createSubjectIsolationErrorServer,
  createInvalidSubjectError,
  SecureDatabaseOperations,
  createSecureDBOps,
  type ValidSubject as ServerValidSubject,
} from "./server-api";
