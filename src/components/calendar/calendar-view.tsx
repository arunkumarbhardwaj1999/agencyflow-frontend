"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  CALENDAR_LEGEND,
  type CalendarEvent,
  type CalendarEventsResponse,
  type CalendarTodayAgenda,
  type CalendarViewMode,
} from "@/lib/types";
import { CalendarAgendaSidebar } from "@/components/calendar/calendar-agenda-sidebar";
import { CalendarEventModal } from "@/components/calendar/calendar-event-modal";
import {
  CalendarDayGrid,
  CalendarMonthGrid,
  CalendarWeekGrid,
} from "@/components/calendar/calendar-grids";
import { Button } from "@/components/ui/button";

const VIEW_TABS: { id: CalendarViewMode; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
];

export function CalendarView() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const dateParam = format(anchor, "yyyy-MM-dd");

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["calendar-events", view, dateParam],
    queryFn: () =>
      apiFetch<CalendarEventsResponse>(
        `/calendar/events?view=${view}&date=${dateParam}`,
      ),
  });

  const { data: agenda, isLoading: agendaLoading } = useQuery({
    queryKey: ["calendar-today", dateParam],
    queryFn: () => apiFetch<CalendarTodayAgenda>("/calendar/today"),
  });

  const events = eventsData?.events ?? [];

  const headerLabel = useMemo(() => {
    if (view === "month") return format(anchor, "MMMM yyyy");
    if (view === "week") {
      const monday = new Date(anchor);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      const sunday = addDays(monday, 6);
      return `${format(monday, "d MMM")} – ${format(sunday, "d MMM yyyy")}`;
    }
    return format(anchor, "EEEE, d MMMM yyyy");
  }, [anchor, view]);

  function navigatePrev() {
    if (view === "month") setAnchor((d) => subMonths(d, 1));
    else if (view === "week") setAnchor((d) => subWeeks(d, 1));
    else setAnchor((d) => subDays(d, 1));
  }

  function navigateNext() {
    if (view === "month") setAnchor((d) => addMonths(d, 1));
    else if (view === "week") setAnchor((d) => addWeeks(d, 1));
    else setAnchor((d) => addDays(d, 1));
  }

  function goToday() {
    setAnchor(new Date());
  }

  function selectDay(day: Date) {
    setAnchor(day);
    setView("day");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500">Meetings, calls, tasks, deadlines — all in one place</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="ml-2 text-lg font-semibold text-slate-800">{headerLabel}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {CALENDAR_LEGEND.map((item) => (
            <span key={item.type} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          {eventsLoading ? (
            <p className="text-sm text-slate-500">Loading calendar…</p>
          ) : (
            <>
              {view === "month" && (
                <CalendarMonthGrid
                  anchor={anchor}
                  events={events}
                  onSelectDay={selectDay}
                  onSelectEvent={setSelectedEvent}
                />
              )}
              {view === "week" && (
                <CalendarWeekGrid
                  anchor={anchor}
                  events={events}
                  onSelectEvent={setSelectedEvent}
                />
              )}
              {view === "day" && (
                <CalendarDayGrid
                  anchor={anchor}
                  events={events}
                  onSelectEvent={setSelectedEvent}
                />
              )}
            </>
          )}
        </div>

        <CalendarAgendaSidebar
          agenda={agenda}
          isLoading={agendaLoading}
          onSelectEvent={setSelectedEvent}
        />
      </div>

      <CalendarEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
