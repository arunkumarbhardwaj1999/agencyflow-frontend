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
import {
  BarChart3,
  Handshake,
  IndianRupee,
  ClipboardCheck,
  Percent,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ManagerReports } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

const PROJECT_COLORS = ["#94a3b8", "#0ea5e9", "#f59e0b", "#10b981"];

export function ManagerReportsPanel({ hideHeader = false }: { hideHeader?: boolean }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["manager-reports"],
    queryFn: () => apiFetch<ManagerReports>("/reports/manager"),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100/80" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return <div className="app-empty text-rose-600">Unable to load reports.</div>;
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
      {!hideHeader && (
        <PageHeader
          title="Reports"
          description="Team productivity, lead conversion, and project health."
          icon={BarChart3}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Conversion rate"
          value={data.lead_conversion.conversion_rate}
          icon={Percent}
          accent="indigo"
          suffix="%"
        />
        <StatCard label="Open deals" value={data.open_deals} icon={Handshake} accent="sky" />
        <StatCard
          label="Paid revenue"
          value={Number(data.revenue_paid) || 0}
          icon={IndianRupee}
          accent="violet"
          currency
        />
        <StatCard
          label="Pending approvals"
          value={data.pending_approvals}
          icon={ClipboardCheck}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead conversion</CardTitle>
            <CardDescription>Pipeline outcomes across stages</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Total", data.lead_conversion.total_leads],
                ["Open", data.lead_conversion.open_leads],
                ["Won", data.lead_conversion.won, "text-emerald-700"],
                ["Lost", data.lead_conversion.lost, "text-rose-600"],
              ].map(([label, value, tone]) => (
                <div key={String(label)} className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <dt className="app-label">{label}</dt>
                  <dd className={`mt-1 text-lg font-semibold tabular-nums text-slate-900 ${tone ?? ""}`}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="h-56">
              {leadChart.length === 0 ? (
                <div className="app-empty">No lead data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadChart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project status</CardTitle>
            <CardDescription>{data.project_status.total} projects total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectChart} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
                    {projectChart.map((_, i) => (
                      <Cell key={i} fill={PROJECT_COLORS[i % PROJECT_COLORS.length]} />
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
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {projectChart.map((p, i) => (
                <li key={p.name}>
                  <Badge variant="secondary" className="gap-1.5 font-medium normal-case tracking-normal">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PROJECT_COLORS[i] }}
                    />
                    {p.name}: {p.value}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team productivity</CardTitle>
          <CardDescription>
            Deal pipeline {formatCurrency(Number(data.deal_pipeline_value) || 0)} · Outstanding{" "}
            {formatCurrency(Number(data.revenue_outstanding) || 0)}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0">
          {data.team_productivity.length === 0 ? (
            <div className="app-empty mx-5 mb-5">No team members to report.</div>
          ) : (
            <Table wrapClassName="rounded-none border-0 shadow-none">
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Member</TH>
                  <TH>Role</TH>
                  <TH>Done</TH>
                  <TH>Open</TH>
                  <TH>Hours (week)</TH>
                </TR>
              </THead>
              <TBody>
                {data.team_productivity.map((m) => (
                  <TR key={m.user_id}>
                    <TD className="font-semibold text-slate-900">{m.name}</TD>
                    <TD className="capitalize text-slate-500">{m.role}</TD>
                    <TD className="tabular-nums font-medium">{m.tasks_done}</TD>
                    <TD className="tabular-nums font-medium">{m.tasks_open}</TD>
                    <TD>
                      <Badge variant="secondary">{m.hours_logged_label}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
