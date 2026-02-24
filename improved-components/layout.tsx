import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";

// =============================================================================
// FONT CONFIGURATION
// =============================================================================

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: {
    default: "Sandstone - AI-Powered Learning",
    template: "%s | Sandstone",
  },
  description:
    "AI-powered A-Level response grading with detailed examiner feedback",
  keywords: [
    "education",
    "AI grading",
    "A-Level",
    "exam preparation",
    "flashcards",
    "learning",
  ],
  authors: [{ name: "Sandstone" }],
  creator: "Sandstone",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Sandstone",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
  width: "device-width",
  initialScale: 1,
};

// =============================================================================
// TOASTER CONFIGURATION (Extracted for reusability)
// =============================================================================

const toasterConfig = {
  position: "top-center" as const,
  toastOptions: {
    style: {
      background: "#2D2D2D",
      color: "#FFFFFF",
      border: "none",
    },
  },
  richColors: true,
  closeButton: true,
};

// =============================================================================
// ROOT LAYOUT (SERVER COMPONENT)
// =============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider
          defaultTheme="system"
          storageKey="sandstone-theme"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster {...toasterConfig} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
