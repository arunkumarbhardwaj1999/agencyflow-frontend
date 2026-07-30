"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AtSign, Mail, Pencil, Phone, Shield, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { usePasswordChange } from "@/components/auth/password-change-context";
import { apiFetch } from "@/lib/api";
import type { PortalMe, User as AuthUser } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

function initials(first: string, last?: string | null) {
  return `${first.charAt(0)}${last?.charAt(0) ?? ""}`.toUpperCase();
}

export function PortalProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { openPasswordChange } = usePasswordChange();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: me } = useQuery({
    queryKey: ["portal-me"],
    queryFn: () => apiFetch<PortalMe>("/portal/me"),
  });

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
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="text-sm text-slate-500">Your client portal account</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit profile
        </Button>
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
          {saveMutation.isError && (
            <p className="text-sm text-red-600">{(saveMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>
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
