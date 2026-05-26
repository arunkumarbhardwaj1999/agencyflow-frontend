"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "./auth-shell";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export function AuthPage({ initialMode }: { initialMode: "login" | "register" }) {
  const router = useRouter();

  function handleModeChange(mode: "login" | "register") {
    router.push(mode === "login" ? "/login" : "/register");
  }

  return (
    <AuthShell mode={initialMode} onModeChange={handleModeChange}>
      {initialMode === "login" ? <LoginForm /> : <RegisterForm />}
    </AuthShell>
  );
}
