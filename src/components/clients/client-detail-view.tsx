"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Client, Member, Record360View } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Record360Panel } from "@/components/record-360/record-360-panel";
import { ClientDocuments } from "@/components/clients/client-documents";
import { ClientPortalStaffPanel } from "@/components/clients/client-portal-staff-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ClientDetailView({ clientId }: { clientId: string }) {
  const { data: client, isLoading, isError } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => apiFetch<Client>(`/clients/${clientId}`),
  });

  const { data: view } = useQuery({
    queryKey: ["record-360", "client", clientId],
    queryFn: () => apiFetch<Record360View>(`/records/client/${clientId}`),
    enabled: Boolean(clientId),
  });

  const { data: members = [] } = useMembers();
  const owner = client?.assigned_user_id
    ? (members as Member[]).find((m) => m.id === client.assigned_user_id)?.name
    : null;

  if (isLoading) return <p className="text-sm text-slate-500">Loading client…</p>;

  if (isError || !client) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Client not found.</p>
        <Button asChild className="mt-4"><Link href="/clients">Back to clients</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/clients"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{client.business_name}</h1>
          <p className="text-sm text-slate-500">{client.name}</p>
        </div>
        <Badge className="ml-auto">360° Client View</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Basic information</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd>{client.email}</dd>
              </div>
              {client.phone && (
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd>{client.phone}</dd>
                </div>
              )}
              {client.gst_number && (
                <div>
                  <dt className="text-slate-500">GSTIN</dt>
                  <dd>{client.gst_number}</dd>
                </div>
              )}
              {owner && (
                <div>
                  <dt className="text-slate-500">Account manager</dt>
                  <dd>{owner}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Active projects</dt>
                <dd>{client.active_projects}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Invoices</dt>
                <dd>{client.invoice_count}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Client since</dt>
                <dd>{format(new Date(client.created_at), "dd MMM yyyy")}</dd>
              </div>
            </dl>
            {client.notes && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{client.notes}</p>
            )}
            <Button asChild className="mt-4 w-full" variant="outline" size="sm">
              <Link href={`/proposals/new?client_id=${clientId}`}>Create proposal</Link>
            </Button>
            <Button asChild className="mt-2 w-full" variant="outline" size="sm">
              <Link href={`/contracts?client_id=${clientId}`}>View contracts</Link>
            </Button>
          </section>

          <Record360Panel
            entityType="client"
            entityId={clientId}
            sections={["insights", "related", "messaging", "internal_comments"]}
          />
        </div>

        <div className="space-y-6">
          <ClientPortalStaffPanel clientId={clientId} />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Documents</h2>
            <ClientDocuments clientId={clientId} />
          </section>

          {view && view.related.projects.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Projects</h2>
              <div className="space-y-2">
                {view.related.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.status} · {p.progress_percent}% done</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {view && view.related.invoices.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Invoices</h2>
              <div className="space-y-2">
                {view.related.invoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href="/finance"
                    className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">{inv.invoice_number}</p>
                    <p className="text-xs text-slate-500">{inv.status} · due {inv.due_date}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {view && view.related.deals.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Related deals</h2>
              <div className="space-y-2">
                {view.related.deals.map((d) => (
                  <Link
                    key={d.id}
                    href={`/deals/${d.id}`}
                    className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                  >
                    <p className="font-medium text-slate-900">{d.title}</p>
                    <p className="text-xs text-slate-500">{d.status}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
