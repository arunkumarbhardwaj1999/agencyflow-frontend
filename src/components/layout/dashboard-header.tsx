"use client";

import Link from "next/link";
import { Bell, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
  title,
  showNewLead = false,
}: {
  title: string;
  showNewLead?: boolean;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        {showNewLead && (
          <Link href="/leads">
            <Button className="h-10 gap-2">
              <Plus className="h-4 w-4" />
              New lead
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
