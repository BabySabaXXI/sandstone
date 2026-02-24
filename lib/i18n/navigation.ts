/**
 * i18n Navigation Utilities
 * 
 * Provides type-safe navigation helpers for localized routes.
 * Uses next-intl's createNavigation for pathnames support.
 */

import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale, pathnames } from './config';

// Create navigation utilities with pathnames support
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
  permanentRedirect,
} = createNavigation({
  locales,
  defaultLocale,
  pathnames,
});

// Type-safe pathname type
export type Pathname = keyof typeof pathnames;

// Helper to get localized href
export function getLocalizedHref(
  pathname: Pathname,
  locale: string
): string {
  const pathConfig = pathnames[pathname];
  if (typeof pathConfig === 'string') {
    return pathConfig;
  }
  return pathconfig[locale as keyof typeof pathConfig] || pathConfig[defaultLocale];
}
