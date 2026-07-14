"use client";

import { Card, CardContent } from "@/components/ui/card";
import { EmployeeTimeSummary } from "@/components/time/employee-time-summary";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { ManagerDashboardView } from "@/components/dashboard/manager-dashboard";
import { OwnerDashboardView } from "@/components/dashboard/owner-dashboard";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardView() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  if (user?.role === "manager") {
    return <ManagerDashboardView />;
  }

  if (user?.role === "owner") {
    return <OwnerDashboardView />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <CardContent className="p-6">
          <p className="text-sm text-indigo-100">Welcome back</p>
          <p className="mt-1 text-2xl font-bold">{user?.first_name}</p>
        </CardContent>
      </Card>
      <EmployeeTimeSummary />
    </div>
  );
}
