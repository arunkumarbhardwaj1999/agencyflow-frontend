"use client";

import { useEffect, useState } from "react";
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
  "/hr/leaves": "Leave requests",
  "/hr/holidays": "Holiday calendar",
  "/automations": "Automation",
  "/proposals": "Proposals",
  "/contracts": "Contracts",
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

const pageSubtitles: Record<string, string> = {
  "/dashboard": "Overview of your agency workspace",
  "/team": "Manage members and roles",
  "/leads": "Pipeline board with draggable stage cards",
  "/deals": "Sales opportunities — drag cards across stages",
  "/clients": "Accounts and account managers",
  "/projects": "Delivery work across clients",
  "/tasks": "Kanban board for team work",
  "/time": "Log and review tracked hours",
  "/documents": "Files shared across the workspace",
  "/inbox": "Messages and conversation threads",
  "/calendar": "Schedule and upcoming events",
  "/finance": "Invoices, payments, and cashflow",
  "/hr": "People, attendance, and payroll tools",
  "/hr/leaves": "Search, filter, and review leave requests",
  "/hr/holidays": "Company holidays with search and full list",
  "/automations": "Triggers and automated actions",
  "/proposals": "Create, preview, and send branded proposals",
  "/contracts": "Agreements, e-signatures, and renewals",
  "/settings": "Workspace preferences",
  "/settings/integrations": "Connect email and other services",
  "/settings/profile": "Your account details",
  "/portal": "Your client workspace",
  "/portal/projects": "Projects shared with you",
  "/portal/tasks": "Tasks assigned to you",
  "/portal/files": "Shared files",
  "/portal/invoices": "Your invoices",
  "/portal/approvals": "Items waiting for your approval",
  "/portal/messages": "Messages with the agency",
  "/portal/profile": "Your profile",
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

function resolveSubtitle(pathname: string) {
  if (pathname.startsWith("/leads/") || pathname.startsWith("/deals/") || pathname.startsWith("/clients/") || pathname.startsWith("/tasks/") || pathname.startsWith("/projects/") || pathname.startsWith("/portal/projects/")) {
    return undefined;
  }
  return pageSubtitles[pathname];
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
  const subtitle = resolveSubtitle(pathname);

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
      <ShellInner title={title} subtitle={subtitle}>
        {children}
      </ShellInner>
    </RealtimeProvider>
  );
}

function ShellInner({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { events } = useRealtime();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  return (
    <PasswordChangeProvider>
      <div className="flex h-screen overflow-hidden bg-transparent">
        {navOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        )}
        <AppSidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="relative w-full px-4 py-4 sm:px-6 sm:py-5 lg:px-8 xl:px-10">
            <DashboardHeader
              title={title}
              subtitle={subtitle}
              onMenuClick={() => setNavOpen(true)}
            />
            <PasswordUpdateBanner />
            <div className="animate-fade-in space-y-6">{children}</div>
          </div>
        </main>
        <LiveToastStack events={events} />
      </div>
    </PasswordChangeProvider>
  );
}
