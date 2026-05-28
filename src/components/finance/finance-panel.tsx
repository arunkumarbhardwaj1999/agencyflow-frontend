"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import type { Client, Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  client_id: z.string().min(1, "Select a client"),
  subtotal: z.string().min(1, "Enter amount"),
  due_date: z.string().min(1, "Due date required"),
});

export function FinancePanel() {
  const queryClient = useQueryClient();
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
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<Invoice>(`/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "paid" }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoices & billing</h1>
        <p className="text-sm text-slate-500">GST-ready invoices (18% tax applied automatically)</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Create invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="grid gap-4 sm:grid-cols-3"
          >
            <div>
              <Label>Client</Label>
              <select
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                {...register("client_id")}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </select>
              {errors.client_id && <p className="text-xs text-red-500">{errors.client_id.message}</p>}
            </div>
            <div>
              <Label>Subtotal (INR)</Label>
              <Input type="number" step="0.01" {...register("subtotal")} />
              {errors.subtotal && <p className="text-xs text-red-500">{errors.subtotal.message}</p>}
            </div>
            <div>
              <Label>Due date</Label>
              <Input type="date" {...register("due_date")} />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">All invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
          {!isLoading && invoices.length === 0 && (
            <p className="text-sm text-slate-500">No invoices yet.</p>
          )}
          <ul className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-slate-900">{inv.invoice_number}</p>
                  <p className="text-xs text-slate-500">{inv.client_name ?? "Client"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                  <p className="text-xs text-slate-500">
                    Tax {formatCurrency(inv.tax)} · Due {inv.due_date}
                  </p>
                </div>
                <Badge variant={inv.status === "paid" ? "default" : "secondary"}>{inv.status}</Badge>
                {inv.status !== "paid" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markPaidMutation.mutate(inv.id)}
                    disabled={markPaidMutation.isPending}
                  >
                    Mark paid
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
