"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<TokenResponse>("/auth/invite/verify-email", {
        method: "POST",
        body: JSON.stringify({ token, code }),
      }),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      router.push("/join/accepted");
    },
  });

  if (!token || !email) {
    return (
      <AuthSimpleShell title="Invalid link" subtitle="Start from your invite email again.">
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthSimpleShell>
    );
  }

  return (
    <AuthSimpleShell
      title="Verify email address"
      subtitle="Enter the code we sent to your inbox to join the organization."
    >
      <p className="mb-4 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
        Code sent to <strong>{email}</strong>
      </p>

      <div className="space-y-4">
        <div>
          <Label>Verification code</Label>
          <Input
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
          <p className="mt-2 text-xs text-slate-500">
            {resendIn > 0 ? `Resend available in ${resendIn}s` : "Didn't get it? Go back and tap Sign up & accept again."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={mutation.isPending || code.length < 4}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Verifying…" : "Verify and accept"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/join?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`}>
              Back
            </Link>
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
        )}
      </div>
    </AuthSimpleShell>
  );
}

export default function JoinVerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
