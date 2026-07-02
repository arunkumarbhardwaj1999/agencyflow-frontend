"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { playNotificationSound, showDesktopNotification } from "@/lib/notifications";
import type { DashboardLiveEvent } from "@/lib/types";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

type RealtimeContextValue = {
  events: DashboardLiveEvent[];
  status: ConnectionStatus;
  unread: number;
  markRead: () => void;
  clearEvents: () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const QUERY_MAP: Record<string, string[]> = {
  lead: ["leads", "dashboard"],
  client: ["clients", "dashboard"],
  project: ["projects", "dashboard"],
  task: ["tasks", "projects", "dashboard"],
  invoice: ["invoices", "dashboard"],
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<DashboardLiveEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [unread, setUnread] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const soundEnabled = useNotificationStore((s) => s.sound);
  const desktopEnabled = useNotificationStore((s) => s.desktop);
  const prefsRef = useRef({ sound: soundEnabled, desktop: desktopEnabled });
  useEffect(() => {
    prefsRef.current = { sound: soundEnabled, desktop: desktopEnabled };
  }, [soundEnabled, desktopEnabled]);

  const staff = user && user.role !== "client";

  const connect = useCallback(() => {
    if (!staff || !user?.company_id) return;

    const token = getAccessToken();
    if (!token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(
      "/api/v1",
      "",
    );
    const wsBase = apiBase.startsWith("https://")
      ? apiBase.replace("https://", "wss://")
      : apiBase.replace("http://", "ws://");

    const ws = new WebSocket(
      `${wsBase}/ws/dashboard/${user.company_id}?token=${encodeURIComponent(token)}`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      retryRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as DashboardLiveEvent;
        setEvents((prev) => [parsed, ...prev].slice(0, 20));
        setUnread((n) => n + 1);
        if (prefsRef.current.sound) playNotificationSound();
        if (prefsRef.current.desktop) showDesktopNotification(parsed);
        const keys = QUERY_MAP[parsed.type] ?? ["dashboard"];
        keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      } catch {
        // ignore malformed payload
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
      retryRef.current += 1;
      retryTimer.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [staff, user?.company_id, queryClient]);

  useEffect(() => {
    if (!staff) return;
    connect();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, staff]);

  const markRead = useCallback(() => setUnread(0), []);
  const clearEvents = useCallback(() => setEvents([]), []);

  const value = useMemo(
    () => ({ events, status, unread, markRead, clearEvents }),
    [events, status, unread, markRead, clearEvents],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used within RealtimeProvider");
  return ctx;
}

export function useRealtimeOptional() {
  return useContext(RealtimeContext);
}
