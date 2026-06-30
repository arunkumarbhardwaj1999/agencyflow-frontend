"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function MockPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [paid, setPaid] = useState(false);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiFetch<Invoice[]>("/invoices"),
  });
  const invoice = invoices?.find((i) => i.id === id);

  useEffect(() => {
    if (invoice?.status === "paid") setPaid(true);
  }, [invoice?.status]);

  const payMutation = useMutation({
    mutationFn: () => apiFetch(`/payments/invoices/${id}/simulate`, { method: "POST" }),
    onSuccess: () => setPaid(true),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-semibold">AgencyFlow Secure Checkout</span>
          <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs">TEST MODE</span>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!isLoading && !invoice && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-600">Invoice not found or you&apos;re not signed in.</p>
              <Link href="/login" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
                Go to login
              </Link>
            </div>
          )}

          {invoice && !paid && (
            <>
              <p className="text-sm text-slate-500">Paying invoice</p>
              <p className="text-lg font-semibold text-slate-900">{invoice.invoice_number}</p>

              <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{invoice.tax_type === "cgst_sgst" ? "CGST + SGST" : "IGST"}</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-indigo-700">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>

              <Button
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
                className="mt-5 w-full gap-2"
              >
                {payMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {payMutation.isPending ? "Processing…" : `Pay ${formatCurrency(invoice.total)}`}
              </Button>
              {payMutation.isError && (
                <p className="mt-2 text-center text-sm text-rose-600">
                  {(payMutation.error as Error).message}
                </p>
              )}
              <p className="mt-3 text-center text-xs text-slate-400">
                This is a test checkout. No real money is charged.
              </p>
            </>
          )}

          {invoice && paid && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <p className="mt-3 text-lg font-semibold text-slate-900">Payment successful</p>
              <p className="text-sm text-slate-500">
                Invoice {invoice.invoice_number} is now marked as paid.
              </p>
              <Link
                href="/finance"
                className="mt-5 inline-block rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white"
              >
                Back to invoices
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
