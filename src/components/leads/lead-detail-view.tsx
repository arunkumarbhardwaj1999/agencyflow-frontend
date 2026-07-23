"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday } from "date-fns";
import {
  ArrowLeft,
  Handshake,
  Mail,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { LEAD_COLUMNS, type Deal, type Lead, type LeadTimelineEvent, type Member } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { formatCurrency } from "@/lib/utils";
import { AIResultModal } from "@/components/ai/ai-result-modal";
import { LeadActivities } from "@/components/leads/lead-activities";
import { LeadAttachments } from "@/components/leads/lead-attachments";
import { LeadEmailHistory } from "@/components/leads/lead-email-history";
import { LeadNotes } from "@/components/leads/lead-notes";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { Record360Panel } from "@/components/record-360/record-360-panel";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { LeadWhatsAppHistory } from "@/components/leads/lead-whatsapp-history";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { FEATURES } from "@/lib/feature-flags";

function statusTitle(status: string) {
  return LEAD_COLUMNS.find((c) => c.id === status)?.title ?? status;
}

function followupText(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  if (isToday(date)) return `Follow-up today · ${format(date, "h:mm a")}`;
  if (isPast(date)) return `Follow-up overdue · ${format(date, "dd MMM yyyy, h:mm a")}`;
  return `Follow-up · ${format(date, "dd MMM yyyy, h:mm a")}`;
}

export function LeadDetailView({ leadId }: { leadId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => apiFetch<Lead>(`/leads/${leadId}`),
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ["lead-timeline", leadId],
    queryFn: () => apiFetch<LeadTimelineEvent[]>(`/leads/${leadId}/timeline`),
    enabled: Boolean(leadId),
  });

  const { data: members = [] } = useMembers();
  const memberMap = new Map<string, string>((members as Member[]).map((m) => [m.id, m.name]));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-activities", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-notes", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-attachments", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-emails", leadId] });
    queryClient.invalidateQueries({ queryKey: ["record-360", "lead", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-messaging", leadId] });
    queryClient.invalidateQueries({ queryKey: ["leads"] });
  };

  const emailMutation = useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/leads/${leadId}/send-email`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setEmailContent("");
      setEmailOpen(false);
      invalidate();
    },
  });

  const createDealMutation = useMutation({
    mutationFn: () =>
      apiFetch<Deal>(`/leads/${leadId}/create-deal`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: (deal) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["deals-kanban"] });
      router.push(`/deals/${deal.id}`);
    },
  });

  const convertMutation = useMutation({
    mutationFn: () => apiFetch(`/leads/${leadId}/convert`, { method: "POST" }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading lead…</p>;
  }

  if (isError || !lead) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Lead not found.</p>
        <Button asChild className="mt-4">
          <Link href="/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  const followup = followupText(lead.next_followup);
  const owner = lead.assigned_user_id ? memberMap.get(lead.assigned_user_id) : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/leads">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
            <p className="text-sm text-slate-500">{lead.company_name || "No company"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          {FEATURES.ai && (
            <Button variant="outline" size="sm" onClick={() => setAiOpen(true)}>
              <Sparkles className="mr-1 h-4 w-4" />
              AI email
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setEmailOpen(true)} disabled={!lead.email}>
            <Mail className="mr-1 h-4 w-4" />
            Send email
          </Button>
          {lead.status !== "won" && lead.status !== "lost" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => createDealMutation.mutate()}
              disabled={createDealMutation.isPending}
            >
              <Handshake className="mr-1 h-4 w-4" />
              Create deal
            </Button>
          )}
          {lead.status === "won" && (
            <Button size="sm" onClick={() => convertMutation.mutate()} disabled={convertMutation.isPending}>
              Convert to client
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Record360Panel
            entityType="lead"
            entityId={leadId}
            sections={
              FEATURES.ai
                ? ["insights", "related", "meetings", "internal_comments"]
                : ["related", "meetings", "internal_comments"]
            }
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Lead information</h2>
              <Badge>{statusTitle(lead.status)}</Badge>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Deal value</dt>
                <dd className="font-semibold text-indigo-700">{formatCurrency(lead.value)}</dd>
              </div>
              {lead.email && (
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd>{lead.email}</dd>
                </div>
              )}
              {lead.phone && (
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd>{lead.phone}</dd>
                </div>
              )}
              {lead.source && (
                <div>
                  <dt className="text-slate-500">Source</dt>
                  <dd>{lead.source}</dd>
                </div>
              )}
              {owner && (
                <div>
                  <dt className="text-slate-500">Owner</dt>
                  <dd>{owner}</dd>
                </div>
              )}
              {followup && (
                <div>
                  <dt className="text-slate-500">Next follow-up</dt>
                  <dd className={followup.includes("overdue") ? "text-red-600" : "text-slate-700"}>{followup}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd>{format(new Date(lead.created_at), "dd MMM yyyy, h:mm a")}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Notes</h2>
            <LeadNotes leadId={leadId} onChanged={invalidate} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h2>
              <p className="mt-1 text-xs text-slate-400">
                Proposals, quotations, GST docs, and reference images.
              </p>
            </div>
            <LeadAttachments leadId={leadId} onChanged={invalidate} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Activities</h2>
              <p className="mt-1 text-xs text-slate-400">
                Sales actions — calls, meetings, demos, follow-ups logged by your team.
              </p>
            </div>
            <LeadActivities leadId={leadId} onChanged={invalidate} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Emails</h2>
              <p className="mt-1 text-xs text-slate-400">
                Outgoing emails sent from the CRM with delivery and open status.
              </p>
            </div>
            <LeadEmailHistory leadId={leadId} />
          </section>

          {FEATURES.whatsapp && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">WhatsApp</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Message history — full integration coming soon. Use email for now.
                </p>
              </div>
              <LeadWhatsAppHistory leadId={leadId} />
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Business timeline</h2>
              <p className="mt-1 text-xs text-slate-400">
                System events — stage changes, emails sent, notes added, files uploaded.
              </p>
            </div>
            {timelineLoading ? (
              <p className="text-sm text-slate-500">Loading timeline…</p>
            ) : (
              <LeadTimeline events={timeline} />
            )}
          </section>
        </div>
      </div>

      <LeadFormDialog open={editOpen} onOpenChange={setEditOpen} lead={lead} />

      <AIResultModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Draft follow-up email"
        description="AI-generated email for this lead"
        streamAction="draft-email"
        body={{ lead_id: leadId }}
        sendEndpoint={`/leads/${leadId}/send-email`}
        sendLabel={lead.email ?? lead.name}
        onSentSuccess={invalidate}
      />

      <Modal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Send email"
        description={lead.email ? `To ${lead.email}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button
              disabled={emailMutation.isPending || !emailContent.trim()}
              onClick={() => emailMutation.mutate(emailContent.trim())}
            >
              {emailMutation.isPending ? "Sending…" : "Send email"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Email content</Label>
            <Textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={8}
              placeholder={"Subject: Following up\n\nHi …"}
            />
          </div>
          {emailMutation.isError && (
            <p className="text-sm text-red-600">{(emailMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>

      {(convertMutation.isError || createDealMutation.isError) && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {((convertMutation.error ?? createDealMutation.error) as Error).message}
        </p>
      )}
    </div>
  );
}
