"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AtSign, KeyRound, Mail, Pencil, Phone, Plug, Shield, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePasswordChange } from "@/components/auth/password-change-context";
import { apiFetch } from "@/lib/api";
import type { User as AuthUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { HrPanel } from "@/components/hr/hr-panel";

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
  const setUser = useAuthStore((s) => s.setUser);
  const { openPasswordChange } = usePasswordChange();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user || !editing) return;
    setFirstName(user.first_name);
    setLastName(user.last_name ?? "");
    setPhone(user.phone ?? "");
  }, [user, editing]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch<AuthUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          phone: phone.trim() || null,
        }),
      }),
    onSuccess: (updated) => {
      setUser(updated);
      setEditing(false);
    },
  });

  if (!user) return null;

  const name = `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your account details and security settings</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit profile
        </Button>
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
              <CardDescription>Email delivery status for your agency.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/settings/integrations">Open integrations</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {user.role === "employee" && <HrPanel selfOnly />}

      <Modal
        open={editing}
        onClose={() => !saveMutation.isPending && setEditing(false)}
        title="Edit profile"
        description="Update your name and phone. Email and username stay the same."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending}
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !firstName.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={user.username} disabled />
            </div>
          </div>
          {saveMutation.isError && (
            <p className="text-sm text-red-600">{(saveMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
