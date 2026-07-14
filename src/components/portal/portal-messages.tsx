"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { PortalMessage, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function PortalMessages() {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["portal-messages"],
    queryFn: () => apiFetch<PortalMessage[]>("/portal/messages"),
    refetchInterval: 15000,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["portal-projects"],
    queryFn: () => apiFetch<Project[]>("/portal/projects"),
  });

  const send = useMutation({
    mutationFn: () =>
      apiFetch("/portal/messages", {
        method: "POST",
        body: JSON.stringify({
          body: body.trim(),
          project_id: projectId || null,
        }),
      }),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["portal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["portal-activity"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <MessageSquare className="h-6 w-6 text-indigo-600" />
          Messages
        </h1>
        <p className="text-sm text-slate-500">Chat with your agency team — internal notes stay private.</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No messages yet. Say hello to your agency team.
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_side === "client";
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      mine
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-900",
                    )}
                  >
                    <p className={cn("mb-1 text-[11px]", mine ? "text-indigo-100" : "text-slate-500")}>
                      {mine ? "You" : m.sender_name || "Agency"}
                      {m.project_title ? ` · ${m.project_title}` : ""}
                      {" · "}
                      {format(new Date(m.created_at), "dd MMM · hh:mm a")}
                    </p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="border-t border-slate-200 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            send.mutate();
          }}
        >
          <div className="mb-2">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">General (no project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>
          <Textarea
            placeholder="Write a message to your agency…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
          />
          <Button type="submit" className="mt-2" disabled={!body.trim() || send.isPending}>
            {send.isPending ? "Sending…" : "Send message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
