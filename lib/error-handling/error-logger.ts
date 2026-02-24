"use client";

import { ErrorInfo } from "react";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error categories for better organization
export type ErrorCategory = 
  | "runtime" 
  | "network" 
  | "auth" 
  | "validation" 
  | "render" 
  | "api" 
  | "unknown";

// Error context for additional debugging info
export interface ErrorContext {
  componentName?: string;
  errorInfo?: ErrorInfo;
  additionalData?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
  userId?: string;
  tags?: string[];
}

// Log entry structure
interface LogEntry {
  id: string;
  timestamp: string;
  error: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  userAgent: string;
  url: string;
}

// Configuration options
interface ErrorLoggerConfig {
  maxLogs: number;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  enableServerReporting: boolean;
  serverEndpoint?: string;
  environment: "development" | "staging" | "production";
  sampleRate: number; // 0-1, percentage of errors to log
}

// Default configuration
const defaultConfig: ErrorLoggerConfig = {
  maxLogs: 100,
  enableConsole: true,
  enableLocalStorage: true,
  enableServerReporting: false,
  environment: process.env.NODE_ENV as "development" | "staging" | "production" || "development",
  sampleRate: 1,
};

class ErrorLogger {
  private logs: LogEntry[] = [];
  private config: ErrorLoggerConfig;
  private errorCount: Map<string, number> = new Map();

  constructor(config: Partial<ErrorLoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.loadFromStorage();
    this.setupGlobalHandlers();
  }

  // Generate unique error ID
  generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Determine error severity based on error type
  private getSeverity(error: Error): ErrorSeverity {
    if (error.name === "ReferenceError" || error.name === "TypeError") {
      return "critical";
    }
    if (error.message?.includes("network") || error.message?.includes("fetch")) {
      return "high";
    }
    if (error.message?.includes("auth") || error.message?.includes("unauthorized")) {
      return "high";
    }
    return "medium";
  }

  // Categorize error
  private getCategory(error: Error): ErrorCategory {
    if (error.message?.includes("network") || error.message?.includes("fetch") || error.name === "NetworkError") {
      return "network";
    }
    if (error.message?.includes("auth") || error.message?.includes("unauthorized") || error.message?.includes("token")) {
      return "auth";
    }
    if (error.message?.includes("validation") || error.message?.includes("invalid")) {
      return "validation";
    }
    if (error.message?.includes("render") || error.name === "RenderingError") {
      return "render";
    }
    if (error.message?.includes("api") || error.message?.includes("API")) {
      return "api";
    }
    return "unknown";
  }

  // Main log method
  log(error: Error, context: ErrorContext = {}): LogEntry | null {
    // Check sample rate
    if (Math.random() > this.config.sampleRate) {
      return null;
    }

    const errorId = this.generateErrorId();
    const entry: LogEntry = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error,
      severity: context.additionalData?.severity as ErrorSeverity || this.getSeverity(error),
      category: context.additionalData?.category as ErrorCategory || this.getCategory(error),
      context,
      userAgent: context.userAgent || navigator.userAgent,
      url: context.url || window.location.href,
    };

    // Track error frequency
    const errorKey = `${error.name}:${error.message}`;
    this.errorCount.set(errorKey, (this.errorCount.get(errorKey) || 0) + 1);

    // Add to logs
    this.logs.unshift(entry);
    
    // Trim logs if exceeded max
    if (this.logs.length > this.config.maxLogs) {
      this.logs = this.logs.slice(0, this.config.maxLogs);
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Local storage
    if (this.config.enableLocalStorage) {
      this.saveToStorage();
    }

    // Server reporting for critical errors
    if (this.config.enableServerReporting && entry.severity === "critical") {
      this.reportToServer(error, context);
    }

    return entry;
  }

  // Log to console with styling
  private logToConsole(entry: LogEntry): void {
    const styles = {
      critical: "color: #dc2626; font-weight: bold;",
      high: "color: #ea580c; font-weight: bold;",
      medium: "color: #ca8a04;",
      low: "color: #16a34a;",
    };

    console.groupCollapsed(
      `%c[${entry.severity.toUpperCase()}] ${entry.error.name}: ${entry.error.message}`,
      styles[entry.severity]
    );
    console.log("Error ID:", entry.id);
    console.log("Timestamp:", entry.timestamp);
    console.log("Category:", entry.category);
    console.log("Stack:", entry.error.stack);
    console.log("Context:", entry.context);
    console.log("URL:", entry.url);
    console.groupEnd();
  }

  // Save logs to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem("sandstone_error_logs", JSON.stringify(this.logs));
    } catch (e) {
      console.warn("Failed to save error logs to localStorage:", e);
    }
  }

  // Load logs from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem("sandstone_error_logs");
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load error logs from localStorage:", e);
    }
  }

  // Report error to server
  async reportToServer(error: Error, context: ErrorContext = {}): Promise<void> {
    if (!this.config.serverEndpoint) {
      console.warn("Server endpoint not configured for error reporting");
      return;
    }

    try {
      const payload = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context: {
          ...context,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      };

      await fetch(this.config.serverEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // Don't wait for response
        keepalive: true,
      });
    } catch (e) {
      console.error("Failed to report error to server:", e);
    }
  }

  // Setup global error handlers
  private setupGlobalHandlers(): void {
    if (typeof window === "undefined") return;

    // Global error handler
    window.addEventListener("error", (event) => {
      this.log(event.error || new Error(event.message), {
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: "window.onerror",
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.log(error, {
        additionalData: {
          source: "unhandledrejection",
          reason: event.reason,
        },
      });
    });
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by severity
  getLogsBySeverity(severity: ErrorSeverity): LogEntry[] {
    return this.logs.filter((log) => log.severity === severity);
  }

  // Get logs by category
  getLogsByCategory(category: ErrorCategory): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  // Get error frequency
  getErrorFrequency(): Map<string, number> {
    return new Map(this.errorCount);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
    this.errorCount.clear();
    localStorage.removeItem("sandstone_error_logs");
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Update configuration
  updateConfig(newConfig: Partial<ErrorLoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): ErrorLoggerConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Utility function for async error handling
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: ErrorContext
): Promise<[T | null, Error | null]> {
  return promise
    .then((data) => [data, null] as [T, null])
    .catch((error) => {
      const err = error instanceof Error ? error : new Error(String(error));
      errorLogger.log(err, context);
      return [null, err] as [null, Error];
    });
}

// Utility for wrapping async functions with error handling
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): (...args: Parameters<T>) => Promise<[Awaited<ReturnType<T>> | null, Error | null]> {
  return async (...args: Parameters<T>) => {
    try {
      const result = await fn(...args);
      return [result, null] as [Awaited<ReturnType<T>>, null];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errorLogger.log(err, {
        ...context,
        additionalData: {
          ...context?.additionalData,
          args,
        },
      });
      return [null, err] as [null, Error];
    }
  };
}

// Safe JSON parse with error handling
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    errorLogger.log(error instanceof Error ? error : new Error("JSON parse error"), {
      additionalData: { json, fallback },
    });
    return fallback;
  }
}

// Safe localStorage access
export function safeLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? safeJsonParse(item, fallback) : fallback;
  } catch (error) {
    errorLogger.log(error instanceof Error ? error : new Error("localStorage access error"), {
      additionalData: { key, fallback },
    });
    return fallback;
  }
}
