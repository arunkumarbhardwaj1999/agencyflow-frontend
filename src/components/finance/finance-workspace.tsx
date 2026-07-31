"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  IndianRupee,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OwnerExecutive, OwnerExpense } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { FinancePanel } from "@/components/finance/finance-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const TABS = [
  { id: "invoices", label: "Invoices & payments" },
  { id: "overview", label: "Profitability" },
  { id: "expenses", label: "Expenses" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#f43f5e", "#8b5cf6"];

export function FinanceWorkspace() {
  const role = useAuthStore((s) => s.user?.role);
  const [tab, setTab] = useState<TabId>("invoices");
  const isOwner = role === "owner";

  if (!isOwner) {
    return <FinancePanel />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "invoices" && <FinancePanel />}
      {tab === "overview" && <FinanceProfitability />}
      {tab === "expenses" && <FinanceExpenses />}
    </div>
  );
}

function FinanceProfitability() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-executive"],
    queryFn: () => apiFetch<OwnerExecutive>("/reports/owner"),
  });

  if (isLoading || !data) return <p className="text-sm text-slate-500">Loading…</p>;

  const pie = data.expenses_by_category.map((e) => ({
    name: e.label,
    value: Number(e.amount) || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paid revenue" value={Number(data.revenue_paid) || 0} icon={IndianRupee} accent="violet" currency />
        <StatCard label="Expenses" value={Number(data.expenses_total) || 0} icon={Wallet} accent="amber" currency />
        <StatCard label="Profit" value={Number(data.profit) || 0} icon={TrendingUp} accent="emerald" currency />
        <StatCard label="Outstanding" value={Number(data.revenue_outstanding) || 0} icon={Receipt} accent="sky" currency />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense mix</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            {pie.length === 0 ? (
              <p className="text-sm text-slate-500">No expenses yet. Add them on project pages.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" outerRadius={80}>
                    {pie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cash flow (6 mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data.cash_flow.map((m) => (
                <li key={m.month} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">{m.label}</span>
                  <span className={Number(m.net) >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-600"}>
                    {formatCurrency(Number(m.net) || 0)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinanceExpenses() {
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["owner-expenses"],
    queryFn: () => apiFetch<OwnerExpense[]>("/reports/owner/expenses"),
  });
  const pagination = useClientPagination(expenses);

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-slate-500">
            No expenses yet. Log them under each{" "}
            <Link href="/projects" className="text-indigo-600 hover:underline">
              project
            </Link>
            .
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {pagination.pageItems.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{e.title}</p>
                    <p className="text-xs text-slate-500">
                      {e.category_label}
                      {e.project_title ? (
                        <>
                          {" · "}
                          <Link href={`/projects/${e.project_id}`} className="hover:text-indigo-600 hover:underline">
                            {e.project_title}
                          </Link>
                        </>
                      ) : null}
                      {" · "}
                      {format(new Date(e.expense_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{e.category_label}</Badge>
                    <span className="font-semibold">{formatCurrency(Number(e.amount) || 0)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.pageSize}
              from={pagination.from}
              to={pagination.to}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              className="mt-3 rounded-xl border border-slate-100"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
