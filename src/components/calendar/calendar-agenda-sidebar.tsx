"use client";

import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import type { CalendarEvent, CalendarTodayAgenda } from "@/lib/types";
import { calendarEventIcon, formatEventTime } from "@/lib/calendar-utils";

export function CalendarAgendaSidebar({
  agenda,
  isLoading,
  onSelectEvent,
}: {
  agenda: CalendarTodayAgenda | undefined;
  isLoading: boolean;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading agenda…</p>;
  }

  if (!agenda) return null;

  return (
    <aside className="w-full shrink-0 space-y-5 lg:w-72">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Today</p>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{agenda.greeting}</h2>
        <p className="mt-1 text-xs text-slate-500">{format(new Date(agenda.date), "EEEE, d MMMM yyyy")}</p>
        <p className="mt-3 text-sm text-slate-600">{agenda.summary}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Today&apos;s priority</h3>
        {agenda.priorities.length === 0 ? (
          <p className="text-sm text-slate-500">No priority items — you&apos;re clear for now.</p>
        ) : (
          <ul className="space-y-2">
            {agenda.priorities.map((item) => {
              const Icon = calendarEventIcon(item.event.event_type);
              return (
                <li key={item.event.id}>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(item.event)}
                    className="flex w-full items-start gap-2 rounded-lg border border-slate-100 px-3 py-2 text-left transition hover:bg-slate-50"
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                      style={{ backgroundColor: item.event.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <p className="text-sm font-medium text-slate-900">{item.event.title}</p>
                      <p className="text-xs text-slate-500">{item.reason}</p>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Today&apos;s schedule</h3>
        {agenda.events_today.length === 0 ? (
          <p className="text-sm text-slate-500">No events scheduled today.</p>
        ) : (
          <ul className="space-y-2">
            {agenda.events_today.map((event) => {
              const Icon = calendarEventIcon(event.event_type);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
                  >
                    <span className="w-14 shrink-0 text-xs text-slate-500">{formatEventTime(event)}</span>
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="truncate text-sm text-slate-800">{event.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
