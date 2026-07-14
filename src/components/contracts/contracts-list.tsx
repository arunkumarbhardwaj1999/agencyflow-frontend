"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, FileSignature, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Contract, ContractExpiryReminder } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  signed: "bg-violet-100 text-violet-700",
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700",
};

export function ContractsList() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", clientId],
    queryFn: () => {
      const qs = clientId ? `?client_id=${clientId}` : "";
      return apiFetch<Contract[]>(`/contracts${qs}`);
    },
  });

  const { data: expiring = [] } = useQuery({
    queryKey: ["contracts-expiring"],
    queryFn: () => apiFetch<ContractExpiryReminder[]>("/contracts/expiring?days=30"),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="text-sm text-slate-500">
            Agreements, e-signatures, expiry tracking, and renewals.
          </p>
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">Renewal reminders</p>
              <ul className="mt-1 space-y-1 text-xs text-amber-800">
                {expiring.slice(0, 5).map((r) => (
                  <li key={r.contract_id}>
                    <Link href={`/contracts/${r.contract_id}`} className="underline hover:no-underline">
                      {r.client_name} — {r.title}
                    </Link>
                    {" "}
                    expires in {r.days_remaining} day{r.days_remaining === 1 ? "" : "s"} (
                    {format(new Date(r.expires_at), "dd MMM yyyy")})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading contracts…</p>
      ) : contracts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileSignature className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-600">No contracts yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Approve a proposal, then generate an agreement from the proposal page.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/proposals">
              <Plus className="mr-1 h-4 w-4" />
              Go to proposals
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {contracts.map((c) => (
            <Link
              key={c.id}
              href={`/contracts/${c.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
                <FileSignature className="h-5 w-5 text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{c.title}</p>
                <p className="text-xs text-slate-500">
                  {c.client_name} · {c.contract_number} · {formatCurrency(c.project_value)}
                  {c.expires_at && ` · expires ${format(new Date(c.expires_at), "dd MMM yyyy")}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {c.renewal_due_soon && (
                  <Badge className="bg-amber-100 text-amber-800">Renew soon</Badge>
                )}
                <Badge className={STATUS_COLORS[c.status] ?? STATUS_COLORS.draft}>{c.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
