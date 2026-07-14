"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Square } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ActiveTimer, Task } from "@/lib/types";
import { formatDurationClock } from "@/lib/time-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TaskTimer({ taskId, taskTitle }: { taskId: string; taskTitle?: string }) {
  const queryClient = useQueryClient();
  const [tick, setTick] = useState(0);

  const { data: task } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => apiFetch<Task>(`/tasks/${taskId}`),
  });

  const { data: active } = useQuery({
    queryKey: ["active-timer"],
    queryFn: () => apiFetch<ActiveTimer>("/time/timer/active"),
    refetchInterval: 5000,
  });

  const isThisTaskRunning = active?.running && active.entry?.task_id === taskId;
  const elapsed = isThisTaskRunning
    ? (active?.elapsed_seconds ?? 0) + tick
    : 0;

  useEffect(() => {
    if (!isThisTaskRunning) {
      setTick(0);
      return;
    }
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isThisTaskRunning]);

  const startMutation = useMutation({
    mutationFn: () =>
      apiFetch<ActiveTimer>("/time/timer/start", {
        method: "POST",
        body: JSON.stringify({ task_id: taskId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["time-summary"] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiFetch("/time/timer/stop", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-timer"] });
      queryClient.invalidateQueries({ queryKey: ["time-summary"] });
      queryClient.invalidateQueries({ queryKey: ["time-entries", taskId] });
      queryClient.invalidateQueries({ queryKey: ["project-time"] });
    },
  });

  const title = taskTitle ?? task?.title ?? "Task";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {isThisTaskRunning && <Badge className="bg-emerald-100 text-emerald-800">Running</Badge>}
      </div>

      {isThisTaskRunning ? (
        <div className="space-y-4">
          <p className="font-mono text-4xl font-bold tracking-wider text-indigo-600">
            {formatDurationClock(elapsed)}
          </p>
          <Button
            className="w-full"
            variant="outline"
            disabled={stopMutation.isPending}
            onClick={() => stopMutation.mutate()}
          >
            <Square className="mr-2 h-4 w-4" />
            {stopMutation.isPending ? "Stopping…" : "Stop timer"}
          </Button>
          <p className="text-xs text-slate-500">Time is saved automatically when you stop.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Track time on this task with one click.</p>
          <Button
            className="w-full"
            disabled={startMutation.isPending || (active?.running && !isThisTaskRunning)}
            onClick={() => startMutation.mutate()}
          >
            <Play className="mr-2 h-4 w-4" />
            {startMutation.isPending ? "Starting…" : "Start timer"}
          </Button>
          {active?.running && active.entry && !isThisTaskRunning && (
            <p className="text-xs text-amber-700">
              Timer running on: {active.entry.task_title}. Stop it before starting here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
