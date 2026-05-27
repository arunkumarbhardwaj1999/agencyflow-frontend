"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { apiFetch } from "@/lib/api";
import type { StaffMember } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["manager", "employee", "client"]),
});

export function TeamPanel() {
  const qc = useQueryClient();
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<StaffMember> }) =>
      apiFetch<StaffMember>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Add team member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid gap-3 sm:grid-cols-3">
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
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <div>
              <Label>Role</Label>
              <select className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register("role")}>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              {Object.keys(errors).length > 0 && (
                <p className="mb-2 text-sm text-red-600">Please fill all required fields correctly.</p>
              )}
              {createMutation.isError && (
                <p className="mb-2 text-sm text-red-600">{(createMutation.error as Error).message}</p>
              )}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create member"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Team members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staff.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {u.first_name} {u.last_name ?? ""}
                  </p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.is_active ? "success" : "secondary"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                  <select
                    value={u.role}
                    onChange={(e) => updateMutation.mutate({ id: u.id, patch: { role: e.target.value as StaffMember["role"] } })}
                    className="h-8 rounded-md border border-slate-200 px-2 text-xs"
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
              </div>
            ))}
            {staff.length === 0 && <p className="text-sm text-slate-500">No members found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
