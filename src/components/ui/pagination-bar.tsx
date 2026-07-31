"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationBarProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

export function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  from,
  to,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationBarProps) {
  if (total === 0) return null;

  const showPager = totalPages > 1 || total > pageSizeOptions[0];

  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center justify-between gap-3 px-1",
        className,
      )}
    >
      <p className="text-[13px] text-slate-500">
        <span className="font-medium text-slate-800">{from}</span>
        <span className="mx-1 text-slate-300">–</span>
        <span className="font-medium text-slate-800">{to}</span>
        <span className="mx-1.5 text-slate-400">of</span>
        <span className="font-semibold text-slate-900">{total}</span>
      </p>

      {showPager ? (
        <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white p-1 shadow-sm">
          {onPageSizeChange ? (
            <>
              <label className="flex items-center gap-1.5 pl-2.5 pr-1 text-[11px] font-medium text-slate-400">
                Per page
                <select
                  className="h-7 cursor-pointer rounded-full border-0 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200"
                  value={String(pageSize)}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  aria-label="Rows per page"
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <span className="mx-0.5 h-4 w-px bg-slate-200" />
            </>
          ) : null}

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[3.25rem] px-1 text-center text-xs font-semibold tabular-nums text-slate-800">
            {page}
            <span className="mx-0.5 font-normal text-slate-400">/</span>
            {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
