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
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { LEAD_COLUMNS, type Lead } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadFormDialog } from "./lead-form-dialog";

function LeadCard({ lead, onConvert }: { lead: Lead; onConvert?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <p className="font-medium text-slate-900">{lead.name}</p>
      {lead.company_name && <p className="text-xs text-slate-500">{lead.company_name}</p>}
      <p className="mt-2 text-sm font-semibold text-indigo-600">{formatCurrency(lead.value)}</p>
      {onConvert && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 w-full"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onConvert();
          }}
        >
          Convert to client
        </Button>
      )}
    </div>
  );
}

function Column({
  status,
  title,
  leads,
  onConvertLead,
}: {
  status: string;
  title: string;
  leads: Lead[];
  onConvertLead?: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] w-72 shrink-0 flex-col rounded-xl border bg-slate-100/80 p-3 ${isOver ? "ring-2 ring-indigo-400" : "border-slate-200"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onConvert={status === "won" && onConvertLead ? () => onConvertLead(lead) : undefined}
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

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => apiFetch<Lead[]>("/leads"),
  });

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

  if (isLoading) return <p className="text-sm text-slate-500">Loading pipeline…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-sm text-slate-500">Drag leads across stages</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>Add Lead</Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_COLUMNS.map((col) => (
            <Column
              key={col.id}
              status={col.id}
              title={col.title}
              leads={leads.filter((l) => l.status === col.id)}
              onConvertLead={(lead) => convertMutation.mutate(lead.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? (
            <div className="w-64 rounded-lg border bg-white p-3 shadow-lg">
              <p className="font-medium">{activeLead.name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
