"use client";

import { format, isSameMonth, isToday } from "date-fns";
import type { CalendarEvent } from "@/lib/types";
import { calendarEventIcon, eventsForDay } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

function EventChip({
  event,
  onClick,
  compact,
}: {
  event: CalendarEvent;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = calendarEventIcon(event.event_type);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-white transition hover:opacity-90",
        compact ? "text-[10px]" : "text-xs",
      )}
      style={{ backgroundColor: event.color }}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{event.title}</span>
    </button>
  );
}

export function CalendarMonthGrid({
  anchor,
  events,
  onSelectDay,
  onSelectEvent,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - mondayOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekdays.map((wd) => (
          <div key={wd} className="px-2 py-2 text-center text-xs font-semibold uppercase text-slate-500">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day);
          const inMonth = isSameMonth(day, anchor);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "min-h-[100px] border-b border-r border-slate-100 p-1.5 text-left transition hover:bg-slate-50/80",
                !inMonth && "bg-slate-50/50 text-slate-400",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                  isToday(day) && "bg-indigo-600 text-white",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <EventChip key={ev.id} event={ev} onClick={() => onSelectEvent(ev)} compact />
                ))}
                {dayEvents.length > 3 && (
                  <p className="px-1 text-[10px] text-slate-500">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export function CalendarWeekGrid({
  anchor,
  events,
  onSelectEvent,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const monday = new Date(anchor);
  const dayOfWeek = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid min-w-[700px] grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50">
        <div />
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="border-l border-slate-200 px-2 py-2 text-center">
            <p className="text-xs text-slate-500">{format(day, "EEE")}</p>
            <p className={cn("text-sm font-semibold", isToday(day) && "text-indigo-600")}>
              {format(day, "d MMM")}
            </p>
          </div>
        ))}
      </div>
      <div className="grid min-w-[700px] grid-cols-[60px_repeat(7,1fr)]">
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="border-b border-r border-slate-100 px-2 py-3 text-xs text-slate-400">
              {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
            </div>
            {weekDays.map((day) => {
              const slotEvents = eventsForDay(events, day).filter((e) => {
                if (e.all_day) return hour === 8;
                const h = new Date(e.starts_at).getHours();
                return h === hour;
              });
              return (
                <div key={`${day.toISOString()}-${hour}`} className="min-h-[52px] border-b border-l border-slate-100 p-1">
                  {slotEvents.map((ev) => (
                    <EventChip key={ev.id} event={ev} onClick={() => onSelectEvent(ev)} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarDayGrid({
  anchor,
  events,
  onSelectEvent,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const dayEvents = eventsForDay(events, anchor).sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-lg font-semibold text-slate-900">
          {isToday(anchor) ? "Today" : format(anchor, "EEEE, d MMMM yyyy")}
        </h3>
        <p className="text-sm text-slate-500">{dayEvents.length} event(s)</p>
      </div>
      <div className="divide-y divide-slate-100">
        {HOURS.map((hour) => {
          const slotEvents = dayEvents.filter((e) => {
            if (e.all_day) return hour === 8;
            return new Date(e.starts_at).getHours() === hour;
          });
          return (
            <div key={hour} className="flex min-h-[56px]">
              <div className="w-16 shrink-0 border-r border-slate-100 px-2 py-3 text-xs text-slate-400">
                {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
              </div>
              <div className="flex-1 space-y-1 p-2">
                {slotEvents.map((ev) => (
                  <EventChip key={ev.id} event={ev} onClick={() => onSelectEvent(ev)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {dayEvents.filter((e) => e.all_day).length > 0 && (
        <div className="border-t border-slate-200 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">All day</p>
          <div className="space-y-1">
            {dayEvents.filter((e) => e.all_day).map((ev) => (
              <EventChip key={ev.id} event={ev} onClick={() => onSelectEvent(ev)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
