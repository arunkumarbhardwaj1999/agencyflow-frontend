"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isBefore, isPast, isToday } from "date-fns";
import {
  Briefcase,
  CalendarClock,
  ClipboardCheck,
  Handshake,
  ListTodo,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  ManagerDashboard,
  ManagerReports,
  PortalApproval,
  Project,
  Task,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

export function ManagerDashboardView() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["manager-dashboard"],
    queryFn: () => apiFetch<ManagerDashboard>("/reports/manager/dashboard"),
  });

  const { data: reports } = useQuery({
    queryKey: ["manager-reports"],
    queryFn: () => apiFetch<ManagerReports>("/reports/manager"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<Task[]>("/tasks"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["client-portal-approvals-pending"],
    queryFn: () => apiFetch<PortalApproval[]>("/client-portal/approvals?status=pending"),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.title])),
    [projects],
  );

  const openTeamTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "done")
        .sort((a, b) => {
          const ad = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          const bd = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          return ad - bd;
        })
        .slice(0, 8),
    [tasks],
  );

  const deadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = addDays(today, 14);
    const taskDeadlines = tasks
      .filter((t) => t.status !== "done" && t.due_date)
      .filter((t) => {
        const due = new Date(t.due_date!);
        return isToday(due) || isPast(due) || isBefore(due, horizon);
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        due: t.due_date!,
        href: `/tasks/${t.id}`,
        kind: "task" as const,
        overdue: isPast(new Date(t.due_date!)) && !isToday(new Date(t.due_date!)),
      }));
    const projectDeadlines = projects
      .filter((p) => p.end_date && !["completed", "cancelled"].includes(p.status))
      .filter((p) => {
        const due = new Date(p.end_date!);
        return isToday(due) || isPast(due) || isBefore(due, horizon);
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        due: p.end_date!,
        href: `/projects/${p.id}`,
        kind: "project" as const,
        overdue: isPast(new Date(p.end_date!)) && !isToday(new Date(p.end_date!)),
      }));
    const all = [...taskDeadlines, ...projectDeadlines].sort(
      (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
    );
    return { total: all.length, items: all.slice(0, 8) };
  }, [tasks, projects]);

  const status = reports?.project_status;
  const pendingApprovals = approvals.slice(0, 6);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white">
        <p className="text-xs uppercase tracking-wide text-indigo-200">Manager workspace</p>
        <h1 className="mt-1 text-2xl font-bold">Hi {user?.first_name}, team &amp; delivery pulse</h1>
        <p className="mt-1 text-sm text-indigo-100">
          Open deals, team tasks, project status, deadlines, and approvals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Open deals" value={data.open_deals} icon={Handshake} accent="indigo" />
        <StatCard label="Team tasks" value={data.tasks_open} icon={ListTodo} accent="sky" />
        <StatCard
          label="Active projects"
          value={data.active_projects}
          icon={Briefcase}
          accent="violet"
        />
        <StatCard
          label="Deadlines (14d)"
          value={deadlines.total}
          icon={CalendarClock}
          accent="amber"
        />
        <StatCard
          label="Approvals"
          value={data.pending_approvals}
          icon={ClipboardCheck}
          accent="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Open deals</CardTitle>
            <Link href="/deals" className="text-sm font-medium text-indigo-600 hover:underline">
              Pipeline · {formatCurrency(Number(data.deal_pipeline_value) || 0)}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Open deals</p>
                <p className="text-xl font-bold text-slate-900">{data.open_deals}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Open leads</p>
                <p className="text-xl font-bold text-slate-900">{data.open_leads}</p>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Deal value</span>
              <span className="font-semibold">{formatCurrency(Number(data.deal_pipeline_value) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lead pipeline</span>
              <span className="font-semibold">{formatCurrency(Number(data.pipeline_value) || 0)}</span>
            </div>
            <Link href="/leads" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
              Manage leads →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Project status</CardTitle>
            <Link href="/projects" className="text-sm font-medium text-indigo-600 hover:underline">
              All projects
            </Link>
          </CardHeader>
          <CardContent>
            {!status ? (
              <p className="text-sm text-slate-500">Loading status…</p>
            ) : (
              <div className="space-y-3">
                {[
                  ["Planning", status.planning, "bg-slate-400"],
                  ["Active", status.active, "bg-indigo-500"],
                  ["Review", status.review, "bg-amber-500"],
                  ["Completed", status.completed, "bg-emerald-500"],
                ].map(([label, count, bar]) => {
                  const pct = status.total ? Math.round((Number(count) / status.total) * 100) : 0;
                  return (
                    <div key={String(label)}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-600">{label}</span>
                        <span className="font-medium text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-500">
                  Avg progress {data.avg_project_progress}% · {status.total} total
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="h-4 w-4 text-indigo-500" />
              Team tasks
            </CardTitle>
            <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:underline">
              Board
            </Link>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-slate-500">
              {data.tasks_done_this_week} done this week · {data.tasks_open} open
            </p>
            {openTeamTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No open tasks.</p>
            ) : (
              <ul className="space-y-2">
                {openTeamTasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{t.title}</p>
                        <p className="truncate text-xs text-slate-500">
                          {projectMap.get(t.project_id) ?? "Project"}
                        </p>
                      </div>
                      <Badge variant="secondary">{t.status.replace("_", " ")}</Badge>
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
              <CalendarClock className="h-4 w-4 text-amber-500" />
              Deadlines
            </CardTitle>
            <Link href="/calendar" className="text-sm font-medium text-indigo-600 hover:underline">
              Calendar
            </Link>
          </CardHeader>
          <CardContent>
            {deadlines.items.length === 0 ? (
              <p className="text-sm text-slate-500">No deadlines in the next 14 days.</p>
            ) : (
              <ul className="space-y-2">
                {deadlines.items.map((d) => (
                  <li key={`${d.kind}-${d.id}`}>
                    <Link
                      href={d.href}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition hover:bg-slate-50 ${
                        d.overdue ? "border-rose-100 bg-rose-50/40" : "border-slate-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{d.title}</p>
                        <p className="text-xs capitalize text-slate-500">{d.kind}</p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          d.overdue ? "text-rose-600" : "text-slate-600"
                        }`}
                      >
                        {format(new Date(d.due), "dd MMM")}
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
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              Approvals
            </CardTitle>
            <Badge variant="secondary">{data.pending_approvals} pending</Badge>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-slate-500">No pending client approvals.</p>
            ) : (
              <ul className="space-y-2">
                {pendingApprovals.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {a.project_title ?? "Client"} · {a.kind_label}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Open a client record to review &amp; request approvals
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
