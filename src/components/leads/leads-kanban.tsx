"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { apiFetch } from "@/lib/api";
import { LEAD_COLUMNS, type Lead, type Member } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { formatCurrency } from "@/lib/utils";
import { Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LeadFormDialog } from "./lead-form-dialog";
import { AIResultModal } from "@/components/ai/ai-result-modal";

function followupLabel(iso: string | null): { text: string; className: string } | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  if (isToday(date)) {
    return {
      text: `Follow-up today · ${format(date, "h:mm a")}`,
      className: "text-amber-600",
    };
  }
  if (isPast(date)) {
    return {
      text: `Follow-up: ${format(date, "dd MMM yyyy")} (overdue)`,
      className: "text-red-600",
    };
  }
  return {
    text: `Follow-up: ${format(date, "dd MMM yyyy, h:mm a")}`,
    className: "text-slate-500",
  };
}

function LeadCard({
  lead,
  memberName,
  onConvert,
  onEdit,
  onDelete,
  onAI,
}: {
  lead: Lead;
  memberName?: string;
  onConvert?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAI: () => void;
}) {
  const followup = followupLabel(lead.next_followup);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/leads/${lead.id}`}
          className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
          onPointerDown={stop}
          onClick={stop}
        >
          {lead.name}
        </Link>
        <div className="flex gap-1">
          <button
            type="button"
            onPointerDown={stop}
            onClick={(e) => { stop(e); onAI(); }}
            className="text-xs text-violet-600 hover:underline"
          >
            AI
          </button>
          <button
            type="button"
            onPointerDown={stop}
            onClick={(e) => { stop(e); onEdit(); }}
            className="text-xs text-indigo-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onPointerDown={stop}
            onClick={(e) => { stop(e); onDelete(); }}
            className="text-xs text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
      {lead.company_name && <p className="text-xs text-slate-500">{lead.company_name}</p>}
      <p className="mt-2 text-sm font-semibold text-indigo-600">{formatCurrency(lead.value)}</p>
      {memberName && (
        <p className="mt-1 text-xs text-slate-500">Owner: {memberName}</p>
      )}
      {followup && <p className={`mt-1 text-xs ${followup.className}`}>{followup.text}</p>}
      {onConvert && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onPointerDown={stop}
          onClick={(e) => {
            stop(e);
            onConvert();
          }}
        >
          Convert to client
        </Button>
      )}
    </div>
  );
}

const STAGE_DOT: Record<string, string> = {
  new: "bg-indigo-500",
  contacted: "bg-sky-500",
  proposal: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
};

function Column({
  status,
  title,
  leads,
  memberMap,
  onConvertLead,
  onEditLead,
  onDeleteLead,
  onAILead,
}: {
  status: string;
  title: string;
  leads: Lead[];
  memberMap: Map<string, string>;
  onConvertLead?: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onAILead: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[440px] w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors ${isOver ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-300" : "border-slate-200 bg-slate-50/70"}`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT[status] ?? "bg-slate-400"}`} />
          {title}
        </h3>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            memberName={lead.assigned_user_id ? memberMap.get(lead.assigned_user_id) : undefined}
            onConvert={status === "won" && onConvertLead ? () => onConvertLead(lead) : undefined}
            onEdit={() => onEditLead(lead)}
            onDelete={() => onDeleteLead(lead)}
            onAI={() => onAILead(lead)}
          />
        ))}
      </div>
    </div>
  );
}

export function LeadsKanban() {
  const queryClient = useQueryClient();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [onlyDueFollowups, setOnlyDueFollowups] = useState(false);
  const [activeStages, setActiveStages] = useState<string[]>(LEAD_COLUMNS.map((col) => col.id));
  const [aiLeadId, setAiLeadId] = useState<string | null>(null);
  const [followupsOpen, setFollowupsOpen] = useState(false);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => apiFetch<Lead[]>("/leads"),
  });
  const { data: members = [] } = useMembers();

  const memberMap = useMemo(
    () => new Map<string, string>((members as Member[]).map((m) => [m.id, m.name])),
    [members],
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<Lead>(`/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/leads/${id}/convert`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(event: DragStartEvent) {
    const lead = event.active.data.current?.lead as Lead | undefined;
    if (lead) setActiveLead(lead);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const lead = event.active.data.current?.lead as Lead | undefined;
    const newStatus = event.over?.id as string | undefined;
    if (!lead || !newStatus || lead.status === newStatus) return;
    updateMutation.mutate({ id: lead.id, status: newStatus });
  }

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = Date.now();
    return leads.filter((l) => {
      if (assigneeFilter && l.assigned_user_id !== assigneeFilter) return false;
      if (!activeStages.includes(l.status)) return false;
      if (onlyDueFollowups) {
        const at = l.next_followup ? new Date(l.next_followup).getTime() : Number.NaN;
        if (!Number.isFinite(at) || at > now) return false;
      }
      if (!term) return true;
      return (
        l.name.toLowerCase().includes(term) ||
        (l.company_name ?? "").toLowerCase().includes(term) ||
        (l.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [leads, search, assigneeFilter, activeStages, onlyDueFollowups]);

  const pipelineValue = useMemo(
    () => filteredLeads.reduce((sum, lead) => sum + Number(lead.value || 0), 0),
    [filteredLeads],
  );

  function toggleStage(stageId: string) {
    setActiveStages((prev) =>
      prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId],
    );
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading pipeline…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="app-page-title">Leads</h1>
          <p className="app-page-subtitle">Pipeline board with draggable stage cards</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setFollowupsOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI follow-ups</span>
            <span className="sm:hidden">AI</span>
          </Button>
          <Button onClick={() => { setEditingLead(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add lead
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Visible leads</p>
          <p className="text-xl font-semibold text-slate-900">{filteredLeads.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Pipeline value</p>
          <p className="text-xl font-semibold text-indigo-700">{formatCurrency(pipelineValue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Due follow-ups</p>
          <p className="text-xl font-semibold text-amber-700">
            {
              filteredLeads.filter((lead) => {
                const ts = lead.next_followup ? new Date(lead.next_followup).getTime() : Number.NaN;
                return Number.isFinite(ts) && ts <= Date.now();
              }).length
            }
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Won deals</p>
          <p className="text-xl font-semibold text-emerald-700">
            {filteredLeads.filter((lead) => lead.status === "won").length}
          </p>
        </div>
      </div>

      {(updateMutation.isError || convertMutation.isError || deleteMutation.isError) && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {((updateMutation.error ?? convertMutation.error ?? deleteMutation.error) as Error).message}
        </p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 lg:w-[280px]">
          <p className="text-sm font-semibold text-slate-800">Filter Leads</p>
          <div className="mt-3 space-y-3">
            <Input
              placeholder="Search name, company, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="">All owners</option>
              {(members as Member[]).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={onlyDueFollowups}
                onChange={(e) => setOnlyDueFollowups(e.target.checked)}
              />
              Show only due follow-ups
            </label>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Stage filter</p>
            <div className="space-y-2">
              {LEAD_COLUMNS.map((col) => (
                <label key={col.id} className="flex cursor-pointer items-center justify-between rounded-md px-1 py-1 text-sm text-slate-700 hover:bg-slate-50">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeStages.includes(col.id)}
                      onChange={() => toggleStage(col.id)}
                    />
                    {col.title}
                  </span>
                  <Badge variant="secondary">
                    {filteredLeads.filter((lead) => lead.status === col.id).length}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {(search || assigneeFilter || onlyDueFollowups || activeStages.length !== LEAD_COLUMNS.length) && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setSearch("");
                setAssigneeFilter("");
                setOnlyDueFollowups(false);
                setActiveStages(LEAD_COLUMNS.map((col) => col.id));
              }}
            >
              Reset filters
            </Button>
          )}
        </aside>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/40 p-3">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {LEAD_COLUMNS.filter((col) => activeStages.includes(col.id)).map((col) => (
                <Column
                  key={col.id}
                  status={col.id}
                  title={col.title}
                  leads={filteredLeads.filter((l) => l.status === col.id)}
                  memberMap={memberMap}
                  onConvertLead={(lead) => convertMutation.mutate(lead.id)}
                  onEditLead={(lead) => { setEditingLead(lead); setFormOpen(true); }}
                  onDeleteLead={(lead) => {
                    if (confirm(`Delete lead "${lead.name}"?`)) deleteMutation.mutate(lead.id);
                  }}
                  onAILead={(lead) => setAiLeadId(lead.id)}
                />
              ))}
            </div>
          </div>
          <DragOverlay>
            {activeLead ? (
              <div className="w-64 rounded-lg border bg-white p-3 shadow-lg">
                <p className="font-medium">{activeLead.name}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <LeadFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingLead(null); }}
        lead={editingLead}
      />

      <AIResultModal
        key={aiLeadId ?? "lead-ai"}
        open={!!aiLeadId}
        onClose={() => setAiLeadId(null)}
        title="Draft follow-up email"
        description="AI-generated email based on lead context"
        streamAction="draft-email"
        body={aiLeadId ? { lead_id: aiLeadId } : {}}
      />

      <AIResultModal
        open={followupsOpen}
        onClose={() => setFollowupsOpen(false)}
        title="Today's follow-up suggestions"
        description="Prioritized actions for your open pipeline"
        streamAction="suggest-followups"
        body={{}}
      />
    </div>
  );
}
