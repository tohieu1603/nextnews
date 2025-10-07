import type { stockDatabase } from "@/constants/stockDatabase";

export type StockAnalysis = (typeof stockDatabase)[keyof typeof stockDatabase];

export interface IndustryInfo {
  readonly name: string;
  readonly updated_at?: string | null;
}

export interface CompanyEvent {
  readonly event_title?: string;
  readonly issue_date?: string | null;
  readonly public_date?: string | null;
  readonly source_url?: string | null;
}

export interface CompanyOfficer {
  readonly officer_name: string;
  readonly position_short_name?: string | null;
  readonly officer_position?: string | null;
  readonly officer_owner_percent?: number;
  readonly updated_at?: string;
}

export interface CompanyShareholder {
  readonly share_holder: string;
  readonly share_own_percent: number;
}

export interface CompanyInfo {
  readonly company_name?: string;
  readonly history?: string;
  readonly company_profile?: string;
  readonly industry?: string;
  readonly website?: string;
  readonly no_employees?: number | string;
  readonly charter_capital?: number | string;
  readonly financial_ratio_issue_share?: number | string;
  readonly events?: CompanyEvent[];
  readonly officers?: CompanyOfficer[];
  readonly shareholders?: CompanyShareholder[];
}

export interface SymbolIndustryData {
  readonly industries?: IndustryInfo[];
}

export interface IncomeStatementEntry {
  readonly year: number;
  readonly quarter: number;
  readonly revenue?: number | null;
  readonly revenue_yoy?: number | null;
  readonly net_profit_for_the_year?: number | null;
  readonly attribute_to_parent_company?: number | null;
  readonly attribute_to_parent_company_yoy?: number | null;
  readonly profit_before_tax?: number | null;
  readonly business_income_tax_current?: number | null;
  readonly business_income_tax_deferred?: number | null;
  readonly minority_interest?: number | null;
  readonly [key: string]: number | string | null | undefined;
}

export interface CashflowSnapshot {
  readonly net_profit_loss_before_tax?: number | string | null;
  readonly [key: string]: number | string | null | undefined;
}

export interface CompanyDetails {
  readonly company?: CompanyInfo;
  readonly symbolData?: SymbolIndustryData;
  readonly incomeData?: IncomeStatementEntry[];
  readonly balanceData?: Record<string, unknown>[];
  readonly cashflowData?: CashflowSnapshot | CashflowSnapshot[];
  readonly exchange?: string;
  readonly [key: string]: unknown;
}
