"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ExternalLink,
  FileText,
  Flag,
  MessageCircle,
  Receipt,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  Record360EntityType,
  Record360View,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Record360Section =
  | "insights"
  | "related"
  | "meetings"
  | "tasks"
  | "messaging"
  | "emails"
  | "internal_comments";

const ALL_SECTIONS: Record360Section[] = [
  "insights",
  "related",
  "meetings",
  "tasks",
  "messaging",
  "emails",
  "internal_comments",
];

function scoreStars(score: number) {
  const filled = Math.round(score / 20);
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3.5 w-3.5 ${i < filled ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
    />
  ));
}

export function useRecord360(entityType: Record360EntityType, entityId: string) {
  return useQuery({
    queryKey: ["record-360", entityType, entityId],
    queryFn: () => apiFetch<Record360View>(`/records/${entityType}/${entityId}`),
    enabled: Boolean(entityId),
  });
}

export function Record360Panel({
  entityType,
  entityId,
  sections = ALL_SECTIONS,
}: {
  entityType: Record360EntityType;
  entityId: string;
  sections?: Record360Section[];
}) {
  const { data, isLoading } = useRecord360(entityType, entityId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading 360° view…</p>;
  }

  if (!data) return null;

  const show = (s: Record360Section) => sections.includes(s);
  const { insights, related, meetings, tasks, messaging, emails, internal_comments } = data;

  const hasRelated =
    related.deals.length > 0 ||
    related.leads.length > 0 ||
    related.clients.length > 0 ||
    related.projects.length > 0 ||
    related.invoices.length > 0;

  return (
    <div className="space-y-4">
      {show("insights") && (
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">AI insights</h2>
          </div>
          {insights.score !== null && (
            <div className="mb-3 flex items-end gap-2">
              <span className="text-3xl font-bold text-indigo-700">{insights.score}</span>
              <span className="text-sm text-slate-500">/ 100</span>
              <div className="mb-1 flex">{scoreStars(insights.score)}</div>
              {insights.confidence && (
                <Badge variant="secondary" className="mb-1">{insights.confidence}</Badge>
              )}
            </div>
          )}
          <p className="text-sm text-slate-700">{insights.summary}</p>
          {insights.recommendations.length > 0 && (
            <ul className="mt-3 space-y-1">
              {insights.recommendations.map((r) => (
                <li key={r} className="text-xs text-slate-600 before:mr-1.5 before:content-['•']">{r}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {show("related") && hasRelated && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Related records</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.deals.map((d) => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <Target className="h-4 w-4 text-indigo-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-slate-500">{d.status} · {formatCurrency(d.value)}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
            {related.leads.map((l) => (
              <Link
                key={l.id}
                href={`/leads/${l.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <Users className="h-4 w-4 text-sky-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="text-xs text-slate-500">{l.status}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
            {related.clients.map((c) => (
              <Link
                key={c.id}
                href={`/clients/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <Users className="h-4 w-4 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.business_name}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
            {related.projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <Flag className="h-4 w-4 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.progress_percent}% complete</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
            {related.invoices.map((inv) => (
              <Link
                key={inv.id}
                href="/finance"
                className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
              >
                <Receipt className="h-4 w-4 text-violet-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{inv.invoice_number}</p>
                  <p className="text-xs text-slate-500">{inv.status} · {formatCurrency(inv.total)}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {show("meetings") && meetings.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Meetings & demos</h2>
          <ul className="space-y-2">
            {meetings.map((m) => (
              <li key={m.id} className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm">
                <p className="font-medium text-slate-900">{m.title || m.activity_label}</p>
                <p className="text-xs text-slate-500">
                  {m.scheduled_at ? format(new Date(m.scheduled_at), "dd MMM yyyy, h:mm a") : "No date"}
                  {m.assigned_to_name && ` · ${m.assigned_to_name}`}
                  {m.is_completed && " · Done"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show("tasks") && tasks.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Tasks</h2>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tasks/${t.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm transition hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{t.title}</span>
                  <Badge variant="secondary">{t.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show("emails") && emails.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent emails</h2>
          <ul className="space-y-2">
            {emails.slice(0, 5).map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{e.subject}</p>
                  <Badge variant="secondary" className="text-[10px]">{e.delivery_status}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{e.body}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show("messaging") && messaging.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <MessageCircle className="h-4 w-4" />
            WhatsApp / messages
          </h2>
          <ul className="space-y-2">
            {messaging.slice(0, 5).map((m) => (
              <li key={m.id} className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-sm">
                <p className="font-medium text-slate-900">{m.title}</p>
                <p className="line-clamp-2 text-xs text-slate-600">{m.preview}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {show("internal_comments") && internal_comments.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <FileText className="h-4 w-4" />
            Internal comments
          </h2>
          <p className="mb-3 text-xs text-slate-400">Team-only — not visible to clients</p>
          <ul className="space-y-2">
            {internal_comments.map((c) => (
              <li key={c.id} className="rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2.5">
                <p className="text-sm text-slate-800">{c.body}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.author_name ?? "Team"} · {format(new Date(c.created_at), "dd MMM yyyy, h:mm a")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
