"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthSimpleShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export default function JoinAcceptedPage() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    if (seconds <= 0) {
      router.push("/dashboard");
      return;
    }
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds, router]);

  return (
    <AuthSimpleShell
      title="Accepted"
      subtitle="You are now part of this organization."
    >
      <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-600" />
        <p className="text-lg font-semibold text-emerald-950">Welcome to the team!</p>
        <p className="mt-2 text-sm text-emerald-800">
          You will be redirected in <strong>{seconds}</strong> second{seconds === 1 ? "" : "s"}.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          Redirect now
        </Button>
      </div>
    </AuthSimpleShell>
  );
}
