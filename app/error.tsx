"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { errorLogger } from "@/lib/error-handling/error-logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isReported, setIsReported] = useState(false);

  useEffect(() => {
    // Log the error when the page loads
    errorLogger.log(error, {
      componentName: "ErrorPage",
      additionalData: {
        digest: error.digest,
        source: "Next.js error boundary",
      },
    });
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReportError = async () => {
    await errorLogger.reportToServer(error, {
      componentName: "ErrorPage",
      additionalData: {
        digest: error.digest,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    });
    setIsReported(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-2xl shadow-soft-lg p-8 max-w-lg w-full"
      >
        {/* Error Icon */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"
          >
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. Our team has been notified.
          </p>
        </div>

        {/* Error Digest */}
        {error.digest && (
          <div className="mb-6 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Error Reference: <span className="font-mono">{error.digest}</span>
            </p>
          </div>
        )}

        {/* Error Details (Collapsible) */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Error Details
              </span>
            </div>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-2 p-3 bg-muted/50 rounded-lg overflow-auto"
            >
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button onClick={reset} className="flex-1" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleReload} className="flex-1" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>

          <Button onClick={handleGoHome} variant="ghost" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>

          {/* Report Error Button */}
          {!isReported && (
            <Button
              onClick={handleReportError}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              Report this error
            </Button>
          )}

          {isReported && (
            <p className="text-center text-sm text-success">
              Error reported successfully. Thank you!
            </p>
          )}
        </div>

        {/* Error ID for support */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Error ID: {errorLogger.generateErrorId()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
