"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import type { Client, Project, Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const projectSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "review", "completed"]),
  budget: z.number().min(0),
});

const taskSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in_progress", "review", "done"]),
});

const statusColors: Record<string, "default" | "secondary" | "success" | "warning"> = {
  planning: "secondary",
  active: "default",
  review: "warning",
  completed: "success",
};

export function ProjectsPanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: "planning", budget: 0 },
  });

  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "medium", status: "todo" },
  });

  const createProject = useMutation({
    mutationFn: (body: z.infer<typeof projectSchema>) =>
      apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      projectForm.reset({ status: "planning", budget: 0 });
    },
  });

  const createTask = useMutation({
    mutationFn: (body: z.infer<typeof taskSchema>) =>
      apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "projects"] });
      taskForm.reset();
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", "projects"] }),
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Projects & Tasks</h1>
        <p className="text-sm text-slate-500">Track delivery workloads</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={projectForm.handleSubmit((d) => createProject.mutate(d))}
            className="grid gap-3 sm:grid-cols-2"
          >
            <div>
              <Label>Client *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                {...projectForm.register("client_id")}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input {...projectForm.register("title")} />
            </div>
            <div>
              <Label>Status</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...projectForm.register("status")}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <Label>Budget (₹)</Label>
              <Input type="number" {...projectForm.register("budget")} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea {...projectForm.register("description")} />
            </div>
            <Button type="submit" disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {projects.map((p) => {
          const projectTasks = tasks.filter((t) => t.project_id === p.id);
          const expanded = expandedId === p.id;
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>{p.title}</CardTitle>
                    <CardDescription>{formatCurrency(p.budget)} budget</CardDescription>
                  </div>
                  <Badge variant={statusColors[p.status] ?? "secondary"}>{p.status}</Badge>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{p.progress_percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
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
                      className="flex flex-wrap gap-2"
                      onSubmit={taskForm.handleSubmit((d) => {
                        taskForm.setValue("project_id", p.id);
                        createTask.mutate({ ...d, project_id: p.id });
                      })}
                    >
                      <Input placeholder="Task title" className="max-w-xs" {...taskForm.register("title")} />
                      <select className="h-10 rounded-md border px-2 text-sm" {...taskForm.register("priority")}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <Button type="submit" size="sm">
                        Add Task
                      </Button>
                    </form>
                    <ul className="space-y-2">
                      {projectTasks.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span>{t.title}</span>
                          <select
                            className="rounded border px-2 py-1 text-xs"
                            value={t.status}
                            onChange={(e) => updateTask.mutate({ id: t.id, status: e.target.value })}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
