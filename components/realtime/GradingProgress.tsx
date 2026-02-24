/**
 * GradingProgress Component
 * =========================
 * Real-time component for displaying essay grading progress.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useEssayGradingRealtime } from "@/lib/realtime";
import { CheckCircle, AlertCircle, Loader2, UserCheck } from "lucide-react";

interface GradingProgressProps {
  essayId?: string;
  userId?: string;
  examiners?: Array<{ id: string; name: string; color: string }>;
  onComplete?: (result: { progress: number; examinersCompleted: string[] }) => void;
  onError?: (error: string) => void;
}

interface ExaminerProgress {
  id: string;
  name: string;
  color: string;
  status: "pending" | "in_progress" | "completed" | "error";
  score?: number;
}

export function GradingProgress({
  essayId,
  userId,
  examiners = [],
  onComplete,
  onError,
}: GradingProgressProps) {
  const [examinerProgress, setExaminerProgress] = useState<ExaminerProgress[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  const {
    isSubscribed,
    progress,
    status,
    currentExaminer,
    examinersCompleted,
    partialResults,
    error,
  } = useEssayGradingRealtime({
    essayId,
    userId,
    enabled: !!essayId,
    onProgress: (payload) => {
      // Update examiner progress
      if (payload.currentExaminer) {
        setExaminerProgress(prev =>
          prev.map(ex =>
            ex.id === payload.currentExaminer
              ? { ...ex, status: "in_progress" }
              : ex
          )
        );
      }

      if (payload.examinersCompleted) {
        payload.examinersCompleted.forEach(examinerId => {
          const partialResult = payload.partialResults?.find(
            r => r.examinerId === examinerId
          );

          setExaminerProgress(prev =>
            prev.map(ex =>
              ex.id === examinerId
                ? { 
                    ...ex, 
                    status: "completed", 
                    score: partialResult?.score 
                  }
                : ex
            )
          );
        });
      }
    },
    onCompleted: (payload) => {
      onComplete?.({
        progress: 100,
        examinersCompleted: payload.examinersCompleted || [],
      });
    },
    onFailed: (payload) => {
      if (payload.error) {
        onError?.(payload.error);
      }
    },
  });

  // Initialize examiner progress
  useEffect(() => {
    if (examiners.length > 0) {
      setExaminerProgress(
        examiners.map(ex => ({
          id: ex.id,
          name: ex.name,
          color: ex.color,
          status: "pending",
        }))
      );
    }
  }, [examiners]);

  const getStatusIcon = (status: ExaminerProgress["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: ExaminerProgress["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "in_progress":
        return "bg-blue-50 border-blue-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!essayId) {
    return null;
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Grading Progress</h3>
        </div>
        <span className={`text-sm font-medium ${
          status === "completed" ? "text-green-600" : "text-blue-600"
        }`}>
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              status === "completed"
                ? "bg-green-500"
                : status === "failed"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text */}
        <div className="mt-2 text-sm text-gray-600">
          {status === "started" && "Initializing graders..."}
          {status === "in_progress" && currentExaminer && (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Grading with {currentExaminer}...
            </span>
          )}
          {status === "completed" && (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Grading complete!
            </span>
          )}
          {status === "failed" && error && (
            <span className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Examiner Details */}
      {showDetails && examinerProgress.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {examinerProgress.map((examiner) => (
              <div
                key={examiner.id}
                className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${getStatusColor(
                  examiner.status
                )}`}
              >
                {getStatusIcon(examiner.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: examiner.color }}
                    />
                    <span className="font-medium text-sm">{examiner.name}</span>
                  </div>
                  {examiner.score !== undefined && (
                    <span className="text-xs text-gray-500 ml-5">
                      Score: {examiner.score}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isSubscribed && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
          <span className="text-xs text-yellow-700 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Connecting to realtime updates...
          </span>
        </div>
      )}
    </div>
  );
}

export default GradingProgress;
