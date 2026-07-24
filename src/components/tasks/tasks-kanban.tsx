"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
} from "@dnd-kit/core";
import Link from "next/link";
import { useMemo, useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { ListTodo } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TASK_COLUMNS, type Project, type Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

const COLUMN_IDS = new Set(TASK_COLUMNS.map((c) => c.id));

/** Prefer column droppables so empty Done/Review columns accept drops reliably. */
const columnPreferringCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    const columnHit = pointerHits.find((c) => COLUMN_IDS.has(String(c.id)));
    return columnHit ? [columnHit] : pointerHits;
  }
  const corners = closestCorners(args);
  const columnHit = corners.find((c) => COLUMN_IDS.has(String(c.id)));
  return columnHit ? [columnHit] : corners;
};

const COLUMN_DOT: Record<string, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-sky-500",
  review: "bg-amber-500",
  done: "bg-emerald-500",
};

const PRIORITY_VARIANT: Record<string, "secondary" | "default" | "warning" | "danger"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "danger",
};

function TaskCard({ task, projectTitle }: { task: Task; projectTitle?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  const overdue = task.due_date && task.status !== "done" && isPast(new Date(task.due_date));
  const dueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <Link
        href={`/tasks/${task.id}`}
        className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {task.title}
      </Link>
      {projectTitle && <p className="mt-1 text-xs text-slate-500">{projectTitle}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant={PRIORITY_VARIANT[task.priority] ?? "secondary"}>{task.priority}</Badge>
        {task.due_date && (
          <span className={`text-xs ${overdue ? "font-medium text-rose-600" : dueToday ? "text-amber-600" : "text-slate-500"}`}>
            {format(new Date(task.due_date), "dd MMM")}
            {overdue ? " · overdue" : dueToday ? " · today" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function Column({
  id,
  title,
  tasks,
  projectMap,
}: {
  id: string;
  title: string;
  tasks: Task[];
  projectMap: Map<string, string>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] w-72 shrink-0 flex-col rounded-2xl border bg-slate-50/80 p-3 ${isOver ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200"}`}
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${COLUMN_DOT[id] ?? "bg-slate-400"}`} />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} projectTitle={projectMap.get(task.project_id)} />
        ))}
      </div>
    </div>
  );
}

export function TasksKanban() {
  const user = useAuthStore((s) => s.user);
  const isEmployee = user?.role === "employee";
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<Task[]>("/tasks"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.title])),
    [projects],
  );

  const byStatus = useMemo(() => {
    const map: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of tasks) {
      (map[task.status] ?? map.todo).push(task);
    }
    return map;
  }, [tasks]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<Task>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previous = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["tasks"], ctx.previous);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === updated.id ? updated : t)),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  function onDragStart(event: DragStartEvent) {
    setActiveTask(event.active.data.current?.task as Task);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const task = event.active.data.current?.task as Task | undefined;
    const overId = event.over?.id as string | undefined;
    if (!task || !overId) return;
    const nextStatus = COLUMN_IDS.has(overId)
      ? overId
      : tasks.find((t) => t.id === overId)?.status;
    if (!nextStatus || nextStatus === task.status) return;
    updateStatus.mutate({ id: task.id, status: nextStatus });
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <ListTodo className="h-6 w-6 text-indigo-600" />
          {isEmployee ? "My Tasks" : "Tasks"}
        </h1>
        <p className="text-sm text-slate-500">
          {isEmployee
            ? "Drag cards across To Do → Done. Only your assigned work."
            : "Team board — drag to update status, open a card for details."}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-600">No tasks assigned yet.</p>
          <p className="mt-1 text-sm text-slate-400">When a manager assigns you work, it shows up here.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={columnPreferringCollision}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {TASK_COLUMNS.map((col) => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={byStatus[col.id] ?? []}
                projectMap={projectMap}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="w-72 rounded-xl border border-indigo-200 bg-white p-3.5 shadow-lg">
                <p className="font-medium text-slate-900">{activeTask.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
