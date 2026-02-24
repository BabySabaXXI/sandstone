/**
 * useTranslations Hook
 * 
 * Enhanced translation hook with additional utilities for common patterns.
 * Wraps next-intl's useTranslations with helpful shortcuts.
 */

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { useFormatter, useLocale } from 'next-intl';
import { useCallback } from 'react';

// Common namespace types
export type TranslationNamespace = 
  | 'navigation'
  | 'auth'
  | 'home'
  | 'dashboard'
  | 'grade'
  | 'flashcards'
  | 'quiz'
  | 'documents'
  | 'library'
  | 'settings'
  | 'errors'
  | 'common'
  | 'time'
  | 'accessibility';

/**
 * Enhanced useTranslations hook with namespace support
 */
export function useTranslations(namespace?: TranslationNamespace) {
  const t = useNextIntlTranslations(namespace);
  const format = useFormatter();
  const locale = useLocale();

  /**
   * Translate with fallback
   */
  const tWithFallback = useCallback(
    (key: string, fallback: string, values?: Record<string, unknown>) => {
      const translation = t(key, values);
      return translation === key ? fallback : translation;
    },
    [t]
  );

  /**
   * Check if translation exists
   */
  const hasTranslation = useCallback(
    (key: string) => {
      const translation = t(key);
      return translation !== key;
    },
    [t]
  );

  /**
   * Format date with locale
   */
  const formatDate = useCallback(
    (date: Date | number, options?: Intl.DateTimeFormatOptions) => {
      return format.dateTime(date, options || { dateStyle: 'medium' });
    },
    [format]
  );

  /**
   * Format number with locale
   */
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return format.number(value, options);
    },
    [format]
  );

  /**
   * Format currency
   */
  const formatCurrency = useCallback(
    (value: number, currency = 'GBP') => {
      return format.number(value, {
        style: 'currency',
        currency,
      });
    },
    [format]
  );

  /**
   * Format percentage
   */
  const formatPercent = useCallback(
    (value: number, decimals = 0) => {
      return format.number(value / 100, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    [format]
  );

  /**
   * Get relative time string
   */
  const formatRelativeTime = useCallback(
    (date: Date | number) => {
      const now = new Date();
      const targetDate = typeof date === 'number' ? new Date(date) : date;
      const diffMs = now.getTime() - targetDate.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffSecs < 60) {
        return t('time.now');
      } else if (diffMins < 60) {
        return t('time.ago', { time: t('time.minutes', { count: diffMins }) });
      } else if (diffHours < 24) {
        return t('time.ago', { time: t('time.hours', { count: diffHours }) });
      } else if (diffDays < 7) {
        return t('time.ago', { time: t('time.days', { count: diffDays }) });
      } else if (diffWeeks < 4) {
        return t('time.ago', { time: t('time.weeks', { count: diffWeeks }) });
      } else if (diffMonths < 12) {
        return t('time.ago', { time: t('time.months', { count: diffMonths }) });
      } else {
        return t('time.ago', { time: t('time.years', { count: diffYears }) });
      }
    },
    [t]
  );

  /**
   * Batch translate multiple keys
   */
  const batchTranslate = useCallback(
    (keys: string[]) => {
      return keys.map((key) => ({ key, value: t(key) }));
    },
    [t]
  );

  return {
    t,
    locale,
    format,
    tWithFallback,
    hasTranslation,
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatRelativeTime,
    batchTranslate,
  };
}

/**
 * Hook for navigation translations
 */
export function useNavigationTranslations() {
  return useTranslations('navigation');
}

/**
 * Hook for auth translations
 */
export function useAuthTranslations() {
  return useTranslations('auth');
}

/**
 * Hook for common translations
 */
export function useCommonTranslations() {
  return useTranslations('common');
}

/**
 * Hook for error translations
 */
export function useErrorTranslations() {
  return useTranslations('errors');
}

/**
 * Hook for form field translations with labels and placeholders
 */
export function useFormTranslations(prefix: string) {
  const { t, formatDate, formatNumber } = useTranslations();

  const getFieldProps = useCallback(
    (fieldName: string) => ({
      label: t(`${prefix}.${fieldName}Label`),
      placeholder: t(`${prefix}.${fieldName}Placeholder`),
    }),
    [t, prefix]
  );

  const getErrorMessage = useCallback(
    (errorKey: string) => t(`${prefix}.error.${errorKey}`),
    [t, prefix]
  );

  return {
    getFieldProps,
    getErrorMessage,
    formatDate,
    formatNumber,
  };
}

/**
 * Hook for page metadata translations
 */
export function usePageMetadata(page: string) {
  const { t } = useTranslations(page as TranslationNamespace);

  return {
    title: t('title'),
    subtitle: t('subtitle'),
  };
}

export default useTranslations;
