"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthBackground } from "./auth-background";
import { CinematicLoginForm } from "./cinematic-login-form";
import { CinematicRegisterForm } from "./cinematic-register-form";
import "./auth-cinematic.css";

type Mode = "login" | "register";

export function CinematicAuth({
  mode,
  onModeChange,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}) {
  const [transitioning, setTransitioning] = useState(false);
  const isLogin = mode === "login";

  function switchMode(next: Mode) {
    if (next === mode || transitioning) return;
    setTransitioning(true);
    onModeChange(next);
  }

  useEffect(() => {
    if (!transitioning) return;
    const t = window.setTimeout(() => setTransitioning(false), 850);
    return () => window.clearTimeout(t);
  }, [transitioning]);

  return (
    <div className="auth-cinematic relative flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
      <AuthBackground />

      <Link
        href="/"
        className="absolute left-6 top-6 z-20 flex items-center gap-2.5 text-slate-700 transition-opacity hover:opacity-80 sm:left-8 sm:top-8"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50">
          <LayoutGrid className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="text-sm font-semibold tracking-tight">AgencyFlow</span>
      </Link>

      <div className="auth-card relative z-10 flex h-[min(720px,92vh)] w-full max-w-[1080px] flex-col md:block">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[5] transition-opacity duration-500",
            transitioning ? "opacity-100" : "opacity-0",
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)",
          }}
        />

        <div
          className={cn(
            "auth-diagonal-panel",
            isLogin ? "auth-diagonal-panel--login" : "auth-diagonal-panel--register",
          )}
        >
          <div className="auth-diagonal-panel__inner relative overflow-hidden">
            <div className="auth-diagonal-panel__glow" />
            <div
              className={cn(
                "auth-welcome-text absolute inset-0 flex flex-col items-center justify-center px-8",
                isLogin ? "auth-welcome-text--visible" : "auth-welcome-text--hidden",
              )}
            >
              <Sparkles className="mb-4 h-8 w-8 text-white/80" />
              <h2 className="text-center text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">
                WELCOME
                <br />
                BACK!
              </h2>
              <p className="mt-4 max-w-xs text-center text-sm text-white/80">
                Your agency workspace is ready. Sign in to continue.
              </p>
            </div>
            <div
              className={cn(
                "auth-welcome-text absolute inset-0 flex flex-col items-center justify-center px-8",
                !isLogin ? "auth-welcome-text--visible" : "auth-welcome-text--hidden",
              )}
            >
              <Sparkles className="mb-4 h-8 w-8 text-white/80" />
              <h2 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl">WELCOME!</h2>
              <p className="mt-4 max-w-xs text-center text-sm text-white/80">
                Create your workspace and start managing leads, clients &amp; projects.
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "auth-form-side auth-form-side--left",
            isLogin ? "auth-form-side--active" : "auth-form-side--exit-left",
          )}
        >
          <div className="w-full max-w-sm">
            <h1 className="mb-1 text-3xl font-bold text-slate-900">Login</h1>
            <p className="mb-8 text-sm text-slate-500">Sign in to your workspace</p>
            <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-white/5" />}>
              <CinematicLoginForm onSwitchToRegister={() => switchMode("register")} />
            </Suspense>
          </div>
        </div>

        <div
          className={cn(
            "auth-form-side auth-form-side--right",
            !isLogin ? "auth-form-side--active" : "auth-form-side--exit-right",
          )}
        >
          <div className="w-full max-w-md">
            <h1 className="mb-1 text-3xl font-bold text-slate-900">Register</h1>
            <p className="mb-6 text-sm text-slate-500">Create your agency workspace</p>
            <CinematicRegisterForm onSwitchToLogin={() => switchMode("login")} />
          </div>
        </div>
      </div>

      <p className="absolute bottom-4 text-center text-xs text-slate-500">
        © 2026 AgencyFlow · Secure multi-tenant CRM
      </p>
    </div>
  );
}
