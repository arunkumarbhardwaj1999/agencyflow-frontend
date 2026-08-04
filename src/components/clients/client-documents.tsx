"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Download,
  Eye,
  FileText,
  Folder,
  Image as ImageIcon,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { apiBlob, apiFetch, apiUpload } from "@/lib/api";
import { askConfirm } from "@/stores/confirm-store";
import {
  CLIENT_DOCUMENT_FOLDERS,
  type ClientDocument,
  type DocumentFolderSuggestion,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/lib/feature-flags";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(contentType: string) {
  if (contentType.startsWith("image/")) return ImageIcon;
  return FileText;
}

type PendingUpload = {
  file: File;
  suggestion: DocumentFolderSuggestion;
};

export function ClientDocuments({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [renaming, setRenaming] = useState<ClientDocument | null>(null);
  const [newName, setNewName] = useState("");
  const [newFolder, setNewFolder] = useState("others");
  const [preview, setPreview] = useState<{ name: string; url: string; type: string } | null>(null);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);

  const queryKey = ["client-documents", clientId, folderFilter, search];

  const { data: documents = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (folderFilter) params.set("folder", folderFilter);
      if (search.trim()) params.set("search", search.trim());
      const qs = params.toString();
      return apiFetch<ClientDocument[]>(
        `/clients/${clientId}/documents${qs ? `?${qs}` : ""}`,
      );
    },
  });

  const pagination = useClientPagination(documents, { resetKey: `${search}|${folderFilter}` });

  const grouped = useMemo(() => {
    const map = new Map<string, ClientDocument[]>();
    for (const folder of CLIENT_DOCUMENT_FOLDERS) {
      map.set(folder.key, []);
    }
    for (const doc of pagination.pageItems) {
      const list = map.get(doc.folder) ?? [];
      list.push(doc);
      map.set(doc.folder, list);
    }
    return CLIENT_DOCUMENT_FOLDERS.map((f) => ({
      ...f,
      docs: map.get(f.key) ?? [],
    })).filter((g) => !folderFilter || g.key === folderFilter);
  }, [pagination.pageItems, folderFilter]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["client-documents", clientId] });
    queryClient.invalidateQueries({ queryKey: ["record-360", "client", clientId] });
  };

  const uploadMutation = useMutation({
    mutationFn: ({ file, folder }: { file: File; folder: string }) => {
      const form = new FormData();
      form.append("file", file);
      return apiUpload<ClientDocument>(
        `/clients/${clientId}/documents?folder=${encodeURIComponent(folder)}`,
        form,
      );
    },
    onSuccess: () => {
      setPendingUpload(null);
      invalidate();
    },
  });

  const renameMutation = useMutation({
    mutationFn: () =>
      apiFetch<ClientDocument>(`/clients/${clientId}/documents/${renaming!.id}`, {
        method: "PATCH",
        body: JSON.stringify({ filename: newName.trim(), folder: newFolder }),
      }),
    onSuccess: () => {
      setRenaming(null);
      setNewName("");
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) =>
      apiFetch(`/clients/${clientId}/documents/${docId}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const classifyAndQueue = useCallback(async (file: File) => {
    if (!FEATURES.ai) {
      uploadMutation.mutate({ file, folder: "others" });
      return;
    }
    const suggestion = await apiFetch<DocumentFolderSuggestion>("/clients/classify-document", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
      }),
    });
    if (suggestion.folder !== "others" && suggestion.confidence >= 0.7) {
      setPendingUpload({ file, suggestion });
    } else {
      uploadMutation.mutate({ file, folder: suggestion.folder });
    }
  }, [uploadMutation]);

  const uploadFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      list.forEach((file) => classifyAndQueue(file));
    },
    [classifyAndQueue],
  );

  async function handleDownload(doc: ClientDocument) {
    const blob = await apiBlob(`/clients/${clientId}/documents/${doc.id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePreview(doc: ClientDocument) {
    if (!doc.is_previewable) return;
    const blob = await apiBlob(`/clients/${clientId}/documents/${doc.id}/preview`);
    const url = URL.createObjectURL(blob);
    setPreview({ name: doc.filename, url, type: doc.content_type });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All folders</option>
          {CLIENT_DOCUMENT_FOLDERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </Select>
      </div>

      <div
        className={`mb-6 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
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
        <p className="text-sm font-medium text-slate-700">Drag & drop files into Document Center</p>
        {FEATURES.ai && (
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
            <Sparkles className="h-3 w-3" />
            AI suggests the right folder automatically
          </p>
        )}
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
        <p className="text-sm text-slate-500">Loading documents…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-slate-500">
          No documents yet. Upload GST, agreements, proposals, invoices, or images.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) =>
            group.docs.length === 0 ? null : (
              <section key={group.key}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Folder className="h-4 w-4 text-indigo-500" />
                  {group.label}
                  <span className="text-xs font-normal text-slate-400">({group.docs.length})</span>
                </h3>
                <ul className="space-y-2">
                  {group.docs.map((doc) => {
                    const Icon = fileIcon(doc.content_type);
                    return (
                      <li
                        key={doc.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">{doc.filename}</p>
                          <p className="text-xs text-slate-400">
                            {formatFileSize(doc.size)}
                            {doc.uploaded_by_name && ` · ${doc.uploaded_by_name}`}
                            {" · "}
                            {format(new Date(doc.uploaded_at), "dd MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {doc.is_previewable && (
                            <Button size="sm" variant="ghost" onClick={() => handlePreview(doc)} title="Preview">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)} title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRenaming(doc);
                              setNewName(doc.filename);
                              setNewFolder(doc.folder);
                            }}
                            title="Rename / move"
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
                                  title: "Delete document?",
                                  description: `Delete “${doc.filename}”? This cannot be undone.`,
                                  confirmLabel: "Delete",
                                  variant: "danger",
                                });
                                if (ok) deleteMutation.mutate(doc.id);
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
              </section>
            ),
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
            className="rounded-xl border border-slate-100"
          />
        </div>
      )}

      <Modal
        open={Boolean(pendingUpload)}
        onClose={() => setPendingUpload(null)}
        title="AI folder suggestion"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                if (pendingUpload) {
                  uploadMutation.mutate({ file: pendingUpload.file, folder: "others" });
                }
              }}
            >
              Keep in Others
            </Button>
            <Button
              disabled={uploadMutation.isPending}
              onClick={() => {
                if (pendingUpload) {
                  uploadMutation.mutate({
                    file: pendingUpload.file,
                    folder: pendingUpload.suggestion.folder,
                  });
                }
              }}
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Move to {pendingUpload?.suggestion.folder_label}
            </Button>
          </>
        }
      >
        {pendingUpload && (
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Upload <strong>{pendingUpload.file.name}</strong>
            </p>
            <p className="rounded-lg bg-indigo-50 px-3 py-2 text-indigo-900">
              Move to <strong>{pendingUpload.suggestion.folder_label}</strong> folder?
              <span className="mt-1 block text-xs text-indigo-700">
                {pendingUpload.suggestion.reason} ({Math.round(pendingUpload.suggestion.confidence * 100)}% confidence)
              </span>
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Rename or move file"
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
        <div className="space-y-3">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Select value={newFolder} onChange={(e) => setNewFolder(e.target.value)}>
            {CLIENT_DOCUMENT_FOLDERS.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </Select>
        </div>
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
