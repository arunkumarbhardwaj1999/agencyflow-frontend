"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  FileSignature,
  Mail,
  PenLine,
  RefreshCw,
} from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type { Contract } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  signed: "bg-violet-100 text-violet-700",
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-red-100 text-red-700",
};

export function ContractDetailView({ contractId }: { contractId: string }) {
  const queryClient = useQueryClient();
  const [signOpen, setSignOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { data: contract, isLoading, isError } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: () => apiFetch<Contract>(`/contracts/${contractId}`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["contract", contractId] });
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    queryClient.invalidateQueries({ queryKey: ["contracts-expiring"] });
  };

  const sendMutation = useMutation({
    mutationFn: () => apiFetch<{ message: string }>(`/contracts/${contractId}/send`, { method: "POST" }),
    onSuccess: (res) => {
      setMessage(res.message);
      invalidate();
    },
  });

  const signMutation = useMutation({
    mutationFn: () =>
      apiFetch<Contract>(`/contracts/${contractId}/sign`, {
        method: "POST",
        body: JSON.stringify({
          signer_name: signerName.trim(),
          signer_email: signerEmail.trim(),
          accept_terms: true,
        }),
      }),
    onSuccess: () => {
      setSignOpen(false);
      setMessage("Contract signed — now active.");
      invalidate();
    },
  });

  const renewMutation = useMutation({
    mutationFn: () => apiFetch<Contract>(`/contracts/${contractId}/renew`, { method: "POST" }),
    onSuccess: () => {
      setMessage("Contract renewed for another year.");
      invalidate();
    },
  });

  async function downloadPdf() {
    const blob = await apiBlob(`/contracts/${contractId}/pdf`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${contract?.contract_number ?? "agreement"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading agreement…</p>;

  if (isError || !contract) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Contract not found.</p>
        <Button asChild className="mt-4"><Link href="/contracts">Back to contracts</Link></Button>
      </div>
    );
  }

  const canSend = contract.status === "draft";
  const canSign = contract.status === "sent" || contract.status === "draft";
  const canRenew = contract.status === "active" || contract.status === "expired";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/contracts"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{contract.title}</h1>
          <p className="text-sm text-slate-500">{contract.client_name} · {contract.contract_number}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={downloadPdf}>
            <Download className="mr-1 h-4 w-4" />Download PDF
          </Button>
          {canSend && (
            <Button variant="outline" size="sm" disabled={sendMutation.isPending} onClick={() => sendMutation.mutate()}>
              <Mail className="mr-1 h-4 w-4" />
              {sendMutation.isPending ? "Sending…" : "Send to client"}
            </Button>
          )}
          {canSign && contract.status !== "active" && (
            <Button size="sm" onClick={() => setSignOpen(true)}>
              <PenLine className="mr-1 h-4 w-4" />E-sign (mock)
            </Button>
          )}
          {canRenew && (
            <Button variant="outline" size="sm" disabled={renewMutation.isPending} onClick={() => renewMutation.mutate()}>
              <RefreshCw className="mr-1 h-4 w-4" />
              {renewMutation.isPending ? "Renewing…" : "Renew"}
            </Button>
          )}
        </div>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{message}</p>
      )}

      {contract.renewal_due_soon && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Auto renewal reminder: this agreement expires in {contract.days_until_expiry} days.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-violet-600" />
              <h2 className="font-semibold text-slate-900">Agreement</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="mt-1">
                  <Badge className={STATUS_COLORS[contract.status]}>{contract.status}</Badge>
                </dd>
              </div>
              {contract.signed_at && (
                <div>
                  <dt className="text-slate-500">Signed on</dt>
                  <dd>{format(new Date(contract.signed_at), "dd MMM yyyy")}</dd>
                  {contract.signer_name && (
                    <dd className="text-xs text-slate-500">by {contract.signer_name}</dd>
                  )}
                </div>
              )}
              {contract.expires_at && (
                <div>
                  <dt className="text-slate-500">Expires</dt>
                  <dd>{format(new Date(contract.expires_at), "dd MMM yyyy")}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Project value</dt>
                <dd>{formatCurrency(contract.project_value)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Renewal</dt>
                <dd>
                  {contract.auto_renewal_reminder
                    ? `Auto reminder ${contract.renewal_reminder_days} days before expiry`
                    : "No auto reminder"}
                </dd>
              </div>
              {contract.proposal_id && (
                <div>
                  <dt className="text-slate-500">Source proposal</dt>
                  <dd>
                    <Link href={`/proposals/${contract.proposal_id}`} className="text-indigo-600 hover:underline">
                      View proposal
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {contract.services.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Services</h3>
              <div className="flex flex-wrap gap-1.5">
                {contract.services.map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">{s}</span>
                ))}
              </div>
            </section>
          )}
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Agreement text</h2>
          <div className="whitespace-pre-wrap rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {contract.body || "No agreement body."}
          </div>
        </section>
      </div>

      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title="Record client e-signature"
        footer={
          <>
            <Button variant="outline" onClick={() => setSignOpen(false)}>Cancel</Button>
            <Button
              disabled={!signerName.trim() || !signerEmail.trim() || signMutation.isPending}
              onClick={() => signMutation.mutate()}
            >
              {signMutation.isPending ? "Signing…" : "Sign agreement"}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          Mock e-sign flow — record the client&apos;s name and email to activate the contract.
        </p>
        <div className="space-y-3">
          <div>
            <Label>Signer name</Label>
            <Input className="mt-1" value={signerName} onChange={(e) => setSignerName(e.target.value)} />
          </div>
          <div>
            <Label>Signer email</Label>
            <Input className="mt-1" type="email" value={signerEmail} onChange={(e) => setSignerEmail(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
