"use client";

import { EmployeeDocumentsPanel } from "@/components/documents/employee-documents-panel";
import { ManagerDocumentsPanel } from "@/components/documents/manager-documents-panel";
import { useAuthStore } from "@/stores/auth-store";

export default function DocumentsPage() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === "manager" || role === "owner") {
    return <ManagerDocumentsPanel />;
  }
  return <EmployeeDocumentsPanel />;
}
