"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday } from "date-fns";
import { MessageCirclePlus, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  deliveryStatusClass,
  deliveryStatusLabel,
  inboxChannelColor,
  inboxChannelIcon,
  resolveInboxLink,
} from "@/lib/inbox-utils";
import {
  INBOX_CHANNELS,
  type InboxChannel,
  type InboxItem,
  type InboxResponse,
  type InboxSummary,
} from "@/lib/types";
import { InboxSummaryBanner } from "@/components/inbox/inbox-summary-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/feature-flags";
import { useAuthStore } from "@/stores/auth-store";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM yyyy");
}

type DateFilter = "all" | "today" | "week";

const VISIBLE_INBOX_CHANNELS = INBOX_CHANNELS.filter(
  (c) => FEATURES.whatsapp || c.id !== "whatsapp",
);

export function InboxView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isEmployee = user?.role === "employee";
  const [channel, setChannel] = useState<InboxChannel>(isEmployee ? "internal_comment" : "all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [mentionsOnly, setMentionsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [commentLeadId, setCommentLeadId] = useState("");

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("channel", channel);
    if (unreadOnly) params.set("unread", "true");
    if (dateFilter !== "all") params.set("date", dateFilter);
    if (search.trim()) params.set("search", search.trim());
    params.set("limit", "100");
    return params.toString();
  }, [channel, unreadOnly, dateFilter, search]);

  const { data: inbox, isLoading } = useQuery({
    queryKey: ["inbox", queryParams],
    queryFn: () => apiFetch<InboxResponse>(`/communications/inbox?${queryParams}`),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["inbox-summary"],
    queryFn: () => apiFetch<InboxSummary>("/communications/summary"),
  });

  const markReadMutation = useMutation({
    mutationFn: (itemKeys: string[]) =>
      apiFetch("/communications/mark-read", {
        method: "POST",
        body: JSON.stringify({ item_keys: itemKeys }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["inbox-summary"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      apiFetch("/communications/send-message", {
        method: "POST",
        body: JSON.stringify({
          message: message.trim(),
          phone: phone.trim() || undefined,
        }),
      }),
    onSuccess: () => {
      setComposeOpen(false);
      setMessage("");
      setPhone("");
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      apiFetch("/communications/internal-comments", {
        method: "POST",
        body: JSON.stringify({
          body: commentBody.trim(),
          lead_id: commentLeadId.trim() || undefined,
        }),
      }),
    onSuccess: () => {
      setCommentOpen(false);
      setCommentBody("");
      setCommentLeadId("");
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const filteredItems = useMemo(() => {
    let items = inbox?.items ?? [];
    if (mentionsOnly && user) {
      const needles = [`@${user.username}`, `@${user.first_name}`]
        .filter(Boolean)
        .map((n) => n.toLowerCase());
      items = items.filter((item) => {
        const hay = `${item.title} ${item.preview}`.toLowerCase();
        return needles.some((n) => hay.includes(n));
      });
    }
    return items;
  }, [inbox?.items, mentionsOnly, user]);

  const pagination = useClientPagination(filteredItems, {
    resetKey: `${channel}|${unreadOnly}|${dateFilter}|${mentionsOnly}|${search}`,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, InboxItem[]>();
    for (const item of pagination.pageItems) {
      const key = dayLabel(item.created_at);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [pagination.pageItems]);

  function handleItemClick(item: InboxItem) {
    if (item.read_status === "unread") {
      markReadMutation.mutate([item.id]);
    }
    const href = resolveInboxLink(item.link_path);
    if (href !== "/inbox") router.push(href);
  }

  function runSearch() {
    setSearch(searchInput);
  }

  return (
    <div>
      <InboxSummaryBanner summary={summary} isLoading={summaryLoading} />

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 lg:w-56">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Channels</p>
          <nav className="space-y-1">
            {(isEmployee
              ? VISIBLE_INBOX_CHANNELS.filter((ch) =>
                  ["all", "internal_comment", "notification"].includes(ch.id),
                )
              : VISIBLE_INBOX_CHANNELS
            ).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                  channel === ch.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {ch.label}
              </button>
            ))}
          </nav>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Filters</p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                />
                Unread only
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={mentionsOnly}
                  onChange={(e) => setMentionsOnly(e.target.checked)}
                />
                Mentions (@you)
              </label>
              {(["all", "today", "week"] as DateFilter[]).map((df) => (
                <label key={df} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="dateFilter"
                    checked={dateFilter === df}
                    onChange={() => setDateFilter(df)}
                  />
                  {df === "all" ? "All time" : df === "today" ? "Today" : "This week"}
                </label>
              ))}
            </div>
          </div>

          {!isEmployee && FEATURES.whatsapp && (channel === "whatsapp" || channel === "messaging") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full gap-1"
              onClick={() => setComposeOpen(true)}
            >
              <MessageCirclePlus className="h-4 w-4" />
              Send SMS (proxy)
            </Button>
          )}
          {channel === "internal_comment" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => setCommentOpen(true)}
            >
              Add team comment
            </Button>
          )}
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search ABC Technologies, emails, messages…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>
            <Button variant="outline" size="sm" onClick={runSearch}>Search</Button>
            {inbox && (
              <Badge variant="secondary">{inbox.unread_count} unread</Badge>
            )}
          </div>

          <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading inbox…</p>
            ) : grouped.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                No messages match your filters. Emails, SMS proxy messages, calls, and internal comments appear here.
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map(([day, dayItems]) => (
                  <div key={day}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</p>
                    <div className="space-y-2">
                      {dayItems.map((item) => {
                        const Icon = inboxChannelIcon(item.channel);
                        const status = deliveryStatusLabel(item);
                        const isUnread = item.read_status === "unread";
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleItemClick(item)}
                            className={cn(
                              "flex w-full gap-3 rounded-xl border px-4 py-3 text-left transition hover:shadow-sm",
                              isUnread
                                ? "border-indigo-200 bg-indigo-50/40"
                                : "border-slate-200 bg-white hover:bg-slate-50",
                            )}
                          >
                            <div
                              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: inboxChannelColor(item.channel) }}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className={cn("text-sm", isUnread ? "font-semibold text-slate-900" : "font-medium text-slate-800")}>
                                    {item.contact_name || item.sender_name || item.title}
                                  </p>
                                  <p className="text-xs text-slate-500">{item.channel_label}</p>
                                </div>
                                <p className="shrink-0 text-xs text-slate-400">
                                  {format(new Date(item.created_at), "h:mm a")}
                                </p>
                              </div>
                              <p className="mt-1 font-medium text-slate-800">{item.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{item.preview}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {status && (
                                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", deliveryStatusClass(status))}>
                                    {status}
                                  </span>
                                )}
                                {item.is_proxy && (
                                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                    SMS proxy
                                  </span>
                                )}
                                {isUnread && (
                                  <span className="h-2 w-2 rounded-full bg-indigo-500" title="Unread" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <PaginationBar
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  from={pagination.from}
                  to={pagination.to}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                  className="rounded-xl border border-slate-100"
                />
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Send message (SMS proxy)"
        description="Send an SMS-style message and log it in the inbox."
        footer={
          <>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button disabled={sendMutation.isPending || !message.trim()} onClick={() => sendMutation.mutate()}>
              {sendMutation.isPending ? "Sending…" : "Send"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Phone (optional if linked to lead)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Hi, following up on your proposal…" />
          </div>
          {sendMutation.isError && (
            <p className="text-sm text-red-600">{(sendMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>

      <Modal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        title="Internal comment"
        description="Team-only notes — clients cannot see these."
        footer={
          <>
            <Button variant="outline" onClick={() => setCommentOpen(false)}>Cancel</Button>
            <Button
              disabled={commentMutation.isPending || !commentBody.trim() || !commentLeadId.trim()}
              onClick={() => commentMutation.mutate()}
            >
              {commentMutation.isPending ? "Saving…" : "Post comment"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Lead ID (link to record)</Label>
            <Input
              value={commentLeadId}
              onChange={(e) => setCommentLeadId(e.target.value)}
              placeholder="Paste lead UUID from lead page URL"
            />
          </div>
          <div>
            <Label>Comment</Label>
            <Textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={4}
              placeholder="Please revise quotation before sending to client."
            />
          </div>
          {commentMutation.isError && (
            <p className="text-sm text-red-600">{(commentMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
