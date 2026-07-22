"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Plus, Settings, Volume2, VolumeX, Monitor } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRealtime } from "@/providers/realtime-provider";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import { requestDesktopPermission, getDesktopPermission } from "@/lib/notifications";
import { ProfileMenu } from "./profile-menu";

export function DashboardHeader({
  title,
  showNewLead = false,
  onMenuClick,
}: {
  title: string;
  showNewLead?: boolean;
  onMenuClick?: () => void;
}) {
  const { events, status, unread, markRead } = useRealtime();
  const user = useAuthStore((s) => s.user);
  const sound = useNotificationStore((s) => s.sound);
  const desktop = useNotificationStore((s) => s.desktop);
  const setSound = useNotificationStore((s) => s.setSound);
  const setDesktop = useNotificationStore((s) => s.setDesktop);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function toggleDesktop() {
    if (desktop) {
      setDesktop(false);
      return;
    }
    const perm = getDesktopPermission();
    if (perm === "granted") {
      setDesktop(true);
    } else if (perm === "denied" || perm === "unsupported") {
      setDesktop(false);
    } else {
      const result = await requestDesktopPermission();
      setDesktop(result === "granted");
    }
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const statusColor =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-slate-300";

  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-4 sm:mb-6 sm:gap-4 sm:pb-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm transition-colors hover:bg-white hover:text-indigo-600 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="app-page-title truncate text-[1.35rem] sm:text-[1.625rem]">{title}</h1>
        <span
          className={`h-2 w-2 shrink-0 rounded-full ring-2 ring-white ${statusColor}`}
          title={`Live updates: ${status}`}
        />
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              if (!open) markRead();
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-indigo-600"
            aria-label="Live activity"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Live activity</p>
                  <p className="text-xs capitalize text-slate-500">{status}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSound(!sound)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                      sound
                        ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                        : "border-slate-200 bg-white text-slate-400 hover:text-slate-600"
                    }`}
                    title={sound ? "Sound on" : "Sound off"}
                    aria-label="Toggle notification sound"
                  >
                    {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleDesktop}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                      desktop
                        ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                        : "border-slate-200 bg-white text-slate-400 hover:text-slate-600"
                    }`}
                    title={desktop ? "Desktop notifications on" : "Desktop notifications off"}
                    aria-label="Toggle desktop notifications"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <ul className="max-h-72 overflow-y-auto py-1">
                {events.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-slate-400">
                    No live events yet. Create a lead or invoice to see updates.
                  </li>
                )}
                {events.map((ev) => (
                  <li key={ev.id} className="border-b border-slate-50 px-4 py-3 last:border-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                      {ev.type}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-800">{ev.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {user?.role === "owner" && (
          <Link
            href="/settings/integrations"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm transition-colors hover:bg-white hover:text-indigo-600 sm:flex"
            aria-label="Integrations"
            title="Integrations (Email & WhatsApp)"
          >
            <Settings className="h-4 w-4" />
          </Link>
        )}
        {showNewLead && (
          <Link href="/leads">
            <Button className="h-10 gap-2 px-3 sm:px-4">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New lead</span>
            </Button>
          </Link>
        )}
        <ProfileMenu />
      </div>
    </header>
  );
}
