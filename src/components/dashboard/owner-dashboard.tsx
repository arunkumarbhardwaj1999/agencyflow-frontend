"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Briefcase,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OwnerExecutive } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLegend, ChartTooltip } from "@/components/ui/chart-tooltip";
import { StatCard } from "@/components/ui/stat-card";

const EXPENSE_COLORS = [
  "#0d9488",
  "#0284c7",
  "#d97706",
  "#059669",
  "#e11d48",
  "#4f46e5",
  "#64748b",
];

export function OwnerDashboardView() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["owner-executive"],
    queryFn: () => apiFetch<OwnerExecutive>("/reports/owner"),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-rose-600">Unable to load executive dashboard.</p>;
  }

  const profit = Number(data.profit) || 0;
  const cashChart = data.cash_flow.map((m) => ({
    name: m.label.replace(/ \d{4}$/, ""),
    inflow: Number(m.inflow) || 0,
    outflow: Number(m.outflow) || 0,
    net: Number(m.net) || 0,
  }));
  const expensePie = data.expenses_by_category.map((e) => ({
    name: e.label,
    value: Number(e.amount) || 0,
  }));
  const expenseTotal = expensePie.reduce((sum, e) => sum + e.value, 0);

  const prevInflow = cashChart.length >= 2 ? cashChart[cashChart.length - 2].inflow : 0;
  const currInflow = cashChart.length >= 1 ? cashChart[cashChart.length - 1].inflow : 0;
  const revenueGrowthPct =
    prevInflow > 0
      ? Math.round(((currInflow - prevInflow) / prevInflow) * 1000) / 10
      : currInflow > 0
        ? 100
        : 0;
  const prevNet = cashChart.length >= 2 ? cashChart[cashChart.length - 2].net : 0;
  const currNet = cashChart.length >= 1 ? cashChart[cashChart.length - 1].net : 0;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 p-6 text-white">
        <p className="text-xs uppercase tracking-wide text-teal-200/90">Owner workspace</p>
        <h1 className="mt-1 text-2xl font-bold">Business overview, {user?.first_name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-200">
          Revenue, profit, pipeline, expenses, team performance, and growth — full control of the
          agency.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Revenue"
          value={Number(data.revenue_paid) || 0}
          icon={IndianRupee}
          accent="violet"
          currency
        />
        <StatCard
          label="Profit"
          value={profit}
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          accent={profit >= 0 ? "emerald" : "rose"}
          currency
        />
        <StatCard
          label="Pipeline"
          value={Number(data.pipeline_value) || 0}
          icon={TrendingUp}
          accent="indigo"
          currency
        />
        <StatCard
          label="Expenses"
          value={Number(data.expenses_total) || 0}
          icon={Wallet}
          accent="amber"
          currency
        />
        <StatCard label="Team performance" value={data.team_size} icon={Users} accent="sky" />
        <StatCard
          label="Growth (MoM revenue)"
          value={revenueGrowthPct}
          icon={revenueGrowthPct >= 0 ? TrendingUp : TrendingDown}
          accent={revenueGrowthPct >= 0 ? "emerald" : "rose"}
          suffix="%"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.35)] lg:col-span-2">
          <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-5 sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80">
                Analytics
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">Cash flow</h3>
              <p className="mt-1 text-xs text-slate-400">
                Inflow vs outflow — last 6 months
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                href="/finance"
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/15"
              >
                Open Finance
              </Link>
              <ChartLegend
                className="text-slate-300"
                items={[
                  { label: "Inflow", color: "#34d399" },
                  { label: "Outflow", color: "#fbbf24" },
                ]}
              />
            </div>
          </div>
          <div className="relative h-[22rem] px-2 pb-4 sm:px-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashChart} margin={{ top: 16, right: 16, left: 4, bottom: 8 }}>
                <defs>
                  <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 10" stroke="rgba(148,163,184,0.18)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("en-IN", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v) || 0)
                  }
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="#34d399"
                  strokeWidth={3}
                  fill="url(#inflowFill)"
                  name="Inflow"
                  activeDot={{ r: 6, strokeWidth: 3, stroke: "#0f172a", fill: "#34d399" }}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  fill="url(#outflowFill)"
                  name="Outflow"
                  activeDot={{ r: 6, strokeWidth: 3, stroke: "#0f172a", fill: "#fbbf24" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-50/80 to-transparent" />
          <CardHeader className="relative border-0 pb-0">
            <CardTitle className="text-base">Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3 text-sm">
            <Row label="Invoiced" value={formatCurrency(Number(data.revenue_invoiced) || 0)} />
            <Row
              label="Outstanding"
              value={formatCurrency(Number(data.revenue_outstanding) || 0)}
            />
            <Row
              label="Deal pipeline"
              value={formatCurrency(Number(data.deal_pipeline_value) || 0)}
            />
            <Row label="Open deals" value={String(data.open_deals)} />
            <Row label="Open leads" value={String(data.open_leads)} />
            <Row label="Lead conversion" value={`${data.conversion_rate}%`} />
            <div className="border-t border-slate-100 pt-3">
              <Row
                label="Net profit"
                value={formatCurrency(profit)}
                emphasize={profit >= 0 ? "good" : "bad"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-0 pb-0">
            <CardTitle className="text-base">Team performance</CardTitle>
            <Link href="/team" className="text-sm font-medium text-teal-700 hover:underline">
              Manage team
            </Link>
          </CardHeader>
          <CardContent>
            {data.team_productivity.length === 0 ? (
              <p className="text-sm text-slate-500">Invite your first teammates.</p>
            ) : (
              <ul className="space-y-2">
                {data.team_productivity.slice(0, 6).map((m) => (
                  <li
                    key={m.user_id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-slate-200 hover:bg-white"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs capitalize text-slate-500">{m.role}</p>
                    </div>
                    <div className="flex gap-2 text-xs text-slate-600">
                      <span>{m.tasks_done} done</span>
                      <Badge variant="secondary">{m.hours_logged_label}/wk</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/30">
          <CardHeader className="relative border-0 pb-0">
            <CardTitle className="text-base">Expenses by category</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Where money is going this period</p>
          </CardHeader>
          <CardContent className="relative">
            {expensePie.length === 0 ? (
              <p className="text-sm text-slate-500">No project expenses logged yet.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
                <div className="relative mx-auto h-56 w-full max-w-[240px]">
                  <div className="absolute inset-6 rounded-full bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.7),0_12px_40px_rgba(15,23,42,0.08)]" />
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={4}
                        stroke="#fff"
                        strokeWidth={4}
                      >
                        {expensePie.map((_, i) => (
                          <Cell
                            key={i}
                            fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]}
                            className="outline-none drop-shadow-sm"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="text-base font-bold tabular-nums text-slate-900">
                      {formatCurrency(expenseTotal)}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {expensePie.slice(0, 6).map((e, i) => {
                    const pct =
                      expenseTotal > 0 ? Math.round((e.value / expenseTotal) * 100) : 0;
                    return (
                      <li key={e.name} className="space-y-1.5 rounded-xl bg-white/70 p-2.5 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                background: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
                              }}
                            />
                            <span className="truncate">{e.name}</span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-slate-500">{pct}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-900">
                            {formatCurrency(e.value)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.25)] lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-32 w-32 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-5 sm:px-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-300/80">
                Performance
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">Growth</h3>
              <p className="mt-1 text-xs text-slate-400">Month-over-month revenue and net cash</p>
            </div>
            <ChartLegend
              className="text-slate-300"
              items={[
                { label: "Revenue", color: "#2dd4bf" },
                { label: "Net", color: "#38bdf8" },
              ]}
            />
          </div>
          <div className="relative h-72 px-2 pb-4 sm:px-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashChart} barGap={8} barCategoryGap="24%">
                <defs>
                  <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5eead4" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  <linearGradient id="netBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 10" stroke="rgba(148,163,184,0.16)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("en-IN", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v) || 0)
                  }
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.06)", radius: 10 }}
                />
                <Bar
                  dataKey="inflow"
                  name="Revenue"
                  fill="url(#revenueBar)"
                  radius={[10, 10, 4, 4]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="net"
                  name="Net"
                  fill="url(#netBar)"
                  radius={[10, 10, 4, 4]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-50/80 to-transparent" />
          <CardHeader className="relative border-0 pb-0">
            <CardTitle className="text-base">Growth signals</CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3 text-sm">
            <Row
              label="Revenue MoM"
              value={`${revenueGrowthPct >= 0 ? "+" : ""}${revenueGrowthPct}%`}
              emphasize={revenueGrowthPct >= 0 ? "good" : "bad"}
            />
            <Row label="This month revenue" value={formatCurrency(currInflow)} />
            <Row label="Last month revenue" value={formatCurrency(prevInflow)} />
            <Row
              label="Net cash change"
              value={formatCurrency(currNet - prevNet)}
              emphasize={currNet - prevNet >= 0 ? "good" : "bad"}
            />
            <Row label="Lead conversion" value={`${data.conversion_rate}%`} />
            <Row label="Active projects" value={String(data.active_projects)} />
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <Briefcase className="h-3.5 w-3.5" />
              Pipeline + conversion drive growth health
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: "good" | "bad";
}) {
  return (
    <div className="flex justify-between gap-3 rounded-lg px-1 py-0.5">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          emphasize === "good"
            ? "font-semibold tabular-nums text-emerald-700"
            : emphasize === "bad"
              ? "font-semibold tabular-nums text-rose-600"
              : "font-semibold tabular-nums text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
