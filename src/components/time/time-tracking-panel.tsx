"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Play, Square } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ActiveTimer, Task, TimeEntry, UserTimeSummary } from "@/lib/types";
import { formatDurationClock } from "@/lib/time-utils";
import { EmployeeTimeSummary } from "@/components/time/employee-time-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

export function TimeTrackingPanel() {
  const queryClient = useQueryClient();
  const [taskId, setTaskId] = useState("");
  const [tick, setTick] = useState(0);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<Task[]>("/tasks"),
  });
  const { data: active } = useQuery({
    queryKey: ["active-timer"],
    queryFn: () => apiFetch<ActiveTimer>("/time/timer/active"),
    refetchInterval: 5000,
  });
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["time-entries"],
    queryFn: () => apiFetch<TimeEntry[]>("/time/entries?limit=40"),
  });
  const { data: summary } = useQuery({
    queryKey: ["time-summary"],
    queryFn: () => apiFetch<UserTimeSummary>("/time/summary/me"),
  });
  const pagination = useClientPagination(entries);

  const openTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done"),
    [tasks],
  );

  const elapsed = active?.running ? (active.elapsed_seconds ?? 0) + tick : 0;

  useEffect(() => {
    if (!active?.running) {
      setTick(0);
      return;
    }
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active?.running]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["active-timer"] });
    queryClient.invalidateQueries({ queryKey: ["time-entries"] });
    queryClient.invalidateQueries({ queryKey: ["time-summary"] });
  };

  const startMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<ActiveTimer>("/time/timer/start", {
        method: "POST",
        body: JSON.stringify({ task_id: id }),
      }),
    onSuccess: invalidate,
  });

  const stopMutation = useMutation({
    mutationFn: () => apiFetch("/time/timer/stop", { method: "POST" }),
    onSuccess: invalidate,
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Timer</h2>
          {active?.running && active.entry ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Tracking <span className="font-medium text-slate-900">{active.entry.task_title}</span>
                {active.entry.project_title ? (
                  <span className="text-slate-500"> · {active.entry.project_title}</span>
                ) : null}
              </p>
              <p className="font-mono text-4xl font-bold tracking-wider text-indigo-600">
                {formatDurationClock(elapsed)}
              </p>
              <Badge className="bg-emerald-100 text-emerald-800">Running</Badge>
              <Button
                className="w-full gap-2 sm:w-auto"
                variant="outline"
                disabled={stopMutation.isPending}
                onClick={() => stopMutation.mutate()}
              >
                <Square className="h-4 w-4" />
                Stop timer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-mono text-4xl font-bold tracking-wider text-slate-300">00:00:00</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Task</label>
                  <Select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
                    <option value="">Select a task…</option>
                    {openTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button
                  className="gap-2"
                  disabled={!taskId || startMutation.isPending}
                  onClick={() => startMutation.mutate(taskId)}
                >
                  <Play className="h-4 w-4" />
                  Start timer
                </Button>
              </div>
              {openTasks.length === 0 && (
                <p className="text-sm text-slate-500">
                  No open tasks.{" "}
                  <Link href="/tasks" className="text-indigo-600 hover:underline">
                    Check My Tasks
                  </Link>
                </p>
              )}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <EmployeeTimeSummary />
          {summary && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-900">
              This week: <span className="font-semibold">{summary.this_week.total_label}</span>
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent entries</h2>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-500">No time logged yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pagination.pageItems.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{e.task_title ?? "Task"}</p>
                  <p className="text-xs text-slate-500">
                    {e.project_title}
                    {" · "}
                    {format(new Date(e.started_at), "dd MMM · hh:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {e.is_running && <Badge className="bg-emerald-100 text-emerald-800">Running</Badge>}
                  <span className="font-semibold text-slate-800">{e.duration_label}</span>
                  <Link href={`/tasks/${e.task_id}`} className="text-xs text-indigo-600 hover:underline">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
          from={pagination.from}
          to={pagination.to}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          className="mt-3 rounded-xl border border-slate-100"
        />
      </section>
    </div>
  );
}
