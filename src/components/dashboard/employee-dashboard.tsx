"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isPast, isToday } from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  Clock,
  Video,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatEventTime } from "@/lib/calendar-utils";
import type {
  CalendarTodayAgenda,
  Project,
  Task,
  UserTimeSummary,
} from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { EmployeeTimeSummary } from "@/components/time/employee-time-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

const MEETING_TYPES = new Set(["meeting", "call"]);

export function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<Task[]>("/tasks"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });
  const { data: timeSummary } = useQuery({
    queryKey: ["time-summary"],
    queryFn: () => apiFetch<UserTimeSummary>("/time/summary/me"),
  });
  const { data: agenda } = useQuery({
    queryKey: ["calendar-today"],
    queryFn: () => apiFetch<CalendarTodayAgenda>("/calendar/today"),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.title])),
    [projects],
  );

  const { myTasks, todayWork, overdueTasks, openCount } = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done");
    const todayWork = open.filter((t) => t.due_date && isToday(new Date(t.due_date)));
    const overdueTasks = open.filter(
      (t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)),
    );
    const myTasks = [...open]
      .sort((a, b) => {
        const ad = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        return ad - bd;
      })
      .slice(0, 8);
    return { myTasks, todayWork, overdueTasks, openCount: open.length };
  }, [tasks]);

  const meetings = useMemo(() => {
    const fromToday = (agenda?.events_today ?? []).filter((e) =>
      MEETING_TYPES.has(e.event_type),
    );
    if (fromToday.length > 0) return fromToday.slice(0, 6);
    return (agenda?.priorities ?? [])
      .map((p) => p.event)
      .filter((e) => MEETING_TYPES.has(e.event_type))
      .slice(0, 6);
  }, [agenda]);

  const hoursToday = Math.round((timeSummary?.today.total_seconds ?? 0) / 3600);
  const hoursLabel = timeSummary?.today.total_label ?? "0h";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
        <p className="text-sm text-indigo-100">Employee workspace</p>
        <h1 className="mt-1 text-2xl font-bold">Hi {user?.first_name}, here&apos;s your day</h1>
        <p className="mt-2 max-w-xl text-sm text-indigo-100">
          My tasks, today&apos;s work, meetings, and hours logged — no CRM clutter.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My tasks" value={openCount} icon={CheckSquare} accent="indigo" />
        <StatCard label="Today's work" value={todayWork.length} icon={CalendarDays} accent="sky" />
        <StatCard label="Meetings" value={meetings.length} icon={Video} accent="violet" />
        <StatCard
          label="Hours logged"
          value={hoursToday}
          icon={Clock}
          accent="amber"
          suffix="h"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Today&apos;s work</CardTitle>
            <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:underline">
              Open board
            </Link>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : todayWork.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing due today. Check My tasks below.</p>
            ) : (
              <ul className="space-y-2">
                {todayWork.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 transition hover:bg-white hover:shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{t.title}</p>
                        <p className="text-xs text-slate-500">
                          {projectMap.get(t.project_id) ?? "Project"}
                        </p>
                      </div>
                      <Badge variant="secondary">{t.status.replace("_", " ")}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {overdueTasks.length > 0 && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Overdue ({overdueTasks.length})
                </p>
                <ul className="space-y-1.5">
                  {overdueTasks.slice(0, 4).map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/tasks/${t.id}`}
                        className="flex justify-between text-sm text-slate-800 hover:underline"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="shrink-0 text-xs text-rose-600">
                          {t.due_date ? format(new Date(t.due_date), "dd MMM") : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <EmployeeTimeSummary />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hours logged</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Today</span>
                <span className="font-semibold text-slate-900">{hoursLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">This week</span>
                <span className="font-semibold text-slate-900">
                  {timeSummary?.this_week.total_label ?? "0h"}
                </span>
              </div>
              <Link
                href="/time"
                className="inline-block text-sm font-medium text-indigo-600 hover:underline"
              >
                Time tracking →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">My tasks</CardTitle>
            <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No open tasks assigned to you.</p>
            ) : (
              <ul className="space-y-2">
                {myTasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{t.title}</p>
                        <p className="text-xs text-slate-500">
                          {projectMap.get(t.project_id)} · {t.priority}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {t.due_date ? format(new Date(t.due_date), "dd MMM") : "No due"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="h-4 w-4 text-violet-500" />
              Meetings
            </CardTitle>
            <Link href="/calendar" className="text-sm font-medium text-indigo-600 hover:underline">
              Calendar
            </Link>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <p className="text-sm text-slate-500">No meetings on your calendar today.</p>
            ) : (
              <ul className="space-y-2">
                {meetings.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={e.link_path || "/calendar"}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{e.title}</p>
                        <p className="text-xs capitalize text-slate-500">{e.event_type}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {formatEventTime(e)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
