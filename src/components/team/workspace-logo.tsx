"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Upload } from "lucide-react";
import { apiFetch, apiUpload } from "@/lib/api";
import type { LogoResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WorkspaceLogo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<LogoResponse>("/files/logo")
      .then((data) => {
        if (active && data.logo) {
          setLogo(`${data.logo}${data.logo.includes("?") ? "&" : "?"}t=${Date.now()}`);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiUpload<LogoResponse>("/files/logo", fd);
    },
    onSuccess: (data) => {
      setError(null);
      if (data.logo) {
        setLogo(`${data.logo}${data.logo.includes("?") ? "&" : "?"}t=${Date.now()}`);
      }
    },
    onError: (err) => setError((err as Error).message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workspace branding</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Workspace logo" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-7 w-7 text-slate-300" />
          )}
        </div>
        <div>
          <p className="text-sm text-slate-600">
            Upload your agency logo — it appears on the client portal and invoices.
          </p>
          <p className="mt-0.5 text-xs text-slate-400">PNG, JPG, WEBP or SVG · up to 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
            className="mt-3 gap-1.5"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploadMutation.isPending ? "Uploading…" : logo ? "Replace logo" : "Upload logo"}
          </Button>
          {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
