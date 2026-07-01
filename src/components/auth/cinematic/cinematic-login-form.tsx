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
import { GoogleSignInButton } from "../google-sign-in-button";

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

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitchToRegister} className="auth-link">
          Sign Up
        </button>
      </p>
    </form>
  );
}
