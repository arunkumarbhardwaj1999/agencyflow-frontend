export type User = {
  id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type ForgotPasswordResponse = {
  message: string;
  reset_token: string | null;
};

export type StaffMember = {
  id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: "owner" | "manager" | "employee" | "client";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type Lead = {
  id: string;
  company_id: string;
  assigned_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  source: string | null;
  status: string;
  value: string;
  notes: string | null;
  next_followup: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  company_id: string;
  assigned_user_id: string | null;
  name: string;
  business_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
  notes: string | null;
  created_at: string;
  active_projects: number;
  invoice_count: number;
};

export type Project = {
  id: string;
  company_id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  budget: string;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  task_total: number;
  task_done: number;
  progress_percent: number;
};

export type Task = {
  id: string;
  company_id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
};

export type DashboardData = {
  kpis: {
    open_leads: number;
    active_projects: number;
    paid_invoices: number;
    unpaid_invoice_total: string;
    pipeline_value: string;
  };
  upcoming_deadlines: {
    id: string;
    type: string;
    title: string;
    due_at: string;
  }[];
  recent_activity: {
    id: string;
    type: string;
    message: string;
    created_at: string;
  }[];
};

export const LEAD_COLUMNS = [
  { id: "new", title: "New" },
  { id: "contacted", title: "Contacted" },
  { id: "proposal", title: "Proposal" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
] as const;
