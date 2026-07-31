 "use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, UserPlus, Users } from "lucide-react";

import { apiFetch } from "@/lib/api";
import type { Member, StaffMember, TeamGroup } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Reveal } from "@/components/ui/reveal";
import { Modal } from "@/components/ui/modal";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["manager", "employee", "client"]),
});

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
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

function roleLabel(role: StaffMember["role"]) {
  if (role === "owner") return "CEO";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function profileLabel(role: StaffMember["role"]) {
  if (role === "owner" || role === "manager") return "Administrator";
  if (role === "employee") return "Standard";
  return "Client";
}

function memberStatus(u: StaffMember): { label: string; variant: "success" | "warning" | "secondary" } {
  if (!u.is_active) return { label: "Inactive", variant: "secondary" };
  if (!u.is_verified) return { label: "Pending invite", variant: "warning" };
  return { label: "Active", variant: "success" };
}

const roleBadge: Record<string, "default" | "violet" | "info" | "secondary"> = {
  owner: "violet",
  manager: "default",
  employee: "info",
  client: "secondary",
};

export function TeamPanel() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"users" | "groups" | "activate">("users");
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteWarning, setInviteWarning] = useState<string | null>(null);
  const [lastInviteEmail, setLastInviteEmail] = useState<string | null>(null);
  const [resendUserId, setResendUserId] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "employee" },
  });
  const groupForm = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: () => apiFetch<StaffMember[]>("/users"),
  });
  const { data: members = [] } = useQuery({
    queryKey: ["staff-members"],
    queryFn: () => apiFetch<Member[]>("/users/members"),
  });
  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return staff;
    return staff.filter((u) => {
      const fullName = `${u.first_name} ${u.last_name ?? ""}`.toLowerCase();
      return (
        fullName.includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      );
    });
  }, [staff, search]);
  const { data: groups = [] } = useQuery({
    queryKey: ["staff-groups"],
    queryFn: () => apiFetch<TeamGroup[]>("/users/groups"),
  });

  const activeCount = staff.filter((u) => u.is_active && u.is_verified).length;
  const pendingCount = staff.filter((u) => u.is_active && !u.is_verified).length;

  const inviteMutation = useMutation({
    mutationFn: (body: z.infer<typeof userSchema>) =>
      apiFetch<{
        message: string;
        invite_token?: string | null;
        email_sent?: boolean;
        email_error?: string | null;
      }>("/users/invite", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data, variables) => {
      reset({ role: "employee" });
      qc.invalidateQueries({ queryKey: ["staff"] });
      setInviteSent(true);
      setLastInviteEmail(variables.email);
      setInviteWarning(
        data.email_sent === false
          ? data.email_error ?? "Email could not be sent. Share the invite link below."
          : null,
      );
      if (data.email_sent) {
        setTimeout(() => {
          setShowModal(false);
          setInviteSent(false);
          setInviteWarning(null);
        }, 2500);
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: (userId: string) =>
      apiFetch<{
        message: string;
        invite_token?: string | null;
        email_sent?: boolean;
        email_error?: string | null;
        email: string;
      }>(`/users/${userId}/resend-invite`, { method: "POST" }),
    onSuccess: (data) => {
      setResendUserId(null);
      if (data.email_sent) {
        window.alert(`Invite email resent to ${data.email}`);
      } else {
        setShowModal(true);
        setInviteSent(true);
        setLastInviteEmail(data.email);
        setInviteWarning(
          data.email_error ?? "Email could not be delivered. Please check email integration settings.",
        );
      }
    },
  });
  const createGroupMutation = useMutation({
    mutationFn: (body: { name: string; member_ids: string[] }) =>
      apiFetch<TeamGroup>("/users/groups", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      groupForm.reset();
      setSelectedMemberIds([]);
      setShowGroupModal(false);
      qc.invalidateQueries({ queryKey: ["staff-groups"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<StaffMember> }) =>
      apiFetch<StaffMember>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });

  function openModal() {
    setInviteSent(false);
    setInviteWarning(null);
    reset({ role: "employee" });
    setShowModal(true);
  }
  const pendingInvites = useMemo(() => staff.filter((u) => !u.is_verified), [staff]);
  const rosterPagination = useClientPagination(filteredStaff, { resetKey: search });
  const activatePagination = useClientPagination(staff);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Active users ({activeCount})
          {pendingCount > 0 ? ` · ${pendingCount} pending invite${pendingCount > 1 ? "s" : ""}` : ""}
        </p>
        {tab === "users" && (
          <Button onClick={openModal} className="gap-2">
            <Plus className="h-4 w-4" />
            New User
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/80 p-1 shadow-sm">
        {[
          { id: "users", label: "Users" },
          { id: "groups", label: "Groups" },
          { id: "activate", label: "Activate Users" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-lg px-3.5 py-2 text-sm transition ${
              tab === t.id
                ? "bg-indigo-600 font-semibold text-white shadow-sm"
                : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            onClick={() => setTab(t.id as "users" | "groups" | "activate")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add New User"
        description="An invitation will be sent to their email address."
        icon={UserPlus}
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="member-form" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <form id="member-form" onSubmit={handleSubmit((d) => inviteMutation.mutate(d))} className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First name</Label>
              <Input {...register("first_name")} autoComplete="given-name" />
              {errors.first_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label>Last name</Label>
              <Input {...register("last_name")} autoComplete="family-name" />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="An invitation will be sent to this email address."
              {...register("email")}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label>Role</Label>
            <Select {...register("role")}>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </Select>
          </div>

          {inviteSent && !inviteWarning && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <p className="font-medium">Invitation sent</p>
              <p className="mt-1 text-xs text-emerald-700">
                {lastInviteEmail} will receive a Join now email with accept and decline options.
              </p>
            </div>
          )}
          {inviteWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-medium">Email could not be delivered</p>
              <p className="mt-1 text-xs">{inviteWarning}</p>
            </div>
          )}
          {inviteMutation.isError && (
            <p className="text-sm text-rose-600">{(inviteMutation.error as Error).message}</p>
          )}
        </form>
      </Modal>
      <Modal
        open={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title="Create Group"
        description="Create a group and add active users."
        icon={Users}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowGroupModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createGroupMutation.isPending}
              onClick={groupForm.handleSubmit((v) =>
                createGroupMutation.mutate({ name: v.name, member_ids: selectedMemberIds }),
              )}
            >
              {createGroupMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Group name</Label>
            <Input {...groupForm.register("name")} placeholder="Agency Flow" />
            {groupForm.formState.errors.name && (
              <p className="mt-1 text-xs text-rose-600">{groupForm.formState.errors.name.message}</p>
            )}
          </div>
          <Label>Add members</Label>
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedMemberIds.includes(m.id)}
                  onChange={(e) =>
                    setSelectedMemberIds((prev) =>
                      e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id),
                    )
                  }
                />
                <span>{m.name}</span>
                <span className="text-xs text-slate-500">{m.email}</span>
              </label>
            ))}
          </div>
          {createGroupMutation.isError && (
            <p className="text-sm text-rose-600">{(createGroupMutation.error as Error).message}</p>
          )}
        </div>
      </Modal>

      {tab === "users" && (
        <>
          <Reveal>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">Team members</CardTitle>
                <Input
                  className="sm:max-w-xs"
                  placeholder="Search by name, email, role…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                    {rosterPagination.pageItems.map((u) => {
                      const status = memberStatus(u);
                      return (
                        <TR key={u.id}>
                          <TD>
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${avatarGradient(u.email)}`}>
                                {initials(u.first_name, u.last_name)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">{u.first_name} {u.last_name ?? ""}</p>
                                <p className="truncate text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </TD>
                          <TD><Badge variant={roleBadge[u.role] ?? "secondary"} className="capitalize">{u.role}</Badge></TD>
                          <TD><Badge variant={status.variant}>{status.label}</Badge></TD>
                          <TD>
                            <div className="flex items-center justify-end gap-2">
                              {!u.is_verified && u.is_active && u.role !== "owner" && (
                                <Button variant="outline" size="sm" disabled={resendMutation.isPending && resendUserId === u.id} onClick={() => { setResendUserId(u.id); resendMutation.mutate(u.id); }}>
                                  {resendMutation.isPending && resendUserId === u.id ? "Sending…" : "Resend"}
                                </Button>
                              )}
                              <select
                                value={u.role}
                                onChange={(e) => updateMutation.mutate({ id: u.id, patch: { role: e.target.value as StaffMember["role"] } })}
                                className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600"
                                disabled={u.role === "owner"}
                              >
                                <option value="owner">Owner</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Employee</option>
                                <option value="client">Client</option>
                              </select>
                            </div>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
                <PaginationBar
                  page={rosterPagination.page}
                  totalPages={rosterPagination.totalPages}
                  total={rosterPagination.total}
                  pageSize={rosterPagination.pageSize}
                  from={rosterPagination.from}
                  to={rosterPagination.to}
                  onPageChange={rosterPagination.setPage}
                  onPageSizeChange={rosterPagination.setPageSize}
                />
              </CardContent>
            </Card>
          </Reveal>
        </>
      )}

      {tab === "groups" && (
        <Reveal>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Groups</CardTitle>
              <Button onClick={() => setShowGroupModal(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create Group
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {groups.length === 0 ? (
                <p className="text-sm text-slate-500">No groups created yet.</p>
              ) : (
                groups.map((g) => (
                  <div key={g.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{g.name}</p>
                      <Badge variant="secondary">{g.members_count} members</Badge>
                    </div>
                    <div className="mt-3 space-y-2">
                      {g.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                          <p className="text-slate-700">{m.name} <span className="text-slate-500">({m.email})</span></p>
                          <Badge variant={m.status === "Active" ? "success" : "warning"}>{m.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </Reveal>
      )}

      {tab === "activate" && (
        <Reveal>
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-semibold text-slate-900">Activate Users</CardTitle>
              <p className="text-sm text-slate-600">
                This page allows you to activate and deactivate users.
                {pendingInvites.length > 0 ? ` Pending invites: ${pendingInvites.length}.` : ""}
              </p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Full Name</TH>
                    <TH>Email Address</TH>
                    <TH>Role</TH>
                    <TH>Profile</TH>
                    <TH className="text-right">User Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {activatePagination.pageItems.map((u) => (
                    <TR key={u.id}>
                      <TD>{u.first_name} {u.last_name ?? ""}</TD>
                      <TD className="text-indigo-700">{u.email}</TD>
                      <TD>{roleLabel(u.role)}</TD>
                      <TD>{profileLabel(u.role)}</TD>
                      <TD>
                        <div className="flex items-center justify-end gap-3">
                          {!u.is_verified && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={resendMutation.isPending && resendUserId === u.id}
                              onClick={() => {
                                setResendUserId(u.id);
                                resendMutation.mutate(u.id);
                              }}
                            >
                              {resendMutation.isPending && resendUserId === u.id ? "Sending..." : "Resend"}
                            </Button>
                          )}
                          <button
                            type="button"
                            aria-label={u.is_active ? "Deactivate user" : "Activate user"}
                            disabled={u.role === "owner"}
                            onClick={() => updateMutation.mutate({ id: u.id, patch: { is_active: !u.is_active } })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${u.is_active ? "bg-emerald-500" : "bg-slate-300"} ${u.role === "owner" ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${u.is_active ? "translate-x-5" : "translate-x-1"}`}
                            />
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <PaginationBar
                page={activatePagination.page}
                totalPages={activatePagination.totalPages}
                total={activatePagination.total}
                pageSize={activatePagination.pageSize}
                from={activatePagination.from}
                to={activatePagination.to}
                onPageChange={activatePagination.setPage}
                onPageSizeChange={activatePagination.setPageSize}
              />
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
