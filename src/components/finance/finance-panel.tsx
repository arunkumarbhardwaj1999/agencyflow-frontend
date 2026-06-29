"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Clock3, Plus, Receipt } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Client, Invoice } from "@/lib/types";
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

const schema = z.object({
  client_id: z.string().min(1, "Select a client"),
  subtotal: z.string().min(1, "Enter amount"),
  due_date: z.string().min(1, "Due date required"),
});

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
};

export function FinancePanel() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiFetch<Invoice[]>("/invoices"),
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/clients"),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { due_date: new Date().toISOString().slice(0, 10) },
  });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) => {
      const subtotal = parseFloat(body.subtotal);
      if (Number.isNaN(subtotal) || subtotal <= 0) {
        throw new Error("Enter a valid amount");
      }
      return apiFetch<Invoice>("/invoices", {
        method: "POST",
        body: JSON.stringify({ ...body, subtotal }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      reset({ due_date: new Date().toISOString().slice(0, 10), client_id: "", subtotal: "" });
      setShowModal(false);
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<Invoice>(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify({ status: "paid" }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const num = (v: string) => parseFloat(v) || 0;
  const totalInvoiced = invoices.reduce((s, i) => s + num(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + num(i.total), 0);
  const totalPending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + num(i.total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoices &amp; billing</h1>
          <p className="text-sm text-slate-500">GST-ready invoices (18% tax applied automatically)</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create invoice
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total invoiced" value={totalInvoiced} icon={Receipt} accent="indigo" currency />
        <StatCard label="Collected" value={totalPaid} icon={CheckCircle2} accent="emerald" currency />
        <StatCard label="Pending" value={totalPending} icon={Clock3} accent="amber" currency />
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create invoice"
        description="18% GST is applied automatically"
        icon={Receipt}
        size="md"
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
        <form id="invoice-form" onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
            <Label>Subtotal (INR)</Label>
            <Input type="number" step="0.01" {...register("subtotal")} />
            {errors.subtotal && <p className="mt-1 text-xs text-rose-500">{errors.subtotal.message}</p>}
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" {...register("due_date")} />
          </div>
          {createMutation.isError && (
            <p className="sm:col-span-2 text-sm text-rose-600">{(createMutation.error as Error).message}</p>
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
                    <TH>Due</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Action</TH>
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
                      <TD className="text-slate-500">{inv.due_date}</TD>
                      <TD>
                        <Badge variant={statusVariant[inv.status] ?? "secondary"} className="capitalize">
                          {inv.status}
                        </Badge>
                      </TD>
                      <TD className="text-right">
                        {inv.status !== "paid" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPaidMutation.mutate(inv.id)}
                            disabled={markPaidMutation.isPending}
                          >
                            Mark paid
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600">Paid</span>
                        )}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
