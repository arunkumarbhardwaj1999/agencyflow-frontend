"use client";

import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { CalendarEvent } from "@/lib/types";
import {
  calendarEventIcon,
  eventTypeLabel,
  formatEventTime,
  resolveCalendarLink,
} from "@/lib/calendar-utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function CalendarEventModal({
  event,
  onClose,
}: {
  event: CalendarEvent | null;
  onClose: () => void;
}) {
  if (!event) return null;
  const Icon = calendarEventIcon(event.event_type);
  const href = resolveCalendarLink(event.link_path);

  return (
    <Modal
      open={Boolean(event)}
      onClose={onClose}
      title={event.title}
      description={eventTypeLabel(event.event_type)}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button asChild>
            <Link href={href}>
              Open details
              <ExternalLink className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: event.color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {format(new Date(event.starts_at), "EEEE, d MMM yyyy")}
            </p>
            <p className="text-sm text-slate-500">{formatEventTime(event)}</p>
          </div>
        </div>
        {event.assigned_to_name && (
          <p className="text-sm text-slate-600">
            <span className="text-slate-500">Assigned:</span> {event.assigned_to_name}
          </p>
        )}
        {event.description && (
          <p className="whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {event.description}
          </p>
        )}
        {event.status && (
          <p className="text-xs uppercase tracking-wide text-slate-500">Status: {event.status}</p>
        )}
      </div>
    </Modal>
  );
}
