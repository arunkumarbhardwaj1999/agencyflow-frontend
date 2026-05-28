"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Invoice, Project } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type PortalMe = {
  client_id: string;
  name: string;
  business_name: string;
  email: string;
};

export function PortalView() {
  const { data: me } = useQuery({
    queryKey: ["portal-me"],
    queryFn: () => apiFetch<PortalMe>("/portal/me"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["portal-projects"],
    queryFn: () => apiFetch<Project[]>("/portal/projects"),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: () => apiFetch<Invoice[]>("/portal/invoices"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Client portal</h1>
        <p className="text-sm text-slate-500">
          {me ? `${me.business_name} · ${me.email}` : "Your projects and invoices"}
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">My projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 && <p className="text-sm text-slate-500">No projects yet.</p>}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">{p.progress_percent}% complete</p>
              </div>
              <Badge variant="secondary">{p.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">My invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length === 0 && <p className="text-sm text-slate-500">No invoices yet.</p>}
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-900">{inv.invoice_number}</p>
                <p className="text-xs text-slate-500">Due {inv.due_date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(inv.total)}</p>
                <Badge variant={inv.status === "paid" ? "default" : "secondary"}>{inv.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
