"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CinematicAuth } from "./cinematic/cinematic-auth";

export function AuthPage({ initialMode }: { initialMode: "login" | "register" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function handleModeChange(next: "login" | "register") {
    setMode(next);
    router.replace(next === "login" ? "/login" : "/register", { scroll: false });
  }

  return <CinematicAuth mode={mode} onModeChange={handleModeChange} />;
}
