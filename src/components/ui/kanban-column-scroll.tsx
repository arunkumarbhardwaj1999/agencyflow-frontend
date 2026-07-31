"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const INITIAL_VISIBLE = 10;
const LOAD_STEP = 10;

export function KanbanColumnScroll({
  itemCount,
  resetKey,
  children,
}: {
  itemCount: number;
  resetKey?: string | number;
  children: (visibleCount: number) => React.ReactNode;
}) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    setVisible(INITIAL_VISIBLE);
  }, [resetKey, itemCount]);

  const capped = Math.min(visible, itemCount);
  const remaining = Math.max(0, itemCount - capped);

  return (
    <div className="flex max-h-[min(58vh,560px)] min-h-[200px] flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-0.5">
      {children(capped)}
      {remaining > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1 w-full shrink-0 border-dashed text-xs"
          onClick={() => setVisible((v) => v + LOAD_STEP)}
        >
          Show more ({remaining} left)
        </Button>
      ) : null}
      {itemCount > INITIAL_VISIBLE && capped >= itemCount ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full shrink-0 text-xs text-slate-500"
          onClick={() => setVisible(INITIAL_VISIBLE)}
        >
          Show less
        </Button>
      ) : null}
    </div>
  );
}
