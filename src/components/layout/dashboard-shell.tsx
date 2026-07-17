"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "./app-sidebar";
import { PasswordUpdateBanner } from "@/components/auth/password-update-banner";
import { PasswordChangeProvider } from "@/components/auth/password-change-context";
import { DashboardHeader } from "./dashboard-header";
import { LiveToastStack } from "@/components/realtime/live-toast-stack";
import { RealtimeProvider, useRealtime } from "@/providers/realtime-provider";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/types";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/team": "Team",
  "/leads": "Leads",
  "/deals": "Deals",
  "/clients": "Clients",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/time": "Time Tracking",
  "/documents": "Documents",
  "/inbox": "Communication Center",
  "/reports": "Reports",
  "/calendar": "Calendar",
  "/finance": "Finance",
  "/hr": "HR",
  "/automations": "Automation",
  "/settings": "Settings",
  "/settings/integrations": "Integrations",
  "/settings/profile": "Profile",
  "/portal": "Client portal",
  "/portal/projects": "Projects",
  "/portal/tasks": "Tasks",
  "/portal/files": "Files",
  "/portal/invoices": "Invoices",
  "/portal/approvals": "Approvals",
  "/portal/messages": "Messages",
  "/portal/profile": "Profile",
};

const EMPLOYEE_PREFIXES = [
  "/dashboard",
  "/tasks",
  "/projects",
  "/calendar",
  "/documents",
  "/inbox",
  "/time",
  "/settings/profile",
  "/hr",
];

const MANAGER_PREFIXES = [
  "/dashboard",
  "/leads",
  "/deals",
  "/clients",
  "/projects",
  "/tasks",
  "/calendar",
  "/documents",
  "/inbox",
  "/reports",
  "/settings/profile",
  "/hr",
  "/proposals",
  "/contracts",
];

function isAllowed(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/portal/projects/")) return "Project";
  if (pathname.startsWith("/leads/")) return "Lead details";
  if (pathname.startsWith("/deals/")) return "Deal details";
  if (pathname.startsWith("/clients/")) return "Client";
  if (pathname.startsWith("/tasks/")) return "Task";
  if (pathname.startsWith("/projects/")) return "Project";
  return pageTitles[pathname] ?? "AgencyFlow";
}

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
      } else if (data.role === "employee" && !isAllowed(pathname, EMPLOYEE_PREFIXES)) {
        router.replace("/dashboard");
      } else if (data.role === "manager" && !isAllowed(pathname, MANAGER_PREFIXES)) {
        router.replace("/dashboard");
      }
    }
    if (isError) router.replace("/login");
  }, [data, isError, router, setUser, pathname]);

  const title = resolveTitle(pathname);

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
    <RealtimeProvider>
      <ShellInner title={title} role={data.role}>
        {children}
      </ShellInner>
    </RealtimeProvider>
  );
}

function ShellInner({
  title,
  role,
  children,
}: {
  title: string;
  role: string;
  children: React.ReactNode;
}) {
  const { events } = useRealtime();
  const showNewLead =
    (title === "Dashboard" || title === "Leads") && (role === "owner" || role === "manager");

  return (
    <PasswordChangeProvider>
      <div className="flex h-screen overflow-hidden bg-transparent">
        <AppSidebar />
        <main className="relative flex-1 overflow-y-auto">
          <div className="relative w-full px-5 py-5 sm:px-6 lg:px-8 xl:px-10">
            <DashboardHeader title={title} showNewLead={showNewLead} />
            <PasswordUpdateBanner />
            <div className="animate-fade-in space-y-6">{children}</div>
          </div>
        </main>
        <LiveToastStack events={events} />
      </div>
    </PasswordChangeProvider>
  );
}
