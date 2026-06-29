"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Building2, Lock, Mail, User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";
import { AuthField } from "./auth-field";

const schema = z.object({
  company_name: z.string().min(2, "Agency name required"),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase, numbers, hyphens only"),
  company_email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
  gst_number: z.string().trim().max(15).optional().or(z.literal("")),
});

export function CinematicRegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) => {
      const { gst_number, ...rest } = body;
      const payload = {
        ...rest,
        ...(gst_number?.trim() ? { gst_number: gst_number.trim().toUpperCase() } : {}),
      };
      return apiFetch<TokenResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      router.push("/dashboard");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="max-h-[52vh] overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible"
    >
      <div className="grid gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AuthField
            label="Agency name"
            placeholder="Your agency"
            icon={<Building2 className="h-4 w-4" />}
            error={errors.company_name?.message}
            {...register("company_name")}
          />
        </div>
        <AuthField
          label="Workspace slug"
          placeholder="your-agency"
          error={errors.slug?.message}
          {...register("slug")}
        />
        <AuthField
          label="Company email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          error={errors.company_email?.message}
          {...register("company_email")}
        />
        <AuthField
          label="First name"
          icon={<User className="h-4 w-4" />}
          error={errors.first_name?.message}
          {...register("first_name")}
        />
        <AuthField label="Last name" {...register("last_name")} />
        <AuthField
          label="Login email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthField
          label="Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="sm:col-span-2">
          <AuthField
            label="GSTIN (optional)"
            placeholder="22AAAAA0000A1Z5"
            maxLength={15}
            error={errors.gst_number?.message}
            {...register("gst_number")}
          />
        </div>
      </div>

      {mutation.isError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {(mutation.error as Error).message}
        </p>
      )}

      <button type="submit" className="auth-btn-primary mt-2" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating…" : "Register"}
      </button>

      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="auth-link">
          Sign In
        </button>
      </p>
    </form>
  );
}
