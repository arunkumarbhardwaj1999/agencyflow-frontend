"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Handshake } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DEAL_STAGES, type Deal } from "@/lib/types";
import { useMembers } from "@/lib/use-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

const schema = z.object({
  title: z.string().min(1),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  company_name: z.string().optional(),
  value: z.string().min(1),
  probability: z.string().optional(),
  expected_close_date: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  assigned_user_id: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function DealFormDialog({
  open,
  onOpenChange,
  deal,
  leadId,
  defaultTitle,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  deal?: Deal | null;
  leadId?: string;
  defaultTitle?: string;
}) {
  const queryClient = useQueryClient();
  const { data: members = [] } = useMembers();
  const isEdit = Boolean(deal);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { value: "0", status: "qualification", probability: "50" },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: deal?.title ?? defaultTitle ?? "",
        contact_name: deal?.contact_name ?? "",
        contact_email: deal?.contact_email ?? "",
        contact_phone: deal?.contact_phone ?? "",
        company_name: deal?.company_name ?? "",
        value: deal ? String(deal.value) : "0",
        probability: deal ? String(deal.probability) : "25",
        expected_close_date: deal?.expected_close_date ?? "",
        status: deal?.status ?? "qualification",
        notes: deal?.notes ?? "",
        assigned_user_id: deal?.assigned_user_id ?? "",
      });
    }
  }, [open, deal, defaultTitle, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const value = parseFloat(data.value);
      if (Number.isNaN(value) || value < 0) throw new Error("Enter a valid amount");
      const probability = data.probability ? parseInt(data.probability, 10) : undefined;
      const payload = {
        title: data.title,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        company_name: data.company_name || null,
        value,
        probability: probability ?? undefined,
        expected_close_date: data.expected_close_date || null,
        status: data.status || "qualification",
        source: deal?.source ?? null,
        notes: data.notes || null,
        assigned_user_id: data.assigned_user_id || null,
        lead_id: leadId ?? deal?.lead_id ?? null,
      };
      if (isEdit && deal) {
        return apiFetch<Deal>(`/deals/${deal.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      return apiFetch<Deal>("/deals", { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals-kanban"] });
      if (deal) queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
      if (leadId) {
        queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        queryClient.invalidateQueries({ queryKey: ["lead-timeline", leadId] });
      }
      reset();
      onOpenChange(false);
    },
  });

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={isEdit ? "Edit deal" : "New deal"}
      description={isEdit ? "Update opportunity details" : "Create a sales opportunity"}
      icon={Handshake}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="deal-form" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create deal"}
          </Button>
        </>
      }
    >
      <form id="deal-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 py-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Deal title *</Label>
          <Input {...register("title")} placeholder="Website Development" />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
        </div>
        <div>
          <Label>Contact name</Label>
          <Input {...register("contact_name")} />
        </div>
        <div>
          <Label>Company</Label>
          <Input {...register("company_name")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("contact_email")} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register("contact_phone")} />
        </div>
        <div>
          <Label>Deal value (₹)</Label>
          <Input type="number" step="0.01" {...register("value")} />
        </div>
        <div>
          <Label>Probability (%)</Label>
          <Input type="number" min={0} max={100} {...register("probability")} />
        </div>
        <div>
          <Label>Expected close</Label>
          <Input type="date" {...register("expected_close_date")} />
        </div>
        <div>
          <Label>Stage</Label>
          <Select {...register("status")}>
            {DEAL_STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Assign to</Label>
          <Select {...register("assigned_user_id")}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea {...register("notes")} placeholder="Client wants React. Need revised quotation." />
        </div>
        {mutation.isError && (
          <p className="sm:col-span-2 text-sm text-rose-600">{(mutation.error as Error).message}</p>
        )}
      </form>
    </Modal>
  );
}
