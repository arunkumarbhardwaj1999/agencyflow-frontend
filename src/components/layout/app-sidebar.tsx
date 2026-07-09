"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Kanban,
  FolderKanban,
  Receipt,
  LayoutGrid,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const navGroupsBase: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Sales",
    items: [
      { href: "/leads", label: "Leads", icon: Kanban },
      { href: "/clients", label: "Clients", icon: Users },
    ],
  },
  {
    title: "Delivery",
    items: [{ href: "/projects", label: "Projects", icon: FolderKanban }],
  },
  {
    title: "Finance",
    items: [{ href: "/finance", label: "Invoices", icon: Receipt }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navGroups =
    user?.role === "client"
      ? [{ title: "Portal", items: [{ href: "/portal", label: "My portal", icon: LayoutDashboard }] }]
      : user?.role === "owner"
        ? [
            {
              title: "Overview",
              items: [...navGroupsBase[0].items, { href: "/team", label: "Team", icon: UserCog }],
            },
            ...navGroupsBase.slice(1),
            {
              title: "Settings",
              items: [{ href: "/settings/integrations", label: "Integrations", icon: Plug }],
            },
          ]
        : user?.role === "employee"
          ? navGroupsBase.filter((g) => g.title !== "Finance" && g.title !== "Sales")
          : navGroupsBase;

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
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
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
                      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active ? "text-white" : "text-indigo-200")} />
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
