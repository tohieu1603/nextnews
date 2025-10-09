export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  avatar: string;
  joinDate: string;
  totalTrades: number;
  totalProfit: number;
  successRate: number;
  signalMethod: "zalo" | "telegram" | "email";
  signalEnabled: boolean;
  telegramId?: string;
  zaloPhone?: string;
}

// Wallet types
export interface WalletInfo {
  wallet_id: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TopUpIntent {
  intent_id: string;
  order_code: string;
  amount: number;
  currency: string;
  status: string;
  qr_image_url: string;
  qr_code_url: string;
  account_number: string;
  account_name: string;
  transfer_content: string;
  bank_code: string;
  expires_at: string;
  message: string;
}

export interface TopUpStatus {
  intent_id: string;
  order_code: string;
  amount: number;
  status: "processing" | "succeeded" | "failed" | "expired";
  is_expired: boolean;
  qr_image_url?: string;
  account_number?: string;
  account_name?: string;
  transfer_content?: string;
  bank_code?: string;
  expires_at?: string;
  payment_id?: string;
  provider_payment_id?: string;
  balance_before?: number;
  balance_after?: number;
  completed_at?: string;
  message: string;
}

export interface PaymentHistory {
  id: string;
  order_code: string;
  reference_code: string;
  amount: number;
  status: string;
  purpose: string;
  provider: string;
  created_at: string;
  user_id: number;
}

export interface PaymentHistoryResponse {
  total: number;
  page: number;
  page_size: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
  };
  results: PaymentHistory[];
}

// Symbol Purchase Types
export interface SymbolOrderItem {
  symbol_id: number;
  price: number;
  license_days: number;
  symbol_name?: string;
  metadata?: Record<string, unknown>;
  auto_renew?: boolean;
  auto_renew_price?: number | null;
  auto_renew_cycle_days?: number | null;
}

export interface SymbolOrderResponse {
  order_id: string;
  total_amount: number;
  status: "pending_payment" | "paid" | "failed" | "cancelled";
  payment_method: "wallet" | "sepay_transfer";
  items: SymbolOrderItem[];
  created_at: string;
  message: string;
  payment_intent_id?: string | null;
  qr_code_url?: string | null;
  deep_link?: string | null;
  insufficient_balance?: boolean;
  wallet_balance?: number;
  shortage?: number;
}

export interface SymbolOrderStatus {
  order_id: string;
  status: "pending_payment" | "paid" | "failed" | "cancelled";
  total_amount: number;
  payment_method: string;
  items: SymbolOrderItem[];
  created_at: string;
  updated_at: string;
  message: string;
}

export interface SepayPaymentIntent {
  intent_id: string;
  order_code: string;
  amount: number;
  currency: string;
  expires_at: string;
  qr_code_url: string;
  message: string;
}

// Symbol Access Check (from /api/sepay/symbol/{symbol_id}/access)
export interface SymbolAccessCheckResponse {
  has_access: boolean;
  license_id?: string;
  symbol_id?: number;
  symbol_name?: string;
  start_at?: string;
  end_at?: string | null;
  is_lifetime?: boolean;
  expires_soon?: boolean;
}

export interface EnableAutoRenewRequest {
  symbol_id: number;
  price?: number | string;
  cycle_days?: number;
  payment_method?: "wallet";
  grace_period_hours?: number;
  retry_interval_minutes?: number;
  max_retry_attempts?: number;
}

// Purchased Licenses Types (from /api/sepay/symbol/licenses)
export interface PurchasedLicense {
  license_id: string;
  symbol_id: number;
  symbol_name: string;
  status: "active" | "expired" | "cancelled";
  start_at: string;
  end_at: string | null;
  is_lifetime: boolean;
  is_active: boolean;
  order_id: string;
  created_at: string;
  purchase_price: number;
  license_days: number | null;
  auto_renew: boolean;
  auto_renew_price?: number | null;
  payment_method: "wallet" | "sepay_transfer";
  order_total_amount: number;
  subscription?: AutoRenewSubscription | null;
  subscription_id?: string | null;
}

// Auto-Renew Subscription Types
export interface AutoRenewSubscription {
  id?: string;
  subscription_id: string;
  symbol_id: number;
  symbol_name?: string;
  license_id?: string | null;
  current_license_id?: string | null;
  status: "pending_activation" | "active" | "paused" | "suspended" | "cancelled" | "completed";
  is_active?: boolean;
  price: number;
  cycle_days: number;
  payment_method: "wallet" | "sepay_transfer";
  next_billing_at: string | null;
  last_success_at: string | null;
  last_attempt_at: string | null;
  consecutive_failures?: number;
  failed_attempts?: number;
  grace_period_hours?: number;
  retry_interval_minutes?: number;
  max_retry_attempts?: number;
  last_order_id?: string | null;
  created_at: string;
  updated_at: string;
  cancelled_at?: string | null;
}

export interface AutoRenewAttempt {
  id: string;
  subscription_id: string;
  status: "success" | "failed" | "skipped";
  amount: number;
  order_id: string | null;
  error_code: string | null;
  error_message: string | null;
  ran_at: string;
}

// Notification module types
export type NotificationChannel = "telegram" | "zalo" | "email";

export interface NotificationEndpoint {
  endpoint_id: string;
  channel: NotificationChannel;
  address: string;
  details: Record<string, unknown> | null;
  is_primary: boolean;
  verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateNotificationEndpointPayload {
  channel: NotificationChannel;
  address: string;
  is_primary?: boolean;
  details?: Record<string, unknown>;
}

export interface UpdateNotificationEndpointPayload {
  is_primary?: boolean;
  verified?: boolean;
  details?: Record<string, unknown>;
}

export interface VerifyNotificationEndpointPayload {
  auto_verify?: boolean;
  verification_code?: string;
}
