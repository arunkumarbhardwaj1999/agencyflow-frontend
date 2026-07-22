"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Kanban,
  Handshake,
  CalendarDays,
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
  X,
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

export function AppSidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
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
    <aside
      className={cn(
        "flex h-screen w-[min(18rem,88vw)] shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#4338ca] via-[#4f46e5] to-[#5b21b6] text-white shadow-[8px_0_32px_rgba(67,56,202,0.18)]",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-[15.5rem] lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
      aria-hidden={!open}
    >
      <div className="flex h-[4.25rem] items-center justify-between border-b border-white/10 px-5">
        <Link
          href={user?.role === "client" ? "/portal" : "/dashboard"}
          onClick={onClose}
          className="flex min-w-0 items-center gap-3 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/25 backdrop-blur">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[15px] font-bold tracking-tight">AgencyFlow</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-indigo-200/80">
              CRM workspace
            </span>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-indigo-100 transition hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-200/75">
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
                      onClick={onClose}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                        active
                          ? "bg-white text-indigo-700 shadow-md shadow-indigo-950/20"
                          : "text-indigo-50/90 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                          active ? "text-indigo-600" : "text-indigo-200",
                        )}
                      />
                      <span className="truncate">{label}</span>
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
