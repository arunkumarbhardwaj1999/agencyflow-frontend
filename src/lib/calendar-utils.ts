import {
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  Flag,
  Mail,
  Phone,
  Presentation,
  Receipt,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import type { CalendarEvent } from "./types";

export function resolveCalendarLink(linkPath: string): string {
  if (linkPath.startsWith("/invoices/")) return "/finance";
  if (linkPath.startsWith("/tasks/")) return "/projects";
  if (linkPath.startsWith("/projects/")) return "/projects";
  return linkPath;
}

export function eventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    meeting: "Meeting",
    call: "Call",
    task: "Task",
    follow_up: "Follow-up",
    lead_followup: "Lead follow-up",
    proposal: "Proposal",
    project_deadline: "Project deadline",
    invoice_due: "Invoice due",
    deal_close: "Deal closing",
    demo: "Demo",
    email: "Email",
  };
  return labels[eventType] ?? eventType.replace(/_/g, " ");
}

export function calendarEventIcon(eventType: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    meeting: Users,
    call: Phone,
    task: CheckSquare,
    follow_up: Clock,
    lead_followup: UserRound,
    proposal: FileText,
    project_deadline: Flag,
    invoice_due: Receipt,
    deal_close: Target,
    demo: Presentation,
    email: Mail,
  };
  return icons[eventType] ?? Calendar;
}

export function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const y = day.getFullYear();
  const m = day.getMonth();
  const d = day.getDate();
  return events.filter((e) => {
    const start = new Date(e.starts_at);
    return start.getFullYear() === y && start.getMonth() === m && start.getDate() === d;
  });
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.all_day) return "All day";
  const start = new Date(event.starts_at);
  return start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}
