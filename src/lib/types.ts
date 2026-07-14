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

export type LeadAttachment = {
  id: string;
  lead_id: string;
  filename: string;
  content_type: string;
  size: number;
  uploaded_by_id: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
  preview_url: string | null;
  download_url: string | null;
  is_previewable: boolean;
};

export type LeadEmail = {
  id: string;
  lead_id: string;
  subject: string;
  body: string;
  from_email: string;
  to_email: string;
  delivery_status: string;
  open_status: string;
  opened_at: string | null;
  sent_by_id: string | null;
  sent_by_name: string | null;
  error_message: string | null;
  sent_at: string;
};

export type LeadMessagingItem = {
  id: string;
  channel: string;
  channel_label: string;
  title: string;
  preview: string;
  contact_name: string | null;
  status: string | null;
  delivery_status: string | null;
  read_status: string;
  created_at: string;
  sender_name: string | null;
};

export type Record360Insights = {
  score: number | null;
  confidence: string | null;
  summary: string;
  recommendations: string[];
};

export type RelatedDealBrief = {
  id: string;
  title: string;
  status: string;
  value: number;
  expected_close_date: string | null;
};

export type RelatedLeadBrief = {
  id: string;
  name: string;
  status: string;
  company_name: string | null;
};

export type RelatedClientBrief = {
  id: string;
  name: string;
  business_name: string;
  email: string;
};

export type RelatedProjectBrief = {
  id: string;
  title: string;
  status: string;
  end_date: string | null;
  progress_percent: number;
};

export type RelatedInvoiceBrief = {
  id: string;
  invoice_number: string;
  status: string;
  total: number;
  due_date: string;
};

export type Record360Related = {
  leads: RelatedLeadBrief[];
  deals: RelatedDealBrief[];
  clients: RelatedClientBrief[];
  projects: RelatedProjectBrief[];
  invoices: RelatedInvoiceBrief[];
};

export type Record360EmailBrief = {
  id: string;
  subject: string;
  body: string;
  to_email: string;
  delivery_status: string;
  open_status: string;
  sent_at: string;
};

export type Record360InternalComment = {
  id: string;
  body: string;
  author_name: string | null;
  created_at: string;
};

export type Record360TaskBrief = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
};

export type Record360Meeting = {
  id: string;
  activity_type: string;
  activity_label: string;
  title: string | null;
  notes: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  is_completed: boolean;
  assigned_to_name: string | null;
};

export type Record360EntityType = "lead" | "deal" | "client" | "project";

export type Record360View = {
  entity_type: string;
  entity_id: string;
  entity: Record<string, unknown>;
  timeline: unknown[];
  activities: unknown | null;
  notes: unknown[];
  attachments: unknown[];
  emails: Record360EmailBrief[];
  messaging: LeadMessagingItem[];
  tasks: Record360TaskBrief[];
  meetings: Record360Meeting[];
  internal_comments: Record360InternalComment[];
  related: Record360Related;
  insights: Record360Insights;
};

export type DuplicateLeadMatch = {
  lead_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  status: string;
  created_at: string;
  match_fields: string[];
};

export type LeadDuplicateCheckResponse = {
  has_duplicates: boolean;
  duplicates: DuplicateLeadMatch[];
};

export const DEAL_STAGES = [
  { id: "qualification", title: "Qualification" },
  { id: "proposal_sent", title: "Proposal Sent" },
  { id: "negotiation", title: "Negotiation" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
] as const;

export type Deal = {
  id: string;
  company_id: string;
  lead_id: string | null;
  client_id: string | null;
  assigned_user_id: string | null;
  assigned_to_name: string | null;
  title: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  value: string;
  probability: number;
  expected_close_date: string | null;
  status: string;
  status_label: string | null;
  kanban_position: number;
  source: string | null;
  notes: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type DealKanbanColumn = {
  stage: string;
  label: string;
  deals: Deal[];
};

export type DealKanbanBoard = {
  columns: DealKanbanColumn[];
  total_pipeline_value: string;
  open_deal_count: number;
};

export type DealInsights = {
  probability: number;
  confidence: string;
  summary: string;
  recommendations: string[];
};

export type DealNote = {
  id: string;
  deal_id: string;
  content: string;
  created_by_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
};

export type DealTimelineEvent = {
  id: string;
  deal_id: string;
  event_type: string;
  description: string;
  created_by_id: string | null;
  created_by_name: string | null;
  metadata: Record<string, string> | null;
  created_at: string;
};

export type DealActivity = {
  id: string;
  deal_id: string;
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

export type DealActivitiesGrouped = {
  upcoming: DealActivity[];
  completed: DealActivity[];
};

export const DEAL_ACTIVITY_TYPES = [
  { id: "call", label: "Call" },
  { id: "meeting", label: "Meeting" },
  { id: "email", label: "Email" },
  { id: "follow_up", label: "Follow-up" },
  { id: "task", label: "Task" },
  { id: "demo", label: "Demo" },
  { id: "proposal", label: "Proposal" },
] as const;

export type DealAttachment = {
  id: string;
  deal_id: string;
  filename: string;
  content_type: string;
  size: number;
  kind: string;
  is_proposal: boolean;
  uploaded_by_id: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
  preview_url: string | null;
  download_url: string | null;
  is_previewable: boolean;
};

export type ClientDocumentFolder = {
  key: string;
  label: string;
};

export const CLIENT_DOCUMENT_FOLDERS: ClientDocumentFolder[] = [
  { key: "gst", label: "GST" },
  { key: "pan", label: "PAN" },
  { key: "proposals", label: "Proposals" },
  { key: "agreements", label: "Agreements" },
  { key: "deliverables", label: "Deliverables" },
  { key: "invoices", label: "Invoices" },
  { key: "images", label: "Images" },
  { key: "others", label: "Others" },
];

export type ClientDocument = {
  id: string;
  client_id: string;
  folder: string;
  folder_label: string;
  filename: string;
  content_type: string;
  size: number;
  uploaded_by_id: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
  preview_url: string | null;
  download_url: string | null;
  is_previewable: boolean;
};

export type DocumentFolderSuggestion = {
  folder: string;
  folder_label: string;
  reason: string;
  confidence: number;
};

export type ProposalTemplate = {
  key: string;
  label: string;
  description: string;
  default_services: string[];
};

export type Proposal = {
  id: string;
  company_id: string;
  client_id: string | null;
  lead_id: string | null;
  deal_id: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  client_name: string | null;
  template_key: string;
  template_label: string;
  title: string;
  project_value: number;
  services: string[];
  overview: string | null;
  timeline: string | null;
  deliverables: string | null;
  scope: string | null;
  pricing: string | null;
  terms: string | null;
  conclusion: string | null;
  status: "draft" | "sent" | "approved" | "rejected";
  sent_at: string | null;
  approved_at: string | null;
  contract_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Contract = {
  id: string;
  company_id: string;
  proposal_id: string | null;
  client_id: string;
  client_name: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
  renewed_from_id: string | null;
  contract_number: string;
  title: string;
  project_value: number;
  services: string[];
  body: string | null;
  status: "draft" | "sent" | "signed" | "active" | "expired";
  signer_name: string | null;
  signer_email: string | null;
  signed_at: string | null;
  sent_at: string | null;
  starts_at: string | null;
  expires_at: string | null;
  auto_renewal_reminder: boolean;
  renewal_reminder_days: number;
  days_until_expiry: number | null;
  renewal_due_soon: boolean;
  created_at: string;
  updated_at: string;
};

export type ContractExpiryReminder = {
  contract_id: string;
  contract_number: string;
  title: string;
  client_name: string;
  expires_at: string;
  days_remaining: number;
};

export type ProposalAIDraft = {
  title: string;
  project_value: number;
  services: string[];
  overview: string;
  timeline: string;
  deliverables: string;
  scope: string;
  pricing: string;
  terms: string;
  conclusion: string;
  mode: string;
};

export type DealEmail = {
  id: string;
  deal_id: string;
  subject: string;
  body: string;
  from_email: string;
  to_email: string;
  delivery_status: string;
  open_status: string;
  opened_at: string | null;
  sent_by_id: string | null;
  sent_by_name: string | null;
  error_message: string | null;
  sent_at: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  event_type: string;
  color: string;
  icon: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  source_type: string;
  source_id: string;
  lead_id: string | null;
  deal_id: string | null;
  project_id: string | null;
  invoice_id: string | null;
  task_id: string | null;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  description: string | null;
  status: string | null;
  link_path: string;
  priority: number;
};

export type CalendarEventsResponse = {
  view: string;
  range_start: string;
  range_end: string;
  events: CalendarEvent[];
  total: number;
};

export type CalendarAgendaItem = {
  event: CalendarEvent;
  reason: string;
};

export type CalendarTodayAgenda = {
  greeting: string;
  user_name: string;
  date: string;
  priorities: CalendarAgendaItem[];
  events_today: CalendarEvent[];
  summary: string;
};

export type CalendarEventDetail = {
  event: CalendarEvent;
  detail: { link_path: string; entity: string; entity_id: string } | null;
};

export type CalendarViewMode = "month" | "week" | "day";

export const CALENDAR_LEGEND = [
  { type: "meeting", label: "Meetings", color: "#3B82F6" },
  { type: "call", label: "Calls", color: "#22C55E" },
  { type: "task", label: "Tasks", color: "#F97316" },
  { type: "project_deadline", label: "Deadlines", color: "#EF4444" },
  { type: "invoice_due", label: "Invoices", color: "#A855F7" },
  { type: "lead_followup", label: "Follow-ups", color: "#F59E0B" },
  { type: "deal_close", label: "Deal close", color: "#EF4444" },
] as const;

export type InboxItem = {
  id: string;
  channel: string;
  channel_label: string;
  title: string;
  preview: string;
  contact_name: string | null;
  status: string | null;
  delivery_status: string | null;
  read_status: string;
  created_at: string;
  is_proxy: boolean;
  sender_name: string | null;
  lead_id: string | null;
  deal_id: string | null;
  client_id: string | null;
  project_id: string | null;
  invoice_id: string | null;
  link_path: string;
  metadata: Record<string, string> | null;
};

export type InboxResponse = {
  items: InboxItem[];
  total: number;
  unread_count: number;
};

export type InboxSummary = {
  unread_messages: number;
  pending_followups: number;
  overdue_invoices: number;
  proposals_needing_revision: number;
  high_priority_count: number;
  summary_lines: string[];
  note: string;
};

export type InboxChannel =
  | "all"
  | "email"
  | "whatsapp"
  | "messaging"
  | "call"
  | "notification"
  | "internal_comment";

export const INBOX_CHANNELS = [
  { id: "all" as const, label: "All" },
  { id: "email" as const, label: "Emails" },
  { id: "whatsapp" as const, label: "WhatsApp" },
  { id: "notification" as const, label: "Notifications" },
  { id: "internal_comment" as const, label: "Internal comments" },
  { id: "call" as const, label: "Calls" },
];

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

export type ActiveTimer = {
  running: boolean;
  entry: TimeEntry | null;
  elapsed_seconds: number;
};

export type TimeEntry = {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string | null;
  project_id: string;
  project_title: string | null;
  task_id: string;
  task_title: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  duration_label: string;
  note: string | null;
  is_running: boolean;
  created_at: string;
};

export type UserTimeSummary = {
  today: { label: string; total_seconds: number; total_label: string };
  yesterday: { label: string; total_seconds: number; total_label: string };
  this_week: { label: string; total_seconds: number; total_label: string };
};

export type ProjectTimeSummary = {
  project_id: string;
  project_title: string;
  total_seconds: number;
  total_hours: number;
  total_label: string;
  estimated_hours: number;
  over_hours: number;
  over_label: string;
};

export const EXPENSE_CATEGORIES = [
  { key: "hosting", label: "Hosting" },
  { key: "domain", label: "Domain" },
  { key: "travel", label: "Travel" },
  { key: "software", label: "Software" },
  { key: "marketing", label: "Marketing" },
  { key: "printing", label: "Printing" },
  { key: "miscellaneous", label: "Others" },
] as const;

export type ProjectExpense = {
  id: string;
  company_id: string;
  project_id: string;
  created_by_id: string | null;
  created_by_name: string | null;
  category: string;
  category_label: string;
  title: string;
  amount: number;
  expense_date: string;
  notes: string | null;
  created_at: string;
};

export type ProjectProfitability = {
  project_id: string;
  project_title: string;
  revenue: number;
  expenses_total: number;
  profit: number;
  breakdown: { category: string; label: string; amount: number }[];
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

export type ManagerDashboard = {
  open_leads: number;
  open_deals: number;
  active_projects: number;
  pending_approvals: number;
  pipeline_value: string;
  deal_pipeline_value: string;
  revenue_paid: string;
  revenue_outstanding: string;
  team_size: number;
  tasks_done_this_week: number;
  tasks_open: number;
  avg_project_progress: number;
};

export type ManagerReports = {
  team_productivity: {
    user_id: string;
    name: string;
    role: string;
    tasks_done: number;
    tasks_open: number;
    hours_logged_label: string;
    hours_logged_seconds: number;
  }[];
  lead_conversion: {
    total_leads: number;
    open_leads: number;
    won: number;
    lost: number;
    conversion_rate: number;
    by_status: Record<string, number>;
  };
  project_status: {
    planning: number;
    active: number;
    review: number;
    completed: number;
    total: number;
  };
  open_deals: number;
  deal_pipeline_value: string;
  revenue_paid: string;
  revenue_outstanding: string;
  pending_approvals: number;
};

export type OwnerExecutive = {
  revenue_paid: string;
  revenue_outstanding: string;
  revenue_invoiced: string;
  expenses_total: string;
  profit: string;
  pipeline_value: string;
  deal_pipeline_value: string;
  open_leads: number;
  open_deals: number;
  active_projects: number;
  team_size: number;
  conversion_rate: number;
  cash_flow: {
    month: string;
    label: string;
    inflow: string;
    outflow: string;
    net: string;
  }[];
  expenses_by_category: {
    category: string;
    label: string;
    amount: string;
  }[];
  team_productivity: ManagerReports["team_productivity"];
  project_status: ManagerReports["project_status"];
};

export type OwnerExpense = {
  id: string;
  project_id: string;
  project_title: string | null;
  category: string;
  category_label: string;
  title: string;
  amount: string;
  expense_date: string;
  notes: string | null;
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
  avg_progress_percent: number;
  pending_approvals: number;
  invoice_count: number;
  unpaid_invoice_count: number;
  total_invoiced: string;
  total_paid: string;
  outstanding: string;
};

export type PortalActivityItem = {
  id: string;
  type: string;
  message: string;
  created_at: string;
};

export type PortalTask = {
  id: string;
  project_id: string;
  project_title: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
};

export type PortalMilestone = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  sort_order: number;
};

export type PortalFile = {
  id: string;
  project_id: string | null;
  project_title: string | null;
  filename: string;
  content_type: string;
  size: number;
  folder: string;
  folder_label: string;
  kind: string;
  source: string;
  created_at: string;
};

export type PortalApproval = {
  id: string;
  project_id: string | null;
  project_title: string | null;
  document_id: string | null;
  document_filename: string | null;
  title: string;
  description: string | null;
  kind: string;
  kind_label: string;
  status: string;
  client_comment: string | null;
  decided_at: string | null;
  created_at: string;
};

export type PortalMessage = {
  id: string;
  project_id: string | null;
  project_title: string | null;
  sender_side: string;
  sender_name: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type PortalProjectDetail = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  task_total: number;
  task_done: number;
  progress_percent: number;
  milestones: PortalMilestone[];
  tasks: PortalTask[];
  files: PortalFile[];
  approvals: PortalApproval[];
};

export const TASK_COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
] as const;

export const LEAD_COLUMNS = [
  { id: "new", title: "New" },
  { id: "contacted", title: "Contacted" },
  { id: "proposal", title: "Proposal" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
] as const;

export type HrEmployee = {
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  salary: number;
  annual_leave_balance: number;
  casual_leave_balance: number;
  medical_leave_balance: number;
  notes: string | null;
  today_status: string | null;
  month_work_hours: number;
  pending_leaves: number;
};

export type AttendanceLog = {
  id: string;
  user_id: string;
  user_name: string | null;
  work_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: string;
  work_seconds: number;
  work_label: string;
  notes: string | null;
};

export type LeaveRequest = {
  id: string;
  user_id: string;
  user_name: string | null;
  leave_type: string;
  leave_type_label: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string | null;
  status: string;
  reviewed_by_id: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
};

export type CompanyHoliday = {
  id: string;
  title: string;
  holiday_date: string;
  is_optional: boolean;
  created_at: string;
};

export type AutomationActionBlock = {
  id: string;
  type: string;
  config: Record<string, unknown>;
};

export type Automation = {
  id: string;
  company_id: string;
  created_by_id: string | null;
  created_by_name: string | null;
  name: string;
  description: string | null;
  trigger_key: string;
  trigger_label: string;
  actions: AutomationActionBlock[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AutomationCatalog = {
  triggers: { key: string; label: string; description: string }[];
  actions: { key: string; label: string; description: string }[];
};

export type AutomationRun = {
  id: string;
  automation_id: string;
  trigger_key: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  result: Record<string, unknown>;
  created_at: string;
};
