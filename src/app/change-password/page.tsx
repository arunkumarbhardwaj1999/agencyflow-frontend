"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    setHasToken(!!getAccessToken());
  }, []);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<User>("/auth/me"),
    enabled: hasToken === true,
    retry: false,
  });

  if (hasToken === null) {
    return (
      <AuthSimpleShell title="Change password" subtitle="Loading…">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </AuthSimpleShell>
    );
  }

  if (!hasToken) {
    return (
      <AuthSimpleShell
        title="Change password"
        subtitle="You need to sign in before changing your password."
      >
        <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Sign in first</p>
          <p>
            Open the email we sent when you registered, copy your password, and sign in on the login
            page. Then open this page again from the dashboard or sidebar.
          </p>
        </div>
        <Button asChild className="mt-4 w-full">
          <Link href="/login">Go to login</Link>
        </Button>
      </AuthSimpleShell>
    );
  }

  if (isLoading) {
    return (
      <AuthSimpleShell title="Change password" subtitle="Loading your account…">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </AuthSimpleShell>
    );
  }

  if (isError || !user) {
    return (
      <AuthSimpleShell title="Session expired" subtitle="Please sign in again.">
        <Button asChild className="w-full">
          <Link href="/login">Go to login</Link>
        </Button>
      </AuthSimpleShell>
    );
  }

  return (
    <AuthSimpleShell
      title="Change password"
      subtitle="Optional — update your password only if you want a new one."
    >
      <ChangePasswordForm
        onSuccess={() => {
          router.push("/dashboard");
        }}
      />
    </AuthSimpleShell>
  );
}
