// ============================================
// Dashboard, Policy, Claims, Billing Types
// ============================================

// ---- Policy ----
export interface PolicySummary {
  policy_id: string;
  policy_number?: string;
  plan_name: string;
  plan_type: 'PPO' | 'HMO' | 'EPO' | 'POS' | 'HDHP';
  metal_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  policy_status: 'active' | 'expired' | 'suspended' | 'terminated';
  premium: number;
  deductible: number;
  coinsurance: number;
  copay_pcp: number;
  copay_specialist: number;
  out_of_pocket_max: number;
  effective_date: string;
  renewal_date: string;
  group_number?: string;
  network_id?: string;
}

// ---- Billing ----
export interface BillingSummary {
  billing_id?: string;
  premium_amount: number;
  due_date: string;
  payment_status: 'paid' | 'pending' | 'overdue' | 'partial';
  deductible_used: number;
  deductible_remaining: number;
  oop_used: number;
  oop_remaining: number;
  auto_pay?: boolean;
  payment_method?: string;
}

// ---- Claims ----
export interface ClaimSummary {
  claim_id: string;
  claim_type: string;
  status: 'approved' | 'denied' | 'paid' | 'submitted' | 'in_review';
  billed_amount: number;
  paid_amount?: number;
  member_responsibility?: number;
  service_date: string;
  hospital_name?: string;
  denial_reason?: string;
}

// ---- Digital ID Card ----
export interface IDCardData {
  card_id?: string;
  member_name: string;
  policy_number: string;
  group_number: string;
  plan_name: string;
  effective_date?: string;
  expiration_date?: string;
  barcode?: string;
  qr_code?: string;
}

// ---- Notification ----
export interface NotificationItem {
  notification_id: string;
  type: string;
  subject: string;
  body?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  read_at?: string;
}

// ---- Dashboard Aggregate ----
export interface DashboardData {
  policy: PolicySummary | null;
  billing: BillingSummary | null;
  recent_claims: ClaimSummary[];
  id_card: IDCardData | null;
  notifications: NotificationItem[];
}

export interface DashboardResponse {
  success: boolean;
  message?: string;
  error?: string;
  policy?: PolicySummary;
  billing?: BillingSummary;
  recent_claims?: ClaimSummary[];
  id_card?: IDCardData;
  notifications?: NotificationItem[];
}
