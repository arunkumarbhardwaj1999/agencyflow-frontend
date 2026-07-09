"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Mail,
  MessageCircle,
  Plus,
  Receipt,
  Sparkles,
  Trash2,
} from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type {
  Client,
  IntegrationsStatus,
  Invoice,
  MessageResponse,
  PaymentLinkResponse,
  WhatsAppLog,
  WhatsAppSendResponse,
  WhatsAppTemplate,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Reveal } from "@/components/ui/reveal";
import { Modal } from "@/components/ui/modal";
import { AIResultModal } from "@/components/ai/ai-result-modal";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  client_id: z.string().min(1, "Select a client"),
  due_date: z.string().min(1, "Due date required"),
  tax_rate: z.string().min(1, "GST rate required"),
  place_of_supply: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Required"),
        quantity: z.string().min(1, "Qty"),
        unit_price: z.string().min(1, "Rate"),
      }),
    )
    .min(1, "Add at least one item"),
});

type FormValues = z.infer<typeof schema>;

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
};

const n = (v: string) => parseFloat(v) || 0;

export function FinancePanel() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [waTemplate, setWaTemplate] = useState("payment_reminder");
  const [aiInvoiceId, setAiInvoiceId] = useState<string | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiFetch<Invoice[]>("/invoices"),
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/clients"),
  });
  const { data: waLogs = [] } = useQuery({
    queryKey: ["whatsapp-logs"],
    queryFn: () => apiFetch<WhatsAppLog[]>("/whatsapp/logs?limit=10"),
  });
  const { data: waTemplates = [] } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: () => apiFetch<WhatsAppTemplate[]>("/whatsapp/templates"),
  });
  const { data: integrations } = useQuery({
    queryKey: ["integrations-status"],
    queryFn: () => apiFetch<IntegrationsStatus>("/integrations/status"),
    enabled: user?.role === "owner",
  });

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      due_date: new Date().toISOString().slice(0, 10),
      tax_rate: "18",
      items: [{ description: "", quantity: "1", unit_price: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchItems = watch("items");
  const watchRate = watch("tax_rate");
  const subtotal = (watchItems ?? []).reduce((s, it) => s + n(it.quantity) * n(it.unit_price), 0);
  const taxRate = n(watchRate) / 100;
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const createMutation = useMutation({
    mutationFn: (body: FormValues) =>
      apiFetch<Invoice>("/invoices", {
        method: "POST",
        body: JSON.stringify({
          client_id: body.client_id,
          due_date: body.due_date,
          tax_rate: n(body.tax_rate) / 100,
          place_of_supply: body.place_of_supply || undefined,
          notes: body.notes || undefined,
          items: body.items.map((it) => ({
            description: it.description,
            quantity: n(it.quantity),
            unit_price: n(it.unit_price),
          })),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      reset({
        due_date: new Date().toISOString().slice(0, 10),
        tax_rate: "18",
        client_id: "",
        place_of_supply: "",
        notes: "",
        items: [{ description: "", quantity: "1", unit_price: "" }],
      });
      setShowModal(false);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<Invoice>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify({ status: "paid" }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const payLinkMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<PaymentLinkResponse>(`/payments/invoices/${id}/link`, {
        method: "POST",
        body: JSON.stringify({ provider: "razorpay" }),
      }),
    onSuccess: (data) => {
      window.open(data.url, "_blank", "noopener");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<MessageResponse>(`/invoices/${id}/send`, { method: "POST" }),
    onSuccess: (data) => {
      setToast(data.message);
      setTimeout(() => setToast(null), 5000);
    },
    onError: (err) => {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 5000);
    },
  });

  const whatsappMutation = useMutation({
    mutationFn: ({ id, template }: { id: string; template: string }) =>
      apiFetch<WhatsAppSendResponse>(
        `/whatsapp/invoices/${id}/notify?template=${encodeURIComponent(template)}`,
        { method: "POST" },
      ),
    onSuccess: (data) => {
      const label = data.queued ? "queued" : data.status;
      setToast(`WhatsApp ${label}: ${data.phone}`);
      queryClient.invalidateQueries({ queryKey: ["whatsapp-logs"] });
      setTimeout(() => setToast(null), 5000);
    },
    onError: (err) => {
      setToast((err as Error).message);
      setTimeout(() => setToast(null), 5000);
    },
  });

  async function downloadPdf(inv: Invoice) {
    const blob = await apiBlob(`/invoices/${inv.id}/pdf`);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const totalInvoiced = invoices.reduce((s, i) => s + n(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + n(i.total), 0);
  const totalPending = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + n(i.total), 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-indigo-100 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices &amp; billing</h1>
          <p className="text-sm text-slate-500">
            GST-compliant invoices — auto CGST+SGST or IGST, PDF export, payment links &amp; WhatsApp
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={waTemplate}
            onChange={(e) => setWaTemplate(e.target.value)}
            className="h-10 w-44"
            title="Default WhatsApp template for invoice rows"
          >
            {waTemplates.map((t) => (
              <option key={t.key} value={t.key}>
                WA: {t.label}
              </option>
            ))}
            {waTemplates.length === 0 && (
              <>
                <option value="payment_reminder">WA: Payment reminder</option>
                <option value="invoice_ready">WA: Invoice ready</option>
                <option value="payment_received">WA: Payment received</option>
              </>
            )}
          </Select>
          <Button onClick={() => setShowModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total invoiced" value={totalInvoiced} icon={Receipt} accent="indigo" currency />
        <StatCard label="Collected" value={totalPaid} icon={CheckCircle2} accent="emerald" currency />
        <StatCard label="Pending" value={totalPending} icon={Clock3} accent="amber" currency />
      </div>

      {user?.role === "owner" && integrations && !integrations.whatsapp.enabled && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">WhatsApp mock mode</p>
              <p className="text-amber-900/80">
                Messages sirf log honge jab tak Meta API connect nahi hoti. Agency-flow business
                account ready hai — ab token setup karo.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-300 bg-white">
            <Link href="/settings/integrations">Connect WhatsApp</Link>
          </Button>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create invoice"
        description="GST is split automatically based on place of supply"
        icon={Receipt}
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invoice-form" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create invoice"}
            </Button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Client</Label>
              <Select {...register("client_id")}>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </Select>
              {errors.client_id && <p className="mt-1 text-xs text-rose-500">{errors.client_id.message}</p>}
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" {...register("due_date")} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Line items</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ description: "", quantity: "1", unit_price: "" })}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add item
              </Button>
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input placeholder="Description" {...register(`items.${idx}.description`)} />
                    {errors.items?.[idx]?.description && (
                      <p className="mt-1 text-xs text-rose-500">{errors.items[idx]?.description?.message}</p>
                    )}
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    className="w-20"
                    {...register(`items.${idx}.quantity`)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    className="w-28"
                    {...register(`items.${idx}.unit_price`)}
                  />
                  <div className="w-24 pt-2 text-right text-sm font-medium text-slate-700">
                    {formatCurrency(n(watchItems?.[idx]?.quantity) * n(watchItems?.[idx]?.unit_price))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fields.length > 1 && remove(idx)}
                    className="pt-2 text-slate-400 transition-colors hover:text-rose-500 disabled:opacity-30"
                    disabled={fields.length === 1}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {typeof errors.items?.message === "string" && (
              <p className="mt-1 text-xs text-rose-500">{errors.items.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>GST rate (%)</Label>
              <Select {...register("tax_rate")}>
                <option value="0">0% (exempt)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </Select>
            </div>
            <div>
              <Label>Place of supply (state code)</Label>
              <Input placeholder="e.g. 27 (auto from client GSTIN)" maxLength={2} {...register("place_of_supply")} />
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Input placeholder="Payment terms, thank-you note…" {...register("notes")} />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-slate-600">
              <span>GST ({n(watchRate)}%)</span>
              <span className="font-medium text-slate-900">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-indigo-700">
              <span>Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {createMutation.isError && (
            <p className="text-sm text-rose-600">{(createMutation.error as Error).message}</p>
          )}
        </form>
      </Modal>

      <Reveal delay={80}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">All invoices</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {isLoading && <p className="px-6 pb-6 text-sm text-slate-500">Loading…</p>}
            {!isLoading && invoices.length === 0 && (
              <p className="px-6 pb-6 text-sm text-slate-500">No invoices yet.</p>
            )}
            {invoices.length > 0 && (
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Invoice</TH>
                    <TH>Client</TH>
                    <TH>Amount</TH>
                    <TH>GST</TH>
                    <TH>Due</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {invoices.map((inv) => (
                    <TR key={inv.id}>
                      <TD className="font-medium text-slate-900">{inv.invoice_number}</TD>
                      <TD>{inv.client_name ?? "—"}</TD>
                      <TD>
                        <span className="font-semibold text-slate-900">{formatCurrency(inv.total)}</span>
                        <span className="block text-xs text-slate-400">incl. {formatCurrency(inv.tax)} tax</span>
                      </TD>
                      <TD>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          {inv.tax_type === "cgst_sgst" ? "CGST + SGST" : "IGST"}
                        </span>
                      </TD>
                      <TD className="text-slate-500">{inv.due_date}</TD>
                      <TD>
                        <Badge variant={statusVariant[inv.status] ?? "secondary"} className="capitalize">
                          {inv.status}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadPdf(inv)}
                            className="gap-1"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendMutation.mutate(inv.id)}
                            disabled={sendMutation.isPending}
                            className="gap-1"
                            title="Email invoice to client"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAiInvoiceId(inv.id)}
                            className="gap-1"
                            title="AI draft invoice email"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            AI
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => whatsappMutation.mutate({ id: inv.id, template: waTemplate })}
                            disabled={whatsappMutation.isPending}
                            className="gap-1"
                            title="Send WhatsApp notification"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WA
                          </Button>
                          {inv.status !== "paid" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => payLinkMutation.mutate(inv.id)}
                                disabled={payLinkMutation.isPending}
                                className="gap-1"
                                title="Generate payment link"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                Pay link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markPaidMutation.mutate(inv.id)}
                                disabled={markPaidMutation.isPending}
                              >
                                Mark paid
                              </Button>
                            </>
                          )}
                          {inv.status === "paid" && (
                            <span className="text-xs text-emerald-600">Paid</span>
                          )}
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={120}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WhatsApp activity</CardTitle>
          </CardHeader>
          <CardContent>
            {waLogs.length === 0 ? (
              <p className="text-sm text-slate-500">
                No WhatsApp messages yet. Send from an invoice row or enable auto-triggers on payment.
              </p>
            ) : (
              <ul className="space-y-3">
                {waLogs.map((log) => (
                  <li key={log.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">{log.phone}</span>
                      <Badge variant={log.status === "failed" ? "danger" : "secondary"} className="capitalize">
                        {log.status}
                      </Badge>
                    </div>
                    {log.template_key && (
                      <p className="mt-1 text-xs text-indigo-600">Template: {log.template_key}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-slate-600">{log.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(log.sent_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <AIResultModal
        open={!!aiInvoiceId}
        onClose={() => setAiInvoiceId(null)}
        title="Draft invoice email"
        description="AI email to accompany the invoice PDF"
        streamAction="draft-invoice-email"
        body={aiInvoiceId ? { invoice_id: aiInvoiceId } : {}}
      />
    </div>
  );
}
