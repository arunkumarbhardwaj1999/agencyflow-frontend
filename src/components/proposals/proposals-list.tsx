"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Proposal } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useClientPagination } from "@/hooks/use-client-pagination";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export function ProposalsList() {
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: () => apiFetch<Proposal[]>("/proposals"),
  });
  const pagination = useClientPagination(proposals);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <Button asChild>
          <Link href="/proposals/new">
            <Plus className="mr-1 h-4 w-4" />
            New proposal
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading proposals…</p>
      ) : proposals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-600">No proposals yet.</p>
          <Button asChild className="mt-4">
            <Link href="/proposals/new">Create your first proposal</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pagination.pageItems.map((p) => (
            <Link
              key={p.id}
              href={`/proposals/${p.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{p.title}</p>
                <p className="text-xs text-slate-500">
                  {p.client_name ?? "No client"} · {p.template_label} · ₹{p.project_value.toLocaleString("en-IN")}
                  {" · "}
                  {format(new Date(p.updated_at), "dd MMM yyyy")}
                </p>
              </div>
              <Badge className={STATUS_COLORS[p.status] ?? STATUS_COLORS.draft}>{p.status}</Badge>
            </Link>
          ))}
          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            from={pagination.from}
            to={pagination.to}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            className="rounded-xl border border-slate-100"
          />
        </div>
      )}
    </div>
  );
}
