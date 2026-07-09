export type User = {
  id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  must_change_password: boolean;
  created_at: string;
};

export type RegisterResponse = {
  message: string;
  email: string;
  username: string;
  generated_password: string | null;
};

export type GoogleRegisterPending = {
  registration_id: string;
  email: string;
  first_name: string;
  next_step: string;
  email_sent?: boolean;
  email_error?: string | null;
  confirm_link?: string | null;
};

export type SendOtpResponse = {
  message: string;
  dev_otp: string | null;
};

export type InvitePreview = {
  workspace: string;
  invited_email: string;
  inviter_name: string;
  inviter_email: string | null;
  role: string;
  first_name: string;
  last_name: string | null;
};

export type ConfirmAccountPreview = {
  email: string;
  first_name: string;
  already_confirmed: boolean;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type ForgotPasswordResponse = {
  message: string;
  reset_token: string | null;
  email: string | null;
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

export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type GroupMember = {
  id: string;
  name: string;
  email: string;
  status: string;
};

export type TeamGroup = {
  id: string;
  name: string;
  members_count: number;
  users_count: number;
  roles_count: number;
  members: GroupMember[];
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

export type LeadNote = {
  id: string;
  lead_id: string;
  content: string;
  created_by_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadTimelineEvent = {
  id: string;
  lead_id: string;
  event_type: string;
  description: string;
  created_by_id: string | null;
  created_by_name: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
};

export type LeadActivity = {
  id: string;
  lead_id: string;
  activity_type: string;
  activity_label: string;
  title: string | null;
  notes: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  is_completed: boolean;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadActivitiesGrouped = {
  upcoming: LeadActivity[];
  completed: LeadActivity[];
};

export const LEAD_ACTIVITY_TYPES = [
  { id: "call", label: "Call" },
  { id: "meeting", label: "Meeting" },
  { id: "email", label: "Email" },
  { id: "follow_up", label: "Follow-up" },
  { id: "task", label: "Task" },
  { id: "demo", label: "Demo" },
  { id: "proposal", label: "Proposal" },
] as const;

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

export type DashboardLiveEvent = {
  id: string;
  type: "lead" | "project" | "task" | "client" | "invoice";
  message: string;
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
  amount: string;
};

export type Invoice = {
  id: string;
  company_id: string;
  client_id: string;
  client_name: string | null;
  invoice_number: string;
  subtotal: string;
  tax: string;
  cgst: string;
  sgst: string;
  igst: string;
  tax_type: string;
  place_of_supply: string | null;
  total: string;
  status: string;
  due_date: string;
  notes: string | null;
  payment_link: string | null;
  payment_provider: string | null;
  paid_at: string | null;
  items: InvoiceItem[];
  created_at: string;
};

export type PaymentLinkResponse = {
  provider: string;
  url: string;
  order_id: string;
};

export type DocumentMeta = {
  id: string;
  project_id: string | null;
  invoice_id: string | null;
  filename: string;
  content_type: string;
  size: number;
  kind: string;
  created_at: string;
};

export type LogoResponse = {
  logo: string | null;
};

export type MessageResponse = {
  message: string;
};

export type AIResponse = {
  content: string;
  mode: string;
};

export type WhatsAppSendResponse = {
  status: string;
  phone: string;
  message: string;
  log_id: string | null;
  queued?: boolean;
};

export type WhatsAppLog = {
  id: string;
  client_id: string | null;
  phone: string;
  message: string;
  status: string;
  template_key: string | null;
  sent_at: string;
};

export type WhatsAppTemplate = {
  key: string;
  label: string;
  description: string;
  meta_name: string;
  requires_approval: boolean;
};

export type IntegrationsStatus = {
  email: {
    enabled: boolean;
    provider: string;
    from_address: string | null;
  };
  whatsapp: {
    enabled: boolean;
    provider: string;
    token_configured: boolean;
    phone_number_id_configured: boolean;
    business_account_id: string | null;
    celery_queue: boolean;
    auto_on_payment: boolean;
    auto_on_invoice_send: boolean;
    webhook_path: string;
  };
  meta_business_hint: string;
};

export type WhatsAppTestResponse = {
  status: string;
  phone: string;
  message_id: string | null;
  delivery: string;
  detail: string | null;
};

export type AIStreamChunk = {
  chunk: string;
  done: boolean;
  mode: string;
  error?: string;
};

export type PortalMe = {
  client_id: string;
  name: string;
  business_name: string;
  email: string;
  company_name: string;
};

export type PortalSummary = {
  active_projects: number;
  completed_projects: number;
  total_projects: number;
  invoice_count: number;
  total_invoiced: string;
  total_paid: string;
  outstanding: string;
};

export const LEAD_COLUMNS = [
  { id: "new", title: "New" },
  { id: "contacted", title: "Contacted" },
  { id: "proposal", title: "Proposal" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
] as const;
