"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import type { PortalApproval, PortalMessage, Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const KINDS = [
  { key: "design", label: "Design" },
  { key: "video", label: "Video" },
  { key: "document", label: "Document" },
  { key: "deliverable", label: "Deliverable" },
];

export function ClientPortalStaffPanel({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("deliverable");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });
  const clientProjects = projects.filter((p) => p.client_id === clientId);

  const { data: approvals = [] } = useQuery({
    queryKey: ["staff-portal-approvals", clientId],
    queryFn: () => apiFetch<PortalApproval[]>(`/client-portal/approvals?client_id=${clientId}`),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["staff-portal-messages", clientId],
    queryFn: () => apiFetch<PortalMessage[]>(`/client-portal/messages?client_id=${clientId}`),
  });

  const createApproval = useMutation({
    mutationFn: () =>
      apiFetch("/client-portal/approvals", {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          project_id: projectId || null,
          title,
          description: description || null,
          kind,
        }),
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["staff-portal-approvals", clientId] });
    },
  });

  const sendMessage = useMutation({
    mutationFn: () =>
      apiFetch("/client-portal/messages", {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          body: message.trim(),
          project_id: projectId || null,
        }),
      }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["staff-portal-messages", clientId] });
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Request client approval
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Title (e.g. Homepage mockups)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </Select>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="sm:col-span-2">
            <option value="">No project</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
          <Textarea
            className="sm:col-span-2"
            placeholder="Notes for the client…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button
          className="mt-3"
          size="sm"
          disabled={!title.trim() || createApproval.isPending}
          onClick={() => createApproval.mutate()}
        >
          Send for approval
        </Button>
        {approvals.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            {approvals.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-800">{a.title}</span>
                <Badge className="capitalize">{a.status.replace("_", " ")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Portal messages
        </h2>
        <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">No portal messages yet.</p>
          ) : (
            messages.slice(-8).map((m) => (
              <div key={m.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <p className="text-xs text-slate-500">
                  {m.sender_side === "client" ? "Client" : m.sender_name || "Team"} ·{" "}
                  {format(new Date(m.created_at), "dd MMM hh:mm a")}
                </p>
                <p className="text-slate-800">{m.body}</p>
              </div>
            ))
          )}
        </div>
        <Textarea
          placeholder="Reply to the client…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        />
        <Button
          className="mt-2"
          size="sm"
          disabled={!message.trim() || sendMessage.isPending}
          onClick={() => sendMessage.mutate()}
        >
          Send reply
        </Button>
      </section>
    </div>
  );
}
