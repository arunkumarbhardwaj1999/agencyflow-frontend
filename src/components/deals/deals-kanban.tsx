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
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DEAL_STAGES, type Deal, type DealKanbanBoard, type Member } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KanbanColumnScroll } from "@/components/ui/kanban-column-scroll";
import { DealFormDialog } from "./deal-form-dialog";

const STAGE_DOT: Record<string, string> = {
  qualification: "bg-indigo-500",
  proposal_sent: "bg-sky-500",
  negotiation: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-rose-500",
};

function DealCard({
  deal,
  memberName,
  onEdit,
  onDelete,
  onWin,
}: {
  deal: Deal;
  memberName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onWin?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
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
          href={`/deals/${deal.id}`}
          className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
          onPointerDown={stop}
          onClick={stop}
        >
          {deal.title}
        </Link>
        <div className="flex gap-1">
          <button
            type="button"
            onPointerDown={stop}
            onClick={(e) => { stop(e); onEdit(); }}
            className="text-xs text-indigo-600 hover:underline"
          >
            Edit
          </button>
          {deal.status !== "won" && deal.status !== "lost" && (
            <button
              type="button"
              onPointerDown={stop}
              onClick={(e) => { stop(e); onDelete(); }}
              className="text-xs text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      {deal.company_name && <p className="text-xs text-slate-500">{deal.company_name}</p>}
      <p className="mt-2 text-sm font-semibold text-indigo-600">{formatCurrency(deal.value)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{deal.probability}%</Badge>
        {deal.expected_close_date && (
          <span className="text-xs text-slate-500">
            Close {format(new Date(deal.expected_close_date), "dd MMM")}
          </span>
        )}
      </div>
      {memberName && <p className="mt-1 text-xs text-slate-500">Assigned to: {memberName}</p>}
      {onWin && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2 w-full gap-1"
          onPointerDown={stop}
          onClick={(e) => { stop(e); onWin(); }}
        >
          <Trophy className="h-3.5 w-3.5" />
          Win deal
        </Button>
      )}
    </div>
  );
}

function Column({
  stage,
  title,
  deals,
  memberMap,
  onEditDeal,
  onDeleteDeal,
  onWinDeal,
}: {
  stage: string;
  title: string;
  deals: Deal[];
  memberMap: Map<string, string>;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onWinDeal?: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[440px] w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors ${isOver ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-300" : "border-slate-200 bg-slate-50/70"}`}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT[stage] ?? "bg-slate-400"}`} />
          {title}
        </h3>
        <Badge variant="secondary">{deals.length}</Badge>
      </div>
      <KanbanColumnScroll
        itemCount={deals.length}
        resetKey={`${stage}:${deals.map((d) => d.id).join(",")}`}
      >
        {(visibleCount) =>
          deals.slice(0, visibleCount).map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              memberName={deal.assigned_user_id ? memberMap.get(deal.assigned_user_id) : undefined}
              onEdit={() => onEditDeal(deal)}
              onDelete={() => onDeleteDeal(deal)}
              onWin={
                stage === "negotiation" && onWinDeal
                  ? () => onWinDeal(deal)
                  : undefined
              }
            />
          ))
        }
      </KanbanColumnScroll>
    </div>
  );
}

export function DealsKanban() {
  const queryClient = useQueryClient();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [activeStages, setActiveStages] = useState<string[]>(DEAL_STAGES.map((c) => c.id));

  const { data: board, isLoading } = useQuery({
    queryKey: ["deals-kanban"],
    queryFn: () => apiFetch<DealKanbanBoard>("/deals/kanban"),
  });

  const { data: members = [] } = useMembers();
  const memberMap = useMemo(
    () => new Map<string, string>((members as Member[]).map((m) => [m.id, m.name])),
    [members],
  );

  const allDeals = useMemo(
    () => board?.columns.flatMap((col) => col.deals) ?? [],
    [board],
  );

  const moveMutation = useMutation({
    mutationFn: ({ id, status, kanban_position }: { id: string; status: string; kanban_position: number }) =>
      apiFetch<Deal>(`/deals/${id}/kanban`, {
        method: "PATCH",
        body: JSON.stringify({ status, kanban_position }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals-kanban"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const winMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/deals/${id}/win`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals-kanban"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/deals/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals-kanban"] }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(event: DragStartEvent) {
    const deal = event.active.data.current?.deal as Deal | undefined;
    if (deal) setActiveDeal(deal);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const deal = event.active.data.current?.deal as Deal | undefined;
    const newStage = event.over?.id as string | undefined;
    if (!deal || !newStage || deal.status === newStage) return;

    const targetCol = board?.columns.find((c) => c.stage === newStage);
    const position = targetCol?.deals.length ?? 0;
    moveMutation.mutate({ id: deal.id, status: newStage, kanban_position: position });
  }

  const filteredColumns = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!board) return [];
    return board.columns.map((col) => ({
      ...col,
      deals: col.deals.filter((d) => {
        if (!activeStages.includes(col.stage)) return false;
        if (assigneeFilter && d.assigned_user_id !== assigneeFilter) return false;
        if (!term) return true;
        return (
          d.title.toLowerCase().includes(term) ||
          (d.company_name ?? "").toLowerCase().includes(term) ||
          (d.contact_email ?? "").toLowerCase().includes(term)
        );
      }),
    }));
  }, [board, search, assigneeFilter, activeStages]);

  function toggleStage(stageId: string) {
    setActiveStages((prev) =>
      prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId],
    );
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading deals pipeline…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <Button onClick={() => { setEditingDeal(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          New deal
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Open deals</p>
          <p className="text-xl font-semibold text-slate-900">{board?.open_deal_count ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Pipeline value</p>
          <p className="text-xl font-semibold text-indigo-700">
            {formatCurrency(board?.total_pipeline_value ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Won</p>
          <p className="text-xl font-semibold text-emerald-700">
            {allDeals.filter((d) => d.status === "won").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Lost</p>
          <p className="text-xl font-semibold text-rose-700">
            {allDeals.filter((d) => d.status === "lost").length}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Input
            className="w-full lg:max-w-xs"
            placeholder="Search title, company, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="w-full lg:w-48"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All assignees</option>
            {(members as Member[]).map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            {DEAL_STAGES.map((col) => {
              const active = activeStages.includes(col.id);
              const count = filteredColumns.find((c) => c.stage === col.id)?.deals.length ?? 0;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => toggleStage(col.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {col.title}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{count}</span>
                </button>
              );
            })}
            {(search || assigneeFilter || activeStages.length !== DEAL_STAGES.length) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setAssigneeFilter("");
                  setActiveStages(DEAL_STAGES.map((col) => col.id));
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {(moveMutation.isError || winMutation.isError || deleteMutation.isError) && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {((moveMutation.error ?? winMutation.error ?? deleteMutation.error) as Error).message}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/40 p-3">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {filteredColumns
              .filter((col) => activeStages.includes(col.stage))
              .map((col) => (
                <Column
                  key={col.stage}
                  stage={col.stage}
                  title={col.label}
                  deals={col.deals}
                  memberMap={memberMap}
                  onEditDeal={(deal) => { setEditingDeal(deal); setFormOpen(true); }}
                  onDeleteDeal={(deal) => {
                    if (confirm(`Delete deal "${deal.title}"?`)) deleteMutation.mutate(deal.id);
                  }}
                  onWinDeal={(deal) => {
                    if (confirm(`Mark "${deal.title}" as won and create client?`)) {
                      winMutation.mutate(deal.id);
                    }
                  }}
                />
              ))}
          </div>
        </div>
        <DragOverlay>
          {activeDeal ? (
            <div className="w-64 rounded-lg border bg-white p-3 shadow-lg">
              <p className="font-medium">{activeDeal.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealFormDialog
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingDeal(null); }}
        deal={editingDeal}
      />
    </div>
  );
}
