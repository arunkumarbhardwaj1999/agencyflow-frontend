"use client";

import Link from "next/link";
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
  token: z.string().trim().min(16, "Paste reset token"),
  new_password: z.string().min(8, "At least 8 characters"),
});

function ResetPasswordForm() {
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
      apiFetch<{ message: string }>("/auth/reset-password", {
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
      title="Reset password"
      subtitle="Each token works once. After reset, sign in with the same email you used on forgot password."
    >
      {accountEmail && (
        <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
          Login email: <strong>{accountEmail}</strong>
        </p>
      )}

      {done ? (
        <div className="space-y-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">Password reset successfully.</p>
          <p>Redirecting to sign in…</p>
          <Link
            href={accountEmail ? `/login?email=${encodeURIComponent(accountEmail)}` : "/login"}
            className="inline-block text-indigo-600 hover:underline"
          >
            Go to sign in now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div>
            <Label>Reset token</Label>
            <Input {...register("token")} autoComplete="off" />
            {errors.token && <p className="mt-1 text-xs text-red-500">{errors.token.message}</p>}
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" autoComplete="new-password" {...register("new_password")} />
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>
            )}
          </div>
          {mutation.isError && (
            <div className="space-y-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <p>{(mutation.error as Error).message}</p>
              {(mutation.error as Error).message.includes("already used") && (
                <Link href="/forgot-password" className="block text-indigo-600 hover:underline">
                  Generate a new reset token
                </Link>
              )}
            </div>
          )}
          <Button type="submit" className="h-11 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}

      {!done && (
        <p className="mt-4 text-sm">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      )}
    </AuthSimpleShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
