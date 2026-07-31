"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { apiBlob, apiFetch, apiUpload } from "@/lib/api";
import type { DocumentMeta, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ManagerDocumentsPanel() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [projectId, setProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<Project[]>("/projects"),
  });
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", "all"],
    queryFn: () => apiFetch<DocumentMeta[]>("/files/documents"),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p.title])),
    [projects],
  );

  const filteredDocs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return docs;
    return docs.filter((doc) => {
      const projectTitle = doc.project_id ? projectMap.get(doc.project_id) ?? "" : "";
      return (
        doc.filename.toLowerCase().includes(term) ||
        projectTitle.toLowerCase().includes(term)
      );
    });
  }, [docs, search, projectMap]);
  const pagination = useClientPagination(filteredDocs, { resetKey: search });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      if (projectId) fd.append("project_id", projectId);
      return apiUpload<DocumentMeta>("/files/documents", fd);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err) => setError((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/files/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  async function download(doc: DocumentMeta) {
    const blob = await apiBlob(`/files/documents/${doc.id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Upload</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">Project</label>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMutation.mutate(file);
              e.target.value = "";
            }}
          />
          <Button
            className="gap-2"
            disabled={!projectId || uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? "Uploading…" : "Upload file"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">All files</h2>
          <Input
            className="sm:max-w-xs"
            placeholder="Search files by name or project…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : filteredDocs.length === 0 ? (
          <p className="text-sm text-slate-500">{docs.length === 0 ? "No documents yet." : "No files match your search."}</p>
        ) : (
          <ul className="space-y-2">
            {pagination.pageItems.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2.5"
              >
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 text-indigo-500" />
                  <div>
                    <p className="font-medium text-slate-900">{doc.filename}</p>
                    <p className="text-xs text-slate-500">
                      {doc.project_id ? (
                        <Link
                          href={`/projects/${doc.project_id}`}
                          className="hover:text-indigo-600 hover:underline"
                        >
                          {projectMap.get(doc.project_id) ?? "Project"}
                        </Link>
                      ) : (
                        "Unassigned"
                      )}
                      {" · "}
                      {formatSize(doc.size)}
                      {" · "}
                      {format(new Date(doc.created_at), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => download(doc)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Delete ${doc.filename}?`)) deleteMutation.mutate(doc.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
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
          className="mt-3 rounded-xl border border-slate-100"
        />
      </section>
    </div>
  );
}
