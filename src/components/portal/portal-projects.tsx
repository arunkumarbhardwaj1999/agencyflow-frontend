"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FolderKanban } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PortalProjects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["portal-projects"],
    queryFn: () => apiFetch<Project[]>("/portal/projects"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <FolderKanban className="h-6 w-6 text-indigo-600" />
          Projects
        </h1>
        <p className="text-sm text-slate-500">Progress, milestones, deliverables, and files for your work.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No projects yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
                  {p.end_date && (
                    <p className="mt-1 text-xs text-slate-500">
                      Deadline {format(new Date(p.end_date), "dd MMM yyyy")}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="capitalize">{p.status}</Badge>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>
                    {p.task_done}/{p.task_total} tasks
                  </span>
                  <span>{p.progress_percent}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${p.progress_percent}%` }}
                  />
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={`/portal/projects/${p.id}`}>Open project</Link>
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
