"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Eye, FileText, Image as ImageIcon, Pencil, Trash2, Upload } from "lucide-react";
import { apiBlob, apiFetch, apiUpload } from "@/lib/api";
import type { DealAttachment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DealAttachments({
  dealId,
  proposalOnly = false,
  onChanged,
}: {
  dealId: string;
  proposalOnly?: boolean;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [renaming, setRenaming] = useState<DealAttachment | null>(null);
  const [newName, setNewName] = useState("");
  const [preview, setPreview] = useState<{ name: string; url: string; type: string } | null>(null);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["deal-attachments", dealId],
    queryFn: () => apiFetch<DealAttachment[]>(`/deals/${dealId}/attachments`),
  });

  const filtered = proposalOnly ? attachments.filter((a) => a.is_proposal) : attachments;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["deal-attachments", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal-timeline", dealId] });
    queryClient.invalidateQueries({ queryKey: ["deal", dealId] });
    onChanged?.();
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const qs = proposalOnly || file.name.toLowerCase().includes("proposal") ? "?is_proposal=true" : "";
      return apiUpload<DealAttachment>(`/deals/${dealId}/attachments${qs}`, form);
    },
    onSuccess: invalidate,
  });

  const renameMutation = useMutation({
    mutationFn: () =>
      apiFetch<DealAttachment>(`/deals/${dealId}/attachments/${renaming!.id}`, {
        method: "PATCH",
        body: JSON.stringify({ filename: newName.trim() }),
      }),
    onSuccess: () => { setRenaming(null); invalidate(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => apiFetch(`/deals/${dealId}/attachments/${docId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const uploadFiles = useCallback(
    (files: FileList | File[]) => Array.from(files).forEach((f) => uploadMutation.mutate(f)),
    [uploadMutation],
  );

  async function handleDownload(att: DealAttachment) {
    const blob = await apiBlob(`/deals/${dealId}/attachments/${att.id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePreview(att: DealAttachment) {
    if (!att.is_previewable) return;
    const blob = await apiBlob(`/deals/${dealId}/attachments/${att.id}/preview`);
    setPreview({ name: att.filename, url: URL.createObjectURL(blob), type: att.content_type });
  }

  return (
    <div>
      <div
        className={`mb-4 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50/60"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
      >
        <Upload className="mx-auto mb-2 h-7 w-7 text-slate-400" />
        <p className="text-sm text-slate-600">{proposalOnly ? "Upload proposal PDF" : "Drag & drop files"}</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => fileRef.current?.click()} disabled={uploadMutation.isPending}>
          Upload file
        </Button>
        <input ref={fileRef} type="file" className="hidden" multiple onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No files yet.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((att) => {
            const Icon = att.content_type.startsWith("image/") ? ImageIcon : FileText;
            return (
              <li key={att.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{att.filename}</p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(att.size)}
                    {att.is_proposal && " · Proposal"}
                    {" · "}{format(new Date(att.uploaded_at), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {att.is_previewable && <Button size="sm" variant="ghost" onClick={() => handlePreview(att)}><Eye className="h-4 w-4" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(att)}><Download className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { setRenaming(att); setNewName(att.filename); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { if (confirm(`Delete ${att.filename}?`)) deleteMutation.mutate(att.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Modal open={Boolean(renaming)} onClose={() => setRenaming(null)} title="Rename" footer={<><Button variant="outline" onClick={() => setRenaming(null)}>Cancel</Button><Button onClick={() => renameMutation.mutate()}>Save</Button></>}>
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
      </Modal>
      <Modal open={Boolean(preview)} onClose={() => { if (preview?.url) URL.revokeObjectURL(preview.url); setPreview(null); }} title={preview?.name ?? "Preview"} size="lg">
        {preview && (
          preview.type.startsWith("image/")
            ? // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt={preview.name} className="mx-auto max-h-[65vh] rounded-lg" />
            : <iframe src={preview.url} title={preview.name} className="h-[65vh] w-full rounded-lg border" />
        )}
      </Modal>
    </div>
  );
}
