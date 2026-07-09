"use client";

import { CinematicAuth } from "./cinematic/cinematic-auth";

export function AuthPage({ initialMode }: { initialMode: "login" | "register" }) {
  return <CinematicAuth mode={initialMode} />;
}
