/**
 * FlashcardSession Component
 * ==========================
 * Real-time component for flashcard study sessions.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useFlashcardSessionRealtime } from "@/lib/realtime";
import { 
  Play, 
  Pause, 
  Square, 
  Trophy, 
  Flame, 
  Clock,
  Target,
  TrendingUp 
} from "lucide-react";

interface FlashcardSessionProps {
  sessionId?: string;
  userId?: string;
  deckId?: string;
  onSessionEnd?: (stats: {
    cardsReviewed: number;
    correctCount: number;
    streak: number;
    timeSpent: number;
  }) => void;
}

interface SessionStats {
  cardsReviewed: number;
  correctCount: number;
  streak: number;
  timeSpent: number;
}

export function FlashcardSession({
  sessionId,
  userId,
  deckId,
  onSessionEnd,
}: FlashcardSessionProps) {
  const [displayTime, setDisplayTime] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsReviewed: 0,
    correctCount: 0,
    streak: 0,
    timeSpent: 0,
  });

  const {
    isSubscribed,
    isSessionActive,
    stats,
    currentStreak,
    startSession,
    reviewCard,
    pauseSession,
    resumeSession,
    endSession,
  } = useFlashcardSessionRealtime({
    sessionId,
    userId,
    deckId,
    enabled: !!sessionId,
    onSessionStarted: () => {
      setDisplayTime(0);
    },
    onStatsUpdate: (newStats) => {
      setSessionStats(newStats);
    },
    onSessionEnded: (payload) => {
      if (payload.stats) {
        onSessionEnd?.(payload.stats);
      }
    },
  });

  // Update display time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSessionActive) {
      interval = setInterval(() => {
        setDisplayTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSessionActive]);

  // Sync with realtime stats
  useEffect(() => {
    if (stats) {
      setSessionStats(stats);
    }
  }, [stats]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const accuracy = sessionStats.cardsReviewed > 0
    ? Math.round((sessionStats.correctCount / sessionStats.cardsReviewed) * 100)
    : 0;

  const handleStart = () => {
    startSession();
  };

  const handlePause = () => {
    pauseSession();
  };

  const handleResume = () => {
    resumeSession();
  };

  const handleEnd = () => {
    endSession();
  };

  const handleReview = (confidence: "again" | "hard" | "good" | "easy") => {
    const cardId = `card-${Date.now()}`;
    reviewCard(cardId, confidence);
  };

  if (!sessionId) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No active session</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Study Session
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            {formatTime(displayTime)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Cards
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {sessionStats.cardsReviewed}
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Accuracy
          </div>
          <div className={`text-2xl font-bold ${
            accuracy >= 80 ? "text-green-600" : accuracy >= 50 ? "text-yellow-600" : "text-red-600"
          }`}>
            {accuracy}%
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
            <Flame className="w-4 h-4" />
            Streak
          </div>
          <div className="text-2xl font-bold text-orange-500">
            {currentStreak}
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <div className="px-4 pb-4">
        {!isSessionActive && sessionStats.cardsReviewed === 0 ? (
          <button
            onClick={handleStart}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Session
          </button>
        ) : (
          <div className="space-y-3">
            {/* Quick Review Buttons (for demo) */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleReview("again")}
                className="py-2 px-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
              >
                Again
              </button>
              <button
                onClick={() => handleReview("hard")}
                className="py-2 px-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-xs font-medium transition-colors"
              >
                Hard
              </button>
              <button
                onClick={() => handleReview("good")}
                className="py-2 px-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
              >
                Good
              </button>
              <button
                onClick={() => handleReview("easy")}
                className="py-2 px-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
              >
                Easy
              </button>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              {isSessionActive ? (
                <button
                  onClick={handlePause}
                  className="flex-1 py-2 px-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex-1 py-2 px-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
              <button
                onClick={handleEnd}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Square className="w-4 h-4" />
                End
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isSubscribed && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-center">
          <span className="text-xs text-yellow-700">
            Connecting to session...
          </span>
        </div>
      )}

      {/* Session Summary (when ended) */}
      {!isSessionActive && sessionStats.cardsReviewed > 0 && (
        <div className="px-4 py-3 bg-green-50 border-t border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Session Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-green-700">
              Cards Reviewed: <span className="font-semibold">{sessionStats.cardsReviewed}</span>
            </div>
            <div className="text-green-700">
              Correct: <span className="font-semibold">{sessionStats.correctCount}</span>
            </div>
            <div className="text-green-700">
              Best Streak: <span className="font-semibold">{sessionStats.streak}</span>
            </div>
            <div className="text-green-700">
              Time: <span className="font-semibold">{formatTime(sessionStats.timeSpent)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardSession;
