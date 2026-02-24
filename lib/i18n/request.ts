/**
 * next-intl Request Configuration
 * 
 * Configures how next-intl handles locale detection and message loading.
 * This is used by the Next.js Intl Plugin.
 */

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from './config';

// Validate locale
function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Load messages for the requested locale
  // Fallback to default locale if translations are missing
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}, falling back to ${defaultLocale}`);
    messages = (await import(`@/messages/${defaultLocale}.json`)).default;
  }

  return {
    locale,
    messages,
    // Configure number formatting
    numberFormats: {
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      percent: {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
      currency: {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
      },
    },
    // Configure date/time formatting
    dateTimeFormats: {
      short: {
        dateStyle: 'short',
      },
      medium: {
        dateStyle: 'medium',
      },
      long: {
        dateStyle: 'long',
      },
      full: {
        dateStyle: 'full',
        timeStyle: 'short',
      },
      time: {
        timeStyle: 'short',
      },
      relative: {
        // Used with formatRelativeTime
      },
    },
    // Configure default translation values
    defaultTranslationValues: {
      appName: 'Sandstone',
      supportEmail: 'support@sandstone.app',
    },
    // Configure rich text elements
    formats: {
      number: {
        precise: {
          maximumFractionDigits: 5,
        },
      },
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
      },
    },
  };
});
