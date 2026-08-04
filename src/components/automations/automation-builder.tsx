"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Plus, Power, Trash2, Workflow, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { askConfirm } from "@/stores/confirm-store";
import type {
  Automation,
  AutomationActionBlock,
  AutomationCatalog,
  AutomationRun,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FEATURES } from "@/lib/feature-flags";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

function newBlock(type: string): AutomationActionBlock {
  return {
    id: crypto.randomUUID(),
    type,
    config:
      type === "wait"
        ? { days: 2 }
        : type === "send_email"
          ? {
              subject: "Welcome from AgencyFlow",
              body: "Thanks for reaching out — we'll be in touch shortly.",
            }
          : type === "send_whatsapp"
            ? { message: "Hi! Thanks for connecting with us." }
            : type === "create_task"
              ? { title: "Follow-up task" }
              : type === "webhook"
                ? { url: "" }
                : {},
  };
}

export function AutomationsList() {
  const { data: automations = [], isLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: () => apiFetch<Automation[]>("/automations"),
  });
  const pagination = useClientPagination(automations);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <Button asChild>
          <Link href="/automations/new">
            <Plus className="mr-1 h-4 w-4" />New automation
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : automations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Workflow className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-600">No automations yet.</p>
          <Button asChild className="mt-4">
            <Link href="/automations/new">Build your first workflow</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pagination.pageItems.map((a) => (
            <Link
              key={a.id}
              href={`/automations/${a.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{a.name}</p>
                <p className="text-xs text-slate-500">
                  {a.trigger_label} · {a.actions.length} action{a.actions.length === 1 ? "" : "s"}
                  {" · "}
                  {format(new Date(a.updated_at), "dd MMM yyyy")}
                </p>
              </div>
              <Badge className={a.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>
                {a.is_active ? "Active" : "Off"}
              </Badge>
            </Link>
          ))}
          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            from={pagination.from}
            to={pagination.to}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            className="rounded-xl border border-slate-100"
          />
        </div>
      )}
    </div>
  );
}

export function AutomationBuilder({ automationId }: { automationId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(automationId);
  const queryClient = useQueryClient();
  const [name, setName] = useState("Lead welcome flow");
  const [description, setDescription] = useState("");
  const [triggerKey, setTriggerKey] = useState("lead_created");
  const [actions, setActions] = useState<AutomationActionBlock[]>([
    newBlock("assign_manager"),
    newBlock("send_email"),
    ...(FEATURES.whatsapp ? [newBlock("send_whatsapp")] : []),
    newBlock("create_task"),
  ]);
  const [addOpen, setAddOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { data: catalog } = useQuery({
    queryKey: ["automation-catalog"],
    queryFn: () => apiFetch<AutomationCatalog>("/automations/catalog"),
  });

  const { data: automation, isLoading } = useQuery({
    queryKey: ["automation", automationId],
    queryFn: () => apiFetch<Automation>(`/automations/${automationId}`),
    enabled: isEdit,
  });

  const { data: runs = [] } = useQuery({
    queryKey: ["automation-runs", automationId],
    queryFn: () => apiFetch<AutomationRun[]>(`/automations/${automationId}/runs`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!automation) return;
    setName(automation.name);
    setDescription(automation.description ?? "");
    setTriggerKey(automation.trigger_key);
    setActions(automation.actions ?? []);
  }, [automation]);

  const actionLabel = (type: string) =>
    catalog?.actions.find((a) => a.key === type)?.label ?? type.replaceAll("_", " ");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: name.trim(),
        description: description || null,
        trigger_key: triggerKey,
        actions,
        is_active: automation?.is_active ?? true,
      };
      if (isEdit) {
        return apiFetch<Automation>(`/automations/${automationId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      }
      return apiFetch<Automation>("/automations", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["automation", saved.id] });
      setMessage("Automation saved.");
      if (!isEdit) router.push(`/automations/${saved.id}`);
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: () => apiFetch<Automation>(`/automations/${automationId}/toggle`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation", automationId] });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/automations/${automationId}`, { method: "DELETE" }),
    onSuccess: () => router.push("/automations"),
  });

  function moveAction(from: number, to: number) {
    if (to < 0 || to >= actions.length) return;
    setActions((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function updateConfig(id: string, key: string, value: string | number) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, config: { ...a.config, [key]: value } } : a)),
    );
  }

  if (isEdit && isLoading) return <p className="text-sm text-slate-500">Loading automation…</p>;

  const triggerLabel =
    catalog?.triggers.find((t) => t.key === triggerKey)?.label ?? triggerKey;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/automations">Back</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? "Edit automation" : "Automation builder"}
          </h1>
          <p className="text-sm text-slate-500">Drag blocks to reorder · add actions from the library</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && (
            <>
              <Button size="sm" variant="outline" onClick={() => toggleMutation.mutate()}>
                <Power className="mr-1 h-4 w-4" />
                {automation?.is_active ? "Turn off" : "Turn on"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => {
                  void (async () => {
                    const ok = await askConfirm({
                      title: "Delete automation?",
                      description: "Delete this automation? This cannot be undone.",
                      confirmLabel: "Delete automation",
                      variant: "danger",
                    });
                    if (ok) deleteMutation.mutate();
                  })();
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />Delete
              </Button>
            </>
          )}
          <Button size="sm" disabled={!name.trim() || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? "Saving…" : "Save workflow"}
          </Button>
        </div>
      </div>

      {message && (
        <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">{message}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label>Name</Label>
            <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            <Label className="mt-3 block">Description</Label>
            <Textarea className="mt-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">Trigger</h2>
            <Select value={triggerKey} onChange={(e) => setTriggerKey(e.target.value)}>
              {(catalog?.triggers ?? []).map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </Select>
            <p className="mt-2 text-xs text-slate-500">
              {catalog?.triggers.find((t) => t.key === triggerKey)?.description}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500">Action library</h2>
            <div className="space-y-1.5">
              {(catalog?.actions ?? [])
                .filter((a) => FEATURES.whatsapp || a.key !== "send_whatsapp")
                .map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={() => setActions((prev) => [...prev, newBlock(a.key)])}
                >
                  <span>{a.label}</span>
                  <Plus className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </section>
        </aside>

        <div>
          <div className="mx-auto max-w-xl">
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Trigger</p>
              <p className="mt-1 text-lg font-bold text-amber-900">{triggerLabel}</p>
            </div>

            {actions.map((action, index) => (
              <div key={action.id}>
                <div className="flex justify-center py-2">
                  <div className="h-8 w-0.5 bg-slate-300" />
                </div>
                <div
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null || dragIndex === index) return;
                    moveAction(dragIndex, index);
                    setDragIndex(null);
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Action</p>
                      <p className="font-semibold text-slate-900">{actionLabel(action.type)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => moveAction(index, index - 1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => moveAction(index, index + 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => setActions((prev) => prev.filter((a) => a.id !== action.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {action.type === "send_email" && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Subject"
                        value={String(action.config.subject ?? "")}
                        onChange={(e) => updateConfig(action.id, "subject", e.target.value)}
                      />
                      <Textarea
                        placeholder="Email body"
                        rows={2}
                        value={String(action.config.body ?? "")}
                        onChange={(e) => updateConfig(action.id, "body", e.target.value)}
                      />
                    </div>
                  )}
                  {action.type === "send_whatsapp" && FEATURES.whatsapp && (
                    <Textarea
                      placeholder="WhatsApp message"
                      rows={2}
                      value={String(action.config.message ?? "")}
                      onChange={(e) => updateConfig(action.id, "message", e.target.value)}
                    />
                  )}
                  {action.type === "create_task" && (
                    <Input
                      placeholder="Task title"
                      value={String(action.config.title ?? "")}
                      onChange={(e) => updateConfig(action.id, "title", e.target.value)}
                    />
                  )}
                  {action.type === "wait" && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>Wait</span>
                      <Input
                        className="w-20"
                        type="number"
                        value={Number(action.config.days ?? 2)}
                        onChange={(e) => updateConfig(action.id, "days", parseInt(e.target.value || "2", 10))}
                      />
                      <span>days</span>
                    </div>
                  )}
                  {action.type === "webhook" && (
                    <Input
                      placeholder="https://hooks.example.com/..."
                      value={String(action.config.url ?? "")}
                      onChange={(e) => updateConfig(action.id, "url", e.target.value)}
                    />
                  )}
                  {action.type === "update_status" && (
                    <Input
                      placeholder="New status"
                      value={String(action.config.status ?? "")}
                      onChange={(e) => updateConfig(action.id, "status", e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-center py-2">
              <div className="h-8 w-0.5 bg-slate-300" />
            </div>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-center">
              <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />Add action block
              </Button>
            </div>
            <div className="flex justify-center py-2">
              <div className="h-8 w-0.5 bg-slate-300" />
            </div>
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-center">
              <p className="text-lg font-bold text-emerald-800">Done</p>
            </div>
          </div>

          {isEdit && runs.length > 0 && (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Recent runs</h2>
              <ul className="space-y-2 text-sm">
                {runs.slice(0, 8).map((run) => (
                  <li key={run.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="capitalize text-slate-700">{run.status}</span>
                    <span className="text-slate-400">{format(new Date(run.created_at), "dd MMM HH:mm")}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add action">
        <div className="space-y-2">
          {(catalog?.actions ?? [])
            .filter((a) => FEATURES.whatsapp || a.key !== "send_whatsapp")
            .map((a) => (
            <button
              key={a.key}
              type="button"
              className="flex w-full flex-col rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
              onClick={() => {
                setActions((prev) => [...prev, newBlock(a.key)]);
                setAddOpen(false);
              }}
            >
              <span className="font-medium text-slate-900">{a.label}</span>
              <span className="text-xs text-slate-500">{a.description}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
