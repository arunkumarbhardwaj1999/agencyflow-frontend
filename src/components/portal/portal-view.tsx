"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  CheckCircle2,
  Download,
  ExternalLink,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type { Invoice, PortalMe, PortalSummary, Project } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Reveal } from "@/components/ui/reveal";

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
};

export function PortalView() {
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
  const { data: invoices = [] } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: () => apiFetch<Invoice[]>("/portal/invoices"),
  });

  async function downloadPdf(inv: Invoice) {
    const blob = await apiBlob(`/portal/invoices/${inv.id}/pdf`);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white">
        <p className="text-xs uppercase tracking-wide text-indigo-200">Client portal</p>
        <h1 className="mt-1 text-2xl font-bold">{me?.company_name ?? "Your agency"}</h1>
        <p className="mt-1 text-sm text-indigo-100">
          {me ? `${me.business_name} · ${me.email}` : "Your projects & invoices"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active projects" value={summary?.active_projects ?? 0} icon={Briefcase} accent="indigo" />
        <StatCard label="Completed" value={summary?.completed_projects ?? 0} icon={CheckCircle2} accent="emerald" />
        <StatCard
          label="Total paid"
          value={summary ? Number(summary.total_paid) : 0}
          icon={Wallet}
          accent="violet"
          currency
        />
        <StatCard
          label="Outstanding"
          value={summary ? Number(summary.outstanding) : 0}
          icon={ReceiptText}
          accent="amber"
          currency
        />
      </div>

      <Reveal delay={60}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 && <p className="text-sm text-slate-500">No projects yet.</p>}
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{p.title}</p>
                  <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${p.progress_percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{p.progress_percent}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {p.task_done}/{p.task_total} tasks done
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={120}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.length === 0 && <p className="text-sm text-slate-500">No invoices yet.</p>}
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{inv.invoice_number}</p>
                  <p className="text-xs text-slate-500">
                    Due {inv.due_date} · {inv.tax_type === "cgst_sgst" ? "CGST + SGST" : "IGST"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                    <Badge variant={statusVariant[inv.status] ?? "secondary"} className="capitalize">
                      {inv.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadPdf(inv)} className="gap-1">
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </Button>
                  {inv.status !== "paid" && inv.payment_link && (
                    <Button
                      size="sm"
                      onClick={() => window.open(inv.payment_link!, "_blank", "noopener")}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Pay now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
