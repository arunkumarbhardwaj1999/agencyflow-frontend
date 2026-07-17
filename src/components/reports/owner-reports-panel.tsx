"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  IndianRupee,
  Percent,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OwnerExecutive } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ManagerReportsPanel } from "@/components/reports/manager-reports-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export function OwnerReportsPanel() {
  const { data } = useQuery({
    queryKey: ["owner-executive"],
    queryFn: () => apiFetch<OwnerExecutive>("/reports/owner"),
  });

  const cashChart =
    data?.cash_flow.map((m) => ({
      name: m.label.replace(/ \d{4}$/, ""),
      inflow: Number(m.inflow) || 0,
      outflow: Number(m.outflow) || 0,
      net: Number(m.net) || 0,
    })) ?? [];

  const profit = Number(data?.profit) || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive reports"
        description="Revenue, profit, cash flow, conversion, and team productivity."
        icon={BarChart3}
      />

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              label="Expenses"
              value={Number(data.expenses_total) || 0}
              icon={Wallet}
              accent="amber"
              currency
            />
            <StatCard
              label="Conversion"
              value={data.conversion_rate}
              icon={Percent}
              accent="indigo"
              suffix="%"
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Cash flow</CardTitle>
                <CardDescription>Last 6 months — inflow, outflow, and net</CardDescription>
              </div>
              <Link href="/finance" className="text-sm font-semibold text-indigo-600 hover:underline">
                Open finance
              </Link>
            </CardHeader>
            <CardContent className="h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashChart} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v) || 0)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="#10b98133" name="Inflow" />
                  <Area type="monotone" dataKey="outflow" stroke="#f59e0b" fill="#f59e0b33" name="Outflow" />
                  <Area type="monotone" dataKey="net" stroke="#6366f1" fill="#6366f122" name="Net" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="app-section-title text-base">Operations reports</h2>
          <p className="app-page-subtitle mt-1">Team, deals, and project health for delivery leads.</p>
        </div>
        <ManagerReportsPanel hideHeader />
      </div>
    </div>
  );
}
