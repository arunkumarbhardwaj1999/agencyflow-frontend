import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-50 text-indigo-700",
        secondary: "border-transparent bg-slate-100 text-slate-700",
        success: "border-transparent bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        warning: "border-transparent bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        danger: "border-transparent bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
        info: "border-transparent bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
        violet: "border-transparent bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
