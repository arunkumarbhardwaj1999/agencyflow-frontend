"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { apiBlob, apiFetch, apiUpload } from "@/lib/api";
import type { DocumentMeta } from "@/lib/types";
import { Button } from "@/components/ui/button";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const queryKey = ["documents", projectId];
  const { data: docs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => apiFetch<DocumentMeta[]>(`/files/documents?project_id=${projectId}`),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("project_id", projectId);
      return apiUpload<DocumentMeta>("/files/documents", fd);
    },
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => setError((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/files/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function download(doc: DocumentMeta) {
    const blob = await apiBlob(`/files/documents/${doc.id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Documents</h4>
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
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Upload className="h-3.5 w-3.5" />
          {uploadMutation.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {error && <p className="mb-2 text-xs text-rose-500">{error}</p>}

      {isLoading && <p className="text-xs text-slate-400">Loading…</p>}
      {!isLoading && docs.length === 0 && (
        <p className="text-xs text-slate-400">No documents yet. Upload contracts, briefs, or assets.</p>
      )}

      <ul className="space-y-2">
        {docs.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="truncate font-medium text-slate-800">{doc.filename}</span>
              <span className="shrink-0 text-xs text-slate-400">{formatSize(doc.size)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => download(doc)}
                className="rounded p-1.5 text-slate-500 transition hover:bg-white hover:text-indigo-600"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${doc.filename}"?`)) deleteMutation.mutate(doc.id);
                }}
                className="rounded p-1.5 text-slate-500 transition hover:bg-white hover:text-rose-500"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
