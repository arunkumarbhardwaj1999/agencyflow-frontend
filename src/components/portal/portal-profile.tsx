"use client";

import { AtSign, Mail, Phone, Shield, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePasswordChange } from "@/components/auth/password-change-context";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PortalMe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function initials(first: string, last?: string | null) {
  return `${first.charAt(0)}${last?.charAt(0) ?? ""}`.toUpperCase();
}

export function PortalProfile() {
  const user = useAuthStore((s) => s.user);
  const { openPasswordChange } = usePasswordChange();
  const { data: me } = useQuery({
    queryKey: ["portal-me"],
    queryFn: () => apiFetch<PortalMe>("/portal/me"),
  });

  if (!user) return null;
  const name = `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Your client portal account</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white">
            {initials(user.first_name, user.last_name)}
          </span>
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>
              {me?.business_name ?? "Client"} · {me?.company_name ?? "Agency"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Info icon={User} label="Name" value={name} />
          <Info icon={AtSign} label="Username" value={user.username} />
          <Info icon={Mail} label="Email" value={user.email} />
          <Info icon={Phone} label="Phone" value={user.phone || "Not added"} />
          <Info icon={Shield} label="Role" value="Client" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription>Update your password anytime.</CardDescription>
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

function Info({
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
      <Icon className="mt-0.5 h-4 w-4 text-indigo-500" />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 break-all text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}
