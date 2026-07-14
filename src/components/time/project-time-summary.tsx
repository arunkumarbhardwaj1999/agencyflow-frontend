"use client";

import { useQuery } from "@tanstack/react-query";
import { Timer } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ProjectTimeSummary } from "@/lib/types";

export function ProjectTimeSummaryCard({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["project-time", projectId],
    queryFn: () => apiFetch<ProjectTimeSummary>(`/time/summary/project/${projectId}`),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading time…</p>;
  if (!data) return null;

  const over = data.over_hours > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <Timer className="h-4 w-4 text-indigo-500" />
        Project time
      </h2>
      <dl className="grid gap-3 sm:grid-cols-3 text-sm">
        <div>
          <dt className="text-slate-500">Total hours</dt>
          <dd className="text-xl font-bold text-slate-900">{data.total_hours}h</dd>
          <dd className="text-xs text-slate-400">{data.total_label}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Estimated</dt>
          <dd className="text-xl font-bold text-slate-900">{data.estimated_hours}h</dd>
        </div>
        <div>
          <dt className="text-slate-500">{over ? "Over" : "Remaining"}</dt>
          <dd className={`text-xl font-bold ${over ? "text-rose-600" : "text-emerald-600"}`}>
            {over ? `${data.over_hours}h` : `${Math.max(0, data.estimated_hours - data.total_hours).toFixed(1)}h`}
          </dd>
        </div>
      </dl>
    </div>
  );
}
