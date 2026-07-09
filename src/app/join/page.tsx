"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { JoinSetupForm } from "@/components/auth/join-setup-form";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { InvitePreview, User } from "@/lib/types";

function workspaceInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function JoinWorkspaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    async function load() {
      if (!getAccessToken()) {
        setChecking(false);
        return;
      }
      try {
        const me = await apiFetch<User>("/auth/me");
        setSessionEmail(me.email.toLowerCase());
        useAuthStore.getState().setUser(me);
      } catch {
        clearTokens();
      }
      setChecking(false);
    }
    load();
  }, []);

  const { data: invite, isLoading, isError } = useQuery({
    queryKey: ["invite-preview", token, email],
    queryFn: () =>
      apiFetch<InvitePreview>(
        `/auth/invite/preview?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
      ),
    enabled: token.length > 10 && email.length > 3,
    retry: false,
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>("/auth/invite/reject", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
    onSuccess: () => setRejected(true),
  });

  function signOut() {
    clearTokens();
    useAuthStore.getState().setUser(null);
    setSessionEmail(null);
    router.refresh();
  }

  if (!token || !email) {
    return (
      <AuthSimpleShell title="Invalid invite" subtitle="This invite link is incomplete.">
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthSimpleShell>
    );
  }

  if (checking || isLoading) {
    return (
      <AuthSimpleShell title="Loading invite…" subtitle="Please wait.">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      </AuthSimpleShell>
    );
  }

  if (rejected) {
    return (
      <AuthSimpleShell title="Invitation declined" subtitle="You have declined this invitation.">
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthSimpleShell>
    );
  }

  if (isError || !invite) {
    return (
      <AuthSimpleShell title="Invite expired" subtitle="Ask your admin to send a new invite.">
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </AuthSimpleShell>
    );
  }

  const wrongAccount =
    sessionEmail && sessionEmail !== invite.invited_email.toLowerCase();

  return (
    <AuthSimpleShell
      title="Join our organization"
      subtitle={`You've been invited to ${invite.workspace} on AgencyFlow.`}
    >
      <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-dashed border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
              {workspaceInitials(invite.workspace)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{invite.workspace}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Invited by <strong>{invite.inviter_name}</strong>
                {invite.inviter_email ? ` (${invite.inviter_email})` : ""}
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">CRM</span>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">
            We invite you to join our organization. Create an AgencyFlow account for{" "}
            <strong>{invite.invited_email}</strong> to accept the invitation.
          </p>
          <p className="mt-2 text-sm capitalize text-slate-500">Role: {invite.role}</p>
        </div>
      </div>

      {wrongAccount ? (
        <div className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">A different account is signed in</p>
              <p className="mt-1">
                You cannot view the invite because you are signed in as{" "}
                <strong>{sessionEmail}</strong> now. Sign out from this account to view and
                accept the invite.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={signOut}>
            Sign out to view invite
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <GoogleSignInButton intent="invite" inviteToken={token} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">or sign up with email</span>
            </div>
          </div>

          <JoinSetupForm invite={invite} token={token} />

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
            >
              {rejectMutation.isPending ? "Declining…" : "Reject"}
            </Button>
            {rejectMutation.isError && (
              <p className="text-sm text-red-600">{(rejectMutation.error as Error).message}</p>
            )}
          </div>
        </div>
      )}

      {invite.inviter_email && (
        <p className="mt-6 text-center text-xs text-slate-500">
          Questions? Contact{" "}
          <a href={`mailto:${invite.inviter_email}`} className="text-indigo-600 hover:underline">
            {invite.inviter_email}
          </a>
        </p>
      )}
    </AuthSimpleShell>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <JoinWorkspaceForm />
    </Suspense>
  );
}
