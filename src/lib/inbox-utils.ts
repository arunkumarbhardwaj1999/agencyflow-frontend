import {
  Bell,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import type { InboxItem } from "./types";

export function resolveInboxLink(linkPath: string): string {
  if (linkPath.startsWith("/invoices/")) return "/finance";
  if (linkPath.startsWith("/tasks/")) return "/projects";
  if (linkPath.startsWith("/projects/")) return "/projects";
  if (linkPath === "/inbox") return "/inbox";
  return linkPath;
}

export function inboxChannelIcon(channel: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    email: Mail,
    messaging: MessageCircle,
    whatsapp: MessageCircle,
    call: Phone,
    notification: Bell,
    internal_comment: Users,
  };
  return icons[channel] ?? Inbox;
}

export function inboxChannelColor(channel: string): string {
  const colors: Record<string, string> = {
    email: "#8B5CF6",
    messaging: "#22C55E",
    whatsapp: "#22C55E",
    call: "#3B82F6",
    notification: "#F59E0B",
    internal_comment: "#6366F1",
  };
  return colors[channel] ?? "#64748B";
}

export function deliveryStatusLabel(item: InboxItem): string | null {
  if (item.channel === "email" || item.channel === "messaging") {
    const status = item.delivery_status ?? item.status;
    if (!status) return null;
    if (status === "delivered" || status === "sent") return "Delivered";
    if (status === "failed") return "Failed";
    if (item.metadata?.open_status === "opened") return "Opened";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  if (item.channel === "messaging" && item.metadata?.read_status === "read") return "Seen";
  return item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : null;
}

export function deliveryStatusClass(status: string | null): string {
  if (!status) return "bg-slate-100 text-slate-600";
  const lower = status.toLowerCase();
  if (lower === "delivered" || lower === "seen" || lower === "opened" || lower === "sent") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (lower === "failed") return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-600";
}
