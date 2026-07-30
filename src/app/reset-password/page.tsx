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

const schema = z
  .object({
    new_password: z.string().min(8, "At least 8 characters"),
    confirm_password: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";
  const accountEmail = searchParams.get("email")?.trim() ?? "";
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: { token: string; new_password: string }) =>
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

  const missingToken = tokenFromUrl.length < 16;

  return (
    <AuthSimpleShell
      title="Reset password"
      subtitle="Choose a new password, then sign in with the same email."
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
      ) : missingToken ? (
        <div className="space-y-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>This reset link is missing or invalid.</p>
          <Link href="/forgot-password" className="font-medium text-indigo-600 hover:underline">
            Request a new password reset link
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit((d) =>
            mutation.mutate({ token: tokenFromUrl, new_password: d.new_password }),
          )}
          className="space-y-4"
        >
          <div>
            <Label>New password</Label>
            <Input type="password" autoComplete="new-password" {...register("new_password")} />
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>
            )}
          </div>
          <div>
            <Label>Confirm password</Label>
            <Input type="password" autoComplete="new-password" {...register("confirm_password")} />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>
            )}
          </div>
          {mutation.isError && (
            <div className="space-y-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <p>{(mutation.error as Error).message}</p>
              {(mutation.error as Error).message.includes("already used") && (
                <Link href="/forgot-password" className="block text-indigo-600 hover:underline">
                  Request a new reset link
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
