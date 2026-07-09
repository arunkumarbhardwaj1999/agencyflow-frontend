"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { AtSign, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";
import { AuthField } from "./auth-field";
import { AuthPasswordField } from "./auth-password-field";
import { GoogleSignInButton } from "../google-sign-in-button";

const schema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});

export function CinematicLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameFromUrl = searchParams.get("username")?.trim() ?? "";
  const emailFromUrl = searchParams.get("email")?.trim() ?? "";
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: usernameFromUrl || emailFromUrl },
  });

  const mutation = useMutation({
    mutationFn: (body: { username: string; password: string }) =>
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
    <div>
      <GoogleSignInButton intent="login" />

      <div className="auth-divider mt-4" aria-hidden>
        <span>or</span>
      </div>

      {!showPassword ? (
        <button
          type="button"
          className="auth-btn-google w-full"
          onClick={() => setShowPassword(true)}
        >
          Sign in with email &amp; password
        </button>
      ) : (
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <AuthField
            label="Username or email"
            placeholder="you@agency.com"
            autoComplete="username"
            icon={<AtSign className="h-4 w-4" />}
            error={errors.username?.message}
            {...register("username")}
          />
          <AuthPasswordField
            label="Password"
            autoComplete="current-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mb-4 -mt-1 text-right">
            <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
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
        </form>
      )}

      <p className="mt-5 text-center text-sm text-slate-500">
        Starting a <strong className="font-medium text-slate-700">new agency</strong>?{" "}
        <Link href="/register" className="auth-link">
          Create workspace
        </Link>
      </p>
    </div>
  );
}
