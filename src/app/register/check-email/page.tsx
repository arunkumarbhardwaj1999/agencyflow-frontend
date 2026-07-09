"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your inbox";
  const emailError = searchParams.get("email_error");
  const emailFailed = searchParams.get("email_failed") === "1";

  return (
    <AuthSimpleShell
      title="Check your email"
      subtitle={
        emailFailed
          ? "We could not deliver the email automatically — use the link below if needed."
          : "One last step — confirm your account from the email we sent."
      }
    >
      {emailFailed && emailError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Email not delivered</p>
          <p className="mt-1 text-xs">{emailError}</p>
        </div>
      )}

      <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <Mail className="h-7 w-7" />
        </div>
        <p className="text-sm text-slate-600">We sent a confirmation link to</p>
        <p className="mt-1 font-semibold text-slate-900">{email}</p>
        <p className="mt-4 text-sm text-slate-500">
          Open the email and click <strong>Confirm your account</strong>, then you&apos;ll land on
          your dashboard.
        </p>
      </div>

      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </AuthSimpleShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}
