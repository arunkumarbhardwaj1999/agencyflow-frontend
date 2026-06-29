"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Lock, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";
import { AuthField } from "./auth-field";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  remember: z.boolean().optional(),
});

export function CinematicLoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email")?.trim() ?? "";

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromUrl, remember: false },
  });

  const mutation = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      apiFetch<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      router.push("/dashboard");
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate({ email: d.email, password: d.password }))}>
      <AuthField
        label="Email"
        type="email"
        placeholder="you@agency.com"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register("email")}
      />
      <AuthField
        label="Password"
        type="password"
        autoComplete="current-password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="mb-6 flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 bg-white accent-indigo-600"
            {...register("remember")}
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="auth-link text-sm">
          Forgot password?
        </Link>
      </div>

      {mutation.isError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {(mutation.error as Error).message}
        </p>
      )}

      <button type="submit" className="auth-btn-primary" disabled={mutation.isPending}>
        {mutation.isPending ? "Signing in…" : "Login"}
      </button>

      <button type="button" className="auth-btn-google mt-3" disabled>
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitchToRegister} className="auth-link">
          Sign Up
        </button>
      </p>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
