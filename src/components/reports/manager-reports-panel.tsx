"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ManagerReports } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

const PROJECT_COLORS = ["#94a3b8", "#0ea5e9", "#f59e0b", "#10b981"];

export function ManagerReportsPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["manager-reports"],
    queryFn: () => apiFetch<ManagerReports>("/reports/manager"),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading reports…</p>;
  }
  if (isError || !data) {
    return <p className="text-sm text-rose-600">Unable to load reports.</p>;
  }

  const projectChart = [
    { name: "Planning", value: data.project_status.planning },
    { name: "Active", value: data.project_status.active },
    { name: "Review", value: data.project_status.review },
    { name: "Done", value: data.project_status.completed },
  ];

  const leadChart = Object.entries(data.lead_conversion.by_status).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          Reports
        </h1>
        <p className="text-sm text-slate-500">
          Team productivity, lead conversion, and project health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Conversion rate"
          value={data.lead_conversion.conversion_rate}
          icon={BarChart3}
          accent="indigo"
          suffix="%"
        />
        <StatCard label="Open deals" value={data.open_deals} icon={BarChart3} accent="sky" />
        <StatCard
          label="Paid revenue"
          value={Number(data.revenue_paid) || 0}
          icon={BarChart3}
          accent="violet"
          currency
        />
        <StatCard
          label="Pending approvals"
          value={data.pending_approvals}
          icon={BarChart3}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Total</dt>
                <dd className="font-semibold">{data.lead_conversion.total_leads}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Open</dt>
                <dd className="font-semibold">{data.lead_conversion.open_leads}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Won</dt>
                <dd className="font-semibold text-emerald-700">{data.lead_conversion.won}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Lost</dt>
                <dd className="font-semibold text-rose-600">{data.lead_conversion.lost}</dd>
              </div>
            </dl>
            <div className="h-56">
              {leadChart.length === 0 ? (
                <p className="text-sm text-slate-500">No lead data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadChart}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-slate-500">{data.project_status.total} projects total</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {projectChart.map((_, i) => (
                      <Cell key={i} fill={PROJECT_COLORS[i % PROJECT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2 text-xs">
              {projectChart.map((p, i) => (
                <li key={p.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PROJECT_COLORS[i] }}
                  />
                  {p.name}: {p.value}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team productivity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.team_productivity.length === 0 ? (
            <p className="text-sm text-slate-500">No team members to report.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-2 font-semibold">Member</th>
                    <th className="px-2 py-2 font-semibold">Role</th>
                    <th className="px-2 py-2 font-semibold">Done</th>
                    <th className="px-2 py-2 font-semibold">Open</th>
                    <th className="px-2 py-2 font-semibold">Hours (week)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.team_productivity.map((m) => (
                    <tr key={m.user_id} className="border-b border-slate-100">
                      <td className="px-2 py-2.5 font-medium text-slate-900">{m.name}</td>
                      <td className="px-2 py-2.5 capitalize text-slate-600">{m.role}</td>
                      <td className="px-2 py-2.5">{m.tasks_done}</td>
                      <td className="px-2 py-2.5">{m.tasks_open}</td>
                      <td className="px-2 py-2.5">
                        <Badge variant="secondary">{m.hours_logged_label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Deal pipeline {formatCurrency(Number(data.deal_pipeline_value) || 0)} · Outstanding{" "}
            {formatCurrency(Number(data.revenue_outstanding) || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
