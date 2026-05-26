"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  "Multi-tenant workspace with role-based access",
  "India-first GST billing engine (CGST / IGST)",
  "WhatsApp + AI-powered client communication",
  "Secure client portal for transparent delivery",
];

export function AuthShell({
  children,
  mode,
  onModeChange,
}: {
  children: React.ReactNode;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden w-[42%] flex-col justify-between bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white lg:flex">
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
          <p className="mt-4 max-w-md text-base text-blue-100">
            Leads, projects, GST billing, and client portals — all connected.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-blue-50">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-blue-200/80">© 2026 AgencyFlow. All rights reserved.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-12">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-900">AgencyFlow</span>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login" ? "Sign in to your workspace" : "Register your agency on AgencyFlow"}
          </p>

          <div className="mt-6 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onModeChange("register")}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                mode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              Register
            </button>
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
