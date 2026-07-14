"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { PortalApproval } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PortalApprovals() {
  const queryClient = useQueryClient();
  const [commentById, setCommentById] = useState<Record<string, string>>({});

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["portal-approvals"],
    queryFn: () => apiFetch<PortalApproval[]>("/portal/approvals"),
  });

  const decide = useMutation({
    mutationFn: ({
      id,
      status,
      client_comment,
    }: {
      id: string;
      status: string;
      client_comment?: string;
    }) =>
      apiFetch(`/portal/approvals/${id}/decide`, {
        method: "POST",
        body: JSON.stringify({ status, client_comment: client_comment || null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["portal-summary"] });
      queryClient.invalidateQueries({ queryKey: ["portal-activity"] });
    },
  });

  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          Approvals
        </h1>
        <p className="text-sm text-slate-500">
          Approve designs, videos, documents, and deliverables from your agency.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                Nothing waiting for your approval.
              </p>
            ) : (
              pending.map((a) => (
                <article key={a.id} className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.kind_label}
                        {a.project_title ? ` · ${a.project_title}` : ""}
                        {" · "}
                        {format(new Date(a.created_at), "dd MMM yyyy")}
                      </p>
                      {a.description && <p className="mt-2 text-sm text-slate-700">{a.description}</p>}
                      {a.document_filename && (
                        <p className="mt-1 text-xs text-indigo-600">Attached: {a.document_filename}</p>
                      )}
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <Textarea
                    className="mt-3"
                    placeholder="Optional comment for the agency…"
                    value={commentById[a.id] ?? ""}
                    onChange={(e) => setCommentById((s) => ({ ...s, [a.id]: e.target.value }))}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate({
                          id: a.id,
                          status: "approved",
                          client_comment: commentById[a.id],
                        })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate({
                          id: a.id,
                          status: "changes_requested",
                          client_comment: commentById[a.id],
                        })
                      }
                    >
                      Request changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate({
                          id: a.id,
                          status: "rejected",
                          client_comment: commentById[a.id],
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                </article>
              ))
            )}
          </section>

          {decided.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">History</h2>
              {decided.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      {a.kind_label}
                      {a.client_comment ? ` · “${a.client_comment}”` : ""}
                    </p>
                  </div>
                  <Badge className="capitalize">{a.status.replace("_", " ")}</Badge>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
