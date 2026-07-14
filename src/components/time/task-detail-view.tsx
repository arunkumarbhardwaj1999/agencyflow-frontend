"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Task, TimeEntry } from "@/lib/types";
import { TaskTimer } from "@/components/time/task-timer";
import { EmployeeTimeSummary } from "@/components/time/employee-time-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TaskDetailView({ taskId }: { taskId: string }) {
  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => apiFetch<Task>(`/tasks/${taskId}`),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["time-entries", taskId],
    queryFn: () => apiFetch<TimeEntry[]>(`/time/entries?task_id=${taskId}&limit=10`),
    enabled: Boolean(taskId),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading task…</p>;

  if (isError || !task) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Task not found.</p>
        <Button asChild className="mt-4"><Link href="/projects">Back to projects</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${task.project_id}`}><ArrowLeft className="mr-1 h-4 w-4" />Back to project</Link>
        </Button>
        <Badge>{task.status.replace("_", " ")}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <TaskTimer taskId={taskId} taskTitle={task.title} />
          {task.description && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-slate-500">Description</h3>
              <p className="text-sm text-slate-700">{task.description}</p>
            </section>
          )}
          {entries.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-500">Recent time logs</h3>
              <ul className="space-y-2 text-sm">
                {entries.map((e) => (
                  <li key={e.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">{e.duration_label}</span>
                    <span className="text-slate-400">{new Date(e.started_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <EmployeeTimeSummary />
      </div>
    </div>
  );
}
