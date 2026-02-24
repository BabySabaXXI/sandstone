"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Auth route group error boundary.
 * Handles errors that occur during authentication flows.
 */
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  // Check for specific auth errors
  const isAuthError = error.message?.toLowerCase().includes("auth") ||
                      error.message?.toLowerCase().includes("login") ||
                      error.message?.toLowerCase().includes("session");

  return (
    <div className="text-center space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30"
      >
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {isAuthError ? "Authentication Error" : "Something went wrong"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAuthError
            ? "There was a problem with authentication. Please try again."
            : "An unexpected error occurred. Please try again."}
        </p>
      </motion.div>

      {process.env.NODE_ENV === "development" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-muted-foreground font-mono"
        >
          {error.message}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </motion.div>
    </div>
  );
}
