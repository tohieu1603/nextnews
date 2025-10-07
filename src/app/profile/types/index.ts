export interface TradingBot {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  subscribedDate: string;
  expiryDate: string;
  monthlyFee: number;
  description: string;
  openOrders?: OpenOrder[];
}

export interface OpenOrder {
  id: string;
  stockCode: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  orderType: "LIMIT" | "MARKET" | "STOP_LOSS";
  status: "PENDING" | "PARTIAL" | "FILLED" | "CANCELLED";
  openTime: string;
  filledQuantity?: number;
}

export interface OrderHistory {
  id: string;
  stockCode: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  orderType: "LIMIT" | "MARKET" | "STOP_LOSS";
  status: "FILLED" | "CANCELLED" | "EXPIRED";
  openTime: string;
  closeTime: string;
  filledQuantity: number;
  profit?: number;
  botId?: string;
  botName?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type:
    | "bot_subscription"
    | "signal_package"
    | "analysis_package"
    | "premium_upgrade";
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  duration?: string;
}

export interface Package {
  duration: string;
  months: number;
  discount: number;
  price: number;
  originalPrice: number;
  savings: number;
}

export interface WalletBalance {
  balance: number;
  lastTopUp: string;
  autoRenewal: {
    enabled: boolean;
    signalPackages: boolean;
    botSubscriptions: boolean;
    minBalance: number;
  };
}
