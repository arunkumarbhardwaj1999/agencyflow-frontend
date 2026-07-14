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
import { BarChart3 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OwnerExecutive } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ManagerReportsPanel } from "@/components/reports/manager-reports-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          Executive reports
        </h1>
        <p className="text-sm text-slate-500">
          Everything — revenue, profit, cash flow, conversion, and team productivity.
        </p>
      </div>

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={Number(data.revenue_paid) || 0}
              icon={BarChart3}
              accent="violet"
              currency
            />
            <StatCard
              label="Profit"
              value={Number(data.profit) || 0}
              icon={BarChart3}
              accent="emerald"
              currency
            />
            <StatCard
              label="Expenses"
              value={Number(data.expenses_total) || 0}
              icon={BarChart3}
              accent="amber"
              currency
            />
            <StatCard
              label="Conversion"
              value={data.conversion_rate}
              icon={BarChart3}
              accent="indigo"
              suffix="%"
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Cash flow</CardTitle>
              <Link href="/finance" className="text-sm font-medium text-indigo-600 hover:underline">
                Open finance
              </Link>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                  <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="#10b98133" name="Inflow" />
                  <Area type="monotone" dataKey="outflow" stroke="#f59e0b" fill="#f59e0b33" name="Outflow" />
                  <Area type="monotone" dataKey="net" stroke="#6366f1" fill="#6366f122" name="Net" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Operations reports</h2>
        <ManagerReportsPanel />
      </div>
    </div>
  );
}
