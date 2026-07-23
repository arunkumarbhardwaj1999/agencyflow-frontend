"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { SiteMenu } from "@/components/landing/site-menu";

const features = [
  "Multi-tenant workspace with role-based access",
  "India-first GST billing engine (CGST / IGST)",
  "Secure client portal for transparent delivery",
];

function AuthBrandPanel() {
  return (
    <div className="hidden w-[42%] flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 text-white lg:flex">
      <div>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AgencyFlow</span>
        </Link>

        <h1 className="mt-14 text-3xl font-bold leading-tight xl:text-4xl">
          Run your entire agency from one place
        </h1>
        <p className="mt-4 max-w-md text-base text-indigo-100">
          Leads, projects, GST billing, and client portals — all connected.
        </p>

        <ul className="mt-10 space-y-4">
          {features.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-indigo-50">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-indigo-200/80">© 2026 AgencyFlow. All rights reserved.</p>
    </div>
  );
}

function AuthMobileBrand() {
  return (
    <div className="mb-8 flex items-center gap-2 lg:hidden">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
        <LayoutGrid className="h-4 w-4" />
      </div>
      <span className="font-semibold text-slate-900">AgencyFlow</span>
    </div>
  );
}

export function AuthSimpleShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-white">
      <div className="absolute right-6 top-6 z-20">
        <SiteMenu tone="solid" showRegister={false} />
      </div>
      <AuthBrandPanel />
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-12">
        <AuthMobileBrand />
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
