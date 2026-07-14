"use client";

import { useAuthStore } from "@/stores/auth-store";
import { ManagerReportsPanel } from "@/components/reports/manager-reports-panel";
import { OwnerReportsPanel } from "@/components/reports/owner-reports-panel";

export default function ReportsPage() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === "owner") {
    return <OwnerReportsPanel />;
  }
  if (role === "manager") {
    return <ManagerReportsPanel />;
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
      Reports are available to managers and owners.
    </div>
  );
}
