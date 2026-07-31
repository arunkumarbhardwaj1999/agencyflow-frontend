"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Member, Project, Task } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectDocuments } from "./project-documents";
import Link from "next/link";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const statusColors: Record<string, "default" | "secondary" | "success" | "warning"> = {
  planning: "secondary",
  active: "default",
  review: "warning",
  completed: "success",
};

export function EmployeeProjectsPanel() {
  const [search, setSearch] = useState("");
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<Task[]>("/tasks"),
  });
  const { data: members = [] } = useMembers();

  const teamByProject = useMemo(() => {
    const map = new Map<string, string[]>();
    const nameById = new Map((members as Member[]).map((m) => [m.id, m.name]));
    for (const task of tasks) {
      if (!task.assigned_to) continue;
      const name = nameById.get(task.assigned_to);
      if (!name) continue;
      const list = map.get(task.project_id) ?? [];
      if (!list.includes(name)) list.push(name);
      map.set(task.project_id, list);
    }
    return map;
  }, [tasks, members]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.description ?? "").toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term),
    );
  }, [projects, search]);
  const pagination = useClientPagination(filteredProjects, { resetKey: search });

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">Only projects where you have assigned work.</p>

      <div className="mb-4">
        <Input
          placeholder="Search my projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading projects…</p>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-600">{projects.length === 0 ? "No assigned projects yet." : "No projects match your search."}</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pagination.pageItems.map((p) => {
            const team = teamByProject.get(p.id) ?? [];
            return (
              <article
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-1 text-xs capitalize text-slate-500">{p.status}</p>
                  </div>
                  <Badge variant={statusColors[p.status] ?? "secondary"}>{p.status}</Badge>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Progress · {p.task_done}/{p.task_total} tasks</span>
                    <span>{p.progress_percent}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${p.progress_percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                  {p.end_date && (
                    <span className="rounded-lg bg-slate-50 px-2.5 py-1">
                      Deadline {format(new Date(p.end_date), "dd MMM yyyy")}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1">
                    <Users className="h-3.5 w-3.5" />
                    {team.length > 0 ? team.slice(0, 3).join(", ") : "Just you"}
                    {team.length > 3 ? ` +${team.length - 3}` : ""}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Files</p>
                  <ProjectDocuments projectId={p.id} />
                </div>

                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={`/projects/${p.id}`}>Open project</Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.pageSize}
        from={pagination.from}
        to={pagination.to}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        className="mt-4 rounded-xl border border-slate-100"
      />
    </div>
  );
}
