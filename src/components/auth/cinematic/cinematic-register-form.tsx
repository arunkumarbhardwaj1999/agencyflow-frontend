"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Mail, RefreshCw, User } from "lucide-react";
import { GoogleSignInButton } from "../google-sign-in-button";
import { AuthField } from "./auth-field";
import { apiFetch } from "@/lib/api";
import { generateStrongPassword, passwordHints } from "@/lib/password";
import type { GoogleRegisterPending } from "@/lib/types";

export function CinematicRegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const hints = password.length > 0 ? passwordHints(password) : [];

  function goCheckEmail(data: GoogleRegisterPending) {
    const params = new URLSearchParams({ email: data.email });
    if (data.confirm_link) params.set("confirm_link", data.confirm_link);
    if (data.email_error) params.set("email_error", data.email_error);
    if (data.email_sent === false) params.set("email_failed", "1");
    router.push(`/register/check-email?${params.toString()}`);
  }

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<GoogleRegisterPending>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName || null,
          email,
          password,
        }),
      }),
    onSuccess: goCheckEmail,
  });

  return (
    <form
      className="auth-register-form w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !mutation.isPending &&
          agreed &&
          firstName.trim() &&
          email.includes("@") &&
          password.length >= 8
        ) {
          mutation.mutate();
        }
      }}
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-500">
        <strong className="text-slate-700">New agency owners only.</strong> Team members use an{" "}
        <Link href="/login" className="auth-link">
          invite link
        </Link>
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <AuthField
          label="First name"
          placeholder="Enter your first name"
          icon={<User className="h-4 w-4" />}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <AuthField
          label="Last name"
          placeholder="Enter your last name"
          icon={<User className="h-4 w-4" />}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mt-3">
        <AuthField
          label="Email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">
          We&apos;ll send a confirmation link to this email.
        </p>
      </div>

      <div className="relative mt-3">
        <AuthField
          label="Password"
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          icon={<KeyRound className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {hints.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-amber-700">
          {hints.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => {
            setPassword(generateStrongPassword());
            setVisible(true);
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Use strong password
        </button>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
          onClick={() => setPassword("")}
        >
          Choose your own
        </button>
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          I agree to AgencyFlow{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            terms of service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            privacy policy
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        className="auth-btn-primary mt-4"
        disabled={
          mutation.isPending ||
          !agreed ||
          !firstName.trim() ||
          !email.includes("@") ||
          password.length < 8
        }
      >
        {mutation.isPending ? "Creating…" : "Sign up"}
      </button>

      {mutation.isError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {(mutation.error as Error).message}
        </p>
      )}

      <p className="auth-divider my-5 text-center text-xs uppercase tracking-wide text-slate-400">
        Sign up using
      </p>

      <GoogleSignInButton intent="register" onRegisterComplete={goCheckEmail} />

      <p className="mt-5 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </form>
  );
}
