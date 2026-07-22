import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create workspace",
  description:
    "Register an AgencyFlow workspace for your Indian digital agency — leads, GST billing, projects, and client portals.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f3f5fb] text-slate-500">Loading…</div>}>
      <AuthPage initialMode="register" />
    </Suspense>
  );
}
