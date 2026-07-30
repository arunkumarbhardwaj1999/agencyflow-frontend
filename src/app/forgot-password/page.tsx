"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AuthSimpleShell } from "@/components/auth/auth-shell";
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
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      setToken(data.reset_token);
      setAccountEmail(data.email);
    },
  });

  return (
    <AuthSimpleShell
      title="Forgot password"
      subtitle="Enter your work email. We'll send a password reset link."
    >
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>}
        {mutation.isSuccess && (
          <div className="space-y-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
            {token ? (
              <>
                <p>
                  Email is not configured yet, so no inbox message was sent. Continue below to set a
                  new password.
                </p>
                <Button asChild className="w-full">
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(token)}${
                      accountEmail ? `&email=${encodeURIComponent(accountEmail)}` : ""
                    }`}
                  >
                    Continue to reset password
                  </Link>
                </Button>
              </>
            ) : accountEmail ? (
              <p>
                If this account exists, a reset link has been sent to <strong>{accountEmail}</strong>.
              </p>
            ) : (
              <p>If that email is registered, a reset link has been sent.</p>
            )}
          </div>
        )}
        <Button type="submit" className="h-11 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/login" className="text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthSimpleShell>
  );
}
