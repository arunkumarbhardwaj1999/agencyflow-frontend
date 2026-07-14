"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Eye,
  FileSignature,
  Mail,
  Sparkles,
} from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type { Client, Contract, Proposal, ProposalAIDraft, ProposalTemplate } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const ALL_SERVICES = [
  "Website",
  "SEO",
  "Hosting",
  "Social Media",
  "Google Ads",
  "Content",
  "Logo Design",
  "Brand Guidelines",
  "Stationery",
];

type SectionKey =
  | "overview"
  | "timeline"
  | "deliverables"
  | "scope"
  | "pricing"
  | "terms"
  | "conclusion";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "overview", label: "Project Overview" },
  { key: "timeline", label: "Timeline" },
  { key: "deliverables", label: "Deliverables" },
  { key: "scope", label: "Scope" },
  { key: "pricing", label: "Pricing" },
  { key: "terms", label: "Terms" },
  { key: "conclusion", label: "Conclusion" },
];

type FormState = {
  template_key: string;
  title: string;
  client_id: string;
  project_value: string;
  services: string[];
  overview: string;
  timeline: string;
  deliverables: string;
  scope: string;
  pricing: string;
  terms: string;
  conclusion: string;
};

const emptyForm: FormState = {
  template_key: "website",
  title: "",
  client_id: "",
  project_value: "250000",
  services: ["Website", "SEO", "Hosting"],
  overview: "",
  timeline: "",
  deliverables: "",
  scope: "",
  pricing: "",
  terms: "",
  conclusion: "",
};

export function ProposalBuilder({ proposalId }: { proposalId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isEdit = Boolean(proposalId);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [aiPrompt, setAiPrompt] = useState("Need proposal for website development and SEO.");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [dealId, setDealId] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["proposal-templates"],
    queryFn: () => apiFetch<ProposalTemplate[]>("/proposals/templates"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/clients"),
  });

  const { data: proposal, isLoading } = useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () => apiFetch<Proposal>(`/proposals/${proposalId}`),
    enabled: isEdit,
  });

  useEffect(() => {
    const clientFromUrl = searchParams.get("client_id");
    const leadFromUrl = searchParams.get("lead_id");
    const dealFromUrl = searchParams.get("deal_id");
    if (!isEdit) {
      if (clientFromUrl) setForm((f) => ({ ...f, client_id: clientFromUrl }));
      if (leadFromUrl) setLeadId(leadFromUrl);
      if (dealFromUrl) setDealId(dealFromUrl);
    }
  }, [searchParams, isEdit]);

  useEffect(() => {
    if (proposal) {
      setForm({
        template_key: proposal.template_key,
        title: proposal.title,
        client_id: proposal.client_id ?? "",
        project_value: String(proposal.project_value),
        services: proposal.services ?? [],
        overview: proposal.overview ?? "",
        timeline: proposal.timeline ?? "",
        deliverables: proposal.deliverables ?? "",
        scope: proposal.scope ?? "",
        pricing: proposal.pricing ?? "",
        terms: proposal.terms ?? "",
        conclusion: proposal.conclusion ?? "",
      });
    }
  }, [proposal]);

  const templateServices = useMemo(() => {
    const t = templates.find((x) => x.key === form.template_key);
    return t?.default_services ?? [];
  }, [templates, form.template_key]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        template_key: form.template_key,
        title: form.title.trim(),
        client_id: form.client_id || null,
        lead_id: leadId,
        deal_id: dealId,
        project_value: parseFloat(form.project_value) || 0,
        services: form.services,
        overview: form.overview || null,
        timeline: form.timeline || null,
        deliverables: form.deliverables || null,
        scope: form.scope || null,
        pricing: form.pricing || null,
        terms: form.terms || null,
        conclusion: form.conclusion || null,
      };
      if (isEdit) {
        return apiFetch<Proposal>(`/proposals/${proposalId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      return apiFetch<Proposal>("/proposals", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", saved.id] });
      setMessage("Proposal saved.");
      if (!isEdit) router.push(`/proposals/${saved.id}`);
    },
  });

  const aiMutation = useMutation({
    mutationFn: () =>
      apiFetch<ProposalAIDraft>("/proposals/ai-draft", {
        method: "POST",
        body: JSON.stringify({
          prompt: aiPrompt,
          template_key: form.template_key,
          client_id: form.client_id || null,
          lead_id: leadId,
          deal_id: dealId,
        }),
      }),
    onSuccess: (draft) => {
      setForm((f) => ({
        ...f,
        title: draft.title,
        project_value: String(draft.project_value),
        services: draft.services,
        overview: draft.overview,
        timeline: draft.timeline,
        deliverables: draft.deliverables,
        scope: draft.scope,
        pricing: draft.pricing,
        terms: draft.terms,
        conclusion: draft.conclusion,
      }));
      setMessage(`AI draft ready (${draft.mode} mode).`);
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => apiFetch<{ message: string }>(`/proposals/${proposalId}/send`, { method: "POST" }),
    onSuccess: (res) => {
      setMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: () => apiFetch<Proposal>(`/proposals/${proposalId}/approve`, { method: "POST" }),
    onSuccess: () => {
      setMessage("Proposal approved — you can now generate the agreement.");
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
    },
  });

  const contractMutation = useMutation({
    mutationFn: () => apiFetch<Contract>(`/contracts/from-proposal/${proposalId}`, { method: "POST" }),
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      router.push(`/contracts/${contract.id}`);
    },
    onError: (err: Error) => setMessage(err.message),
  });

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleService(service: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter((s) => s !== service)
        : [...f.services, service],
    }));
  }

  function applyTemplate(key: string) {
    const t = templates.find((x) => x.key === key);
    setForm((f) => ({
      ...f,
      template_key: key,
      services: t?.default_services?.length ? [...t.default_services] : f.services,
      title: f.title || (t ? `${t.label} Proposal` : f.title),
    }));
  }

  async function openPdfPreview() {
    if (!proposalId) {
      setMessage("Save the proposal first to preview PDF.");
      return;
    }
    const blob = await apiBlob(`/proposals/${proposalId}/pdf`);
    const url = URL.createObjectURL(blob);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
    setShowPreview(true);
  }

  async function downloadPdf() {
    if (!proposalId) return;
    const blob = await apiBlob(`/proposals/${proposalId}/pdf`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title || "proposal"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isEdit && isLoading) {
    return <p className="text-sm text-slate-500">Loading proposal…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/proposals"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit proposal" : "New proposal"}
          </h1>
          {proposal && (
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary">{proposal.status}</Badge>
              {proposal.client_name && (
                <span className="text-sm text-slate-500">{proposal.client_name}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && (
            <>
              <Button variant="outline" size="sm" onClick={openPdfPreview}>
                <Eye className="mr-1 h-4 w-4" />Preview
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPdf}>
                <Download className="mr-1 h-4 w-4" />PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={sendMutation.isPending || proposal?.status === "approved"}
                onClick={() => sendMutation.mutate()}
              >
                <Mail className="mr-1 h-4 w-4" />
                {sendMutation.isPending ? "Sending…" : "Email client"}
              </Button>
              {proposal?.status !== "approved" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate()}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Mark approved
                </Button>
              )}
              {proposal?.status === "approved" && !proposal.contract_id && (
                <Button
                  size="sm"
                  disabled={contractMutation.isPending}
                  onClick={() => contractMutation.mutate()}
                >
                  <FileSignature className="mr-1 h-4 w-4" />
                  {contractMutation.isPending ? "Generating…" : "Generate agreement"}
                </Button>
              )}
              {proposal?.contract_id && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/contracts/${proposal.contract_id}`}>
                    <FileSignature className="mr-1 h-4 w-4" />
                    View contract
                  </Link>
                </Button>
              )}
            </>
          )}
          <Button
            size="sm"
            disabled={!form.title.trim() || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create proposal"}
          </Button>
        </div>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{message}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Template</h2>
            <div className="space-y-2">
              {templates.map((t) => (
                <label
                  key={t.key}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    form.template_key === t.key
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    className="mt-1"
                    checked={form.template_key === t.key}
                    onChange={() => applyTemplate(t.key)}
                  />
                  <span>
                    <span className="font-medium text-slate-900">{t.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{t.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Client</h2>
            <Select
              value={form.client_id}
              onChange={(e) => setField("client_id", e.target.value)}
            >
              <option value="">Select client (optional)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.business_name}</option>
              ))}
            </Select>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label className="text-xs uppercase text-slate-500">Project value</Label>
            <Input
              className="mt-2"
              type="number"
              value={form.project_value}
              onChange={(e) => setField("project_value", e.target.value)}
            />
            {form.project_value && (
              <p className="mt-1 text-xs text-slate-500">
                {formatCurrency(parseFloat(form.project_value) || 0)}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Services</h2>
            <div className="flex flex-wrap gap-2">
              {[...new Set([...ALL_SERVICES, ...templateServices])].map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => toggleService(svc)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    form.services.includes(svc)
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <h2 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI draft
            </h2>
            <Textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Need proposal for website and SEO"
            />
            <Button
              size="sm"
              className="mt-2 w-full"
              variant="outline"
              disabled={aiMutation.isPending}
              onClick={() => aiMutation.mutate()}
            >
              {aiMutation.isPending ? "Generating…" : "Generate with AI"}
            </Button>
          </section>
        </aside>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Label>Proposal title</Label>
            <Input
              className="mt-2"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Website redesign proposal"
            />
          </section>

          {SECTIONS.map(({ key, label }) => (
            <section key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Label>{label}</Label>
              <Textarea
                className="mt-2 min-h-[100px]"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </section>
          ))}
        </div>
      </div>

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Proposal preview"
        size="lg"
      >
        {previewUrl && (
          <iframe src={previewUrl} title="Proposal PDF" className="h-[70vh] w-full rounded-lg border" />
        )}
      </Modal>
    </div>
  );
}
