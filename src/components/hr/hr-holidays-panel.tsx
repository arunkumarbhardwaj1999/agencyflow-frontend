"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { CompanyHoliday } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

export function HrHolidaysPanel() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "owner" || user?.role === "manager";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [holidayTitle, setHolidayTitle] = useState("");
  const [holidayDate, setHolidayDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ["hr-holidays"],
    queryFn: () => apiFetch<CompanyHoliday[]>("/hr/holidays"),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return holidays;
    return holidays.filter((h) => {
      const dateLabel = format(new Date(h.holiday_date), "dd MMM yyyy").toLowerCase();
      return h.title.toLowerCase().includes(term) || dateLabel.includes(term);
    });
  }, [holidays, search]);

  const pagination = useClientPagination(filtered, { resetKey: search });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["hr-holidays"] });

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
    },
  });

  const deleteHoliday = useMutation({
    mutationFn: (id: string) => apiFetch(`/hr/holidays/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
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
        {canManage ? (
          <Button size="sm" onClick={() => setHolidayOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add holiday
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <Input
          className="w-full sm:max-w-sm"
          placeholder="Search by holiday name or date…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading holidays…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No holidays match your search.</p>
        ) : (
          <>
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Holiday
                    </span>
                  </TH>
                  <TH>Date</TH>
                  <TH>Type</TH>
                  {canManage ? <TH className="text-right">Actions</TH> : null}
                </TR>
              </THead>
              <TBody>
                {pagination.pageItems.map((h) => (
                  <TR key={h.id}>
                    <TD className="font-medium text-slate-900">{h.title}</TD>
                    <TD className="text-slate-500">
                      {format(new Date(h.holiday_date), "dd MMM yyyy")}
                    </TD>
                    <TD>{h.is_optional ? "Optional" : "Company holiday"}</TD>
                    {canManage ? (
                      <TD>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => {
                              if (confirm(`Delete holiday "${h.title}"?`)) {
                                deleteHoliday.mutate(h.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
        open={holidayOpen}
        onClose={() => setHolidayOpen(false)}
        title="Add holiday"
        footer={
          <>
            <Button variant="outline" onClick={() => setHolidayOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!holidayTitle.trim() || createHoliday.isPending}
              onClick={() => createHoliday.mutate()}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              className="mt-1"
              value={holidayTitle}
              onChange={(e) => setHolidayTitle(e.target.value)}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              className="mt-1"
              type="date"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
