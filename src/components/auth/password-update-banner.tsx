"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { usePasswordChange } from "./password-change-context";

export function PasswordUpdateBanner() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const { openPasswordChange } = usePasswordChange();

  const dismiss = useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>("/auth/dismiss-password-prompt", { method: "POST" }),
    onSuccess: async () => {
      if (user) setUser({ ...user, must_change_password: false });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  if (!user?.must_change_password) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
        <div>
          <p className="font-medium">Want to set your own password?</p>
          <p className="mt-0.5 text-indigo-900/80">
            You&apos;re signed in with the password from your email. Keep using it, or choose a new
            one right here on the dashboard.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        <Button type="button" size="sm" onClick={openPasswordChange}>
          Update password
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-100"
          onClick={() => dismiss.mutate()}
          disabled={dismiss.isPending}
        >
          {dismiss.isPending ? "Saving…" : "Keep email password"}
        </Button>
      </div>
    </div>
  );
}
