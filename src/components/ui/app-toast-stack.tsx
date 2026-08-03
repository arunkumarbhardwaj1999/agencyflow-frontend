"use client";

import { X } from "lucide-react";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  default: "border-l-indigo-500",
  success: "border-l-emerald-500",
  error: "border-l-rose-500",
  info: "border-l-sky-500",
} as const;

export function AppToastStack() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 sm:right-6 sm:top-6"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto animate-fade-in rounded-xl border border-slate-200 border-l-4 bg-white px-4 py-3 text-sm shadow-[0_12px_32px_rgba(15,23,42,0.12)]",
            VARIANT_STYLES[t.variant],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="leading-snug text-slate-800">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
