"use client";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import {
  Activity,
  AlertTriangle,
  BarChart,
  Building2,
  Calculator,
  Calendar,
  CheckCircle,
  FileBarChart,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
  Waves,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyDetails } from "../../../types";
/** ========== TYPES từ BE ========== */
type Quarter = 1 | 2 | 3 | 4;
interface CashFlowData {
  rows: CashFlowRow[];
  data: any;
}
export type CashFlowRow = {
  year: number;
  quarter: number;
  // Operating
  net_profit_loss_before_tax: number;
  depreciation_and_amortisation: number;
  provision_for_credit_losses: number;
  unrealized_foreign_exchange_gain_loss: number;
  profit_loss_from_investing_activities: number;
  interest_expense: number;
  operating_profit_before_changes_in_working_capital: number;
  increase_decrease_in_receivables: number;
  increase_decrease_in_inventories: number;
  increase_decrease_in_payables: number;
  increase_decrease_in_prepaid_expenses: number;
  interest_paid: number;
  business_income_tax_paid: number;
  net_cash_inflows_outflows_from_operating_activities: number;
  // Investing
  purchase_of_fixed_assets: number;
  proceeds_from_disposal_of_fixed_assets: number;
  loans_granted_purchases_of_debt_instruments_bn_vnd: number;
  collection_of_loans_proceeds_sales_instruments_vnd: number;
  investment_in_other_entities: number;
  proceeds_from_divestment_in_other_entities: number;
  gain_on_dividend: number;
  net_cash_flows_from_investing_activities: number;
  // Financing
  increase_in_charter_captial: number;
  payments_for_share_repurchases: number;
  proceeds_from_borrowings: number;
  repayment_of_borrowings: number;
  finance_lease_principal_payments: number;
  dividends_paid: number;
  cash_flows_from_financial_activities: number;
  // Cash summary
  net_increase_decrease_in_cash_and_cash_equivalents: number;
  cash_and_cash_equivalents: number; // đầu kỳ
  foreign_exchange_differences_adjustment: number;
  cash_and_cash_equivalents_at_the_end_of_period: number; // cuối kỳ
};
type Props = {
  data?: CompanyDetails | null;
  loading?: boolean;
  error?: string | null;
};
type YoYMode = "annual" | "quarter-latest";
type Metric = {
  label: string;
  field: keyof CashFlowRow;
  yoy?: YoYMode;
  strong?: boolean;
};
/** ========== UTILS ========== */
type RatioFormat = "ratio" | "percent" | "currency" | "days" | "times";
type RatioColor = "positive" | "negative" | "neutral";
type RatioSymbol = {
  readonly name?: string | null;
  readonly exchange?: string | null;
  readonly [key: string]: unknown;
};
type RatioEntry = {
  readonly year?: number | null;
  readonly quarter?: number | null;
  readonly symbol?: RatioSymbol | null;
  readonly [key: string]: unknown;
};
type RatioMetricDefinition = {
  readonly key: string;
  readonly label: string;
  readonly format: RatioFormat;
  readonly color: RatioColor;
};
type RatioCategoryDefinition = {
  readonly title: string;
  readonly color: "blue" | "emerald" | "yellow" | "cyan" | "rose";
  readonly metrics: readonly RatioMetricDefinition[];
};
const RATIO_CATEGORY_DEFINITIONS: readonly RatioCategoryDefinition[] = [
  {
    title: "Chỉ số thanh khoản",
    color: "blue",
    metrics: [
      { key: "current_ratio", label: "Tỷ số thanh toán hiện hành", format: "ratio", color: "positive" },
      { key: "quick_ratio", label: "Tỷ số thanh toán nhanh", format: "ratio", color: "positive" },
      { key: "cash_ratio", label: "Tỷ số thanh toán bằng tiền", format: "ratio", color: "positive" },
    ],
  },
  {
    title: "Chỉ số đòn bẩy",
    color: "rose",
    metrics: [
      { key: "debt_equity", label: "Tỷ lệ nợ/vốn chủ sở hữu", format: "ratio", color: "negative" },
      { key: "financial_leverage", label: "Đòn bẩy tài chính", format: "ratio", color: "negative" },
      { key: "interest_coverage", label: "Khả năng thanh toán lãi vay", format: "times", color: "positive" },
    ],
  },
  {
    title: "Chỉ số hiệu quả",
    color: "emerald",
    metrics: [
      { key: "asset_turnover", label: "Vòng quay tổng tài sản", format: "times", color: "positive" },
      { key: "inventory_turnover", label: "Vòng quay hàng tồn kho", format: "times", color: "positive" },
      { key: "cash_cycle", label: "Chu kỳ tiền mặt", format: "days", color: "negative" },
    ],
  },
  {
    title: "Chỉ số lợi nhuận",
    color: "yellow",
    metrics: [
      { key: "roe_percent", label: "ROE", format: "percent", color: "positive" },
      { key: "roa_percent", label: "ROA", format: "percent", color: "positive" },
      { key: "net_profit_margin_percent", label: "Biên lợi nhuận ròng", format: "percent", color: "positive" },
    ],
  },
  {
    title: "Chỉ số định giá",
    color: "cyan",
    metrics: [
      { key: "p_e", label: "P/E", format: "times", color: "neutral" },
      { key: "p_b", label: "P/B", format: "times", color: "neutral" },
      { key: "ev_ebitda", label: "EV/EBITDA", format: "times", color: "neutral" },
    ],
  },
];

const RATIO_CATEGORY_COLOR_CLASSES: Record<
  RatioCategoryDefinition["color"],
  { container: string; title: string }
> = {
  blue: {
    container: "bg-blue-500/10 border border-blue-500/30",
    title: "text-blue-400",
  },
  rose: {
    container: "bg-rose-500/10 border border-rose-500/30",
    title: "text-rose-400",
  },
  emerald: {
    container: "bg-emerald-500/10 border border-emerald-500/30",
    title: "text-emerald-400",
  },
  yellow: {
    container: "bg-yellow-500/10 border border-yellow-500/30",
    title: "text-yellow-400",
  },
  cyan: {
    container: "bg-cyan-500/10 border border-cyan-500/30",
    title: "text-cyan-400",
  },
};

const parseNumericValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};
const parseYear = (value: unknown): number | null => {
  const numeric = parseNumericValue(value);
  if (numeric == null) return null;
  const year = Math.trunc(numeric);
  return Number.isFinite(year) ? year : null;
};
const parseQuarterValue = (value: unknown): Quarter | null => {
  const numeric = parseNumericValue(value);
  if (numeric == null) return null;
  const quarter = Math.trunc(numeric);
  return quarter === 1 || quarter === 2 || quarter === 3 || quarter === 4
    ? (quarter as Quarter)
    : null;
};
const parseYearLoose = (value: unknown): number | null => {
  const parsed = parseYear(value);
  if (parsed != null) return parsed;
  if (typeof value === "string") {
    const match = value.match(/(\d{4})/);
    if (match) {
      const yearCandidate = Number(match[1]);
      if (Number.isFinite(yearCandidate)) {
        return yearCandidate;
      }
    }
  }
  return null;
};
const parseQuarterLoose = (value: unknown): Quarter | null => {
  const parsed = parseQuarterValue(value);
  if (parsed) return parsed;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    const qMatch = normalized.match(/Q([1-4])/);
    if (qMatch) {
      return Number(qMatch[1]) as Quarter;
    }
    const standaloneMatch = normalized.match(/(?:^|[^0-9])([1-4])(?:[^0-9]|$)/);
    if (standaloneMatch) {
      return Number(standaloneMatch[1]) as Quarter;
    }
  }
  return null;
};
const extractCashflowRows = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const source = raw as Record<string, unknown>;
  const candidates = [
    source.data,
    source.results,
    source.items,
    source.rows,
    source.cashflows,
  ].find(Array.isArray);
  if (Array.isArray(candidates)) {
    return candidates;
  }
  return [raw];
};
const normalizeRatioEntry = (entry: unknown): RatioEntry | null => {
  if (!entry || typeof entry !== "object") return null;
  const record = entry as Record<string, unknown>;
  const yearSources = [
    record.year,
    record.fiscal_year,
    record.report_year,
    record.period,
    record.date,
    record.time,
  ];
  const quarterSources = [
    record.quarter,
    record.fiscal_quarter,
    record.report_quarter,
    record.period,
    record.date,
    record.time,
  ];
  const derivedYear = yearSources.map(parseYearLoose).find((value) => value != null) ?? null;
  const derivedQuarter =
    quarterSources.map(parseQuarterLoose).find((value) => value != null) ?? null;
  return {
    ...(record as RatioEntry),
    year: derivedYear,
    quarter: derivedQuarter,
  };
};
const normalizeRatioEntries = (raw: unknown): RatioEntry[] => {
  const entries: RatioEntry[] = [];
  const pushEntry = (value: unknown) => {
    const normalized = normalizeRatioEntry(value);
    if (normalized) entries.push(normalized);
  };
  const visited = new WeakSet<object>();
  const collectFromContainer = (container: Record<string, unknown>) => {
    if (visited.has(container)) {
      return;
    }
    visited.add(container);
    const candidateKeys = [
      "data",
      "results",
      "items",
      "rows",
      "records",
      "values",
      "ratios",
      "entries",
      "list",
      "payload",
    ];
    let found = false;
    candidateKeys.forEach((key) => {
      const candidate = container[key];
      if (Array.isArray(candidate)) {
        found = true;
        candidate.forEach(pushEntry);
        return;
      }
      if (candidate && typeof candidate === "object") {
        const before = entries.length;
        collectFromContainer(candidate as Record<string, unknown>);
        if (entries.length > before) {
          found = true;
        }
      }
    });
    if (!found) {
      pushEntry(container);
    }
  };
  if (Array.isArray(raw)) {
    raw.forEach(pushEntry);
  } else if (raw && typeof raw === "object") {
    collectFromContainer(raw as Record<string, unknown>);
  }
  return entries
    .filter((entry) => entry.year != null)
    .sort((a, b) => {
      const yearDiff = (b.year ?? 0) - (a.year ?? 0);
      if (yearDiff !== 0) return yearDiff;
      const quarterA = a.quarter ?? 0;
      const quarterB = b.quarter ?? 0;
      return quarterB - quarterA;
    });
};
const TO_BILLION = 1e9;
const fmtBnVND = (v?: number | null) => {
  if (v == null) return "—";
  const bn = v / TO_BILLION;
  if (Math.abs(bn) < 1e-9) return "0";
  return bn.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
};
const amountClass = (v?: number | null) =>
  v == null ? "text-slate-400" : v < 0 ? "text-red-400" : "text-slate-200";
const yoyClass = (pct?: number | null) =>
  pct == null || !Number.isFinite(pct)
    ? "text-slate-400"
    : pct >= 0
      ? "text-emerald-400"
      : "text-red-400";
const fmtYoY = (pct?: number | null) =>
  pct == null || !Number.isFinite(pct)
    ? "—"
    : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
/** Helper: record theo năm/quý */
const getQuarterRow = (rows: CashFlowRow[], year: number, quarter: Quarter) =>
  rows.find((r) => r.year === year && r.quarter === quarter);
/** Danh sách năm giảm dần */
const getYearsDesc = (rows: CashFlowRow[]) =>
  Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => b - a);
/** Tổng 4 quý của 1 năm cho 1 field */
const sumYear = (rows: CashFlowRow[], year: number, field: keyof CashFlowRow) =>
  rows
    .filter((r) => r.year === year)
    .reduce((s, r) => s + (Number(r[field]) || 0), 0);
/** Quý mới nhất có dữ liệu trong 1 năm */
// const latestQuarterOfYear = (rows: CashFlowRow[], year: number): Quarter | null => {
//   const qs = rows.filter((r) => r.year === year).map((r) => r.quarter);
//   if (!qs.length) return null;
//   return qs.sort((a, b) => b - a)[0] ?? null;
// };
const latestQuarterOfYear = (
  rows: CashFlowRow[],
  year: number
): Quarter | null => {
  const qs = rows.filter((r) => r.year === year).map((r) => r.quarter);
  if (!qs.length) return null;
  const max = Math.max(...qs);
  return [1, 2, 3, 4].includes(max) ? (max as Quarter) : null; // ✅ an toàn
};
/** YoY tong năm */
const yoyAnnual = (
  rows: CashFlowRow[],
  year: number,
  field: keyof CashFlowRow
) => {
  const cur = sumYear(rows, year, field);
  const prev = sumYear(rows, year - 1, field);
  if (!Number.isFinite(prev) || prev === 0) return null;
  return ((cur - prev) / Math.abs(prev)) * 100;
};
/** YoY theo quý mới nhất (so cùng quý năm trước) */
const yoyQuarterLatest = (
  rows: CashFlowRow[],
  year: number,
  field: keyof CashFlowRow
) => {
  const q = latestQuarterOfYear(rows, year);
  if (!q) return null;
  const cur = getQuarterRow(rows, year, q)?.[field] as number | undefined;
  const prev = getQuarterRow(rows, year - 1, q)?.[field] as number | undefined;
  if (cur == null || prev == null || prev === 0) return null;
  return ((cur - prev) / Math.abs(prev)) * 100;
};
/** Cấu hình các dòng trong bảng */
const OPERATING_ROWS: Metric[] = [
  {
    label: "Lợi nhuận trước thuế",
    field: "net_profit_loss_before_tax",
    yoy: "annual",
    strong: true,
  },
  {
    label: "Khấu hao và phân bổ",
    field: "depreciation_and_amortisation",
    yoy: "annual",
  },
  {
    label: "Chi phí dự phòng rủi ro tín dụng",
    field: "provision_for_credit_losses",
    yoy: "annual",
  },
  {
    label: "Lãi/lỗ chênh lệch tỷ gia (chưa thực hiện)",
    field: "unrealized_foreign_exchange_gain_loss",
    yoy: "annual",
  },
  {
    label: "Lãi/lỗ từ HĐ đầu tư",
    field: "profit_loss_from_investing_activities",
    yoy: "annual",
  },
  { label: "Chi phí lãi vay", field: "interest_expense", yoy: "annual" },
  {
    label: "LN từ HĐKD trước thay đổi VLĐ",
    field: "operating_profit_before_changes_in_working_capital",
    yoy: "annual",
    strong: true,
  },
  {
    label: "Tăng/giảm phải thu KH",
    field: "increase_decrease_in_receivables",
    yoy: "annual",
  },
  {
    label: "Tăng/giảm hang tồn kho",
    field: "increase_decrease_in_inventories",
    yoy: "annual",
  },
  {
    label: "Tăng/giảm phải trả NB",
    field: "increase_decrease_in_payables",
    yoy: "annual",
  },
  {
    label: "Tăng/giảm chi phí trả trước",
    field: "increase_decrease_in_prepaid_expenses",
    yoy: "annual",
  },
  { label: "Tiền lãi vay đã trả", field: "interest_paid", yoy: "annual" },
  {
    label: "Thuế TNDN đã nộp",
    field: "business_income_tax_paid",
    yoy: "annual",
  },
];
const INVESTING_ROWS: Metric[] = [
  { label: "Mua sắm TSCĐ", field: "purchase_of_fixed_assets", yoy: "annual" },
  {
    label: "Thu từ thanh lý TSCĐ",
    field: "proceeds_from_disposal_of_fixed_assets",
    yoy: "annual",
  },
  {
    label: "Cho vay/Mua công cụ no",
    field: "loans_granted_purchases_of_debt_instruments_bn_vnd",
    yoy: "annual",
  },
  {
    label: "Thu hồi cho vay/Bán công cụ no",
    field: "collection_of_loans_proceeds_sales_instruments_vnd",
    yoy: "annual",
  },
  {
    label: "Đầu tư vào đơn vị khác",
    field: "investment_in_other_entities",
    yoy: "annual",
  },
  {
    label: "Thu từ thoai vốn",
    field: "proceeds_from_divestment_in_other_entities",
    yoy: "annual",
  },
  {
    label: "Cổ tức/Lợi nhuận nhận được",
    field: "gain_on_dividend",
    yoy: "annual",
  },
];
const FINANCING_ROWS: Metric[] = [
  {
    label: "Tăng vốn điều lệ",
    field: "increase_in_charter_captial",
    yoy: "annual",
  },
  {
    label: "Chi mua lại cổ phiếu quỹ",
    field: "payments_for_share_repurchases",
    yoy: "annual",
  },
  {
    label: "Tiền vay nhận được",
    field: "proceeds_from_borrowings",
    yoy: "annual",
  },
  { label: "Trả no gốc vay", field: "repayment_of_borrowings", yoy: "annual" },
  {
    label: "Thanh toán no gốc thuê TC",
    field: "finance_lease_principal_payments",
    yoy: "annual",
  },
  { label: "Cổ tức đã trả", field: "dividends_paid", yoy: "annual" },
];
const CASH_ROWS: Metric[] = [
  {
    label: "Tăng/giảm tiền thuần trong kỳ",
    field: "net_increase_decrease_in_cash_and_cash_equivalents",
    yoy: "annual",
    strong: true,
  },
  {
    label: "Tiền & TĐT đầu kỳ",
    field: "cash_and_cash_equivalents",
    yoy: "quarter-latest",
  },
  {
    label: "Ảnh hưởng thay đổi tỷ gia",
    field: "foreign_exchange_differences_adjustment",
    yoy: "annual",
  },
];
/** ========== COMPONENT ========== */
export default function CashFlow({ data, loading, error }: Props) {
  // State for selected year and quarter in ratio analysis
  const [selectedYear, setSelectedYear] = useState<number | null>(2025);
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter | null>(2);


  /** Sắp xếp để hiển thi ổn dinh */
  const cashflowRaw = data?.cashflowData;
  const ratioEntries = useMemo<RatioEntry[]>(
    () => normalizeRatioEntries(data?.ratiosData),
    [data?.ratiosData]
  );
  const ratioYears = useMemo<number[]>(() => {
    const years = ratioEntries
      .map((entry) => entry.year)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [ratioEntries]);
  useEffect(() => {
    if (!ratioEntries.length) {
      return;
    }
    const fallbackYearEntry = ratioEntries.find((entry) => entry.year != null);
    const fallbackYear = fallbackYearEntry?.year ?? null;
    const findQuarterForYear = (yearTarget: number | null): Quarter | null => {
      if (yearTarget != null) {
        const match = ratioEntries.find(
          (entry) => entry.year === yearTarget && entry.quarter != null
        );
        if (match?.quarter != null) {
          return match.quarter as Quarter;
        }
      }
      const anyQuarter = ratioEntries.find((entry) => entry.quarter != null);
      return (anyQuarter?.quarter ?? null) as Quarter | null;
    };
    const ensureQuarter = (next: Quarter | null) => {
      setSelectedQuarter((prev) => (prev === next ? prev : next));
    };
    if (selectedYear == null) {
      if (fallbackYear != null) {
        setSelectedYear(fallbackYear);
        ensureQuarter(findQuarterForYear(fallbackYear));
      } else {
        ensureQuarter(findQuarterForYear(null));
      }
      return;
    }
    const yearMatches = ratioEntries.some((entry) => entry.year === selectedYear);
    if (!yearMatches) {
      if (fallbackYear != null) {
        setSelectedYear(fallbackYear);
        ensureQuarter(findQuarterForYear(fallbackYear));
      } else {
        ensureQuarter(findQuarterForYear(null));
      }
      return;
    }
    const hasQuarter = ratioEntries.some(
      (entry) => entry.year === selectedYear && entry.quarter === selectedQuarter
    );
    if (!hasQuarter) {
      ensureQuarter(findQuarterForYear(selectedYear));
    }
  }, [ratioEntries, selectedYear, selectedQuarter]);
  const ratioData = useMemo<RatioEntry | null>(() => {
    if (!ratioEntries.length) return null;
    if (selectedYear != null) {
      const entriesForYear = ratioEntries.filter((entry) => entry.year === selectedYear);
      if (entriesForYear.length) {
        if (selectedQuarter != null) {
          const match = entriesForYear.find((entry) => entry.quarter === selectedQuarter);
          if (match) return match;
        }
        return entriesForYear[0];
      }
    }
    return ratioEntries[0];
  }, [ratioEntries, selectedQuarter, selectedYear]);
  const getRatioNumber = useCallback(
    (key: string): number | null => {
      if (!ratioData) return null;
      return parseNumericValue(ratioData[key]);
    },
    [ratioData]
  );
  const formatRatioValue = (value: number | null, format: RatioFormat): string => {
    if (value == null) return "--";
    switch (format) {
      case "percent":
        return `${(value * 100).toFixed(2)}%`;
      case "currency":
        if (Math.abs(value) >= 1_000_000_000_000) {
          return `\u20AB${(value / 1_000_000_000_000).toFixed(1)}T`;
        }
        if (Math.abs(value) >= 1_000_000_000) {
          return `\u20AB${(value / 1_000_000_000).toFixed(1)}B`;
        }
        if (Math.abs(value) >= 1_000_000) {
          return `\u20AB${(value / 1_000_000).toFixed(1)}M`;
        }
        return `\u20AB${value.toLocaleString("vi-VN")}`;
      case "days":
        return `${value.toFixed(0)} ngày`;
      case "times":
        return `${value.toFixed(2)}x`;
      case "ratio":
      default:
        return value.toFixed(3);
    }
  };
  const getRatioColor = (value: number | null, color: RatioColor): string => {
    if (value == null) return "text-slate-400";
    if (color === "positive") {
      return value >= 0 ? "text-emerald-400" : "text-red-400";
    }
    if (color === "negative") {
      return value <= 0 ? "text-emerald-400" : "text-red-400";
    }
    return "text-blue-400";
  };
  type RatioCategoryInstance = {
    readonly title: string;
    readonly color: string;
    readonly metrics: Array<RatioMetricDefinition & { value: number }>;
  };

  const ratioSymbol = (ratioData?.symbol as RatioSymbol | undefined) ?? null;
  const displayYear = selectedYear ?? ratioData?.year ?? null;
  const displayQuarter = selectedQuarter ?? ratioData?.quarter ?? null;
  const ratioSymbolName =
    ratioSymbol && typeof ratioSymbol.name === "string" && ratioSymbol.name.trim().length
      ? ratioSymbol.name
      : "N/A";
  const ratioSymbolExchange =
    ratioSymbol && typeof ratioSymbol.exchange === "string" && ratioSymbol.exchange.trim().length
      ? ratioSymbol.exchange
      : "N/A";
  const displayYearLabel = displayYear != null ? String(displayYear) : "--";
  const displayQuarterLabel = displayQuarter != null ? `Q${displayQuarter}` : "Q--";
  const marketCapitalValue = getRatioNumber("market_capital_bn_vnd");
  const formattedMarketCap =
    marketCapitalValue != null ? `${formatRatioValue(marketCapitalValue, "currency")} VND` : "--";
  const rows = useMemo<CashFlowRow[]>(() => {
    if (!cashflowRaw) return [];
    const list = extractCashflowRows(cashflowRaw);
    return list
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        const record = entry as Record<string, unknown>;
        const yearValue =
          parseYearLoose(
            record.year ??
            record.fiscal_year ??
            record.report_year ??
            record.period ??
            record.date ??
            record.time
          ) ?? null;
        const quarterValue =
          parseQuarterLoose(
            record.quarter ??
            record.fiscal_quarter ??
            record.report_quarter ??
            record.period ??
            record.date ??
            record.time
          ) ?? null;
        if (yearValue == null || quarterValue == null) {
          return null;
        }
        const numericRest = Object.entries(record).reduce<Partial<CashFlowRow>>(
          (acc, [key, value]) => {
            if (key === "year" || key === "quarter" || key === "symbol") {
              return acc;
            }
            const parsed = parseNumericValue(value);
            if (parsed != null) {
              acc[key as keyof CashFlowRow] = parsed;
            }
            return acc;
          },
          {}
        );
        return {
          ...numericRest,
          year: yearValue,
          quarter: quarterValue,
        } as CashFlowRow;
      })
      .filter((row): row is CashFlowRow => row != null)
      .sort((a, b) => a.year - b.year || a.quarter - b.quarter);
  }, [cashflowRaw]);
  /** Danh sách năm & năm đang chọn */
  const yearsDesc = useMemo(() => getYearsDesc(rows), [rows]);
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    if (!year && yearsDesc.length) setYear(yearsDesc[0]); // auto chọn năm mới nhất
  }, [yearsDesc, year]);
  /** Cell hiển thi theo quý */
  const Cell = (
    q: Quarter,
    field: keyof CashFlowRow,
    y: number | null,
    strong = false
  ) => {
    if (!y) return <td className="p-4 text-right text-slate-400">—</td>;
    const v = getQuarterRow(rows, y, q)?.[field] as number | undefined;
    return (
      <td
        className={`p-4 text-right ${amountClass(v)} ${strong ? "font-bold" : ""
          }`}
      >
        {fmtBnVND(v)}
      </td>
    );
  };
  /** Tính %YoY cho 1 field theo mode */
  const yoyValue = (field: keyof CashFlowRow, mode: YoYMode = "annual") => {
    if (!year) return null;
    return mode === "quarter-latest"
      ? yoyQuarterLatest(rows, year, field)
      : yoyAnnual(rows, year, field);
  };
  /** 1 hang chỉ tiêu chung */
  const MetricRow: React.FC<Metric> = ({
    label,
    field,
    yoy = "annual",
    strong,
  }) => {
    const pct = yoyValue(field, yoy);
    return (
      <tr className="hover:bg-slate-700/20 transition-colors border-b border-slate-700/40">
        <td
          className={`p-4 pl-8 ${strong ? "text-slate-200 font-medium" : "text-slate-300"
            }`}
        >
          {label}
        </td>
        {Cell(1, field, year, !!strong)}
        {Cell(2, field, year)}
        {Cell(3, field, year)}
        {Cell(4, field, year)}
        <td className={`p-4 text-right font-semibold ${yoyClass(pct)}`}>
          {fmtYoY(pct)}
        </td>
      </tr>
    );
  };
  /** Hàng tong (màu nhấn) */
  const TotalRow: React.FC<{
    label: string;
    field: keyof CashFlowRow;
    color: "emerald" | "blue" | "purple" | "cyan";
    yoy?: YoYMode;
  }> = ({ label, field, color, yoy = "annual" }) => {
    const pct = yoyValue(field, yoy);
    const mapColor = {
      emerald: {
        text: "text-emerald-400",
        bg: "bg-emerald-500/15",
        border: "border-emerald-400/40",
      },
      blue: {
        text: "text-blue-400",
        bg: "bg-blue-500/15",
        border: "border-blue-400/40",
      },
      purple: {
        text: "text-purple-400",
        bg: "bg-purple-500/15",
        border: "border-purple-400/40",
      },
      cyan: {
        text: "text-cyan-400",
        bg: "bg-cyan-500/15",
        border: "border-cyan-400/40",
      },
    }[color];
    return (
      <tr className={`${mapColor.bg} ${mapColor.border} font-bold border-b-2`}>
        <td className={`p-5 pl-6 ${mapColor.text} text-base`}>{label}</td>
        {Cell(1, field, year, true)}
        {Cell(2, field, year)}
        {Cell(3, field, year)}
        {Cell(4, field, year)}
        <td className={`p-5 text-right font-bold ${yoyClass(pct)}`}>
          {fmtYoY(pct)}
        </td>
      </tr>
    );
  };
  /** Loading / Error / Empty */
  if (loading)
    return <div className="p-6 text-slate-300">Đang tải dữ liệu…</div>;
  if (error) return <div className="p-6 text-red-400">Lỗi: {error}</div>;
  if (!rows.length)
    return (
      <div className="p-6 text-slate-300">Không có dữ liệu để hiển thi</div>
    );
  /** KPI (ví dụ động cơ bản) */
  const ocfSum = year
    ? sumYear(rows, year, "net_cash_inflows_outflows_from_operating_activities")
    : null;
  const ocfYoy = year
    ? yoyAnnual(
      rows,
      year,
      "net_cash_inflows_outflows_from_operating_activities"
    )
    : null;
  const invSum = year
    ? sumYear(rows, year, "net_cash_flows_from_investing_activities")
    : null;
  const invYoy = year
    ? yoyAnnual(rows, year, "net_cash_flows_from_investing_activities")
    : null;
  const finSum = year
    ? sumYear(rows, year, "cash_flows_from_financial_activities")
    : null;
  const finYoy = year
    ? yoyAnnual(rows, year, "cash_flows_from_financial_activities")
    : null;
  const latestQ = year ? latestQuarterOfYear(rows, year) : null;
  const cashEnd =
    latestQ && year
      ? getQuarterRow(rows, year, latestQ)
        ?.cash_and_cash_equivalents_at_the_end_of_period
      : null;
  const cashEndYoY = year
    ? yoyQuarterLatest(
      rows,
      year,
      "cash_and_cash_equivalents_at_the_end_of_period"
    )
    : null;

  return (
    <div className="space-y-8">
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full"></div>
              <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Chỉ số tài chính
              </h3>
            </div>
            {/* Modern Period Selector */}
            <div className="flex items-center gap-3">
              {/* Quarter Selector */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-gray-800/90 backdrop-blur-sm border border-blue-500/30 rounded-lg overflow-hidden">
                  <div className="flex">
                    {[1, 2, 3, 4].map(quarter => (
                      <button
                        key={quarter}
                        onClick={() => setSelectedQuarter(quarter as Quarter)}
                        className={`px-3 py-2 text-xs font-medium transition-all duration-300 relative ${selectedQuarter === quarter
                          ? 'text-white bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                          : 'text-blue-300 hover:text-white hover:bg-blue-500/20'
                          }`}
                      >
                        {selectedQuarter === quarter && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 animate-pulse"></div>
                        )}
                        <span className="relative z-10">Q{quarter}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Year Selector */}
              {/* Year Selector */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative">
                  <select
                    value={selectedYear != null ? String(selectedYear) : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedYear(value ? Number(value) : null);
                    }}
                    className="px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                    disabled={!ratioYears.length}
                  >
                    {ratioYears.length ? (
                      ratioYears.map((yearOption) => (
                        <option key={yearOption} value={yearOption}>
                          {yearOption}
                        </option>
                      ))
                    ) : (
                      <option value="">--</option>
                    )}
                  </select>
                </div>
              </div>
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-cyan-300 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  {displayQuarterLabel}/{displayYearLabel}
                </Badge>
              </div>
            </div>
          </div>
          {ratioData ? (
            (() => {
              const ratioCategories = RATIO_CATEGORY_DEFINITIONS.map((category) => ({
                title: category.title,
                color: category.color,
                metrics: category.metrics.map((metric) => {
                  const value = getRatioNumber(metric.key);
                  return {
                    ...metric,
                    value,
                    formattedValue: formatRatioValue(value, metric.format),
                    colorClass: getRatioColor(value, metric.color),
                  };
                }),
              }));
              const ratioHighlights = [
                {
                  key: "eps_vnd",
                  label: "EPS",
                  description: "Thu nhập trên cổ phiếu",
                  format: "currency" as const,
                  containerClass: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30",
                  labelClass: "text-emerald-400",
                  descriptionClass: "text-emerald-300",
                },
                {
                  key: "bvps_vnd",
                  label: "BVPS",
                  description: "Giá trị sổ sách/cổ phiếu",
                  format: "currency" as const,
                  containerClass: "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30",
                  labelClass: "text-blue-400",
                  descriptionClass: "text-blue-300",
                },
                {
                  key: "dividend_yield_percent",
                  label: "Cổ tức",
                  description: "Tỷ suất cổ tức",
                  format: "percent" as const,
                  containerClass: "bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30",
                  labelClass: "text-purple-400",
                  descriptionClass: "text-purple-300",
                },
              ].map((highlight) => {
                const value = getRatioNumber(highlight.key);
                return {
                  ...highlight,
                  displayValue: formatRatioValue(value, highlight.format),
                };
              });
              const symbolInitials =
                ratioSymbolName !== "N/A" ? ratioSymbolName.slice(0, 3).toUpperCase() : "--";
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {symbolInitials}
                      </div>
                      <div>
                        <div className="text-white font-bold">{ratioSymbolName}</div>
                        <div className="text-slate-400 text-sm">
                          {ratioSymbolExchange} · {displayQuarterLabel}/{displayYearLabel}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-sm">Vốn hóa thị trường</div>
                      <div className="text-blue-400 font-bold">{formattedMarketCap}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {ratioCategories.map((category) => {
                      const colorClasses = RATIO_CATEGORY_COLOR_CLASSES[category.color];
                      return (
                        <div key={category.title} className={`p-4 rounded-lg ${colorClasses.container}`}>
                          <h4 className={`font-bold mb-3 text-sm uppercase tracking-wide ${colorClasses.title}`}>
                            {category.title}
                          </h4>
                          <div className="space-y-3">
                            {category.metrics.map((metric) => (
                              <div key={metric.key} className="flex justify-between items-center">
                                <div className="text-slate-300 text-sm flex-1 mr-2">{metric.label}</div>
                                <div className={`font-bold text-sm ${metric.colorClass}`}>{metric.formattedValue}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ratioHighlights.map((highlight) => (
                      <div key={highlight.key} className={`p-4 rounded-lg ${highlight.containerClass}`}>
                        <div className={`${highlight.labelClass} text-sm font-medium mb-1`}>{highlight.label}</div>
                        <div className="text-white font-bold text-lg">{highlight.displayValue}</div>
                        <div className={`${highlight.descriptionClass} text-xs mt-1`}>{highlight.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-6 text-center text-slate-300 bg-slate-800/40 border border-slate-700/50 rounded-lg">
              Chưa có dữ liệu chỉ số tài chính
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-8">
          {/* Header + Year Picker */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-cyan-400 flex items-center gap-3">
              <Waves className="w-6 h-6" />
              Phân tích dòng tiền (Cash Flow Analysis)
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-left text-slate-200 font-semibold min-w-[120px]">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 200,
                        "& .MuiInputBase-root": { color: "white" },
                        "& .MuiInputLabel-root": { color: "white" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "white",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "white",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "white",
                        },
                      }}
                    >
                      <DatePicker
                        label="Year"
                        views={["year"]}
                        openTo="year"
                        value={year ? dayjs(`${year}-01-01`) : null}
                        onChange={(v) => v && setYear(v.year())}
                      />
                    </Box>
                  </Stack>
                </LocalizationProvider>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-400 px-3 py-1">
                  Báo cáo {year ?? "—"}
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-400 px-3 py-1">
                  Đã kiểm toán
                </Badge>
              </div>
            </div>
          </div>
          {/* KPI Cards (động) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-xl border border-emerald-400/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-emerald-400">Dòng tiền HĐKD</h4>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {fmtBnVND(ocfSum)}
              </div>
              <div className={`text-sm ${yoyClass(ocfYoy)} mb-1`}>
                YoY {fmtYoY(ocfYoy)}
              </div>
              <div className="text-xs text-slate-300">OCF (tong năm)</div>
            </div>
            <div className="p-5 bg-gradient-to-br from-blue-500/15 to-blue-600/5 rounded-xl border border-blue-400/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-400">Dòng tiền Đầu tư</h4>
                <TrendingDown className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {fmtBnVND(invSum)}
              </div>
              <div className={`text-sm ${yoyClass(invYoy)} mb-1`}>
                YoY {fmtYoY(invYoy)}
              </div>
              <div className="text-xs text-slate-300">
                Investing CF (tong năm)
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-500/15 to-purple-600/5 rounded-xl border border-purple-400/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-400">
                  Dòng tiền Tài chính
                </h4>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {fmtBnVND(finSum)}
              </div>
              <div className={`text-sm ${yoyClass(finYoy)} mb-1`}>
                YoY {fmtYoY(finYoy)}
              </div>
              <div className="text-xs text-slate-300">
                Financing CF (tong năm)
              </div>
            </div>
            <div className="p-5 bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 rounded-xl border border-cyan-400/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-cyan-400">
                  Tiền & TĐT cuối kỳ
                </h4>
                <Wallet className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {fmtBnVND(cashEnd ?? null)}
              </div>
              <div className={`text-sm ${yoyClass(cashEndYoY)} mb-1`}>
                YoY {fmtYoY(cashEndYoY)}
              </div>
              <div className="text-xs text-slate-300">So cùng quý năm trước</div>
            </div>
          </div>
          {/* BẢNG LCTT */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileBarChart className="w-5 h-5" />
                Báo cáo lưu chuyển tiền tệ (Consolidated Cash Flow Statement)
              </h4>
              <div className="text-sm text-slate-400">
                Đơn vị: Tỷ VND | Dữ liệu theo quý
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-600/40">
              <table className="w-full text-sm border-collapse bg-slate-900/20">
                <thead>
                  <tr className="border-b-2 border-slate-600/60 bg-slate-800/50">
                    <th className="text-left p-4 text-slate-200 font-semibold min-w-[300px]">
                      Khoản mục
                    </th>
                    <th className="text-right p-4 text-slate-200 font-semibold w-[100px]">
                      Quý 1
                    </th>
                    <th className="text-right p-4 text-slate-200 font-semibold w-[100px]">
                      Quý 2
                    </th>
                    <th className="text-right p-4 text-slate-200 font-semibold w-[100px]">
                      Quý 3
                    </th>
                    <th className="text-right p-4 text-slate-200 font-semibold w-[100px]">
                      Quý 4
                    </th>
                    <th className="text-right p-4 text-slate-200 font-semibold w-[100px]">
                      % YoY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* I. OPERATING */}
                  <tr className="bg-emerald-500/8 border-b border-emerald-400/20">
                    <td
                      className="p-4 font-bold text-emerald-400 text-base"
                      colSpan={6}
                    >
                      I. HOẠT ĐỘNG KINH DOANH (OPERATING ACTIVITIES)
                    </td>
                  </tr>
                  {OPERATING_ROWS.map((m) => (
                    <MetricRow key={m.field as string} {...m} />
                  ))}
                  <TotalRow
                    label="Lưu chuyển tiền thuần từ HĐKD"
                    field="net_cash_inflows_outflows_from_operating_activities"
                    color="emerald"
                    yoy="annual"
                  />
                  {/* II. INVESTING */}
                  <tr className="bg-blue-500/8 border-b border-blue-400/20">
                    <td
                      className="p-4 font-bold text-blue-400 text-base"
                      colSpan={6}
                    >
                      II. HOẠT ĐỘNG ĐẦU TƯ (INVESTING ACTIVITIES)
                    </td>
                  </tr>
                  {INVESTING_ROWS.map((m) => (
                    <MetricRow key={m.field as string} {...m} />
                  ))}
                  <TotalRow
                    label="Lưu chuyển tiền thuần từ HĐĐT"
                    field="net_cash_flows_from_investing_activities"
                    color="blue"
                    yoy="annual"
                  />
                  {/* III. FINANCING */}
                  <tr className="bg-purple-500/8 border-b border-purple-400/20">
                    <td
                      className="p-4 font-bold text-purple-400 text-base"
                      colSpan={6}
                    >
                      III. HOẠT ĐỘNG TÀI CHÍNH (FINANCING ACTIVITIES)
                    </td>
                  </tr>
                  {FINANCING_ROWS.map((m) => (
                    <MetricRow key={m.field as string} {...m} />
                  ))}
                  <TotalRow
                    label="Lưu chuyển tiền thuần từ HĐTC"
                    field="cash_flows_from_financial_activities"
                    color="purple"
                    yoy="annual"
                  />
                  {/* IV. CASH POSITION */}
                  <tr className="bg-cyan-500/8 border-b border-cyan-400/20">
                    <td
                      className="p-4 font-bold text-cyan-400 text-base"
                      colSpan={6}
                    >
                      IV. TÌNH HÌNH TIỀN MẶT VÀ TƯƠNG ĐƯƠNG TIỀN
                    </td>
                  </tr>
                  {CASH_ROWS.map((m) => (
                    <MetricRow key={m.field as string} {...m} />
                  ))}
                  <TotalRow
                    label="Tiền và tương đương tiền cuối kỳ"
                    field="cash_and_cash_equivalents_at_the_end_of_period"
                    color="cyan"
                    yoy="quarter-latest" // so cùng quý năm trước
                  />
                </tbody>
              </table>
            </div>
          </div>
          {/* ======= Bạn có thể giữ/tuỳ biến các phần phân tích dưới đây (tĩnh hoặc nối thêm dữ liệu) ======= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-6 bg-gradient-to-br from-emerald-500/8 to-emerald-600/5 rounded-xl border border-emerald-400/30">
              <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Điểm mạnh (Key Strengths)
              </h4>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg">
                  <span className="text-emerald-400 font-bold mt-1 text-lg">
                    •
                  </span>
                  <div>
                    <strong className="text-white">OCF tích cực:</strong>
                    <p className="text-slate-300 mt-1">
                      Tổng OCF năm {year ?? "—"}: {fmtBnVND(ocfSum)} (
                      {fmtYoY(ocfYoy)} YoY)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg">
                  <span className="text-emerald-400 font-bold mt-1 text-lg">
                    •
                  </span>
                  <div>
                    <strong className="text-white">Tiền mặt cuối kỳ:</strong>
                    <p className="text-slate-300 mt-1">
                      Cuối quý {latestQ ?? "—"} năm {year ?? "—"}:{" "}
                      {fmtBnVND(cashEnd)} ({fmtYoY(cashEndYoY)} YoY)
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-gradient-to-br from-yellow-500/8 to-orange-500/5 rounded-xl border border-yellow-400/30">
              <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Điểm cần lưu ý (Areas of Concern)
              </h4>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <span className="text-yellow-400 font-bold mt-1 text-lg">
                    •
                  </span>
                  <div>
                    <strong className="text-white">Dòng tiền đầu tư:</strong>
                    <p className="text-slate-300 mt-1">
                      Tổng HĐĐT năm {year ?? "—"}: {fmtBnVND(invSum)} (
                      {fmtYoY(invYoy)} YoY)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
                  <span className="text-yellow-400 font-bold mt-1 text-lg">
                    •
                  </span>
                  <div>
                    <strong className="text-white">Dòng tiền tai chinh:</strong>
                    <p className="text-slate-300 mt-1">
                      Tổng HĐTC năm {year ?? "—"}: {fmtBnVND(finSum)} (
                      {fmtYoY(finYoy)} YoY)
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          {/* Benchmark (tuỳ bạn nối thêm số thật nếu có) */}
          <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/40">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              So sánh ngành (Industry Benchmark)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-slate-700/40 rounded-lg">
                <div className="text-slate-400 mb-2 text-sm">OCF (năm)</div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {fmtBnVND(ocfSum)}
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                  YoY {fmtYoY(ocfYoy)}
                </Badge>
              </div>
              <div className="text-center p-4 bg-slate-700/40 rounded-lg">
                <div className="text-slate-400 mb-2 text-sm">HĐĐT (năm)</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {fmtBnVND(invSum)}
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                  YoY {fmtYoY(invYoy)}
                </Badge>
              </div>
              <div className="text-center p-4 bg-slate-700/40 rounded-lg">
                <div className="text-slate-400 mb-2 text-sm">HĐTC (năm)</div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {fmtBnVND(finSum)}
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                  YoY {fmtYoY(finYoy)}
                </Badge>
              </div>
              <div className="text-center p-4 bg-slate-700/40 rounded-lg">
                <div className="text-slate-400 mb-2 text-sm">Tiền cuối kỳ</div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {fmtBnVND(cashEnd)}
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">
                  YoY {fmtYoY(cashEndYoY)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

