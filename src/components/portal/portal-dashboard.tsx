"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  ClipboardCheck,
  Folders,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  Invoice,
  PortalActivityItem,
  PortalApproval,
  PortalFile,
  PortalMe,
  PortalSummary,
  Project,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

const invoiceStatusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
};

export function PortalDashboard() {
  const { data: me } = useQuery({
    queryKey: ["portal-me"],
    queryFn: () => apiFetch<PortalMe>("/portal/me"),
  });
  const { data: summary } = useQuery({
    queryKey: ["portal-summary"],
    queryFn: () => apiFetch<PortalSummary>("/portal/summary"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["portal-projects"],
    queryFn: () => apiFetch<Project[]>("/portal/projects"),
  });
  const { data: approvals = [] } = useQuery({
    queryKey: ["portal-approvals"],
    queryFn: () => apiFetch<PortalApproval[]>("/portal/approvals"),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: () => apiFetch<Invoice[]>("/portal/invoices"),
  });
  const { data: files = [] } = useQuery({
    queryKey: ["portal-files", ""],
    queryFn: () => apiFetch<PortalFile[]>("/portal/files"),
  });
  const { data: activity = [] } = useQuery({
    queryKey: ["portal-activity"],
    queryFn: () => apiFetch<PortalActivityItem[]>("/portal/activity"),
  });

  const activeProjects = projects.filter((p) =>
    ["planning", "active", "review"].includes(p.status),
  );
  const pendingApprovals = approvals.filter((a) => a.status === "pending").slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);
  const recentFiles = files.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white">
        <p className="text-xs uppercase tracking-wide text-indigo-200">Client portal</p>
        <h1 className="mt-1 text-2xl font-bold">{me?.company_name ?? "Your agency"}</h1>
        <p className="mt-1 text-sm text-indigo-100">
          {me
            ? `${me.business_name} · Project progress, approvals, invoices & files`
            : "Your projects, approvals, invoices & files"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Project progress"
          value={summary?.avg_progress_percent ?? 0}
          icon={TrendingUp}
          accent="indigo"
          suffix="%"
        />
        <StatCard
          label="Approvals"
          value={summary?.pending_approvals ?? 0}
          icon={ClipboardCheck}
          accent="amber"
        />
        <StatCard
          label="Invoices due"
          value={summary?.unpaid_invoice_count ?? 0}
          icon={ReceiptText}
          accent="violet"
        />
        <StatCard label="Files" value={files.length} icon={Folders} accent="sky" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              Project progress
            </CardTitle>
            <Link
              href="/portal/projects"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeProjects.length === 0 ? (
              <p className="text-sm text-slate-500">No active projects right now.</p>
            ) : (
              activeProjects.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  href={`/portal/projects/${p.id}`}
                  className="block rounded-xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{p.title}</p>
                    <Badge variant="secondary" className="capitalize">
                      {p.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${p.progress_percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{p.progress_percent}%</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-amber-500" />
              Approvals
            </CardTitle>
            <Link
              href="/portal/approvals"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Review
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing waiting for your approval.</p>
            ) : (
              <ul className="space-y-2">
                {pendingApprovals.map((a) => (
                  <li key={a.id}>
                    <Link
                      href="/portal/approvals"
                      className="block rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2.5 transition hover:bg-amber-50"
                    >
                      <p className="font-medium text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.project_title ?? "Project"} · {a.kind_label}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ReceiptText className="h-4 w-4 text-violet-500" />
              Invoices
            </CardTitle>
            <Link
              href="/portal/invoices"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              All invoices
            </Link>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-slate-500">
              Outstanding {formatCurrency(summary ? Number(summary.outstanding) : 0)}
            </p>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-slate-500">No invoices yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentInvoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-500">
                        Due {format(new Date(inv.due_date), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(Number(inv.total))}</p>
                      <Badge
                        variant={invoiceStatusVariant[inv.status] ?? "secondary"}
                        className="capitalize"
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Folders className="h-4 w-4 text-sky-500" />
              Files
            </CardTitle>
            <Link
              href="/portal/files"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              All files
            </Link>
          </CardHeader>
          <CardContent>
            {recentFiles.length === 0 ? (
              <p className="text-sm text-slate-500">No shared files yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{f.filename}</p>
                      <p className="text-xs text-slate-500">
                        {f.folder_label}
                        {f.project_title ? ` · ${f.project_title}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {format(new Date(f.created_at), "dd MMM")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm text-slate-900">{item.message}</p>
                    <p className="text-xs capitalize text-slate-400">{item.type}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
