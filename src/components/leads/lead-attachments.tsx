"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { apiBlob, apiFetch, apiUpload } from "@/lib/api";
import type { LeadAttachment } from "@/lib/types";
import { askConfirm } from "@/stores/confirm-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return ImageIcon;
  return FileText;
}

export function LeadAttachments({ leadId, onChanged }: { leadId: string; onChanged?: () => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [renaming, setRenaming] = useState<LeadAttachment | null>(null);
  const [newName, setNewName] = useState("");
  const [preview, setPreview] = useState<{ name: string; url: string; type: string } | null>(null);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["lead-attachments", leadId],
    queryFn: () => apiFetch<LeadAttachment[]>(`/leads/${leadId}/attachments`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lead-attachments", leadId] });
    queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
    onChanged?.();
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiUpload<LeadAttachment>(`/leads/${leadId}/attachments`, form);
    },
    onSuccess: invalidate,
  });

  const renameMutation = useMutation({
    mutationFn: () =>
      apiFetch<LeadAttachment>(`/leads/${leadId}/attachments/${renaming!.id}`, {
        method: "PATCH",
        body: JSON.stringify({ filename: newName.trim() }),
      }),
    onSuccess: () => {
      setRenaming(null);
      setNewName("");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) =>
      apiFetch(`/leads/${leadId}/attachments/${docId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      list.forEach((file) => uploadMutation.mutate(file));
    },
    [uploadMutation],
  );

  async function handleDownload(att: LeadAttachment) {
    const blob = await apiBlob(`/leads/${leadId}/attachments/${att.id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePreview(att: LeadAttachment) {
    if (!att.is_previewable) return;
    const blob = await apiBlob(`/leads/${leadId}/attachments/${att.id}/preview`);
    const url = URL.createObjectURL(blob);
    setPreview({ name: att.filename, url, type: att.content_type });
  }

  return (
    <div>
      <div
        className={`mb-4 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">Drag & drop files here</p>
        <p className="mt-1 text-xs text-slate-500">PDFs, images, proposals — or</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => fileRef.current?.click()}
          disabled={uploadMutation.isPending}
        >
          <Upload className="mr-1 h-4 w-4" />
          Upload file
        </Button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploadMutation.isPending && (
        <p className="mb-3 text-xs text-indigo-600">Uploading…</p>
      )}
      {uploadMutation.isError && (
        <p className="mb-3 text-xs text-red-600">{(uploadMutation.error as Error).message}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading attachments…</p>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-slate-500">No files yet. Upload proposals, quotations, or reference images.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => {
            const Icon = fileIcon(att.content_type);
            return (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{att.filename}</p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(att.size)}
                    {att.uploaded_by_name && ` · ${att.uploaded_by_name}`}
                    {" · "}
                    {format(new Date(att.uploaded_at), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {att.is_previewable && (
                    <Button size="sm" variant="ghost" onClick={() => handlePreview(att)} title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(att)} title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRenaming(att);
                      setNewName(att.filename);
                    }}
                    title="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      void (async () => {
                        const ok = await askConfirm({
                          title: "Delete attachment?",
                          description: `Delete “${att.filename}”? This cannot be undone.`,
                          confirmLabel: "Delete",
                          variant: "danger",
                        });
                        if (ok) deleteMutation.mutate(att.id);
                      })();
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename file"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenaming(null)}>Cancel</Button>
            <Button
              disabled={!newName.trim() || renameMutation.isPending}
              onClick={() => renameMutation.mutate()}
            >
              {renameMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
      </Modal>

      <Modal
        open={Boolean(preview)}
        onClose={() => {
          if (preview?.url) URL.revokeObjectURL(preview.url);
          setPreview(null);
        }}
        title={preview?.name ?? "Preview"}
        size="lg"
      >
        {preview && (
          <div className="max-h-[70vh] overflow-auto">
            {preview.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt={preview.name} className="mx-auto max-h-[65vh] rounded-lg" />
            ) : (
              <iframe src={preview.url} title={preview.name} className="h-[65vh] w-full rounded-lg border" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
