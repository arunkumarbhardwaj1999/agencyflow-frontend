"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { UserTimeSummary } from "@/lib/types";

export function EmployeeTimeSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["time-summary"],
    queryFn: () => apiFetch<UserTimeSummary>("/time/summary/me"),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading time…</p>;
  if (!data) return null;

  const periods = [data.today, data.yesterday, data.this_week];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <Clock className="h-4 w-4 text-indigo-500" />
        My time
      </h2>
      <dl className="space-y-3">
        {periods.map((p) => (
          <div key={p.label} className="flex items-center justify-between text-sm">
            <dt className="text-slate-600">{p.label}</dt>
            <dd className="font-semibold text-slate-900">{p.total_label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
