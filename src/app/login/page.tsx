import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <AuthPage initialMode="login" />
    </Suspense>
  );
}
