"use client";

import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmStore, type ConfirmVariant } from "@/stores/confirm-store";
import { cn } from "@/lib/utils";

const VARIANT_UI: Record<
  ConfirmVariant,
  {
    icon: typeof AlertTriangle;
    iconWrap: string;
    confirmVariant: "default" | "destructive";
  }
> = {
  danger: {
    icon: AlertTriangle,
    iconWrap: "bg-rose-50 text-rose-600 ring-rose-100",
    confirmVariant: "destructive",
  },
  primary: {
    icon: HelpCircle,
    iconWrap: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    confirmVariant: "default",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    confirmVariant: "default",
  },
};

export function ConfirmDialogHost() {
  const open = useConfirmStore((s) => s.open);
  const options = useConfirmStore((s) => s.options);
  const close = useConfirmStore((s) => s.close);

  if (!open || !options) return null;

  const variant = options.variant ?? "primary";
  const ui = VARIANT_UI[variant];
  const Icon = ui.icon;

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm"
      onClick={() => close(false)}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={options.description ? "confirm-desc" : undefined}
    >
      <div
        className="animate-scale-in w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "h-1 w-full",
            variant === "danger" && "bg-gradient-to-r from-rose-500 to-orange-400",
            variant === "success" && "bg-gradient-to-r from-emerald-500 to-teal-400",
            variant === "primary" && "bg-gradient-to-r from-indigo-500 to-violet-500",
          )}
        />

        <div className="px-6 pb-2 pt-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
                ui.iconWrap,
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id="confirm-title" className="text-lg font-semibold tracking-tight text-slate-900">
                {options.title}
              </h2>
              {options.description ? (
                <p id="confirm-desc" className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {options.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 py-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => close(false)}>
            {options.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            type="button"
            variant={ui.confirmVariant}
            className={
              variant === "success"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 hover:brightness-110"
                : undefined
            }
            onClick={() => close(true)}
          >
            {options.confirmLabel ?? "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
