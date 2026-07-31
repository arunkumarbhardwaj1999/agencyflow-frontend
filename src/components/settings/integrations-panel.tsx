"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Mail, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { IntegrationsStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
      }`}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export function IntegrationsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["integrations-status"],
    queryFn: () => apiFetch<IntegrationsStatus>("/integrations/status"),
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-indigo-600" />
              Email (Resend)
            </CardTitle>
            <CardDescription>Invites, invoices, password emails</CardDescription>
          </div>
          <StatusPill ok={data.email.enabled} label={data.email.enabled ? "Live" : "Mock"} />
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {data.email.enabled ? (
            <p>
              Sending from <strong>{data.email.from_address}</strong> via Resend.
            </p>
          ) : (
            <p>Set RESEND_API_KEY in the backend .env file to send real emails.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
