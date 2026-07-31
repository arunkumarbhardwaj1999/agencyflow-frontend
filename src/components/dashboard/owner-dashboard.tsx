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
import { StatCard } from "@/components/ui/stat-card";

const EXPENSE_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6", "#94a3b8"];

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
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-800 p-6 text-white">
        <p className="text-xs uppercase tracking-wide text-indigo-200">Owner workspace</p>
        <h1 className="mt-1 text-2xl font-bold">Business overview, {user?.first_name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-indigo-100">
          Revenue, profit, pipeline, expenses, team performance, and growth — full control of the agency.
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
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Cash flow</CardTitle>
              <p className="text-xs text-slate-500">Inflow (paid invoices) vs outflow (expenses) — 6 months</p>
            </div>
            <Link href="/finance" className="text-sm font-medium text-indigo-600 hover:underline">
              Finance
            </Link>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashChart} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="url(#inflowFill)" name="Inflow" />
                <Area type="monotone" dataKey="outflow" stroke="#f59e0b" fill="url(#outflowFill)" name="Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Invoiced" value={formatCurrency(Number(data.revenue_invoiced) || 0)} />
            <Row label="Outstanding" value={formatCurrency(Number(data.revenue_outstanding) || 0)} />
            <Row label="Deal pipeline" value={formatCurrency(Number(data.deal_pipeline_value) || 0)} />
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Team performance</CardTitle>
            <Link href="/team" className="text-sm font-medium text-indigo-600 hover:underline">
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
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expenses by category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensePie.length === 0 ? (
              <p className="text-sm text-slate-500">No project expenses logged yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expensePie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                        {expensePie.map((_, i) => (
                          <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {expensePie.slice(0, 6).map((e, i) => (
                    <li key={e.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                        />
                        {e.name}
                      </span>
                      <span className="font-medium text-slate-900">{formatCurrency(e.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Growth</CardTitle>
            <p className="text-xs text-slate-500">Month-over-month revenue and net cash</p>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashChart}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                <Bar dataKey="inflow" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Growth signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          emphasize === "good"
            ? "font-semibold text-emerald-700"
            : emphasize === "bad"
              ? "font-semibold text-rose-600"
              : "font-semibold text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
