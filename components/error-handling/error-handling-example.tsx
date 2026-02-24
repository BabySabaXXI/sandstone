"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, CheckCircle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EnhancedErrorBoundary,
  useGlobalErrorHandler,
  useAsyncOperation,
  useErrorState,
  useNetworkStatus,
  LoadingFallback,
  EmptyStateFallback,
  GenericErrorFallback,
  ErrorMonitor,
} from "@/components/error-handling";
import {
  ValidationError,
  NetworkError,
  AuthError,
} from "@/lib/error-handling/error-utils";

// Example 1: Basic Error Boundary Usage
export function ErrorBoundaryExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">1. Error Boundary Example</h2>
      <EnhancedErrorBoundary
        componentName="ErrorBoundaryExample"
        onError={(error) => console.log("Error caught:", error)}
      >
        <ComponentThatThrows />
      </EnhancedErrorBoundary>
    </div>
  );
}

function ComponentThatThrows() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("This is a test error!");
  }

  return (
    <Button onClick={() => setShouldThrow(true)} variant="destructive">
      <AlertTriangle className="w-4 h-4 mr-2" />
      Trigger Error
    </Button>
  );
}

// Example 2: Async Operation with Error Handling
export function AsyncOperationExample() {
  const { data, isLoading, error, execute } = useAsyncOperation(
    async (shouldFail: boolean) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (shouldFail) {
        throw new NetworkError("Failed to fetch data from server");
      }
      
      return { message: "Data loaded successfully!", timestamp: new Date() };
    },
    {
      onSuccess: (data) => console.log("Success:", data),
      onError: (error) => console.log("Error handled:", error),
      showToast: true,
      retryCount: 2,
    }
  );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">2. Async Operation Example</h2>
      
      {isLoading && <LoadingFallback message="Loading data..." />}
      
      {error && (
        <div className="p-4 bg-destructive/10 rounded-lg">
          <p className="text-destructive">{error.message}</p>
        </div>
      )}
      
      {data && (
        <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <p>{data.message}</p>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button onClick={() => execute(false)} disabled={isLoading}>
          Load Data (Success)
        </Button>
        <Button onClick={() => execute(true)} variant="destructive" disabled={isLoading}>
          Load Data (Fail)
        </Button>
      </div>
    </div>
  );
}

// Example 3: Error State Management
export function ErrorStateExample() {
  const { error, hasError, throwError, clearError, handleError } = useErrorState();

  const triggerValidationError = () => {
    handleError(new ValidationError("Invalid input provided", { field: "email" }));
  };

  const triggerNetworkError = () => {
    handleError(new NetworkError("Connection timeout"));
  };

  const triggerAuthError = () => {
    handleError(new AuthError("Session expired"));
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">3. Error State Management</h2>
      
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{error?.name}</p>
              <p className="text-sm text-destructive/80">{error?.message}</p>
            </div>
            <Button onClick={clearError} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={triggerValidationError} variant="outline">
          Validation Error
        </Button>
        <Button onClick={triggerNetworkError} variant="outline">
          Network Error
        </Button>
        <Button onClick={triggerAuthError} variant="outline">
          Auth Error
        </Button>
        <Button onClick={clearError} variant="ghost">
          Clear Error
        </Button>
      </div>
    </div>
  );
}

// Example 4: Network Status Monitoring
export function NetworkStatusExample() {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">4. Network Status</h2>
      
      <div className="flex items-center gap-4">
        <div
          className={`w-4 h-4 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="font-medium">
          {isOnline ? "Online" : "Offline"}
        </span>
        {wasOffline && isOnline && (
          <span className="text-sm text-green-600">(Was offline)</span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Try turning your network on/off to see the status change and toast notifications.
      </p>
    </div>
  );
}

// Example 5: Global Error Handler
export function GlobalErrorHandlerExample() {
  const { handleError, handleAsyncError } = useGlobalErrorHandler();

  const triggerGlobalError = () => {
    handleError(new Error("This is a global error!"));
  };

  const triggerAsyncError = async () => {
    await handleAsyncError(
      Promise.reject(new Error("Async operation failed")),
      { additionalData: { source: "example" } }
    );
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">5. Global Error Handler</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={triggerGlobalError} variant="outline">
          Trigger Global Error
        </Button>
        <Button onClick={triggerAsyncError} variant="outline">
          Trigger Async Error
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        These errors will be logged and shown as toast notifications.
      </p>
    </div>
  );
}

// Example 6: Fallback Components
export function FallbackComponentsExample() {
  const [showEmpty, setShowEmpty] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">6. Fallback Components</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowEmpty(!showEmpty)} variant="outline">
          Toggle Empty State
        </Button>
        <Button onClick={() => setShowError(!showError)} variant="outline">
          Toggle Error State
        </Button>
      </div>
      
      <div className="border border-border rounded-lg p-4">
        {showEmpty && (
          <EmptyStateFallback
            title="No essays yet"
            message="Start by grading your first essay to see it here."
            action={() => setShowEmpty(false)}
            actionLabel="Create Essay"
          />
        )}
        
        {showError && (
          <GenericErrorFallback
            error={new Error("Failed to load essays")}
            onRetry={() => setShowError(false)}
            onGoHome={() => setShowError(false)}
          />
        )}
        
        {!showEmpty && !showError && (
          <p className="text-center text-muted-foreground">
            Content loaded successfully!
          </p>
        )}
      </div>
    </div>
  );
}

// Example 7: Error Monitor
export function ErrorMonitorExample() {
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);

  const triggerErrors = () => {
    // Trigger various errors to populate the monitor
    console.error("Test error 1");
    console.error("Test error 2");
    setTimeout(() => setIsMonitorOpen(true), 100);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">7. Error Monitor</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setIsMonitorOpen(true)} variant="outline">
          <Bug className="w-4 h-4 mr-2" />
          Open Error Monitor
        </Button>
        <Button onClick={triggerErrors} variant="outline">
          Trigger Test Errors
        </Button>
      </div>
      
      <ErrorMonitor
        isOpen={isMonitorOpen}
        onClose={() => setIsMonitorOpen(false)}
      />
    </div>
  );
}

// Main Demo Component
export function ErrorHandlingDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Handling Demo</h1>
        <p className="text-muted-foreground">
          Examples of error handling components and hooks
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl">
          <ErrorBoundaryExample />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <AsyncOperationExample />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <ErrorStateExample />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <NetworkStatusExample />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <GlobalErrorHandlerExample />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <FallbackComponentsExample />
        </div>

        <div className="bg-card border border-border rounded-xl">
          <ErrorMonitorExample />
        </div>
      </div>
    </div>
  );
}
