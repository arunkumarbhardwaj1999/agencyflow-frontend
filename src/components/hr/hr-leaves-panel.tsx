"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { LeaveRequest } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function HrLeavesPanel() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "owner" || user?.role === "manager";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["hr-leaves"],
    queryFn: () => apiFetch<LeaveRequest[]>("/hr/leaves"),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leaves.filter((leave) => {
      if (statusFilter && leave.status !== statusFilter) return false;
      if (typeFilter && leave.leave_type !== typeFilter) return false;
      if (!term) return true;
      return (
        (leave.user_name ?? "").toLowerCase().includes(term) ||
        leave.leave_type_label.toLowerCase().includes(term) ||
        leave.status.toLowerCase().includes(term) ||
        (leave.reason ?? "").toLowerCase().includes(term)
      );
    });
  }, [leaves, search, statusFilter, typeFilter]);

  const pagination = useClientPagination(filtered, {
    resetKey: `${search}|${statusFilter}|${typeFilter}`,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["hr-leaves"] });

  const createLeave = useMutation({
    mutationFn: () =>
      apiFetch("/hr/leaves", {
        method: "POST",
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason || null,
        }),
      }),
    onSuccess: () => {
      setLeaveOpen(false);
      setReason("");
      invalidate();
      toast("Leave request submitted.", "success");
    },
    onError: (err) => toast((err as Error).message, "error"),
  });

  const reviewLeave = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/hr/leaves/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_data, vars) => {
      invalidate();
      toast(vars.status === "approved" ? "Leave approved." : "Leave rejected.", "success");
    },
    onError: (err) => toast((err as Error).message, "error"),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/hr">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to HR
          </Link>
        </Button>
        <Button size="sm" onClick={() => setLeaveOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Apply leave
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
        <Input
          className="w-full sm:max-w-sm"
          placeholder="Search by name, type, status, reason…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          className="w-full sm:w-40"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          <option value="annual">Annual</option>
          <option value="casual">Casual</option>
          <option value="medical">Medical</option>
        </Select>
        <Select
          className="w-full sm:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading leave requests…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No leave requests match your filters.</p>
        ) : (
          <>
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Employee</TH>
                  <TH>Type</TH>
                  <TH>Dates</TH>
                  <TH>Days</TH>
                  <TH>Status</TH>
                  <TH>Reason</TH>
                  {canManage ? <TH className="text-right">Actions</TH> : null}
                </TR>
              </THead>
              <TBody>
                {pagination.pageItems.map((leave) => (
                  <TR key={leave.id}>
                    <TD className="font-medium text-slate-900">{leave.user_name ?? "—"}</TD>
                    <TD>{leave.leave_type_label}</TD>
                    <TD className="text-slate-500">
                      {format(new Date(leave.start_date), "dd MMM yyyy")} –{" "}
                      {format(new Date(leave.end_date), "dd MMM yyyy")}
                    </TD>
                    <TD>{leave.days}</TD>
                    <TD>
                      <Badge className="capitalize">{leave.status}</Badge>
                    </TD>
                    <TD className="max-w-[14rem] truncate text-slate-500">
                      {leave.reason || "—"}
                    </TD>
                    {canManage ? (
                      <TD>
                        {leave.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                reviewLeave.mutate({ id: leave.id, status: "approved" })
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                reviewLeave.mutate({ id: leave.id, status: "rejected" })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-slate-400">—</p>
                        )}
                      </TD>
                    ) : null}
                  </TR>
                ))}
              </TBody>
            </Table>
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.pageSize}
              from={pagination.from}
              to={pagination.to}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </>
        )}
      </div>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Apply for leave"
        footer={
          <>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>
              Cancel
            </Button>
            <Button disabled={createLeave.isPending} onClick={() => createLeave.mutate()}>
              {createLeave.isPending ? "Submitting…" : "Submit"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Leave type</Label>
            <Select className="mt-1" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="annual">Annual Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="medical">Medical Leave</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start</Label>
              <Input
                className="mt-1"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                className="mt-1"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea className="mt-1" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
