"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type { PortalFile, PortalProjectDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function downloadFile(file: PortalFile) {
  const blob = await apiBlob(`/portal/files/${file.id}/download`);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PortalProjectDetailView({ projectId }: { projectId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal-project", projectId],
    queryFn: () => apiFetch<PortalProjectDetail>(`/portal/projects/${projectId}`),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading project…</p>;
  if (isError || !data) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-slate-600">Project not found.</p>
        <Button asChild className="mt-4"><Link href="/portal/projects">Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/projects"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
          <p className="text-sm capitalize text-slate-500">{data.status}</p>
        </div>
        <Badge className="ml-auto">{data.progress_percent}% complete</Badge>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{data.task_done}/{data.task_total} tasks</span>
          <span>{data.progress_percent}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${data.progress_percent}%` }}
          />
        </div>
      </div>

      {data.description && (
        <p className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
          {data.description}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Milestones</h2>
          {data.milestones.length === 0 ? (
            <p className="text-sm text-slate-500">No milestones published yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.milestones.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.title}</p>
                    {m.due_date && (
                      <p className="text-xs text-slate-500">{format(new Date(m.due_date), "dd MMM yyyy")}</p>
                    )}
                  </div>
                  <Badge variant={m.status === "completed" ? "success" : "secondary"} className="capitalize">
                    {m.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Deliverables / Approvals</h2>
          {data.approvals.length === 0 ? (
            <p className="text-sm text-slate-500">No deliverables awaiting review.</p>
          ) : (
            <ul className="space-y-2">
              {data.approvals.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.kind_label}</p>
                  </div>
                  <Badge className="capitalize">{a.status.replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/portal/approvals">Open approvals</Link>
          </Button>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Tasks</h2>
        {data.tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks visible yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.tasks.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2.5">
                <div>
                  <p className="font-medium text-slate-900">{t.title}</p>
                  {t.due_date && (
                    <p className="text-xs text-slate-500">Due {format(new Date(t.due_date), "dd MMM")}</p>
                  )}
                </div>
                <Badge variant="secondary" className="capitalize">{t.status.replace("_", " ")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Files</h2>
        {data.files.length === 0 ? (
          <p className="text-sm text-slate-500">No files shared on this project yet.</p>
        ) : (
          <ul className="space-y-2">
            {data.files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{f.filename}</p>
                    <p className="text-xs text-slate-500">
                      {f.folder_label} · {formatSize(f.size)}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadFile(f)}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
