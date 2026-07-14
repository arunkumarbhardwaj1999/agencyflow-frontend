"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { PortalTask } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "secondary" | "default" | "warning" | "success"> = {
  todo: "secondary",
  in_progress: "default",
  review: "warning",
  done: "success",
};

export function PortalTasks() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["portal-tasks"],
    queryFn: () => apiFetch<PortalTask[]>("/portal/tasks"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <CheckSquare className="h-6 w-6 text-indigo-600" />
          Tasks
        </h1>
        <p className="text-sm text-slate-500">Read-only view of work on your projects.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No tasks yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{t.title}</p>
                <p className="text-xs text-slate-500">
                  {t.project_title}
                  {t.due_date ? ` · Due ${format(new Date(t.due_date), "dd MMM yyyy")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{t.priority}</Badge>
                <Badge variant={statusVariant[t.status] ?? "secondary"} className="capitalize">
                  {t.status.replace("_", " ")}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
