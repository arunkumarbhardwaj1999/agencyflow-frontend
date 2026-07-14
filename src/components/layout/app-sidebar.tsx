"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Kanban,
  Handshake,
  CalendarDays,
  FileText,
  FolderKanban,
  Receipt,
  LayoutGrid,
  Plug,
  Briefcase,
  Workflow,
  ListTodo,
  Folders,
  Settings,
  BarChart3,
  Inbox,
  FileSignature,
  Clock,
  UserRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const employeeNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/tasks", label: "My Tasks", icon: ListTodo },
      { href: "/projects", label: "My Projects", icon: FolderKanban },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/documents", label: "Documents", icon: Folders },
      { href: "/inbox", label: "Messages", icon: Inbox },
      { href: "/time", label: "Time Tracking", icon: Clock },
      { href: "/settings/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const managerNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: Kanban },
      { href: "/deals", label: "Deals", icon: Handshake },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/tasks", label: "Tasks", icon: ListTodo },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/documents", label: "Documents", icon: Folders },
      { href: "/inbox", label: "Communication Center", icon: Inbox },
      { href: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

const ownerNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Command center",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: Kanban },
      { href: "/deals", label: "Deals", icon: Handshake },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/tasks", label: "Tasks", icon: ListTodo },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/documents", label: "Documents", icon: Folders },
      { href: "/finance", label: "Finance", icon: Receipt },
      { href: "/hr", label: "HR", icon: Briefcase },
      { href: "/automations", label: "Automation", icon: Workflow },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/team", label: "Team", icon: UserCog },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/settings/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

const clientNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Portal",
    items: [
      { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
      { href: "/portal/projects", label: "Projects", icon: FolderKanban },
      { href: "/portal/tasks", label: "Tasks", icon: ListTodo },
      { href: "/portal/files", label: "Files", icon: Folders },
      { href: "/portal/invoices", label: "Invoices", icon: Receipt },
      { href: "/portal/approvals", label: "Approvals", icon: FileSignature },
      { href: "/portal/messages", label: "Messages", icon: Inbox },
      { href: "/portal/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const fallbackNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: Kanban },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/hr", label: "HR", icon: Briefcase },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navGroups =
    user?.role === "client"
      ? clientNavGroups
      : user?.role === "owner"
        ? ownerNavGroups
        : user?.role === "employee"
          ? employeeNavGroups
          : user?.role === "manager"
            ? managerNavGroups
            : fallbackNav;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-gradient-to-b from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl">
      <Link
        href={user?.role === "client" ? "/portal" : "/dashboard"}
        className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5 transition hover:bg-white/5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <span className="text-[15px] font-bold tracking-tight">AgencyFlow</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-indigo-200/80">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/settings"
                    ? pathname === "/settings"
                    : href === "/portal"
                      ? pathname === "/portal"
                      : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={`${group.title}-${label}`}>
                    <Link
                      href={href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-white/20 text-white shadow-sm ring-1 ring-white/10"
                          : "text-indigo-100 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                          active ? "text-white" : "text-indigo-200",
                        )}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
