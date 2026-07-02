"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, UserPlus } from "lucide-react";

import { apiFetch } from "@/lib/api";
import type { StaffMember } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Reveal } from "@/components/ui/reveal";
import { Modal } from "@/components/ui/modal";
import { WorkspaceLogo } from "./workspace-logo";

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["manager", "employee", "client"]),
});

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-600",
];

function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function initials(first: string, last?: string | null) {
  return `${first.charAt(0)}${last?.charAt(0) ?? ""}`.toUpperCase();
}

const roleBadge: Record<string, "default" | "violet" | "info" | "secondary"> = {
  owner: "violet",
  manager: "default",
  employee: "info",
  client: "secondary",
};

export function TeamPanel() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { role: "employee" },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: () => apiFetch<StaffMember[]>("/users"),
  });

  const createMutation = useMutation({
    mutationFn: (body: z.infer<typeof schema>) =>
      apiFetch<StaffMember>("/users", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      reset({ role: "employee" });
      qc.invalidateQueries({ queryKey: ["staff"] });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<StaffMember> }) =>
      apiFetch<StaffMember>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team</h1>
          <p className="text-sm text-slate-500">Manage members, roles &amp; access</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add member
        </Button>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add team member"
        description="Invite a teammate and set their role"
        icon={UserPlus}
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="member-form" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create member"}
            </Button>
          </>
        }
      >
        <form id="member-form" onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid gap-4 py-2 sm:grid-cols-2">
          <div>
            <Label>First name</Label>
            <Input {...register("first_name")} />
          </div>
          <div>
            <Label>Last name</Label>
            <Input {...register("last_name")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" {...register("password")} />
          </div>
          <div>
            <Label>Role</Label>
            <Select {...register("role")}>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            {Object.keys(errors).length > 0 && (
              <p className="text-sm text-rose-600">Please fill all required fields correctly.</p>
            )}
            {createMutation.isError && (
              <p className="text-sm text-rose-600">{(createMutation.error as Error).message}</p>
            )}
          </div>
        </form>
      </Modal>

      <Reveal>
        <WorkspaceLogo />
      </Reveal>

      <Reveal>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Team members</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Member</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {staff.map((u) => (
                  <TR key={u.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${avatarGradient(u.email)}`}
                        >
                          {initials(u.first_name, u.last_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {u.first_name} {u.last_name ?? ""}
                          </p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <Badge variant={roleBadge[u.role] ?? "secondary"} className="capitalize">
                        {u.role}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge variant={u.is_active ? "success" : "secondary"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            updateMutation.mutate({ id: u.id, patch: { role: e.target.value as StaffMember["role"] } })
                          }
                          className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 disabled:opacity-50"
                          disabled={u.role === "owner"}
                        >
                          <option value="owner">Owner</option>
                          <option value="manager">Manager</option>
                          <option value="employee">Employee</option>
                          <option value="client">Client</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={u.role === "owner"}
                          onClick={() => updateMutation.mutate({ id: u.id, patch: { is_active: !u.is_active } })}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
                {staff.length === 0 && (
                  <TR className="hover:bg-transparent">
                    <TD colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No members found.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
