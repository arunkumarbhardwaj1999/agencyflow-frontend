"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { apiFetch } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import type { TokenResponse } from "@/lib/types";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function GoogleSignInButton() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(320);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setButtonWidth(Math.max(Math.floor(el.offsetWidth), 200));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mutation = useMutation({
    mutationFn: (credential: string) =>
      apiFetch<TokenResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
      }),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      router.push("/dashboard");
    },
    onError: (err: Error) => setError(err.message),
  });

  if (!CLIENT_ID) {
    return (
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Google sign-in needs <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in{" "}
        <code className="font-mono">.env.local</code>
      </p>
    );
  }

  function onSuccess(res: CredentialResponse) {
    if (!res.credential) {
      setError("Google did not return a sign-in token");
      return;
    }
    setError(null);
    mutation.mutate(res.credential);
  }

  return (
    <div ref={containerRef} className="mt-3 w-full">
      <div className={mutation.isPending ? "pointer-events-none opacity-60" : undefined}>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={() => setError("Google sign-in was cancelled or failed")}
          theme="outline"
          size="large"
          width={buttonWidth}
          text="continue_with"
          shape="pill"
        />
      </div>
      {(error || mutation.isError) && (
        <p className="mt-2 text-sm text-red-600">
          {error ?? (mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
