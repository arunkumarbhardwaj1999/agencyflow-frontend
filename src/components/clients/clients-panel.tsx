"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import type { Client } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  name: z.string().min(1),
  business_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export function ClientsPanel() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/clients"),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<Client>("/clients", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      reset();
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/clients/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">360° client directory</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Client"}</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((d) => createMutation.mutate(d))}
              className="grid gap-3 sm:grid-cols-2"
            >
              <div>
                <Label>Contact Name *</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Business Name *</Label>
                <Input {...register("business_name")} />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" {...register("email")} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input {...register("phone")} />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input {...register("gst_number")} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Textarea {...register("address")} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  Save Client
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading clients…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{c.business_name}</CardTitle>
                    <p className="text-sm text-slate-500">{c.name}</p>
                  </div>
                  {c.gst_number && <Badge variant="secondary">GST</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>{c.email}</p>
                {c.phone && <p>{c.phone}</p>}
                <div className="flex gap-2 pt-2">
                  <Badge>{c.active_projects} projects</Badge>
                  <Badge variant="secondary">{c.invoice_count} invoices</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    if (confirm("Delete this client?")) deleteMutation.mutate(c.id);
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
