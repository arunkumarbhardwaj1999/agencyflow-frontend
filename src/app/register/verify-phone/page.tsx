"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectToCheckEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    router.replace(`/register/check-email?${params.toString()}`);
  }, [router, email]);

  return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Redirecting…</div>;
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <RedirectToCheckEmail />
    </Suspense>
  );
}
