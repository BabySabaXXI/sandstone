"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
} from "lucide-react";
import { errorLogger } from "@/lib/error-handling/error-logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the critical error
    errorLogger.log(error, {
      componentName: "GlobalError",
      additionalData: {
        digest: error.digest,
        source: "Next.js global error boundary",
        isGlobal: true,
      },
    });
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-2xl shadow-soft-lg p-8 max-w-lg w-full text-center"
          >
            {/* Critical Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </motion.div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Critical Error
            </h1>
            
            <p className="text-muted-foreground mb-6">
              A critical error has occurred that prevented the application from loading. 
              We've logged this issue and our team is investigating.
            </p>

            {error.digest && (
              <div className="mb-6 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Error Reference: <span className="font-mono">{error.digest}</span>
                </p>
              </div>
            )}

            {/* Error Message (if available) */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Error Details</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message || "Unknown error occurred"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={handleReload}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </button>
              </div>

              <button
                onClick={handleGoHome}
                className="w-full inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground px-6 py-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                If this problem persists, please contact support
              </p>
              <p className="text-xs text-muted-foreground">
                Error ID: {errorLogger.generateErrorId()}
              </p>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
