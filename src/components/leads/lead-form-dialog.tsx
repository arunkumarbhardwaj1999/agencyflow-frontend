"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Target } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  source: z.string().optional(),
  value: z.string().min(1, "Enter amount"),
  notes: z.string().optional(),
  next_followup: z.string().optional(),
  assigned_user_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
}) {
  const queryClient = useQueryClient();
  const { data: members = [] } = useMembers();
  const isEdit = Boolean(lead);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { value: "0" },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: lead?.name ?? "",
        email: lead?.email ?? "",
        phone: lead?.phone ?? "",
        company_name: lead?.company_name ?? "",
        source: lead?.source ?? "",
        value: lead ? String(lead.value) : "0",
        notes: lead?.notes ?? "",
        next_followup: toLocalInput(lead?.next_followup ?? null),
        assigned_user_id: lead?.assigned_user_id ?? "",
      });
    }
  }, [open, lead, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const value = parseFloat(data.value);
      if (Number.isNaN(value) || value < 0) {
        throw new Error("Enter a valid amount");
      }
      const payload = {
        ...data,
        value,
        email: data.email || null,
        assigned_user_id: data.assigned_user_id || null,
        next_followup: data.next_followup ? new Date(data.next_followup).toISOString() : null,
      };
      if (isEdit && lead) {
        return apiFetch<Lead>(`/leads/${lead.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      return apiFetch<Lead>("/leads", {
        method: "POST",
        body: JSON.stringify({ ...payload, status: "new" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (lead) {
        queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
        queryClient.invalidateQueries({ queryKey: ["lead-timeline", lead.id] });
        queryClient.invalidateQueries({ queryKey: ["lead-activities", lead.id] });
        queryClient.invalidateQueries({ queryKey: ["lead-notes", lead.id] });
      }
      reset();
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Edit lead" : "New lead"}
      description={isEdit ? "Update the opportunity details" : "Capture a new opportunity"}
      icon={Target}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="lead-form" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create lead"}
          </Button>
        </>
      }
    >
      <form id="lead-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 py-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Name *</Label>
          <Input {...register("name")} placeholder="Contact person" />
          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} placeholder="name@company.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register("phone")} placeholder="+91…" />
        </div>
        <div>
          <Label>Company</Label>
          <Input {...register("company_name")} />
        </div>
        <div>
          <Label>Source</Label>
          <Input {...register("source")} placeholder="referral, website…" />
        </div>
        <div>
          <Label>Value (₹)</Label>
          <Input type="number" step="0.01" {...register("value")} placeholder="0" />
          {errors.value && <p className="mt-1 text-xs text-rose-500">{errors.value.message}</p>}
        </div>
        <div>
          <Label>Assign to</Label>
          <Select {...register("assigned_user_id")}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Next follow-up</Label>
          <Input type="datetime-local" {...register("next_followup")} />
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea {...register("notes")} placeholder="Context, requirements, budget…" />
        </div>
        {mutation.isError && (
          <p className="sm:col-span-2 text-sm text-rose-600">{(mutation.error as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
