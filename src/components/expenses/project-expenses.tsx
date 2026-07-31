"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EXPENSE_CATEGORIES, type ProjectExpense, type ProjectProfitability } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const CHART_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#f43f5e", "#a855f7", "#64748b"];

export function ProjectExpenses({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("hosting");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["project-expenses", projectId],
    queryFn: () => apiFetch<ProjectExpense[]>(`/projects/${projectId}/expenses`),
  });
  const pagination = useClientPagination(expenses);

  const { data: profit } = useQuery({
    queryKey: ["project-profit", projectId],
    queryFn: () => apiFetch<ProjectProfitability>(`/projects/${projectId}/profitability`),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      apiFetch<ProjectExpense>(`/projects/${projectId}/expenses`, {
        method: "POST",
        body: JSON.stringify({
          category,
          title: title.trim(),
          amount: parseFloat(amount) || 0,
          expense_date: expenseDate,
        }),
      }),
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["project-expenses", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-profit", projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (expenseId: string) =>
      apiFetch(`/projects/${projectId}/expenses/${expenseId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-expenses", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-profit", projectId] });
    },
  });

  const chartData = (profit?.breakdown ?? []).map((b) => ({
    name: b.label,
    value: b.amount,
  }));

  return (
    <div>
      {profit && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Revenue</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(profit.revenue)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Expenses</p>
            <p className="text-lg font-bold text-rose-600">{formatCurrency(profit.expenses_total)}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700">Profit</p>
            <p className="text-lg font-bold text-emerald-800">{formatCurrency(profit.profit)}</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Expenses</h3>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />Add expense
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading expenses…</p>
      ) : expenses.length === 0 ? (
        <p className="text-sm text-slate-500">No expenses recorded yet.</p>
      ) : (
        <ul className="mb-6 space-y-2">
          {pagination.pageItems.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{e.title}</p>
                <p className="text-xs text-slate-500">{e.category_label}</p>
              </div>
              <span className="font-semibold text-slate-900">{formatCurrency(e.amount)}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600"
                onClick={() => {
                  if (confirm(`Delete ${e.title}?`)) deleteMutation.mutate(e.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.pageSize}
        from={pagination.from}
        to={pagination.to}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        className="mb-6 rounded-xl border border-slate-100"
      />

      {chartData.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Expense breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
            {chartData.map((d, i) => (
              <li key={d.name} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                {d.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add expense"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={!title.trim() || !amount || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {addMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Category</Label>
            <Select className="mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AWS hosting" />
          </div>
          <div>
            <Label>Amount (₹)</Label>
            <Input className="mt-1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
