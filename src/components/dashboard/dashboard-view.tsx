"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  CalendarClock,
  Clock,
  FileText,
  IndianRupee,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { LEAD_COLUMNS, type DashboardData, type Lead } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/ui/reveal";
import { useAuthStore } from "@/stores/auth-store";
import { useRealtimeOptional } from "@/providers/realtime-provider";

const STAGE_COLORS: Record<string, string> = {
  new: "#6366f1",
  contacted: "#0ea5e9",
  proposal: "#f59e0b",
  won: "#10b981",
  lost: "#f43f5e",
};

function deadlineDot(dueAt: string) {
  const due = new Date(dueAt);
  const today = new Date();
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "bg-rose-500";
  if (diffDays <= 1) return "bg-amber-500";
  return "bg-indigo-500";
}

function formatDueLabel(dueAt: string) {
  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diff = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return format(due, "dd MMM");
}

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.role === "owner";
  const realtime = useRealtimeOptional();
  const liveEvents = realtime?.events ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardData>("/dashboard"),
    enabled: isOwner,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => apiFetch<Lead[]>("/leads"),
  });

  if (!isOwner) {
    const pipeline = leads.filter((l) => !["won", "lost"].includes(l.status));
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Open leads" value={pipeline.length} icon={Users} accent="indigo" />
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <CardContent className="p-6">
            <p className="text-sm text-indigo-100">Welcome back</p>
            <p className="mt-1 text-2xl font-bold">{user?.first_name}</p>
            <p className="mt-2 text-sm text-indigo-100">Here&apos;s your pipeline at a glance.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-rose-600">Unable to load executive dashboard.</p>;
  }

  const areaData = LEAD_COLUMNS.map((col) => ({
    name: col.title,
    value: leads.filter((l) => l.status === col.id).length,
  }));

  const stageData = LEAD_COLUMNS.filter((c) => c.id !== "lost").map((col) => ({
    name: col.title,
    key: col.id,
    value: leads.filter((l) => l.status === col.id).length,
  }));
  const totalPipeline = stageData.reduce((sum, s) => sum + s.value, 0);

  const allActivity = [...liveEvents, ...data.recent_activity];
  const dedupActivity = new Map<string, { id: string; type: string; message: string; created_at: string }>();
  for (const item of allActivity) dedupActivity.set(item.id, item);
  const mergedActivity = Array.from(dedupActivity.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (MTD)"
          value={Number(data.kpis.pipeline_value) || 0}
          icon={IndianRupee}
          accent="violet"
          currency
          trend="Pipeline"
          trendUp
        />
        <StatCard
          label="Active projects"
          value={data.kpis.active_projects}
          icon={Briefcase}
          accent="sky"
          trend="In progress"
          trendUp
        />
        <StatCard
          label="Open leads"
          value={data.kpis.open_leads}
          icon={Users}
          accent="indigo"
          trend="Follow-up"
          trendUp
        />
        <StatCard
          label="Pending invoices"
          value={Number(data.kpis.unpaid_invoice_total) || 0}
          icon={FileText}
          accent="amber"
          currency
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Operations overview</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">Leads across pipeline stages</p>
              </div>
              <Link href="/finance" className="text-sm font-medium text-indigo-600 hover:underline">
                View report
              </Link>
            </CardHeader>
            <CardContent className="h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="opsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#opsFill)"
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Pipeline split</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Active leads by stage</p>
            </CardHeader>
            <CardContent>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData.length ? stageData : [{ name: "None", key: "none", value: 1 }]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={3}
                      stroke="none"
                      animationDuration={1200}
                    >
                      {(stageData.length ? stageData : [{ key: "none" }]).map((s) => (
                        <Cell key={s.key} fill={STAGE_COLORS[s.key] ?? "#e2e8f0"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    <AnimatedCounter value={totalPipeline} />
                  </span>
                  <span className="text-xs text-slate-500">Active</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {stageData.map((s) => (
                  <li key={s.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: STAGE_COLORS[s.key] }}
                      />
                      {s.name}
                    </span>
                    <span className="font-semibold text-slate-900">{s.value}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CalendarClock className="h-4 w-4 text-indigo-500" />
                Upcoming deadlines
              </CardTitle>
              <Link href="/projects" className="text-sm font-medium text-indigo-600 hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="divide-y divide-slate-100">
                {data.upcoming_deadlines.length === 0 && (
                  <li className="py-4 text-sm text-slate-500">No upcoming deadlines</li>
                )}
                {data.upcoming_deadlines.map((d) => (
                  <li key={`${d.type}-${d.id}`} className="flex items-center gap-3 py-3.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${deadlineDot(d.due_at)}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{d.title}</p>
                      <p className="text-xs capitalize text-slate-400">{d.type}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                      {formatDueLabel(d.due_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="divide-y divide-slate-100">
                {mergedActivity.map((a) => (
                  <li key={a.id} className="flex items-center gap-3.5 py-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      {a.type === "lead" ? <UserPlus className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-800">{a.message}</p>
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.message.includes("won")
                          ? "success"
                          : a.message.includes("lost")
                            ? "danger"
                            : "default"
                      }
                    >
                      {a.message.includes("won") ? "Won" : a.message.includes("lost") ? "Lost" : "New"}
                    </Badge>
                  </li>
                ))}
                {mergedActivity.length === 0 && (
                  <li className="py-4 text-sm text-slate-500">No recent activity</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
