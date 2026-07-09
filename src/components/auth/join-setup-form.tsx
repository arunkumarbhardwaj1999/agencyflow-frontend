"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { generateStrongPassword, passwordHints } from "@/lib/password";
import type { InvitePreview } from "@/lib/types";

export function JoinSetupForm({
  invite,
  token,
}: {
  invite: InvitePreview;
  token: string;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(invite.first_name);
  const [lastName, setLastName] = useState(invite.last_name ?? "");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [useGenerated, setUseGenerated] = useState(false);

  const hints = password.length > 0 ? passwordHints(password) : [];

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<{ message: string; email: string }>("/auth/invite/setup", {
        method: "POST",
        body: JSON.stringify({
          token,
          first_name: firstName,
          last_name: lastName || null,
          password,
        }),
      }),
    onSuccess: (data) => {
      const params = new URLSearchParams({
        token,
        email: data.email,
      });
      router.push(`/join/verify-email?${params.toString()}`);
    },
  });

  function applyGenerated() {
    setPassword(generateStrongPassword());
    setUseGenerated(true);
    setVisible(true);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        A new AgencyFlow account will be created for{" "}
        <strong>{invite.invited_email}</strong>.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>First name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <Label>Last name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Password</Label>
        <div className="relative">
          <Input
            type={visible ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setUseGenerated(false);
            }}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={applyGenerated}>
          <RefreshCw className="h-3.5 w-3.5" />
          Use strong password
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setPassword("");
            setUseGenerated(false);
          }}
        >
          Choose your own
        </Button>
      </div>

      {useGenerated && password && (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
          <KeyRound className="mb-1 inline h-3.5 w-3.5" /> Strong password generated. Save it or
          proceed — you can sign in with Google or this password later.
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          disabled={mutation.isPending || password.length < 8 || !firstName.trim()}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Sending code…" : "Sign up & accept"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/login">Back</Link>
        </Button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  );
}
