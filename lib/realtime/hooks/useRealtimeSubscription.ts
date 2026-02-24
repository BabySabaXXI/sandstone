/**
 * useRealtimeSubscription Hook
 * ============================
 * Generic hook for subscribing to Supabase realtime database changes.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getRealtimeClient } from "@/lib/supabase/realtime-client";
import type { Database } from "@/lib/supabase/database.types";

type TableName = keyof Database["public"]["Tables"];
type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];

interface UseRealtimeSubscriptionOptions<T extends TableName> {
  table: T;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: {
    column: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "is" | "in" | "cs" | "cd" | "sl" | "sr" | "nxl" | "nxr" | "adj" | "ov" | "fts" | "plfts" | "phfts" | "wfts";
    value: string | number | boolean | null;
  };
  enabled?: boolean;
  onInsert?: (payload: RealtimePostgresChangesPayload<Row<T>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Row<T>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Row<T>>) => void;
  onError?: (error: Error) => void;
}

interface UseRealtimeSubscriptionReturn<T extends TableName> {
  data: Row<T>[];
  isSubscribed: boolean;
  error: Error | null;
  unsubscribe: () => void;
}

/**
 * Hook for subscribing to database changes
 */
export function useRealtimeSubscription<T extends TableName>(
  options: UseRealtimeSubscriptionOptions<T>
): UseRealtimeSubscriptionReturn<T> {
  const {
    table,
    event = "*",
    filter,
    enabled = true,
    onInsert,
    onUpdate,
    onDelete,
    onError,
  } = options;

  const [data, setData] = useState<Row<T>[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof getRealtimeClient>["channel"]>> | null>(null);

  const handlePayload = useCallback((payload: RealtimePostgresChangesPayload<Row<T>>) => {
    switch (payload.eventType) {
      case "INSERT":
        setData(prev => [...prev, payload.new as Row<T>]);
        onInsert?.(payload);
        break;
      case "UPDATE":
        setData(prev => 
          prev.map(item => 
            (item as any).id === (payload.new as any).id ? payload.new as Row<T> : item
          )
        );
        onUpdate?.(payload);
        break;
      case "DELETE":
        setData(prev => 
          prev.filter(item => (item as any).id !== (payload.old as any).id)
        );
        onDelete?.(payload);
        break;
    }
  }, [onInsert, onUpdate, onDelete]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const client = getRealtimeClient();
    const channelName = `db-changes:${table}:${event}:${filter?.column || "all"}`;
    
    let channel = client.channel(channelName);

    // Build the filter configuration
    const filterConfig: Record<string, string> = {
      event: event === "*" ? "*" : event,
      schema: "public",
      table: table as string,
    };

    if (filter) {
      filterConfig.filter = `${filter.column}=${filter.operator}.${filter.value}`;
    }

    channel = channel.on(
      "postgres_changes" as any,
      filterConfig,
      handlePayload as any
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsSubscribed(true);
        setError(null);
      } else if (status === "CHANNEL_ERROR") {
        const err = new Error(`Failed to subscribe to channel: ${channelName}`);
        setError(err);
        onError?.(err);
      }
    });

    channelRef.current = channel;

    return () => {
      unsubscribe();
    };
  }, [table, event, filter?.column, filter?.operator, filter?.value, enabled, handlePayload, unsubscribe, onError]);

  return {
    data,
    isSubscribed,
    error,
    unsubscribe,
  };
}

export default useRealtimeSubscription;
