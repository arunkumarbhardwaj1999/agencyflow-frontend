"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { CheckCircle2, Clock, MessageCircle, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { LeadTimelineEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM yyyy");
}

function statusBadge(status: string | null, readStatus?: string) {
  const label = readStatus === "read" || readStatus === "seen" ? "Seen" : status;
  if (!label) return null;
  const lower = label.toLowerCase();
  if (lower === "seen" || lower === "read" || lower === "delivered") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Badge>
    );
  }
  if (lower === "failed") {
    return (
      <Badge className="bg-red-50 text-red-700 hover:bg-red-50">
        <XCircle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Clock className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

type WhatsAppEntry = {
  id: string;
  message: string;
  sentAt: string;
  status: string | null;
  readStatus: string;
};

export function LeadWhatsAppHistory({ leadId }: { leadId: string }) {
  const { data: timeline = [] } = useQuery({
    queryKey: ["lead-timeline", leadId],
    queryFn: () => apiFetch<LeadTimelineEvent[]>(`/leads/${leadId}/timeline`),
  });

  const { data: record360 } = useQuery({
    queryKey: ["record-360", "lead", leadId],
    queryFn: () => apiFetch<{ messaging: import("@/lib/types").LeadMessagingItem[] }>(`/records/lead/${leadId}`),
    enabled: Boolean(leadId),
  });

  const entries = useMemo(() => {
    const map = new Map<string, WhatsAppEntry>();

    for (const item of record360?.messaging ?? []) {
      if (item.channel !== "whatsapp" && item.channel !== "messaging") continue;
      map.set(item.id, {
        id: item.id,
        message: item.preview || item.title,
        sentAt: item.created_at,
        status: item.delivery_status ?? item.status,
        readStatus: item.read_status,
      });
    }

    for (const event of timeline) {
      if (event.event_type !== "whatsapp_sent") continue;
      const key = event.id;
      if (map.has(key)) continue;
      map.set(key, {
        id: event.id,
        message: event.metadata?.message ?? event.description,
        sentAt: event.created_at,
        status: event.metadata?.status ?? "delivered",
        readStatus: event.metadata?.read_status ?? "unknown",
      });
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
    );
  }, [timeline, record360?.messaging]);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
        <MessageCircle className="mx-auto mb-2 h-6 w-6 text-slate-400" />
        No WhatsApp messages yet.
        <p className="mt-1 text-xs text-slate-400">
          WhatsApp API integration coming soon. For now, use email to reach leads.
        </p>
      </div>
    );
  }

  const grouped = new Map<string, WhatsAppEntry[]>();
  for (const entry of entries) {
    const key = dayLabel(entry.sentAt);
    const list = grouped.get(key) ?? [];
    list.push(entry);
    grouped.set(key, list);
  }

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([day, dayEntries]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</p>
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{entry.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-slate-400">{format(new Date(entry.sentAt), "h:mm a")}</p>
                    {statusBadge(entry.status, entry.readStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
