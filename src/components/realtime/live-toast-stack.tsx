"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { DashboardLiveEvent } from "@/lib/types";

const TYPE_STYLES: Record<string, string> = {
  lead: "border-l-indigo-500",
  invoice: "border-l-emerald-500",
  project: "border-l-sky-500",
  task: "border-l-amber-500",
  client: "border-l-violet-500",
  deal: "border-l-teal-500",
};

const TOAST_MS = 5000;

export function LiveToastStack({ events }: { events: DashboardLiveEvent[] }) {
  const [visible, setVisible] = useState<DashboardLiveEvent[]>([]);

  useEffect(() => {
    if (events.length === 0) return;
    const latest = events[0];
    setVisible((prev) => {
      if (prev.some((e) => e.id === latest.id)) return prev;
      return [latest, ...prev].slice(0, 4);
    });
    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((e) => e.id !== latest.id));
    }, TOAST_MS);
    return () => clearTimeout(timer);
  }, [events]);

  if (visible.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 sm:right-6 sm:top-6">
      {visible.map((ev) => (
        <div
          key={ev.id}
          className={`pointer-events-auto animate-fade-in rounded-xl border border-slate-200 border-l-4 bg-white px-4 py-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.12)] ${TYPE_STYLES[ev.type] ?? "border-l-slate-400"}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {ev.type}
              </p>
              <p className="mt-0.5 text-slate-800">{ev.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setVisible((prev) => prev.filter((e) => e.id !== ev.id))}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
