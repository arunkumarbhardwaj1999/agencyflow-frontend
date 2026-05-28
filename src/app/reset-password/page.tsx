"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    const loginUrl = accountEmail
      ? `/login?email=${encodeURIComponent(accountEmail)}`
      : "/login";
    const t = window.setTimeout(() => router.push(loginUrl), 2500);
    return () => window.clearTimeout(t);
  }, [done, router, accountEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Each token works once only. After reset, sign in with the{" "}
          <strong>same email</strong> you used on forgot password.
        </p>
        {accountEmail && (
          <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Login email: <strong>{accountEmail}</strong>
          </p>
        )}

        {done ? (
          <div className="mt-4 space-y-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <p className="font-medium">Password reset successfully.</p>
            <p>Your new password is saved. Redirecting to login…</p>
            <Link
              href={accountEmail ? `/login?email=${encodeURIComponent(accountEmail)}` : "/login"}
              className="inline-block text-blue-600 hover:underline"
            >
              Go to login now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
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
                  <Link href="/forgot-password" className="block text-blue-600 hover:underline">
                    Generate a new reset token
                  </Link>
                )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}

        {!done && (
          <p className="mt-4 text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
