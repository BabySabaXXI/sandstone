/**
 * Realtime Provider
 * =================
 * Context provider for managing global realtime state and connections.
 * Wraps the application to provide realtime functionality throughout.
 */

"use client";

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useRef, 
  useCallback,
  useState,
  type ReactNode 
} from "react";
import { getRealtimeClient, removeAllChannels } from "@/lib/supabase/realtime-client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

interface RealtimeContextValue {
  client: SupabaseClient<Database> | null;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  reconnect: () => void;
  disconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

interface RealtimeProviderProps {
  children: ReactNode;
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Provider component for realtime functionality
 */
export function RealtimeProvider({
  children,
  enabled = true,
  onConnect,
  onDisconnect,
  onError,
}: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  
  const clientRef = useRef<SupabaseClient<Database> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const initializeClient = useCallback(() => {
    try {
      setConnectionStatus("connecting");
      const client = getRealtimeClient();
      clientRef.current = client;
      
      // Set up connection state listener
      const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          setIsConnected(true);
          setConnectionStatus("connected");
          reconnectAttemptsRef.current = 0;
          onConnect?.();
        } else if (event === "SIGNED_OUT") {
          setIsConnected(false);
          setConnectionStatus("disconnected");
          onDisconnect?.();
        }
      });

      // Check initial connection
      client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsConnected(true);
          setConnectionStatus("connected");
          onConnect?.();
        } else {
          setConnectionStatus("disconnected");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      setConnectionStatus("error");
      onError?.(error as Error);
      return undefined;
    }
  }, [onConnect, onDisconnect, onError]);

  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      onError?.(new Error("Max reconnection attempts reached"));
      return;
    }

    reconnectAttemptsRef.current++;
    
    // Remove all existing channels
    removeAllChannels().then(() => {
      // Reinitialize
      initializeClient();
    });
  }, [initializeClient, onError]);

  const disconnect = useCallback(() => {
    removeAllChannels().then(() => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      onDisconnect?.();
    });
  }, [onDisconnect]);

  useEffect(() => {
    if (!enabled) return;

    const cleanup = initializeClient();

    // Handle online/offline events
    const handleOnline = () => {
      reconnect();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      onDisconnect?.();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      cleanup?.();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      disconnect();
    };
  }, [enabled, initializeClient, reconnect, disconnect, onDisconnect]);

  const value: RealtimeContextValue = {
    client: clientRef.current,
    isConnected,
    connectionStatus,
    reconnect,
    disconnect,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

/**
 * Hook to access the realtime context
 */
export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  
  return context;
}

/**
 * Hook to check if realtime is connected
 */
export function useRealtimeStatus(): {
  isConnected: boolean;
  connectionStatus: RealtimeContextValue["connectionStatus"];
} {
  const { isConnected, connectionStatus } = useRealtime();
  return { isConnected, connectionStatus };
}

export default RealtimeProvider;
