"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import type { ForgotPasswordResponse } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => setToken(data.reset_token),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your work email to generate a reset token.</p>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>}
          {mutation.isSuccess && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Token generated. Copy and use it on reset page.
              {token && <p className="mt-1 break-all font-mono text-xs">{token}</p>}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Generating..." : "Generate reset token"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/reset-password" className="text-blue-600 hover:underline">
            Go to reset password
          </Link>
        </p>
      </div>
    </div>
  );
}
