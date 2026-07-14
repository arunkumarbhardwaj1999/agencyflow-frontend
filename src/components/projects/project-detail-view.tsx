"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Record360View } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Record360Panel } from "@/components/record-360/record-360-panel";
import { ProjectDocuments } from "@/components/projects/project-documents";
import { ProjectExpenses } from "@/components/expenses/project-expenses";
import { ProjectTimeSummaryCard } from "@/components/time/project-time-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ProjectEntity = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  progress_percent: number;
  task_total: number;
  task_done: number;
};

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const user = useAuthStore((s) => s.user);
  const isEmployee = user?.role === "employee";
  const canSeeFinance = !isEmployee;

  const { data: view, isLoading, isError } = useQuery({
    queryKey: ["record-360", "project", projectId],
    queryFn: () => apiFetch<Record360View>(`/records/project/${projectId}`),
  });

  const entity = view?.entity as ProjectEntity | undefined;

  if (isLoading) return <p className="text-sm text-slate-500">Loading project…</p>;

  if (isError || !entity) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Project not found.</p>
        <Button asChild className="mt-4"><Link href="/projects">Back to projects</Link></Button>
      </div>
    );
  }

  const visibleTasks = isEmployee
    ? (view?.tasks ?? []).filter((t) => t.assigned_to === user?.id)
    : (view?.tasks ?? []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/projects"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{entity.title}</h1>
          {canSeeFinance ? (
            <p className="text-sm text-slate-500">{formatCurrency(entity.budget)} budget</p>
          ) : (
            <p className="text-sm text-slate-500">Assigned project · tasks &amp; files only</p>
          )}
        </div>
        <Badge className="ml-auto">{entity.status}</Badge>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{entity.task_done}/{entity.task_total} tasks</span>
          <span>{entity.progress_percent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${entity.progress_percent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Project details</h2>
            <dl className="space-y-3 text-sm">
              {entity.start_date && (
                <div>
                  <dt className="text-slate-500">Start</dt>
                  <dd>{format(new Date(entity.start_date), "dd MMM yyyy")}</dd>
                </div>
              )}
              {entity.end_date && (
                <div>
                  <dt className="text-slate-500">Deadline</dt>
                  <dd>{format(new Date(entity.end_date), "dd MMM yyyy")}</dd>
                </div>
              )}
            </dl>
            {entity.description && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{entity.description}</p>
            )}
          </section>

          <Record360Panel
            entityType="project"
            entityId={projectId}
            sections={
              isEmployee
                ? ["tasks", "internal_comments"]
                : ["insights", "related", "tasks", "internal_comments"]
            }
          />
        </div>

        <div className="space-y-6">
          {!isEmployee && <ProjectTimeSummaryCard projectId={projectId} />}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {isEmployee ? "My tasks" : "Tasks"}
            </h2>
            {visibleTasks.length > 0 ? (
              <ul className="space-y-2">
                {visibleTasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">{t.title}</span>
                      <span className="text-xs text-slate-500">{t.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No tasks on this project yet.</p>
            )}
          </section>

          {canSeeFinance && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Expenses & profit</h2>
              <ProjectExpenses projectId={projectId} />
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Documents</h2>
            <ProjectDocuments projectId={projectId} />
          </section>

          {canSeeFinance && view?.related.clients[0] && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Client</h2>
              <Link
                href={`/clients/${view.related.clients[0].id}`}
                className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{view.related.clients[0].business_name}</p>
                <p className="text-xs text-slate-500">{view.related.clients[0].email}</p>
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
