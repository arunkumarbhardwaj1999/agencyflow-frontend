"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Mail,
  Paperclip,
  PlusCircle,
  StickyNote,
  Trophy,
  XCircle,
} from "lucide-react";
import type { DealTimelineEvent } from "@/lib/types";

const EVENT_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  deal_created: { label: "Deal created", icon: PlusCircle, color: "text-indigo-600 bg-indigo-50" },
  stage_changed: { label: "Stage updated", icon: ArrowRightLeft, color: "text-sky-600 bg-sky-50" },
  deal_won: { label: "Deal won", icon: Trophy, color: "text-emerald-700 bg-emerald-50" },
  deal_lost: { label: "Deal lost", icon: XCircle, color: "text-rose-600 bg-rose-50" },
  note_added: { label: "Note added", icon: StickyNote, color: "text-amber-600 bg-amber-50" },
  email_sent: { label: "Email sent", icon: Mail, color: "text-violet-600 bg-violet-50" },
  attachment_uploaded: { label: "Attachment", icon: Paperclip, color: "text-slate-600 bg-slate-100" },
  proposal_uploaded: { label: "Proposal uploaded", icon: Paperclip, color: "text-indigo-600 bg-indigo-50" },
  activity_scheduled: { label: "Activity scheduled", icon: CalendarClock, color: "text-sky-600 bg-sky-50" },
  activity_completed: { label: "Activity done", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
};

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM yyyy");
}

export function DealTimeline({ events }: { events: DealTimelineEvent[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, DealTimelineEvent[]>();
    for (const event of events) {
      const key = dayLabel(event.created_at);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center text-sm text-slate-500">
        No activity yet. Stage changes, proposals, and emails will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([day, dayEvents]) => (
        <div key={day}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</p>
          <div className="space-y-3">
            {dayEvents.map((event) => {
              const meta = EVENT_META[event.event_type] ?? {
                label: event.event_type.replace(/_/g, " "),
                icon: StickyNote,
                color: "text-slate-600 bg-slate-100",
              };
              const Icon = meta.icon;
              return (
                <div key={event.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{meta.label}</p>
                      <p className="text-xs text-slate-400">{format(new Date(event.created_at), "h:mm a")}</p>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{event.description}</p>
                    {event.created_by_name && (
                      <p className="mt-1 text-xs text-slate-400">by {event.created_by_name}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
