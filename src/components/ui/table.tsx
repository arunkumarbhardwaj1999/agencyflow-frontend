import { cn } from "@/lib/utils";

export function Table({
  className,
  wrapClassName,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & { wrapClassName?: string }) {
  return (
    <div className={cn("app-table-wrap w-full overflow-x-auto", wrapClassName)}>
      <table className={cn("w-full min-w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b border-slate-200/80 bg-slate-50/90 text-slate-500", className)}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("bg-white", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100/90 transition-colors last:border-0 hover:bg-indigo-50/40",
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 first:pl-5 last:pr-5",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3.5 align-middle text-[13.5px] leading-snug text-slate-700 first:pl-5 last:pr-5",
        className,
      )}
      {...props}
    />
  );
}
