/**
 * i18n Components Exports
 * 
 * Centralized exports for all i18n-related components.
 */

export {
  LanguageSwitcher,
  LanguageSwitcherCompact,
  LanguageSwitcherInline,
  type LanguageSwitcherProps,
} from './language-switcher';

export { LocaleProvider } from './locale-provider';

// Re-export hooks for convenience
export { useLocale, useTranslations } from 'next-intl';
