import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign in",
  description: "Sign in to your AgencyFlow CRM workspace to manage leads, projects, invoices, and clients.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f3f5fb] text-slate-500">Loading…</div>}>
      <AuthPage initialMode="login" />
    </Suspense>
  );
}
