import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";
import { EnhancedErrorBoundary } from "@/components/error-handling/enhanced-error-boundary";
import { GlobalErrorHandler } from "@/components/error-handling/global-error-handler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sandstone - AI-Powered Learning",
  description: "AI-powered A-Level response grading with detailed examiner feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {/* Global Error Boundary - Catches all uncaught errors */}
        <EnhancedErrorBoundary componentName="RootLayout">
          {/* Global Error Handler - Handles async errors and network status */}
          <GlobalErrorHandler>
            <ThemeProvider>
              <AuthProvider>
                {children}
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: '#2D2D2D',
                      color: '#FFFFFF',
                      border: 'none',
                    },
                  }}
                />
              </AuthProvider>
            </ThemeProvider>
          </GlobalErrorHandler>
        </EnhancedErrorBoundary>
      </body>
    </html>
  );
}
