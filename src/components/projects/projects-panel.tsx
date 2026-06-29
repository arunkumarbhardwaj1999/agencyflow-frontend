"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, isPast } from "date-fns";
import { apiFetch } from "@/lib/api";
import type { Client, Member, Project, Task } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

const projectSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "review", "completed"]),
  budget: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
});

const statusColors: Record<string, "default" | "secondary" | "success" | "warning"> = {
  planning: "secondary",
  active: "default",
  review: "warning",
  completed: "success",
};

const priorityColors: Record<string, "default" | "secondary" | "success" | "warning" | "danger"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  urgent: "danger",
};

const PROJECT_STATUSES = ["planning", "active", "review", "completed"] as const;

export function ProjectsPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/clients"),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<Task[]>("/tasks"),
  });
  const { data: members = [] } = useMembers();
  const memberMap = useMemo(
    () => new Map<string, string>((members as Member[]).map((m) => [m.id, m.name])),
    [members],
  );

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: "planning", budget: "0" },
  });

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium", status: "todo" },
  });

  const createProject = useMutation({
    mutationFn: (body: z.infer<typeof projectSchema>) =>
      apiFetch<Project>("/projects", {
        method: "POST",
        body: JSON.stringify({ ...body, budget: parseFloat(body.budget || "0") || 0 }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      projectForm.reset({ status: "planning", budget: "0" });
      setShowProjectModal(false);
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) =>
      apiFetch<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => apiFetch(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const createTask = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      taskForm.reset({ priority: "medium", status: "todo" });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      apiFetch<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiFetch(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects &amp; tasks</h1>
          <p className="text-sm text-slate-500">Track delivery workloads</p>
        </div>
        <Button onClick={() => setShowProjectModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <Modal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="New project"
        description="Spin up a delivery project for a client"
        icon={FolderKanban}
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowProjectModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="project-form" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </>
        }
      >
        <form
          id="project-form"
          onSubmit={projectForm.handleSubmit((d) => createProject.mutate(d))}
          className="grid gap-4 py-2 sm:grid-cols-2"
        >
          <div>
            <Label>Client *</Label>
            <Select {...projectForm.register("client_id")}>
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Title *</Label>
            <Input {...projectForm.register("title")} />
          </div>
          <div>
            <Label>Status</Label>
            <Select {...projectForm.register("status")}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
          <div>
            <Label>Budget (₹)</Label>
            <Input type="number" {...projectForm.register("budget")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea {...projectForm.register("description")} />
          </div>
        </form>
      </Modal>

      <div className="grid gap-4">
        {projects.map((p) => {
          const projectTasks = tasks.filter((t) => t.project_id === p.id);
          const expanded = expandedId === p.id;
          return (
            <Reveal key={p.id}>
            <Card hover>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>{p.title}</CardTitle>
                    <CardDescription>{formatCurrency(p.budget)} budget</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[p.status] ?? "secondary"}>{p.status}</Badge>
                    <select
                      className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      value={p.status}
                      onChange={(e) => updateProject.mutate({ id: p.id, patch: { status: e.target.value } })}
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete project "${p.title}" and its tasks?`)) deleteProject.mutate(p.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Progress · {p.task_done}/{p.task_total} tasks</span>
                    <span>{p.progress_percent}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                      style={{ width: `${p.progress_percent}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" onClick={() => setExpandedId(expanded ? null : p.id)}>
                  {expanded ? "Hide tasks" : `Tasks (${projectTasks.length})`}
                </Button>
                {expanded && (
                  <div className="mt-4 space-y-3">
                    <form
                      className="grid gap-2 sm:grid-cols-2"
                      onSubmit={taskForm.handleSubmit((d) => {
                        createTask.mutate({
                          project_id: p.id,
                          title: d.title,
                          priority: d.priority,
                          status: d.status,
                          due_date: d.due_date ? new Date(d.due_date).toISOString() : null,
                          assigned_to: d.assigned_to || null,
                        });
                      })}
                    >
                      <Input placeholder="Task title" {...taskForm.register("title")} />
                      <Select {...taskForm.register("priority")}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                      <Input type="datetime-local" {...taskForm.register("due_date")} />
                      <Select {...taskForm.register("assigned_to")}>
                        <option value="">Unassigned</option>
                        {(members as Member[]).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" size="sm" className="sm:col-span-2">
                        Add Task
                      </Button>
                    </form>
                    <ul className="space-y-2">
                      {projectTasks.map((t) => {
                        const overdue = t.due_date && t.status !== "done" && isPast(new Date(t.due_date));
                        return (
                          <li
                            key={t.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-800">{t.title}</span>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <Badge variant={priorityColors[t.priority] ?? "secondary"}>{t.priority}</Badge>
                                {t.due_date && (
                                  <span className={overdue ? "text-red-600" : ""}>
                                    Due {format(new Date(t.due_date), "dd MMM")}
                                    {overdue ? " (overdue)" : ""}
                                  </span>
                                )}
                                {t.assigned_to && <span>· {memberMap.get(t.assigned_to) ?? "Assigned"}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                                value={t.status}
                                onChange={(e) => updateTask.mutate({ id: t.id, patch: { status: e.target.value } })}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Delete this task?")) deleteTask.mutate(t.id);
                                }}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        );
                      })}
                      {projectTasks.length === 0 && (
                        <li className="text-xs text-slate-400">No tasks yet.</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            </Reveal>
          );
        })}
        {projects.length === 0 && <p className="text-sm text-slate-500">No projects yet.</p>}
      </div>
    </div>
  );
}
