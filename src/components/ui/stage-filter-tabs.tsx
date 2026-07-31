"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type StageFilterOption = {
  id: string;
  title: string;
  count: number;
  accent?: string;
};

const DEFAULT_ACCENT: Record<string, string> = {
  new: "bg-indigo-500",
  contacted: "bg-sky-500",
  proposal: "bg-amber-500",
  proposal_sent: "bg-amber-500",
  qualification: "bg-indigo-500",
  negotiation: "bg-violet-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
};

export function StageFilterTabs({
  stages,
  activeIds,
  onToggle,
  onReset,
  showReset = false,
  className,
}: {
  stages: StageFilterOption[];
  activeIds: string[];
  onToggle: (id: string) => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3", className)}>
      <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto rounded-xl bg-slate-100/90 p-1">
        {stages.map((stage) => {
          const active = activeIds.includes(stage.id);
          const dot = stage.accent ?? DEFAULT_ACCENT[stage.id] ?? "bg-slate-400";
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onToggle(stage.id)}
              aria-pressed={active}
              className={cn(
                "flex min-w-[4.75rem] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                active
                  ? "bg-white font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                  : "font-medium text-slate-500 hover:bg-white/60 hover:text-slate-700",
              )}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-full", active ? dot : "bg-slate-300")} />
              <span className="truncate">{stage.title}</span>
              <span
                className={cn(
                  "tabular-nums text-xs",
                  active ? "font-semibold text-slate-700" : "text-slate-400",
                )}
              >
                {stage.count}
              </span>
            </button>
          );
        })}
      </div>
      {showReset && onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 self-end rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      ) : null}
    </div>
  );
}
