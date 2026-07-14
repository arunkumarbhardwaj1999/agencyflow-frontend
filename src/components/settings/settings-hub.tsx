"use client";

import Link from "next/link";
import {
  Building2,
  KeyRound,
  Plug,
  UserCog,
  Workflow,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePasswordChange } from "@/components/auth/password-change-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  {
    href: "/settings/integrations",
    title: "Integrations",
    description: "Email, WhatsApp, SMS, payments, and AI providers.",
    icon: Plug,
  },
  {
    href: "/settings/profile",
    title: "Your profile",
    description: "Name, contact details, and account security.",
    icon: Building2,
  },
  {
    href: "/team",
    title: "Team & hiring",
    description: "Invite managers, employees, and clients to the workspace.",
    icon: UserCog,
  },
  {
    href: "/automations",
    title: "Automation",
    description: "Build workflows for leads, deals, projects, and invoices.",
    icon: Workflow,
  },
];

export function SettingsHub() {
  const user = useAuthStore((s) => s.user);
  const { openPasswordChange } = usePasswordChange();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Workspace settings</h1>
        <p className="text-sm text-slate-500">
          Full control of {user?.first_name ? "your" : "the"} AgencyFlow workspace — integrations, team, and security.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-indigo-600" />
            Security
          </CardTitle>
          <CardDescription>Update your owner account password anytime.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={openPasswordChange}>
            Change password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
