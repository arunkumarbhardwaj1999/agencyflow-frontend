import { cn } from "@/lib/utils";

export function StackSection({
  children,
  bgClassName,
  last = false,
}: {
  children: React.ReactNode;
  /** Background that fills the panel behind the section (should match the section bg). */
  bgClassName?: string;
  /** The last panel never recedes. */
  last?: boolean;
}) {
  return (
    <div className={cn("stack-panel", bgClassName)} data-last={last ? "true" : undefined}>
      <div className="stack-inner">{children}</div>
    </div>
  );
}
