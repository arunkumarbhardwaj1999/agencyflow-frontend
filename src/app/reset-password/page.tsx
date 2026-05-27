"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

const schema = z.object({
  token: z.string().min(16, "Reset link is invalid"),
  new_password: z.string().min(8, "At least 8 characters"),
});

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: tokenFromUrl },
  });

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">Set a new password for your account.</p>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
          <input type="hidden" {...register("token")} />
          <div>
            <Label>New password</Label>
            <Input type="password" {...register("new_password")} />
            {errors.new_password && <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>}
          </div>
          {!tokenFromUrl && (
            <p className="text-sm text-amber-600">Reset link is missing or expired. Request a new email.</p>
          )}
          {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>}
          {mutation.isSuccess && <p className="text-sm text-emerald-600">Password reset successfully.</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending || !tokenFromUrl}>
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
