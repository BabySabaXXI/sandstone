/**
 * useEssayGradingRealtime Hook
 * ============================
 * Real-time hook for essay grading progress updates.
 * Subscribes to grading status changes and broadcasts progress updates.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { 
  getRealtimeClient, 
  CHANNELS, 
  EVENTS,
  type GradingProgressPayload 
} from "@/lib/supabase/realtime-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseEssayGradingRealtimeOptions {
  essayId?: string;
  userId?: string;
  enabled?: boolean;
  onProgress?: (payload: GradingProgressPayload) => void;
  onCompleted?: (payload: GradingProgressPayload) => void;
  onFailed?: (payload: GradingProgressPayload) => void;
  onStarted?: (payload: GradingProgressPayload) => void;
}

interface UseEssayGradingRealtimeReturn {
  isSubscribed: boolean;
  progress: number;
  status: "idle" | "started" | "in_progress" | "completed" | "failed";
  currentExaminer: string | null;
  examinersCompleted: string[];
  partialResults: GradingProgressPayload["partialResults"];
  error: string | null;
  broadcastProgress: (payload: Omit<GradingProgressPayload, "timestamp">) => void;
  unsubscribe: () => void;
}

/**
 * Hook for real-time essay grading progress
 */
export function useEssayGradingRealtime(
  options: UseEssayGradingRealtimeOptions
): UseEssayGradingRealtimeReturn {
  const {
    essayId,
    userId,
    enabled = true,
    onProgress,
    onCompleted,
    onFailed,
    onStarted,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "started" | "in_progress" | "completed" | "failed">("idle");
  const [currentExaminer, setCurrentExaminer] = useState<string | null>(null);
  const [examinersCompleted, setExaminersCompleted] = useState<string[]>([]);
  const [partialResults, setPartialResults] = useState<GradingProgressPayload["partialResults"]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handlePayload = useCallback((payload: GradingProgressPayload) => {
    setProgress(payload.progress);
    setStatus(payload.status);
    setCurrentExaminer(payload.currentExaminer || null);
    setExaminersCompleted(payload.examinersCompleted || []);
    setPartialResults(payload.partialResults || []);
    if (payload.error) setError(payload.error);

    switch (payload.status) {
      case "started":
        onStarted?.(payload);
        break;
      case "in_progress":
        onProgress?.(payload);
        break;
      case "completed":
        onCompleted?.(payload);
        break;
      case "failed":
        onFailed?.(payload);
        break;
    }
  }, [onProgress, onCompleted, onFailed, onStarted]);

  const broadcastProgress = useCallback((payload: Omit<GradingProgressPayload, "timestamp">) => {
    if (!channelRef.current || !essayId) return;

    const fullPayload: GradingProgressPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
    };

    channelRef.current.send({
      type: "broadcast",
      event: EVENTS.ESSAY_GRADING_PROGRESS,
      payload: fullPayload,
    });
  }, [essayId]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !essayId) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.ESSAY_GRADING(essayId);
    
    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    // Subscribe to grading events
    channel
      .on("broadcast", { event: EVENTS.ESSAY_GRADING_STARTED }, (payload) => {
        handlePayload(payload.payload as GradingProgressPayload);
      })
      .on("broadcast", { event: EVENTS.ESSAY_GRADING_PROGRESS }, (payload) => {
        handlePayload(payload.payload as GradingProgressPayload);
      })
      .on("broadcast", { event: EVENTS.ESSAY_GRADING_COMPLETED }, (payload) => {
        handlePayload(payload.payload as GradingProgressPayload);
      })
      .on("broadcast", { event: EVENTS.ESSAY_GRADING_FAILED }, (payload) => {
        handlePayload(payload.payload as GradingProgressPayload);
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
  }, [essayId, enabled, handlePayload, unsubscribe]);

  // Subscribe to user's essays for new grading notifications
  useEffect(() => {
    if (!enabled || !userId) return;

    const client = getRealtimeClient();
    const userChannelName = CHANNELS.USER_ESSAYS(userId);
    
    const userChannel = client.channel(userChannelName, {
      config: {
        broadcast: { self: false },
      },
    });

    userChannel
      .on("broadcast", { event: EVENTS.ESSAY_GRADING_STARTED }, (payload) => {
        // Notify user of new grading started
        const data = payload.payload as GradingProgressPayload;
        if (data.essayId !== essayId) {
          // Could trigger a toast notification here
          console.log("New essay grading started:", data.essayId);
        }
      });

    userChannel.subscribe();

    return () => {
      userChannel.unsubscribe();
    };
  }, [userId, enabled, essayId]);

  return {
    isSubscribed,
    progress,
    status,
    currentExaminer,
    examinersCompleted,
    partialResults,
    error,
    broadcastProgress,
    unsubscribe,
  };
}

export default useEssayGradingRealtime;
