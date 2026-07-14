"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { LeadEmail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM yyyy");
}

function deliveryBadge(status: string) {
  if (status === "delivered") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Delivered
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge className="bg-red-50 text-red-700 hover:bg-red-50">
        <XCircle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}

function openBadge(status: string) {
  if (status === "opened") {
    return <span className="text-xs font-medium text-violet-600">Opened</span>;
  }
  if (status === "unknown") return null;
  return <span className="text-xs text-slate-400 capitalize">{status}</span>;
}

export function LeadEmailHistory({ leadId }: { leadId: string }) {
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["lead-emails", leadId],
    queryFn: () => apiFetch<LeadEmail[]>(`/leads/${leadId}/emails`),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading emails…</p>;
  }

  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
        No emails sent yet. Use &quot;Send email&quot; to reach this lead from the CRM.
      </div>
    );
  }

  const grouped = new Map<string, LeadEmail[]>();
  for (const email of emails) {
    const key = dayLabel(email.sent_at);
    const list = grouped.get(key) ?? [];
    list.push(email);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([day, dayEmails]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</p>
          <div className="space-y-2">
            {dayEmails.map((email) => (
              <div
                key={email.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50">
                      <Mail className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{email.subject}</p>
                      <p className="text-xs text-slate-500">
                        To {email.to_email}
                        {email.sent_by_name && ` · by ${email.sent_by_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-slate-400">{format(new Date(email.sent_at), "h:mm a")}</p>
                    <div className="flex items-center gap-2">
                      {openBadge(email.open_status)}
                      {deliveryBadge(email.delivery_status)}
                    </div>
                  </div>
                </div>
                <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">{email.body}</p>
                {email.error_message && (
                  <p className="mt-1 text-xs text-red-600">{email.error_message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
