"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  X,
  Bug,
  Trash2,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
  Globe,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { errorLogger, ErrorSeverity, ErrorCategory, LogEntry } from "@/lib/error-handling/error-logger";

interface ErrorMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ErrorMonitor({ isOpen, onClose }: ErrorMonitorProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | "all">("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const refreshLogs = useCallback(() => {
    setLogs(errorLogger.getLogs());
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshLogs]);

  const filteredLogs = logs.filter((log) => {
    const severityMatch = selectedSeverity === "all" || log.severity === selectedSeverity;
    const categoryMatch = selectedCategory === "all" || log.category === selectedCategory;
    return severityMatch && categoryMatch;
  });

  const clearLogs = () => {
    errorLogger.clearLogs();
    refreshLogs();
  };

  const exportLogs = () => {
    const data = errorLogger.exportLogs();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case "critical":
        return "text-red-500 bg-red-500/10";
      case "high":
        return "text-orange-500 bg-orange-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "low":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getCategoryIcon = (category: ErrorCategory) => {
    switch (category) {
      case "network":
        return <Globe className="w-4 h-4" />;
      case "api":
        return <Cpu className="w-4 h-4" />;
      case "auth":
        return <AlertCircle className="w-4 h-4" />;
      case "render":
        return <Bug className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-soft-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Bug className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Error Monitor</h2>
                <p className="text-sm text-muted-foreground">
                  {logs.length} errors logged
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={cn(isAutoRefresh && "text-primary")}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isAutoRefresh && "animate-spin")} />
                Auto
              </Button>
              <Button variant="ghost" size="sm" onClick={refreshLogs}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={exportLogs}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={clearLogs}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as ErrorSeverity | "all")}
              className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ErrorCategory | "all")}
              className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="runtime">Runtime</option>
              <option value="network">Network</option>
              <option value="auth">Auth</option>
              <option value="validation">Validation</option>
              <option value="render">Render</option>
              <option value="api">API</option>
            </select>
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Bug className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No errors found</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    className="w-full flex items-center gap-3 p-3 bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", getSeverityColor(log.severity))}>
                      {log.severity}
                    </span>
                    <span className="p-1.5 bg-muted rounded">
                      {getCategoryIcon(log.category)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {log.error.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.error.name} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {expandedLog === log.id ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedLog === log.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-muted/50 border-t border-border space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Error ID</p>
                            <p className="text-sm font-mono text-foreground">{log.id}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Stack Trace</p>
                            <pre className="text-xs text-muted-foreground bg-background p-2 rounded overflow-auto max-h-40">
                              {log.error.stack}
                            </pre>
                          </div>
                          {log.context.componentName && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Component</p>
                              <p className="text-sm text-foreground">{log.context.componentName}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">URL</p>
                            <p className="text-sm text-foreground">{log.url}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">User Agent</p>
                            <p className="text-xs text-muted-foreground">{log.userAgent}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} errors
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {logs.filter((l) => l.severity === "critical").length} Critical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {logs.filter((l) => l.severity === "high").length} High
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
