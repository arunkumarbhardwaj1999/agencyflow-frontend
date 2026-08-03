"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDays, ChevronRight, LogIn, LogOut, Plus, UserPlus, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AttendanceLog, CompanyHoliday, HrEmployee, LeaveRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/stores/toast-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const PREVIEW_LIMIT = 5;

function timeLabel(iso: string | null) {
  if (!iso) return "—";
  return format(new Date(iso), "hh:mm a");
}

export function HrPanel({ selfOnly = false }: { selfOnly?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const canManage = !selfOnly && (user?.role === "owner" || user?.role === "manager");
  const isEmployeeSelf = selfOnly || user?.role === "employee";
  const queryClient = useQueryClient();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");
  const [holidayTitle, setHolidayTitle] = useState("");
  const [holidayDate, setHolidayDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selected, setSelected] = useState<HrEmployee | null>(null);
  const [salary, setSalary] = useState("");
  const [department, setDepartment] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["hr-employees"],
    queryFn: () => apiFetch<HrEmployee[]>("/hr/employees"),
  });

  const { data: todayAttendance } = useQuery({
    queryKey: ["hr-attendance-today"],
    queryFn: () => apiFetch<AttendanceLog | null>("/hr/attendance/today"),
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ["hr-leaves"],
    queryFn: () => apiFetch<LeaveRequest[]>("/hr/leaves"),
  });

  const { data: holidays = [] } = useQuery({
    queryKey: ["hr-holidays"],
    queryFn: () => apiFetch<CompanyHoliday[]>("/hr/holidays"),
  });

  const employeesPagination = useClientPagination(employees);
  const leavePreview = useMemo(() => leaves.slice(0, PREVIEW_LIMIT), [leaves]);
  const holidayPreview = useMemo(() => holidays.slice(0, PREVIEW_LIMIT), [holidays]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["hr-employees"] });
    queryClient.invalidateQueries({ queryKey: ["hr-attendance-today"] });
    queryClient.invalidateQueries({ queryKey: ["hr-leaves"] });
    queryClient.invalidateQueries({ queryKey: ["hr-holidays"] });
  };

  const checkIn = useMutation({
    mutationFn: () => apiFetch("/hr/attendance/check-in", { method: "POST" }),
    onSuccess: () => {
      invalidate();
      toast("Checked in successfully.", "success");
    },
    onError: (err) => toast((err as Error).message, "error"),
  });
  const checkOut = useMutation({
    mutationFn: () => apiFetch("/hr/attendance/check-out", { method: "POST" }),
    onSuccess: () => {
      invalidate();
      toast("Checked out successfully.", "success");
    },
    onError: (err) => toast((err as Error).message, "error"),
  });
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
      toast(
        vars.status === "approved" ? "Leave approved." : "Leave rejected.",
        "success",
      );
    },
    onError: (err) => toast((err as Error).message, "error"),
  });
  const createHoliday = useMutation({
    mutationFn: () =>
      apiFetch("/hr/holidays", {
        method: "POST",
        body: JSON.stringify({ title: holidayTitle, holiday_date: holidayDate }),
      }),
    onSuccess: () => {
      setHolidayOpen(false);
      setHolidayTitle("");
      invalidate();
      toast("Holiday added.", "success");
    },
    onError: (err) => toast((err as Error).message, "error"),
  });
  const saveProfile = useMutation({
    mutationFn: () =>
      apiFetch(`/hr/employees/${selected!.user_id}`, {
        method: "PATCH",
        body: JSON.stringify({
          salary: parseFloat(salary) || 0,
          department: department || null,
        }),
      }),
    onSuccess: () => {
      setSelected(null);
      invalidate();
      toast("Employee profile updated.", "success");
    },
    onError: (err) => toast((err as Error).message, "error"),
  });

  const me = employees.find((e) => e.email === user?.email) ?? employees[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => setLeaveOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />Apply leave
        </Button>
        {canManage && (
          <Button size="sm" variant="outline" onClick={() => setHolidayOpen(true)}>
            <CalendarDays className="mr-1 h-4 w-4" />Add holiday
          </Button>
        )}
        {canManage && user?.role === "owner" && (
          <Button size="sm" asChild>
            <Link href="/team">
              <UserPlus className="mr-1 h-4 w-4" />Hiring
            </Link>
          </Button>
        )}
      </div>

      {canManage && user?.role === "owner" && (
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Hiring</h2>
              <p className="mt-1 text-sm text-slate-600">
                Invite managers, employees, and clients from Team.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/team">
                <UserPlus className="mr-1 h-4 w-4" />Open team & invites
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Today&apos;s attendance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Check in</p>
            <p className="text-lg font-semibold text-slate-900">{timeLabel(todayAttendance?.check_in_at ?? null)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Check out</p>
            <p className="text-lg font-semibold text-slate-900">{timeLabel(todayAttendance?.check_out_at ?? null)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Worked</p>
            <p className="text-lg font-semibold text-slate-900">{todayAttendance?.work_label ?? "0m"}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            disabled={Boolean(todayAttendance?.check_in_at) || checkIn.isPending}
            onClick={() => checkIn.mutate()}
          >
            <LogIn className="mr-1 h-4 w-4" />Check in
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!todayAttendance?.check_in_at || Boolean(todayAttendance?.check_out_at) || checkOut.isPending}
            onClick={() => checkOut.mutate()}
          >
            <LogOut className="mr-1 h-4 w-4" />Check out
          </Button>
        </div>
      </section>

      {me && (
        <section className={`grid gap-3 ${isEmployeeSelf ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Attendance</p>
            <p className="font-semibold capitalize text-slate-900">{me.today_status ?? "absent"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Leaves left</p>
            <p className="font-semibold text-slate-900">
              {me.annual_leave_balance + me.casual_leave_balance + me.medical_leave_balance}
            </p>
          </div>
          {!isEmployeeSelf && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Salary</p>
            <p className="font-semibold text-slate-900">{formatCurrency(me.salary)}</p>
          </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Working hours (month)</p>
            <p className="font-semibold text-slate-900">{me.month_work_hours}h</p>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {!isEmployeeSelf && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <UserRound className="h-4 w-4" />
              Employees
            </h2>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-indigo-600">
              <Link href="/team">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {employeesPagination.pageItems.map((emp) => (
                <li key={emp.user_id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50"
                    onClick={() => {
                      if (!canManage) return;
                      setSelected(emp);
                      setSalary(String(emp.salary || ""));
                      setDepartment(emp.department ?? "");
                    }}
                  >
                    <div>
                      <p className="font-medium text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">
                        {emp.designation || emp.role} · {emp.department || "No dept"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="capitalize">{emp.today_status ?? "absent"}</Badge>
                      <p className="mt-1 text-xs text-slate-500">{emp.month_work_hours}h this month</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <PaginationBar
            page={employeesPagination.page}
            totalPages={employeesPagination.totalPages}
            total={employeesPagination.total}
            pageSize={employeesPagination.pageSize}
            from={employeesPagination.from}
            to={employeesPagination.to}
            onPageChange={employeesPagination.setPage}
            onPageSizeChange={employeesPagination.setPageSize}
            className="mt-3 rounded-xl border border-slate-100"
          />
        </section>
        )}

        <div className={isEmployeeSelf ? "lg:col-span-2 space-y-6" : "space-y-6"}>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Leave requests
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-indigo-600">
                <Link href="/hr/leaves">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1">Annual</span>
              <span className="rounded-full bg-sky-50 px-2.5 py-1">Casual</span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1">Medical</span>
            </div>
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-500">No leave requests yet.</p>
            ) : (
              <ul className="space-y-2">
                {leavePreview.map((leave) => (
                  <li key={leave.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {leave.user_name} · {leave.leave_type_label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(leave.start_date), "dd MMM")} –{" "}
                          {format(new Date(leave.end_date), "dd MMM")} ({leave.days}d)
                        </p>
                      </div>
                      <Badge className="capitalize">{leave.status}</Badge>
                    </div>
                    {canManage && leave.status === "pending" && (
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => reviewLeave.mutate({ id: leave.id, status: "approved" })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewLeave.mutate({ id: leave.id, status: "rejected" })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {leaves.length > PREVIEW_LIMIT ? (
              <p className="mt-3 text-center text-xs text-slate-500">
                Showing {PREVIEW_LIMIT} of {leaves.length}.{" "}
                <Link href="/hr/leaves" className="font-medium text-indigo-600 hover:underline">
                  View all with search
                </Link>
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Holiday calendar
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-indigo-600">
                <Link href="/hr/holidays">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {holidays.length === 0 ? (
              <p className="text-sm text-slate-500">No holidays added.</p>
            ) : (
              <ul className="space-y-2">
                {holidayPreview.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-900">{h.title}</span>
                    <span className="text-slate-500">
                      {format(new Date(h.holiday_date), "dd MMM yyyy")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {holidays.length > PREVIEW_LIMIT ? (
              <p className="mt-3 text-center text-xs text-slate-500">
                Showing {PREVIEW_LIMIT} of {holidays.length}.{" "}
                <Link href="/hr/holidays" className="font-medium text-indigo-600 hover:underline">
                  View all with search
                </Link>
              </p>
            ) : null}
          </section>
        </div>
      </div>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Apply for leave"
        footer={
          <>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>Cancel</Button>
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
              <Input className="mt-1" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input className="mt-1" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea className="mt-1" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal
        open={holidayOpen}
        onClose={() => setHolidayOpen(false)}
        title="Add holiday"
        footer={
          <>
            <Button variant="outline" onClick={() => setHolidayOpen(false)}>Cancel</Button>
            <Button disabled={!holidayTitle.trim() || createHoliday.isPending} onClick={() => createHoliday.mutate()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={holidayTitle} onChange={(e) => setHolidayTitle(e.target.value)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input className="mt-1" type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Employee — ${selected.name}` : "Employee"}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button disabled={saveProfile.isPending} onClick={() => saveProfile.mutate()}>
              {saveProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Attendance</p>
                <p className="capitalize font-medium">{selected.today_status}</p>
              </div>
              <div>
                <p className="text-slate-500">Working hours</p>
                <p className="font-medium">{selected.month_work_hours}h</p>
              </div>
              <div>
                <p className="text-slate-500">Annual leave</p>
                <p className="font-medium">{selected.annual_leave_balance}</p>
              </div>
              <div>
                <p className="text-slate-500">Pending leaves</p>
                <p className="font-medium">{selected.pending_leaves}</p>
              </div>
            </div>
            <div>
              <Label>Department</Label>
              <Input className="mt-1" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <Label>Salary (₹)</Label>
              <Input className="mt-1" type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
