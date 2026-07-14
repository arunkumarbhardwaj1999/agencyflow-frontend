"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Folders } from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type { PortalFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const FOLDER_FILTERS = [
  { key: "", label: "All files" },
  { key: "proposals", label: "Proposals" },
  { key: "agreements", label: "Agreements" },
  { key: "deliverables", label: "Deliverables" },
  { key: "images", label: "Images" },
  { key: "invoices", label: "Invoices / PDFs" },
  { key: "others", label: "Others" },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PortalFiles() {
  const [folder, setFolder] = useState("");
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (folder) params.set("folder", folder);
    const qs = params.toString();
    return qs ? `/portal/files?${qs}` : "/portal/files";
  }, [folder]);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["portal-files", folder],
    queryFn: () => apiFetch<PortalFile[]>(query),
  });

  async function download(file: PortalFile) {
    const blob = await apiBlob(`/portal/files/${file.id}/download`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Folders className="h-6 w-6 text-indigo-600" />
            Files
          </h1>
          <p className="text-sm text-slate-500">
            Download proposals, agreements, deliverables, images, and PDFs.
          </p>
        </div>
        <Select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-52">
          {FOLDER_FILTERS.map((f) => (
            <option key={f.key || "all"} value={f.key}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No files shared yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{f.filename}</p>
                <p className="text-xs text-slate-500">
                  {f.folder_label}
                  {f.project_title ? ` · ${f.project_title}` : ""}
                  {" · "}
                  {formatSize(f.size)}
                  {" · "}
                  {format(new Date(f.created_at), "dd MMM yyyy")}
                </p>
              </div>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => download(f)}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
