"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/types";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/team": "Team",
  "/leads": "Leads",
  "/clients": "Clients",
  "/projects": "Projects",
  "/finance": "Finance",
  "/portal": "Client portal",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isError, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<User>("/auth/me"),
    enabled: !!getAccessToken(),
    retry: false,
  });

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    if (data) {
      setUser(data);
      if (data.role === "client" && !pathname.startsWith("/portal")) {
        router.replace("/portal");
      } else if (data.role !== "client" && pathname.startsWith("/portal")) {
        router.replace("/dashboard");
      }
    }
    if (isError) router.replace("/login");
  }, [data, isError, router, setUser, pathname]);

  const title = pageTitles[pathname] ?? "AgencyFlow";

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fc]">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full px-6 py-6 lg:px-8 xl:px-10">
          <DashboardHeader title={title} showNewLead={pathname === "/dashboard"} />
          {children}
        </div>
      </main>
    </div>
  );
}
