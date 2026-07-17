"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

const schema = z.object({
  token: z.string().trim().min(16, "Invalid invite link"),
  new_password: z.string().min(8, "At least 8 characters"),
});

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
  const accountEmail = searchParams.get("email")?.trim() ?? "";
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: tokenFromUrl },
  });

  useEffect(() => {
    if (tokenFromUrl) setValue("token", tokenFromUrl);
  }, [tokenFromUrl, setValue]);

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<{ message: string }>("/auth/accept-invite", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => setDone(true),
  });

  useEffect(() => {
    if (!done) return;
    const loginUrl = accountEmail ? `/login?email=${encodeURIComponent(accountEmail)}` : "/login";
    const t = window.setTimeout(() => router.push(loginUrl), 2500);
    return () => window.clearTimeout(t);
  }, [done, router, accountEmail]);

  return (
    <AuthSimpleShell
      title="Accept team invite"
      subtitle="Set your password to join the workspace."
    >
      {accountEmail && (
        <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
          Account email: <strong>{accountEmail}</strong>
        </p>
      )}

      {done ? (
        <div className="space-y-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">Welcome to the team!</p>
          <p>Redirecting to sign in…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label>Password</Label>
            <Input type="password" autoComplete="new-password" {...register("new_password")} />
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>
            )}
          </div>
          <input type="hidden" {...register("token")} />
          {mutation.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {(mutation.error as Error).message}
            </p>
          )}
          <Button type="submit" className="h-11 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Setting up…" : "Join workspace"}
          </Button>
        </form>
      )}
    </AuthSimpleShell>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  );
}
