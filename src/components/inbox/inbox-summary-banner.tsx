"use client";

import { Sparkles } from "lucide-react";
import type { InboxSummary } from "@/lib/types";

export function InboxSummaryBanner({
  summary,
  isLoading,
}: {
  summary: InboxSummary | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4 text-sm text-slate-500">
        Loading summary…
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    { label: "Unread", value: summary.unread_messages },
    { label: "Follow-ups", value: summary.pending_followups },
    { label: "Overdue invoices", value: summary.overdue_invoices },
    { label: "Proposals to revise", value: summary.proposals_needing_revision },
  ];

  return (
    <div className="mb-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
              Smart summary
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Rule-based priorities — no API key needed. WhatsApp uses SMS proxy until you connect Meta.
          </p>
          {summary.summary_lines.length > 0 && (
            <ul className="mt-3 space-y-1">
              {summary.summary_lines.map((line) => (
                <li key={line} className="text-sm text-slate-700 before:mr-2 before:content-['•']">
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-center shadow-sm">
              <p className="text-lg font-bold text-indigo-700">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      {summary.note && (
        <p className="mt-3 border-t border-indigo-100 pt-2 text-xs text-slate-500">{summary.note}</p>
      )}
    </div>
  );
}
