"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

type Accent = "indigo" | "violet" | "sky" | "emerald" | "amber" | "rose";

const accentMap: Record<Accent, { icon: string; ring: string; bar: string }> = {
  indigo: { icon: "from-indigo-500 to-indigo-600", ring: "ring-indigo-100", bar: "bg-indigo-500" },
  violet: { icon: "from-violet-500 to-purple-600", ring: "ring-violet-100", bar: "bg-violet-500" },
  sky: { icon: "from-sky-500 to-cyan-500", ring: "ring-sky-100", bar: "bg-sky-500" },
  emerald: { icon: "from-emerald-500 to-teal-600", ring: "ring-emerald-100", bar: "bg-emerald-500" },
  amber: { icon: "from-amber-500 to-orange-500", ring: "ring-amber-100", bar: "bg-amber-500" },
  rose: { icon: "from-rose-500 to-pink-600", ring: "ring-rose-100", bar: "bg-rose-500" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "indigo",
  trend,
  trendUp,
  currency = false,
  suffix = "",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: Accent;
  trend?: string;
  trendUp?: boolean;
  currency?: boolean;
  suffix?: string;
}) {
  const a = accentMap[accent];
  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  return (
    <div className="card-hover group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_rgba(15,23,42,0.05)] backdrop-blur-sm">
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20",
          a.bar,
        )}
      />
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-4",
            a.icon,
            a.ring,
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
            )}
          >
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 text-[1.7rem] font-bold tracking-tight text-slate-900 tabular-nums">
        {currency ? (
          <AnimatedCounter value={value} format={formatINR} />
        ) : (
          <AnimatedCounter value={value} suffix={suffix} />
        )}
      </p>
    </div>
  );
}
