"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import type { Client, Member } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Plus, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { Modal } from "@/components/ui/modal";
import { AIResultModal } from "@/components/ai/ai-result-modal";
import { FEATURES } from "@/lib/feature-flags";

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const schema = z.object({
  name: z.string().min(1),
  business_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  assigned_user_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ClientsPanel() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [aiClientId, setAiClientId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch<Client[]>("/clients"),
  });
  const { data: members = [] } = useMembers();
  const memberMap = useMemo(
    () => new Map<string, string>((members as Member[]).map((m) => [m.id, m.name])),
    [members],
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const isEdit = Boolean(editing);

  useEffect(() => {
    if (showForm) {
      reset({
        name: editing?.name ?? "",
        business_name: editing?.business_name ?? "",
        email: editing?.email ?? "",
        phone: editing?.phone ?? "",
        gst_number: editing?.gst_number ?? "",
        address: editing?.address ?? "",
        notes: editing?.notes ?? "",
        assigned_user_id: editing?.assigned_user_id ?? "",
      });
    }
  }, [showForm, editing, reset]);

  const saveMutation = useMutation({
    mutationFn: (body: FormData) => {
      const payload = {
        ...body,
        gst_number: body.gst_number ? body.gst_number.toUpperCase() : null,
        assigned_user_id: body.assigned_user_id || null,
      };
      if (isEdit && editing) {
        return apiFetch<Client>(`/clients/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      return apiFetch<Client>("/clients", { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      reset();
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/clients/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (c) =>
        c.business_name.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term),
    );
  }, [clients, search]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setShowForm(true);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="app-page-title">Clients</h1>
          <p className="app-page-subtitle">360° client directory — accounts, contacts, and portal access</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add client
        </Button>
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={isEdit ? "Edit client" : "New client"}
        description={isEdit ? "Update client details" : "Add a client to your workspace"}
        icon={UserRound}
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
            <Button type="submit" form="client-form" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Save client"}
            </Button>
          </>
        }
      >
        <form id="client-form" onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="grid gap-4 py-2 sm:grid-cols-2">
          <div>
            <Label>Contact name *</Label>
            <Input {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Business name *</Label>
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
          <div>
            <Label>Account manager</Label>
            <Select {...register("assigned_user_id")}>
              <option value="">Unassigned</option>
              {(members as Member[]).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Textarea {...register("address")} />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea {...register("notes")} />
          </div>
          {saveMutation.isError && (
            <p className="sm:col-span-2 text-sm text-rose-600">{(saveMutation.error as Error).message}</p>
          )}
        </form>
      </Modal>

      <div className="mb-5">
        <Input
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading clients…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i * 50, 300)}>
              <Card hover className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-semibold text-white ${avatarGradient(c.email)}`}
                    >
                      {c.business_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">
                        <Link href={`/clients/${c.id}`} className="hover:text-indigo-600 hover:underline">
                          {c.business_name}
                        </Link>
                      </CardTitle>
                      <p className="truncate text-sm text-slate-500">{c.name}</p>
                    </div>
                    {c.gst_number && <Badge variant="violet">GST</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <p className="truncate">{c.email}</p>
                  {c.phone && <p>{c.phone}</p>}
                  {c.assigned_user_id && (
                    <p className="text-xs text-slate-500">
                      Manager: {memberMap.get(c.assigned_user_id) ?? "—"}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Badge variant="info">{c.active_projects} projects</Badge>
                    <Badge variant="secondary">{c.invoice_count} invoices</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clients/${c.id}`}>360° view</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                    {FEATURES.ai && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setAiClientId(c.id)}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Welcome email
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this client?")) deleteMutation.mutate(c.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">No clients found.</p>
          )}
        </div>
      )}
      {deleteMutation.isError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(deleteMutation.error as Error).message}
        </p>
      )}

      <AIResultModal
        open={!!aiClientId}
        onClose={() => setAiClientId(null)}
        title="Client welcome email"
        description="AI onboarding email — draft, then send it to the client"
        streamAction="draft-client-welcome"
        body={aiClientId ? { client_id: aiClientId } : {}}
        sendEndpoint={aiClientId ? `/clients/${aiClientId}/send-email` : undefined}
        sendLabel={clients.find((c) => c.id === aiClientId)?.email}
      />
    </div>
  );
}
