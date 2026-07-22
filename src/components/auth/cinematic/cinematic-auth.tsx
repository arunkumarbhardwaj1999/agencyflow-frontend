"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthBackground } from "./auth-background";
import { CinematicLoginForm } from "./cinematic-login-form";
import { CinematicRegisterForm } from "./cinematic-register-form";
import "./auth-cinematic.css";

type Mode = "login" | "register";

export function CinematicAuth({ mode }: { mode: Mode }) {
  const isLogin = mode === "login";

  return (
    <div className="auth-cinematic relative w-full">
      <AuthBackground />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] flex-col px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="auth-card flex h-full max-h-[min(780px,100%)] w-full flex-col">
            <header className="auth-card-header relative z-30 border-b border-slate-100 bg-white px-5 py-3.5 sm:px-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 text-slate-700 transition-opacity hover:opacity-80"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50">
                  <LayoutGrid className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-semibold tracking-tight">AgencyFlow</span>
              </Link>
            </header>

            <div className="auth-card-body relative min-h-0 flex-1 overflow-hidden">
            <div
              className={cn(
                "auth-diagonal-panel",
                isLogin ? "auth-diagonal-panel--login" : "auth-diagonal-panel--register",
              )}
            >
          <div className="auth-diagonal-panel__inner relative overflow-hidden">
            <div className="auth-diagonal-panel__glow" />
            <div className="auth-welcome-text auth-welcome-text--visible absolute inset-0 flex flex-col items-center justify-center px-8">
              <Sparkles className="mb-4 h-8 w-8 text-white/80" />
              {isLogin ? (
                <>
                  <h2 className="text-center text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">
                    WELCOME
                    <br />
                    BACK!
                  </h2>
                  <p className="mt-4 max-w-xs text-center text-sm text-white/80">
                    Sign in with the account your agency gave you.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">START HERE</h2>
                  <p className="mt-4 max-w-xs text-center text-sm text-white/80">
                    Create a new agency workspace — for owners starting fresh.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "auth-form-side auth-form-side--active",
            isLogin ? "auth-form-side--left" : "auth-form-side--right auth-form-side--scroll",
          )}
        >
          <div className={cn("w-full", isLogin ? "max-w-md" : "max-w-lg")}>
            {isLogin ? (
              <>
                <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-4xl">Login</h1>
                <p className="mb-8 text-sm text-slate-500">
                  Sign in with Google — or use email if your team gave you a password.
                </p>
                <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-slate-100" />}>
                  <CinematicLoginForm />
                </Suspense>
              </>
            ) : (
              <>
                <h1 className="mb-1 text-2xl font-bold text-slate-900 sm:text-4xl">Create account</h1>
                <p className="mb-4 text-sm text-slate-500">
                  Fill in your details — we&apos;ll email you a confirmation link to access your workspace.
                </p>
                <CinematicRegisterForm />
              </>
            )}
          </div>
        </div>
          </div>
        </div>
        </div>

        <p className="shrink-0 pt-3 text-center text-xs text-slate-500">
          © 2026 AgencyFlow · Secure multi-tenant CRM
        </p>
      </div>
    </div>
  );
}
