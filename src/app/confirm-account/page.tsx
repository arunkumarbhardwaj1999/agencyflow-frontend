"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { ConfirmAccountPreview, TokenResponse } from "@/lib/types";

function ConfirmAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [done, setDone] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["confirm-account", token],
    queryFn: () => apiFetch<ConfirmAccountPreview>(`/auth/confirm-account?token=${encodeURIComponent(token)}`),
    enabled: token.length > 10,
    retry: false,
  });

  const accessMutation = useMutation({
    mutationFn: () =>
      apiFetch<TokenResponse>("/auth/confirm-account", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
    onSuccess: (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1200);
    },
  });

  if (!token) {
    return (
      <AuthSimpleShell title="Invalid link" subtitle="This confirmation link is not valid.">
        <Button asChild className="w-full">
          <a href="/login">Go to sign in</a>
        </Button>
      </AuthSimpleShell>
    );
  }

  if (isLoading) {
    return (
      <AuthSimpleShell title="Loading…" subtitle="Checking your confirmation link.">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </AuthSimpleShell>
    );
  }

  if (isError || !data) {
    return (
      <AuthSimpleShell title="Link expired" subtitle="Request a new confirmation email or register again.">
        <Button asChild className="w-full">
          <a href="/register">Create workspace</a>
        </Button>
      </AuthSimpleShell>
    );
  }

  if (done) {
    return (
      <AuthSimpleShell title="Welcome!" subtitle="Redirecting to your dashboard…">
        <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center text-emerald-900">
          <CheckCircle2 className="mb-3 h-12 w-12" />
          <p className="font-medium">You&apos;re all set, {data.first_name}!</p>
        </div>
      </AuthSimpleShell>
    );
  }

  return (
    <AuthSimpleShell
      title={data.already_confirmed ? "Account confirmed" : "Confirm your account"}
      subtitle={
        data.already_confirmed
          ? `Your account ${data.email} is ready.`
          : "Click below to activate your AgencyFlow workspace."
      }
    >
      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p>
          Email: <strong>{data.email}</strong>
        </p>
      </div>
      <Button
        className="w-full"
        size="lg"
        disabled={accessMutation.isPending}
        onClick={() => accessMutation.mutate()}
      >
        {accessMutation.isPending ? "Opening workspace…" : "Access account"}
      </Button>
      {accessMutation.isError && (
        <p className="mt-3 text-sm text-red-600">{(accessMutation.error as Error).message}</p>
      )}
    </AuthSimpleShell>
  );
}

export default function ConfirmAccountPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <ConfirmAccountForm />
    </Suspense>
  );
}
