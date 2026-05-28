"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

const schema = z.object({
  token: z.string().min(16, "Paste reset token"),
  new_password: z.string().min(8, "At least 8 characters"),
});

export default function ResetPasswordPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => reset(),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter token and your new password.</p>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-4 space-y-4">
          <div>
            <Label>Reset token</Label>
            <Input {...register("token")} />
            {errors.token && <p className="mt-1 text-xs text-red-500">{errors.token.message}</p>}
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" {...register("new_password")} />
            {errors.new_password && <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>}
          </div>
          {mutation.isError && <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>}
          {mutation.isSuccess && <p className="text-sm text-emerald-600">Password reset successfully.</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
