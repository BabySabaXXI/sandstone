/**
 * useFlashcardSessionRealtime Hook
 * ================================
 * Real-time hook for flashcard study sessions.
 * Tracks session progress, card reviews, and syncs across devices.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { 
  getRealtimeClient, 
  CHANNELS, 
  EVENTS,
  type FlashcardSessionPayload 
} from "@/lib/supabase/realtime-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface StudyStats {
  cardsReviewed: number;
  correctCount: number;
  streak: number;
  timeSpent: number; // in seconds
}

interface UseFlashcardSessionRealtimeOptions {
  sessionId?: string;
  userId?: string;
  deckId?: string;
  enabled?: boolean;
  onSessionStarted?: (payload: FlashcardSessionPayload) => void;
  onCardReviewed?: (payload: FlashcardSessionPayload) => void;
  onSessionEnded?: (payload: FlashcardSessionPayload) => void;
  onStatsUpdate?: (stats: StudyStats) => void;
}

interface UseFlashcardSessionRealtimeReturn {
  isSubscribed: boolean;
  isSessionActive: boolean;
  stats: StudyStats;
  currentStreak: number;
  lastReviewedCardId: string | null;
  startSession: () => void;
  reviewCard: (flashcardId: string, confidence: "again" | "hard" | "good" | "easy") => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  broadcastStats: (stats: StudyStats) => void;
  unsubscribe: () => void;
}

/**
 * Hook for real-time flashcard study sessions
 */
export function useFlashcardSessionRealtime(
  options: UseFlashcardSessionRealtimeOptions
): UseFlashcardSessionRealtimeReturn {
  const {
    sessionId,
    userId,
    deckId,
    enabled = true,
    onSessionStarted,
    onCardReviewed,
    onSessionEnded,
    onStatsUpdate,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [stats, setStats] = useState<StudyStats>({
    cardsReviewed: 0,
    correctCount: 0,
    streak: 0,
    timeSpent: 0,
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastReviewedCardId, setLastReviewedCardId] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string>(sessionId || `session-${Date.now()}`);

  const handlePayload = useCallback((payload: FlashcardSessionPayload) => {
    switch (payload.action) {
      case "started":
        setIsSessionActive(true);
        sessionStartTimeRef.current = Date.now();
        onSessionStarted?.(payload);
        break;
      case "reviewed":
        setStats(prev => ({
          ...prev,
          cardsReviewed: payload.stats?.cardsReviewed || prev.cardsReviewed + 1,
        }));
        setCurrentStreak(payload.stats?.streak || 0);
        setLastReviewedCardId(payload.flashcardId || null);
        onCardReviewed?.(payload);
        break;
      case "paused":
        setIsSessionActive(false);
        break;
      case "resumed":
        setIsSessionActive(true);
        break;
      case "ended":
        setIsSessionActive(false);
        onSessionEnded?.(payload);
        break;
    }

    if (payload.stats) {
      setStats(payload.stats);
      onStatsUpdate?.(payload.stats);
    }
  }, [onSessionStarted, onCardReviewed, onSessionEnded, onStatsUpdate]);

  const broadcastEvent = useCallback((
    action: FlashcardSessionPayload["action"],
    additionalData?: Partial<FlashcardSessionPayload>
  ) => {
    if (!channelRef.current) return;

    const payload: FlashcardSessionPayload = {
      sessionId: sessionIdRef.current,
      userId: userId || "anonymous",
      action,
      stats,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    const eventMap: Record<string, string> = {
      started: EVENTS.FLASHCARD_SESSION_STARTED,
      reviewed: EVENTS.FLASHCARD_REVIEWED,
      paused: EVENTS.SESSION_PAUSED,
      resumed: EVENTS.SESSION_RESUMED,
      ended: EVENTS.FLASHCARD_SESSION_ENDED,
    };

    channelRef.current.send({
      type: "broadcast",
      event: eventMap[action],
      payload,
    });
  }, [userId, stats]);

  const startSession = useCallback(() => {
    sessionIdRef.current = sessionId || `session-${Date.now()}`;
    sessionStartTimeRef.current = Date.now();
    setStats({
      cardsReviewed: 0,
      correctCount: 0,
      streak: 0,
      timeSpent: 0,
    });
    setCurrentStreak(0);
    broadcastEvent("started");
  }, [sessionId, broadcastEvent]);

  const reviewCard = useCallback((flashcardId: string, confidence: "again" | "hard" | "good" | "easy") => {
    const isCorrect = confidence === "good" || confidence === "easy";
    const newStreak = isCorrect ? currentStreak + 1 : 0;
    
    const newStats: StudyStats = {
      cardsReviewed: stats.cardsReviewed + 1,
      correctCount: isCorrect ? stats.correctCount + 1 : stats.correctCount,
      streak: newStreak,
      timeSpent: sessionStartTimeRef.current 
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : stats.timeSpent,
    };

    setStats(newStats);
    setCurrentStreak(newStreak);
    setLastReviewedCardId(flashcardId);

    broadcastEvent("reviewed", {
      flashcardId,
      confidence,
      stats: newStats,
    });
  }, [stats, currentStreak, broadcastEvent]);

  const pauseSession = useCallback(() => {
    broadcastEvent("paused");
  }, [broadcastEvent]);

  const resumeSession = useCallback(() => {
    broadcastEvent("resumed");
  }, [broadcastEvent]);

  const endSession = useCallback(() => {
    const finalStats: StudyStats = {
      ...stats,
      timeSpent: sessionStartTimeRef.current 
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : stats.timeSpent,
    };

    broadcastEvent("ended", { stats: finalStats });
    setIsSessionActive(false);
    sessionStartTimeRef.current = null;
  }, [stats, broadcastEvent]);

  const broadcastStats = useCallback((newStats: StudyStats) => {
    setStats(newStats);
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: EVENTS.SESSION_PROGRESS,
        payload: {
          sessionId: sessionIdRef.current,
          userId: userId || "anonymous",
          stats: newStats,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [userId]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  // Subscribe to session channel
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.FLASHCARD_SESSION(sessionId);
    
    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    // Subscribe to session events
    channel
      .on("broadcast", { event: EVENTS.FLASHCARD_SESSION_STARTED }, (payload) => {
        handlePayload(payload.payload as FlashcardSessionPayload);
      })
      .on("broadcast", { event: EVENTS.FLASHCARD_REVIEWED }, (payload) => {
        handlePayload(payload.payload as FlashcardSessionPayload);
      })
      .on("broadcast", { event: EVENTS.FLASHCARD_SESSION_ENDED }, (payload) => {
        handlePayload(payload.payload as FlashcardSessionPayload);
      })
      .on("broadcast", { event: EVENTS.SESSION_PAUSED }, (payload) => {
        handlePayload(payload.payload as FlashcardSessionPayload);
      })
      .on("broadcast", { event: EVENTS.SESSION_RESUMED }, (payload) => {
        handlePayload(payload.payload as FlashcardSessionPayload);
      })
      .on("broadcast", { event: EVENTS.SESSION_PROGRESS }, (payload) => {
        const data = payload.payload as FlashcardSessionPayload;
        if (data.stats) {
          setStats(data.stats);
          onStatsUpdate?.(data.stats);
        }
      });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsSubscribed(true);
      }
    });

    channelRef.current = channel;

    return () => {
      unsubscribe();
    };
  }, [sessionId, enabled, handlePayload, onStatsUpdate, unsubscribe]);

  // Subscribe to deck updates
  useEffect(() => {
    if (!enabled || !deckId) return;

    const client = getRealtimeClient();
    const deckChannelName = CHANNELS.DECK_UPDATES(deckId);
    
    const deckChannel = client.channel(deckChannelName, {
      config: {
        broadcast: { self: false },
      },
    });

    deckChannel
      .on("broadcast", { event: EVENTS.DECK_UPDATED }, (payload) => {
        // Handle deck updates (new cards, edits, etc.)
        console.log("Deck updated:", payload);
      });

    deckChannel.subscribe();

    return () => {
      deckChannel.unsubscribe();
    };
  }, [deckId, enabled]);

  return {
    isSubscribed,
    isSessionActive,
    stats,
    currentStreak,
    lastReviewedCardId,
    startSession,
    reviewCard,
    pauseSession,
    resumeSession,
    endSession,
    broadcastStats,
    unsubscribe,
  };
}

export default useFlashcardSessionRealtime;
