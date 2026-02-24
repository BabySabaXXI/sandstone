"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * App route group error boundary.
 * Catches errors within the app layout and provides recovery options.
 */
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("App route error:", error);
    
    // Send to error tracking service
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        {/* Error Icon */}
        <div className="relative mx-auto w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full bg-rose-100 dark:bg-rose-900/30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an error while loading this page. Please try again or contact support if the problem persists.
          </p>
        </div>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="bg-muted rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2 text-rose-500">
                <Bug className="w-4 h-4" />
                <span className="text-sm font-medium">Error Details</span>
              </div>
              <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-2 pt-2 border-t">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/help" className="text-accent hover:underline">
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
