/**
 * usePresence Hook
 * ================
 * Real-time hook for user presence detection.
 * Tracks online/away/offline status and user activity.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { 
  getRealtimeClient, 
  CHANNELS, 
  EVENTS,
  type PresenceState 
} from "@/lib/supabase/realtime-client";
import type { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";

type UserStatus = "online" | "away" | "offline" | "dnd";

interface UserActivity {
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
}

interface UsePresenceOptions {
  userId?: string;
  email?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  enabled?: boolean;
  heartbeatInterval?: number; // in milliseconds
  awayTimeout?: number; // in milliseconds
  initialStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
  onUserOnline?: (user: PresenceState) => void;
  onUserOffline?: (user: PresenceState) => void;
}

interface UsePresenceReturn {
  isSubscribed: boolean;
  status: UserStatus;
  onlineUsers: PresenceState[];
  onlineCount: number;
  setStatus: (status: UserStatus) => void;
  setActivity: (activity: UserActivity) => void;
  updateMetadata: (metadata: Record<string, unknown>) => void;
  unsubscribe: () => void;
}

/**
 * Hook for real-time user presence detection
 */
export function usePresence(options: UsePresenceOptions): UsePresenceReturn {
  const {
    userId,
    email,
    fullName,
    avatarUrl,
    enabled = true,
    heartbeatInterval = 30000, // 30 seconds
    awayTimeout = 300000, // 5 minutes
    initialStatus = "online",
    onStatusChange,
    onUserOnline,
    onUserOffline,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatusState] = useState<UserStatus>(initialStatus);
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const currentActivityRef = useRef<UserActivity | null>(null);
  const metadataRef = useRef<Record<string, unknown>>({});

  const buildPresenceState = useCallback((): PresenceState => {
    return {
      userId: userId || "anonymous",
      email: email || "",
      fullName: fullName || null,
      avatarUrl: avatarUrl || null,
      status,
      lastSeen: new Date().toISOString(),
      currentActivity: currentActivityRef.current?.description,
      metadata: metadataRef.current,
    };
  }, [userId, email, fullName, avatarUrl, status]);

  const handlePresenceSync = useCallback((state: RealtimePresenceState) => {
    const users: PresenceState[] = [];
    
    Object.keys(state).forEach(key => {
      const presences = state[key] as any[];
      // Get the most recent presence for each user
      const latestPresence = presences[presences.length - 1];
      if (latestPresence && latestPresence.userId !== userId) {
        users.push({
          userId: latestPresence.userId,
          email: latestPresence.email,
          fullName: latestPresence.fullName,
          avatarUrl: latestPresence.avatarUrl,
          status: latestPresence.status,
          lastSeen: latestPresence.lastSeen,
          currentActivity: latestPresence.currentActivity,
          metadata: latestPresence.metadata,
        });
      }
    });

    setOnlineUsers(users);
  }, [userId]);

  const handlePresenceJoin = useCallback(({ key, newPresences }: { key: string; newPresences: any[] }) => {
    const presence = newPresences[0];
    if (presence && presence.userId !== userId) {
      onUserOnline?.({
        userId: presence.userId,
        email: presence.email,
        fullName: presence.fullName,
        avatarUrl: presence.avatarUrl,
        status: presence.status,
        lastSeen: presence.lastSeen,
        currentActivity: presence.currentActivity,
        metadata: presence.metadata,
      });
    }
  }, [userId, onUserOnline]);

  const handlePresenceLeave = useCallback(({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
    const presence = leftPresences[0];
    if (presence && presence.userId !== userId) {
      onUserOffline?.({
        userId: presence.userId,
        email: presence.email,
        fullName: presence.fullName,
        avatarUrl: presence.avatarUrl,
        status: "offline",
        lastSeen: presence.lastSeen,
        currentActivity: presence.currentActivity,
        metadata: presence.metadata,
      });
    }
  }, [userId, onUserOffline]);

  const updatePresence = useCallback(() => {
    if (!channelRef.current) return;

    channelRef.current.track(buildPresenceState());
  }, [buildPresenceState]);

  const setStatus = useCallback((newStatus: UserStatus) => {
    setStatusState(newStatus);
    onStatusChange?.(newStatus);
    
    // Update presence immediately
    setTimeout(() => updatePresence(), 0);
  }, [onStatusChange, updatePresence]);

  const setActivity = useCallback((activity: UserActivity) => {
    currentActivityRef.current = activity;
    lastActivityRef.current = Date.now();
    
    // Reset away status if user becomes active
    if (status === "away") {
      setStatus("online");
    }
    
    // Clear existing away timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Set new away timeout
    activityTimeoutRef.current = setTimeout(() => {
      if (status === "online") {
        setStatus("away");
      }
    }, awayTimeout);
    
    updatePresence();
  }, [status, awayTimeout, setStatus, updatePresence]);

  const updateMetadata = useCallback((metadata: Record<string, unknown>) => {
    metadataRef.current = { ...metadataRef.current, ...metadata };
    updatePresence();
  }, [updatePresence]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    heartbeatRef.current = setInterval(() => {
      updatePresence();
    }, heartbeatInterval);
  }, [heartbeatInterval, updatePresence]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const unsubscribe = useCallback(() => {
    stopHeartbeat();
    
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    if (channelRef.current) {
      // Set status to offline before unsubscribing
      if (userId) {
        channelRef.current.track({
          ...buildPresenceState(),
          status: "offline",
        });
      }
      
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    setIsSubscribed(false);
    setOnlineUsers([]);
  }, [userId, buildPresenceState, stopHeartbeat]);

  // Subscribe to presence channel
  useEffect(() => {
    if (!enabled || !userId) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.USER_PRESENCE(userId);
    
    const channel = client.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Handle presence events
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        handlePresenceSync(state);
      })
      .on("presence", { event: "join" }, handlePresenceJoin)
      .on("presence", { event: "leave" }, handlePresenceLeave);

    channel.subscribe(async (subscribeStatus) => {
      if (subscribeStatus === "SUBSCRIBED") {
        setIsSubscribed(true);
        
        // Track initial presence
        const status = await channel.track(buildPresenceState());
        if (status === "ok") {
          startHeartbeat();
        }
      }
    });

    channelRef.current = channel;

    return () => {
      unsubscribe();
    };
  }, [enabled, userId, buildPresenceState, handlePresenceSync, handlePresenceJoin, handlePresenceLeave, startHeartbeat, unsubscribe]);

  // Handle visibility change for away status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (status === "online") {
          setStatus("away");
        }
      } else {
        lastActivityRef.current = Date.now();
        if (status === "away") {
          setStatus("online");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, setStatus]);

  // Handle beforeunload to set offline status
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (channelRef.current && userId) {
        channelRef.current.track({
          ...buildPresenceState(),
          status: "offline",
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId, buildPresenceState]);

  return {
    isSubscribed,
    status,
    onlineUsers,
    onlineCount: onlineUsers.length,
    setStatus,
    setActivity,
    updateMetadata,
    unsubscribe,
  };
}

export default usePresence;
