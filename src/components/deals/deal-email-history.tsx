"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { DealEmail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM yyyy");
}

export function DealEmailHistory({ dealId }: { dealId: string }) {
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["deal-emails", dealId],
    queryFn: () => apiFetch<DealEmail[]>(`/deals/${dealId}/emails`),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading emails…</p>;
  if (emails.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
        No emails sent yet.
      </div>
    );
  }

  const grouped = new Map<string, DealEmail[]>();
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
              <div key={email.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-violet-600" />
                    <div>
                      <p className="text-sm font-medium">{email.subject}</p>
                      <p className="text-xs text-slate-500">To {email.to_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{format(new Date(email.sent_at), "h:mm a")}</p>
                    <Badge className={email.delivery_status === "delivered" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>
                      {email.delivery_status === "delivered" ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                      {email.delivery_status}
                    </Badge>
                    {email.open_status === "opened" && <p className="mt-1 text-xs text-violet-600">Opened</p>}
                  </div>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{email.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
