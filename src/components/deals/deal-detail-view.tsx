"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Mail, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DEAL_STAGES, type Deal, type DealTimelineEvent, type Member } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { formatCurrency } from "@/lib/utils";
import { DealActivities } from "@/components/deals/deal-activities";
import { DealAttachments } from "@/components/deals/deal-attachments";
import { DealEmailHistory } from "@/components/deals/deal-email-history";
import { DealFormDialog } from "@/components/deals/deal-form-dialog";
import { DealNotes } from "@/components/deals/deal-notes";
import { Record360Panel } from "@/components/record-360/record-360-panel";
import { DealTimeline } from "@/components/deals/deal-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

function stageTitle(status: string) {
  return DEAL_STAGES.find((s) => s.id === status)?.title ?? status;
}

export function DealDetailView({ dealId }: { dealId: string }) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  const { data: deal, isLoading, isError } = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => apiFetch<Deal>(`/deals/${dealId}`),
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ["deal-timeline", dealId],
    queryFn: () => apiFetch<DealTimelineEvent[]>(`/deals/${dealId}/timeline`),
    enabled: Boolean(dealId),
  });

  const { data: members = [] } = useMembers();
  const memberMap = new Map<string, string>((members as Member[]).map((m) => [m.id, m.name]));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal-timeline", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal-activities", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal-notes", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal-attachments", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal-emails", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deals-kanban"] });
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  const emailMutation = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/deals/${dealId}/send-email`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setEmailContent("");
      setEmailOpen(false);
      invalidate();
    },
  });

  const winMutation = useMutation({
    mutationFn: () => apiFetch(`/deals/${dealId}/win`, { method: "POST" }),
    onSuccess: () => invalidate(),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading deal…</p>;

  if (isError || !deal) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Deal not found.</p>
        <Button asChild className="mt-4"><Link href="/deals">Back to deals</Link></Button>
      </div>
    );
  }

  const owner = deal.assigned_user_id ? memberMap.get(deal.assigned_user_id) : null;
  const isClosed = deal.status === "won" || deal.status === "lost";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/deals"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
            <p className="text-sm text-slate-500">{deal.company_name || deal.contact_name || "No company"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
          <Button variant="outline" size="sm" onClick={() => setEmailOpen(true)} disabled={!deal.contact_email}>
            <Mail className="mr-1 h-4 w-4" />Send email
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/proposals/new?deal_id=${dealId}`}>Create proposal</Link>
          </Button>
          {!isClosed && (
            <Button size="sm" onClick={() => { if (confirm("Mark as won and create client?")) winMutation.mutate(); }} disabled={winMutation.isPending}>
              <Trophy className="mr-1 h-4 w-4" />Win deal
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Record360Panel
            entityType="deal"
            entityId={dealId}
            sections={["insights", "related", "meetings", "internal_comments"]}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Deal information</h2>
              <Badge>{stageTitle(deal.status)}</Badge>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Deal value</dt>
                <dd className="font-semibold text-indigo-700">{formatCurrency(deal.value)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Probability</dt>
                <dd className="font-medium">{deal.probability}%</dd>
              </div>
              {deal.expected_close_date && (
                <div>
                  <dt className="text-slate-500">Expected close</dt>
                  <dd>{format(new Date(deal.expected_close_date), "dd MMM yyyy")}</dd>
                </div>
              )}
              {owner && (
                <div>
                  <dt className="text-slate-500">Assigned to</dt>
                  <dd>{owner}</dd>
                </div>
              )}
              {deal.contact_email && (
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd>{deal.contact_email}</dd>
                </div>
              )}
              {deal.contact_phone && (
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd>{deal.contact_phone}</dd>
                </div>
              )}
              {deal.lead_id && (
                <div>
                  <dt className="text-slate-500">Source lead</dt>
                  <dd>
                    <Link href={`/leads/${deal.lead_id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                      View lead <ExternalLink className="h-3 w-3" />
                    </Link>
                  </dd>
                </div>
              )}
              {deal.client_id && (
                <div>
                  <dt className="text-slate-500">Client</dt>
                  <dd>
                    <Link href={`/clients`} className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                      View client <ExternalLink className="h-3 w-3" />
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd>{format(new Date(deal.created_at), "dd MMM yyyy, h:mm a")}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Proposal</h2>
            <DealAttachments dealId={dealId} proposalOnly onChanged={invalidate} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h2>
            <DealNotes dealId={dealId} onChanged={invalidate} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h2>
            <DealAttachments dealId={dealId} onChanged={invalidate} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Activities</h2>
            <DealActivities dealId={dealId} onChanged={invalidate} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Emails</h2>
            <DealEmailHistory dealId={dealId} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Activity timeline</h2>
            {timelineLoading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <DealTimeline events={timeline} />
            )}
          </section>
        </div>
      </div>

      <DealFormDialog open={editOpen} onOpenChange={setEditOpen} deal={deal} />

      <Modal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Send email"
        description={deal.contact_email ? `To ${deal.contact_email}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button disabled={emailMutation.isPending || !emailContent.trim()} onClick={() => emailMutation.mutate(emailContent.trim())}>
              {emailMutation.isPending ? "Sending…" : "Send email"}
            </Button>
          </>
        }
      >
        <div>
          <Label>Email content</Label>
          <Textarea value={emailContent} onChange={(e) => setEmailContent(e.target.value)} rows={8} placeholder={"Subject: Proposal follow-up\n\nHi …"} />
          {emailMutation.isError && <p className="mt-2 text-sm text-red-600">{(emailMutation.error as Error).message}</p>}
        </div>
      </Modal>

      {(winMutation.isError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(winMutation.error as Error).message}</p>
      )}
    </div>
  );
}
