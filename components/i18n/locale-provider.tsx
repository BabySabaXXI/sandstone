/**
 * Locale Provider Component
 * 
 * Wraps the application with next-intl provider.
 * Handles locale detection, message loading, and formatting configuration.
 */

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getFormatter, getNow, getTimeZone } from 'next-intl/server';
import { ReactNode } from 'react';
import { localeDirections, type Locale } from '@/lib/i18n/config';

interface LocaleProviderProps {
  children: ReactNode;
  locale: Locale;
}

export async function LocaleProvider({ children, locale }: LocaleProviderProps) {
  // Load messages for the current locale
  const messages = await getMessages();
  
  // Get formatting utilities
  const format = await getFormatter();
  const now = await getNow();
  const timeZone = await getTimeZone();

  // Get text direction for the locale
  const direction = localeDirections[locale] || 'ltr';

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      now={now}
      timeZone={timeZone}
      formats={{
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
      }}
    >
      <div dir={direction} className="contents">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
