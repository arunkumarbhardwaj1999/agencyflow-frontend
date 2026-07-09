"use client";

import Link from "next/link";
import { AtSign, KeyRound, Mail, Phone, Plug, Shield, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePasswordChange } from "@/components/auth/password-change-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function initials(first: string, last?: string | null) {
  return `${first.charAt(0)}${last?.charAt(0) ?? ""}`.toUpperCase();
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 break-all text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function ProfilePanel() {
  const user = useAuthStore((s) => s.user);
  const { openPasswordChange } = usePasswordChange();

  if (!user) return null;

  const name = `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account details and security settings</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-md">
            {initials(user.first_name, user.last_name)}
          </span>
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription className="capitalize">{user.role} · AgencyFlow workspace</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={User} label="Full name" value={name} />
          <InfoRow icon={AtSign} label="Username" value={user.username} />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Phone" value={user.phone || "Not added"} />
          <InfoRow icon={Shield} label="Role" value={user.role} />
          <InfoRow
            icon={Shield}
            label="Account status"
            value={user.is_active ? "Active" : "Inactive"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              Security
            </CardTitle>
            <CardDescription>Update your password anytime — optional if you use email password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={openPasswordChange}>
              Change password
            </Button>
          </CardContent>
        </Card>

        {user.role === "owner" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plug className="h-4 w-4 text-emerald-600" />
                Workspace integrations
              </CardTitle>
              <CardDescription>Email, WhatsApp, and automation for your agency.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/settings/integrations">Open integrations</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
