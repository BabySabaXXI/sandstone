/**
 * i18n Module Exports
 * 
 * Centralized exports for all i18n-related utilities and configurations.
 */

// Export configuration
export {
  locales,
  defaultLocale,
  localeLabels,
  localeDirections,
  localeFlags,
  localeMetadata,
  pathnames,
  isValidLocale,
  getLocaleFromRequest,
  type Locale,
} from './config';

// Export navigation utilities
export {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
  permanentRedirect,
  type Pathname,
} from './navigation';

// Re-export next-intl hooks for convenience
export {
  useTranslations,
  useMessages,
  useLocale,
  useNow,
  useTimeZone,
  useFormatter,
} from 'next-intl';

// Re-export server-side utilities
export {
  getTranslations,
  getMessages,
  getFormatter,
  getNow,
  getTimeZone,
} from 'next-intl/server';
