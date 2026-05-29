"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  source: z.string().optional(),
  value: z.string().min(1, "Enter amount"),
  notes: z.string().optional(),
  next_followup: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function LeadFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { value: "0" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const value = parseFloat(data.value);
      if (Number.isNaN(value) || value < 0) {
        throw new Error("Enter a valid amount");
      }
      return apiFetch<Lead>("/leads", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          value,
          email: data.email || null,
          status: "new",
          next_followup: data.next_followup
            ? new Date(data.next_followup).toISOString()
            : null,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      reset();
      onOpenChange(false);
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold">New Lead</h2>
        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
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
            {errors.value && <p className="text-xs text-red-500">{errors.value.message}</p>}
          </div>
          <div>
            <Label>Next follow-up</Label>
            <Input type="datetime-local" {...register("next_followup")} />
            <p className="mt-1 text-xs text-slate-500">Optional — next call or meeting</p>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea {...register("notes")} />
          </div>
        </div>
        {mutation.isError && (
          <p className="mt-2 text-sm text-red-600">{(mutation.error as Error).message}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Create Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
}
