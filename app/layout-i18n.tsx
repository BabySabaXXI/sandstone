/**
 * Root Layout with i18n Support
 * 
 * This is the updated root layout that includes next-intl integration.
 * Replace the existing layout.tsx with this file for full i18n support.
 */

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { LocaleProvider } from '@/components/i18n/locale-provider';
import { Toaster } from 'sonner';
import Script from 'next/script';
import {
  homepageStructuredData,
  organizationStructuredData,
  websiteStructuredData,
} from '@/lib/seo/structured-data';
import { locales, defaultLocale, localeDirections, type Locale } from '@/lib/i18n/config';

// Font optimization with display swap for better performance
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
  fallback: ['monospace'],
});

// Generate metadata for each locale
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const isDefault = validLocale === defaultLocale;
  
  return {
    title: {
      default: 'Sandstone - AI-Powered A-Level Learning',
      template: '%s | Sandstone',
    },
    description:
      'AI-powered A-Level response grading with detailed examiner feedback. Master Economics and Geography with personalized AI tutoring, instant essay feedback, and comprehensive study tools.',
    keywords: [
      'A-Level',
      'Economics',
      'Geography',
      'AI tutoring',
      'exam preparation',
      'essay grading',
      'Edexcel',
      'study app',
      'UK education',
      'personalized learning',
      'flashcards',
      'quizzes',
      'revision',
      'past papers',
    ],
    authors: [{ name: 'Sandstone Team', url: 'https://sandstone.app' }],
    creator: 'Sandstone',
    publisher: 'Sandstone',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: validLocale === 'en' ? 'en_GB' : validLocale,
      url: `https://sandstone.app${isDefault ? '' : `/${validLocale}`}`,
      siteName: 'Sandstone',
      title: 'Sandstone - AI-Powered A-Level Learning',
      description:
        'AI-powered A-Level response grading with detailed examiner feedback. Master Economics and Geography with personalized AI tutoring.',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Sandstone - AI-Powered A-Level Learning Platform',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@sandstone',
      creator: '@sandstone',
      title: 'Sandstone - AI-Powered A-Level Learning',
      description:
        'AI-powered A-Level response grading with detailed examiner feedback',
      images: ['/og-image.png'],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
        { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
        { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
        { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
        { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
        { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180' },
        { url: '/icons/icon-152x152.png', sizes: '152x152' },
      ],
      shortcut: '/favicon-16x16.png',
      other: [
        {
          rel: 'mask-icon',
          url: '/safari-pinned-tab.svg',
          color: '#E8D5C4',
        },
      ],
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Sandstone',
      startupImage: [
        {
          url: '/apple-splash-2048-2732.png',
          media:
            '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
        },
      ],
    },
    applicationName: 'Sandstone',
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    category: 'education',
    classification: 'Education Technology',
    referrer: 'origin-when-cross-origin',
    metadataBase: new URL('https://sandstone.app'),
    alternates: {
      canonical: `https://sandstone.app${isDefault ? '' : `/${validLocale}`}`,
      languages: {
        'en-GB': 'https://sandstone.app',
        'en': 'https://sandstone.app',
        'es': 'https://sandstone.app/es',
        'fr': 'https://sandstone.app/fr',
        'de': 'https://sandstone.app/de',
        'zh': 'https://sandstone.app/zh',
        'ar': 'https://sandstone.app/ar',
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      other: {
        me: ['mailto:contact@sandstone.app'],
      },
    },
    other: {
      'apple-itunes-app': 'app-id=sandstonelearning',
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      'msapplication-TileColor': '#E8D5C4',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#F5F1EB',
    },
  };
}

// Separate viewport export for Next.js 14
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F1EB' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
  colorScheme: 'light dark',
};

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Root layout as Server Component
export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  // Validate locale
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const direction = localeDirections[validLocale];

  return (
    <html
      lang={validLocale}
      dir={direction}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://api.moonshot.cn" />
        <link rel="dns-prefetch" href="https://api.moonshot.cn" />
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />

        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Structured Data - Organization */}
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(organizationStructuredData)}
        </Script>

        {/* Structured Data - WebSite */}
        <Script
          id="website-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(websiteStructuredData)}
        </Script>

        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="GB" />
        <meta name="geo.placename" content="United Kingdom" />
        <meta name="ICBM" content="54.3781, -2.2137" />
        <meta name="geo.position" content="54.3781;-2.2137" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <LocaleProvider locale={validLocale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="sandstone-theme"
          >
            <AuthProvider>
              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
              >
                Skip to main content
              </a>

              {/* Main content wrapper */}
              <main id="main-content" className="relative flex min-h-screen flex-col">
                {children}
              </main>

              {/* Toast notifications */}
              <Toaster
                position="top-center"
                richColors
                closeButton
                toastOptions={{
                  style: {
                    background: 'var(--toast-background, #2D2D2D)',
                    color: 'var(--toast-foreground, #FFFFFF)',
                    border: 'none',
                  },
                  duration: 4000,
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
