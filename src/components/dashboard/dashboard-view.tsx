"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { DashboardData, Lead } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

function KpiCard({
  label,
  value,
  trend,
  trendType = "neutral",
}: {
  label: string;
  value: string | number;
  trend: string;
  trendType?: "up" | "warn" | "neutral";
}) {
  const trendColor =
    trendType === "up" ? "text-emerald-600" : trendType === "warn" ? "text-amber-600" : "text-slate-500";

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        <p className={`mt-2 text-xs font-medium ${trendColor}`}>{trend}</p>
      </CardContent>
    </Card>
  );
}

function deadlineDot(type: string, dueAt: string) {
  const due = new Date(dueAt);
  const today = new Date();
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "bg-red-500";
  if (diffDays <= 1) return "bg-amber-500";
  return "bg-blue-500";
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardData>("/dashboard"),
    enabled: isOwner,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => apiFetch<Lead[]>("/leads"),
    enabled: !isOwner,
  });

  if (!isOwner) {
    const pipeline = leads.filter((l) => !["won", "lost"].includes(l.status));
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Open leads" value={pipeline.length} trend="Your pipeline snapshot" />
        <Card className="border-slate-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Welcome back</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{user?.first_name}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">Unable to load executive dashboard.</p>;
  }

  const chartData = [
    { name: "Open Leads", value: data.kpis.open_leads },
    { name: "Active Projects", value: data.kpis.active_projects },
    { name: "Paid Invoices", value: data.kpis.paid_invoices },
  ];

  const followUpCount = Math.min(data.kpis.open_leads, 12);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue (MTD)"
          value={formatCurrency(data.kpis.pipeline_value)}
          trend="↑ Pipeline value this month"
          trendType="up"
        />
        <KpiCard
          label="Active projects"
          value={data.kpis.active_projects}
          trend={`${Math.min(data.kpis.active_projects, 4)} in progress`}
          trendType="up"
        />
        <KpiCard
          label="Open leads"
          value={data.kpis.open_leads}
          trend={`${followUpCount} need follow-up`}
          trendType="warn"
        />
        <KpiCard
          label="Pending invoices"
          value={formatCurrency(data.kpis.unpaid_invoice_total)}
          trend={`${data.kpis.paid_invoices} paid total`}
          trendType="warn"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Operations overview</CardTitle>
            <Link href="/finance" className="text-sm font-medium text-blue-600 hover:underline">
              View report
            </Link>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Upcoming deadlines</CardTitle>
            <Link href="/projects" className="text-sm font-medium text-blue-600 hover:underline">
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
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${deadlineDot(d.type, d.due_at)}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{d.title}</p>
                    <p className="text-xs capitalize text-slate-400">{d.type}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {formatDueLabel(d.due_at)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="divide-y divide-slate-100">
            {data.recent_activity.map((a) => (
              <li key={a.id} className="flex items-center gap-4 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  {a.type === "lead" ? <UserPlus className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{a.message}</p>
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
            {data.recent_activity.length === 0 && (
              <li className="py-4 text-sm text-slate-500">No recent activity</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
