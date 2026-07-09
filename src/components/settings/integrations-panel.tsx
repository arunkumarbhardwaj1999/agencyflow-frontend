"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Mail,
  MessageCircle,
  Send,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { IntegrationsStatus, WhatsAppTestResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

const metaSteps = [
  {
    title: "Meta Business portfolio ready",
    detail: 'Aapka "Agency-flow" business account ban chuka hai.',
    done: true,
    href: "https://business.facebook.com/latest/settings/business_info",
  },
  {
    title: "Developer app banao",
    detail: "Business type app banao aur Agency-flow portfolio se link karo.",
    done: false,
    href: "https://developers.facebook.com/apps/create/",
  },
  {
    title: "WhatsApp product add karo",
    detail: "App dashboard → Add product → WhatsApp → API Setup.",
    done: false,
    href: "https://developers.facebook.com/apps/",
  },
  {
    title: "Test phone verify karo",
    detail: "API Setup → To field mein apna mobile add karo (OTP). Dev mode mein sirf ye numbers ko message jayega.",
    done: false,
    href: "https://developers.facebook.com/apps/",
  },
  {
    title: "Credentials .env mein daalo",
    detail: "WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID copy karke agencyflow-backend/.env mein paste karo, phir docker restart.",
    done: false,
  },
  {
    title: "Test message bhejo",
    detail: "Neeche apna phone daal kar test karo.",
    done: false,
  },
];

export function IntegrationsPanel() {
  const [testPhone, setTestPhone] = useState("");
  const [testResult, setTestResult] = useState<WhatsAppTestResponse | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["integrations-status"],
    queryFn: () => apiFetch<IntegrationsStatus>("/integrations/status"),
  });

  const testMutation = useMutation({
    mutationFn: (phone: string) =>
      apiFetch<WhatsAppTestResponse>("/integrations/whatsapp/test", {
        method: "POST",
        body: JSON.stringify({ phone }),
      }),
    onSuccess: (res) => {
      setTestResult(res);
      refetch();
    },
    onError: (err: Error) => {
      setTestResult({
        status: "failed",
        phone: testPhone,
        message_id: null,
        delivery: "text",
        detail: err.message,
      });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const wa = data.whatsapp;
  const stepsWithDone = metaSteps.map((s, i) => {
    if (i === 0) return { ...s, done: true };
    if (i === 4) return { ...s, done: wa.token_configured && wa.phone_number_id_configured };
    if (i === 5) return { ...s, done: wa.enabled };
    return s;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Integrations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Email, WhatsApp (Meta), aur automation — workspace owner ke liye
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
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
              <p>RESEND_API_KEY backend .env mein set karo.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp (Meta Cloud API)
              </CardTitle>
              <CardDescription>Invoice alerts, payment updates, task notifications</CardDescription>
            </div>
            <StatusPill ok={wa.enabled} label={wa.enabled ? "Live" : "Mock"} />
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex flex-wrap gap-2">
              <StatusPill ok={wa.token_configured} label="Token" />
              <StatusPill ok={wa.phone_number_id_configured} label="Phone ID" />
              <StatusPill ok={wa.celery_queue} label="Queue" />
            </div>
            {wa.business_account_id && (
              <p>
                Business account ID: <code className="rounded bg-slate-100 px-1">{wa.business_account_id}</code>
              </p>
            )}
            <p>
              Auto on payment: {wa.auto_on_payment ? "On" : "Off"} · Auto on invoice send:{" "}
              {wa.auto_on_invoice_send ? "On" : "Off"}
            </p>
            {!wa.enabled && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                Abhi mock mode — Finance se WhatsApp dabane par sirf log save hoga. Meta credentials
                add karke API restart karo.
              </p>
            )}
            {wa.enabled && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                WhatsApp live hai. Finance → invoice row se message bhejo ya auto-triggers use karo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">WhatsApp setup — Agency-flow (Meta)</CardTitle>
          <CardDescription>
            Business portfolio ban chuka hai. Ab developer app + API keys connect karo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3">
            {stepsWithDone.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                {step.done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    {i + 1}. {step.title}
                  </p>
                  <p className="text-sm text-slate-500">{step.detail}</p>
                  {step.href && (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                    >
                      Open Meta <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Test WhatsApp message</p>
            <p className="mt-1 text-xs text-slate-500">
              Apna verified test number use karo (Meta API Setup mein add kiya hua).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                placeholder="9876543210"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="max-w-xs bg-white"
              />
              <Button
                type="button"
                className="gap-2"
                disabled={testMutation.isPending || testPhone.length < 10}
                onClick={() => testMutation.mutate(testPhone)}
              >
                <Send className="h-4 w-4" />
                {testMutation.isPending ? "Sending…" : "Send test"}
              </Button>
            </div>
            {testResult && (
              <div
                className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                  testResult.status === "failed" || testResult.status === "mock"
                    ? "border border-amber-200 bg-amber-50 text-amber-900"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-900"
                }`}
              >
                <p>
                  Status: <strong>{testResult.status}</strong> → {testResult.phone}
                </p>
                {testResult.detail && <p className="mt-1">{testResult.detail}</p>}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Finance mein use karne ke liye client record mein phone number zaroori hai.{" "}
            <Link href="/finance" className="text-indigo-600 hover:underline">
              Open Finance →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
