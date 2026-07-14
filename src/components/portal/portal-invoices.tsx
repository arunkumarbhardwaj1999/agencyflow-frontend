"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, ExternalLink, ReceiptText } from "lucide-react";
import { apiBlob, apiFetch } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusVariant: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  paid: "success",
  unpaid: "warning",
  overdue: "danger",
};

export function PortalInvoices() {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["portal-invoices"],
    queryFn: () => apiFetch<Invoice[]>("/portal/invoices"),
  });

  async function downloadPdf(inv: Invoice) {
    const blob = await apiBlob(`/portal/invoices/${inv.id}/pdf`);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <ReceiptText className="h-6 w-6 text-indigo-600" />
          Invoices
        </h1>
        <p className="text-sm text-slate-500">Paid & unpaid invoices — download PDF or pay online.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
          No invoices yet.
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{inv.invoice_number}</p>
                <p className="text-xs text-slate-500">Due {inv.due_date}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(inv.total)}</p>
                  <Badge variant={statusVariant[inv.status] ?? "secondary"} className="capitalize">
                    {inv.status === "paid" ? "Paid" : inv.status === "overdue" ? "Unpaid (overdue)" : "Unpaid"}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadPdf(inv)}>
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
                {inv.status !== "paid" && inv.payment_link && (
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => window.open(inv.payment_link!, "_blank", "noopener")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Pay now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
