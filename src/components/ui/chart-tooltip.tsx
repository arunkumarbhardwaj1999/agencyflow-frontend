"use client";

import { formatCurrency, cn } from "@/lib/utils";

type TooltipItem = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  currency?: boolean;
};

export function ChartTooltip({
  active,
  payload,
  label,
  currency = true,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/95 px-3.5 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-md">
      {label != null && label !== "" ? (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {String(label)}
        </p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry, i) => {
          const raw = Number(entry.value) || 0;
          const display = currency ? formatCurrency(raw) : String(entry.value ?? "");
          return (
            <li key={`${entry.dataKey ?? entry.name}-${i}`} className="flex items-center gap-2 text-sm">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: entry.color ?? "#64748b" }}
              />
              <span className="text-slate-500">{entry.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-slate-900">{display}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string }[];
  className?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <span
          key={item.label}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium text-slate-500",
            className,
          )}
        >
          <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
