/**
 * Optimized Root Layout
 * 
 * This layout includes all performance optimizations:
 * - Resource hints (preconnect, dns-prefetch, preload)
 * - Critical CSS inlining
 * - Font optimization
 * - Performance monitoring
 * - Lazy loading setup
 */

import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";
import Script from "next/script";
import {
  PerformanceResourceHints,
  PerformanceMonitor,
  preloadCriticalResources,
  prefetchCommonRoutes,
} from "@/components/performance";

// Font optimization with display swap for better performance
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  adjustFontFallback: true,
});

// Separate viewport export for Next.js 14
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1EB" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
  colorScheme: "light dark",
};

// Enhanced metadata for SEO and PWA
export const metadata: Metadata = {
  title: {
    default: "Sandstone - AI-Powered A-Level Learning",
    template: "%s | Sandstone",
  },
  description:
    "AI-powered A-Level response grading with detailed examiner feedback. Master Economics and Geography with personalized AI tutoring, instant essay feedback, and comprehensive study tools.",
  keywords: [
    "A-Level",
    "Economics",
    "Geography",
    "AI tutoring",
    "exam preparation",
    "essay grading",
    "Edexcel",
    "study app",
    "online learning",
    "UK education",
    "personalized learning",
    "flashcards",
    "quizzes",
    "revision",
    "past papers",
  ],
  authors: [{ name: "Sandstone Team", url: "https://sandstone.app" }],
  creator: "Sandstone",
  publisher: "Sandstone",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://sandstone.app",
    siteName: "Sandstone",
    title: "Sandstone - AI-Powered A-Level Learning",
    description:
      "AI-powered A-Level response grading with detailed examiner feedback. Master Economics and Geography with personalized AI tutoring.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sandstone - AI-Powered A-Level Learning Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sandstone",
    creator: "@sandstone",
    title: "Sandstone - AI-Powered A-Level Learning",
    description:
      "AI-powered A-Level response grading with detailed examiner feedback",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
    ],
    shortcut: "/favicon-16x16.png",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#E8D5C4",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sandstone",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  applicationName: "Sandstone",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  category: "education",
  classification: "Education Technology",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL("https://sandstone.app"),
  alternates: {
    canonical: "https://sandstone.app",
    languages: {
      "en-GB": "https://sandstone.app",
      "en": "https://sandstone.app",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      me: ["mailto:contact@sandstone.app"],
    },
  },
  other: {
    "apple-itunes-app": "app-id=sandstonelearning",
    "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
    "msapplication-TileColor": "#E8D5C4",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#F5F1EB",
  },
};

// Critical CSS to inline
const criticalCSS = `
  /* Critical CSS for above-the-fold content */
  :root {
    --background: 40 33% 95%;
    --foreground: 0 0% 10%;
    --card: 40 33% 95%;
    --card-foreground: 0 0% 10%;
    --popover: 40 33% 95%;
    --popover-foreground: 0 0% 10%;
    --primary: 25 45% 45%;
    --primary-foreground: 40 33% 95%;
    --secondary: 40 20% 90%;
    --secondary-foreground: 0 0% 10%;
    --muted: 40 20% 90%;
    --muted-foreground: 0 0% 45%;
    --accent: 25 45% 45%;
    --accent-foreground: 40 33% 95%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 40 20% 85%;
    --input: 40 20% 85%;
    --ring: 25 45% 45%;
    --radius: 0.5rem;
  }
  
  .dark {
    --background: 0 0% 10%;
    --foreground: 40 33% 95%;
    --card: 0 0% 12%;
    --card-foreground: 40 33% 95%;
    --popover: 0 0% 12%;
    --popover-foreground: 40 33% 95%;
    --primary: 25 45% 55%;
    --primary-foreground: 0 0% 10%;
    --secondary: 0 0% 18%;
    --secondary-foreground: 40 33% 95%;
    --muted: 0 0% 18%;
    --muted-foreground: 0 0% 60%;
    --accent: 25 45% 55%;
    --accent-foreground: 0 0% 10%;
    --destructive: 0 62% 30%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 25 45% 55%;
  }
  
  * {
    border-color: hsl(var(--border));
  }
  
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: var(--font-inter), system-ui, sans-serif;
  }
  
  /* Prevent layout shift */
  html {
    scroll-behavior: smooth;
  }
  
  /* Skip link for accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`;

// Root layout as Server Component (no 'use client' directive)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
      dir="ltr"
    >
      <head>
        {/* Resource Hints for Performance */}
        <PerformanceResourceHints
          preconnectDomains={[
            "https://api.moonshot.cn",
            "https://*.supabase.co",
            "https://fonts.gstatic.com",
          ]}
          preloadResources={[
            {
              url: "/fonts/inter-var.woff2",
              as: "font",
              type: "font/woff2",
              crossOrigin: true,
            },
            {
              url: "/icons/icon-192x192.png",
              as: "image",
            },
          ]}
          prefetchPages={[
            "/dashboard",
            "/flashcards",
            "/documents",
          ]}
        />

        {/* Critical CSS Inline */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.moonshot.cn" />
        <link rel="dns-prefetch" href="https://api.moonshot.cn" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Performance Monitoring Script */}
        <Script
          id="performance-init"
          strategy="afterInteractive"
        >
          {`
            // Preload critical resources
            if (typeof window !== 'undefined') {
              // Mark initial page load start
              window.performance.mark('page-load-start');
              
              // Preload critical resources on idle
              if ('requestIdleCallback' in window) {
                requestIdleCallback(function() {
                  // Prefetch common routes
                  const routes = ['/dashboard', '/flashcards', '/documents'];
                  routes.forEach(function(route) {
                    var link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = route;
                    document.head.appendChild(link);
                  });
                }, { timeout: 2000 });
              }
              
              // Measure page load
              window.addEventListener('load', function() {
                window.performance.mark('page-load-end');
                window.performance.measure('page-load', 'page-load-start', 'page-load-end');
              });
            }
          `}
        </Script>

        {/* Web Vitals Monitoring */}
        <Script
          src="https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js"
          strategy="worker"
        />

        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="GB" />
        <meta name="geo.placename" content="United Kingdom" />
        <meta name="ICBM" content="54.3781, -2.2137" />
        <meta name="geo.position" content="54.3781;-2.2137" />
      </head>
      <body className="font-sans antialiased min-h-screen">
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
                  background: "var(--toast-background, #2D2D2D)",
                  color: "var(--toast-foreground, #FFFFFF)",
                  border: "none",
                },
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>

        {/* Performance Monitor (only in production) */}
        {process.env.NODE_ENV === 'production' && (
          <PerformanceMonitor
            reportToAnalytics={true}
            onMetric={(metric) => {
              // Log to console in development
              if (process.env.NODE_ENV === 'development') {
                console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
              }
            }}
          />
        )}
      </body>
    </html>
  );
}
