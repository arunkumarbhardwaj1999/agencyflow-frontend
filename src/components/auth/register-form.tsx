"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  company_name: z.string().min(2),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .max(100, "Maximum 100 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  company_email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  gst_number: z.string().optional(),
});

export function RegisterForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<TokenResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      router.push("/dashboard");
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Agency Name *</Label>
        <Input {...register("company_name")} placeholder="Your agency name" />
      </div>
      <div>
        <Label>Workspace Slug *</Label>
        <Input {...register("slug")} placeholder="your-agency" maxLength={100} />
        {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
      </div>
      <div>
        <Label>Company Email *</Label>
        <Input type="email" {...register("company_email")} />
      </div>
      <div>
        <Label>First Name *</Label>
        <Input {...register("first_name")} />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input {...register("last_name")} />
      </div>
      <div>
        <Label>Login Email *</Label>
        <Input type="email" {...register("email")} />
      </div>
      <div>
        <Label>Password *</Label>
        <Input type="password" {...register("password")} />
      </div>
      <div className="sm:col-span-2">
        <Label>GSTIN (optional)</Label>
        <Input {...register("gst_number")} placeholder="22AAAAA0000A1Z5" />
      </div>
      {mutation.isError && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(mutation.error as Error).message}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" className="h-11 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating…" : "Create workspace"}
        </Button>
      </div>
    </form>
  );
}
