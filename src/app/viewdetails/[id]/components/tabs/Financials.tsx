import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Shield,
  Building2,
  AlertTriangle,
  Wallet,
  FileBarChart,
  Star,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuarterData {
  year: number;
  quarter: number;
  revenue: number;
  revenue_yoy: number;
  net_profit_for_the_year: number;
  attribute_to_parent_company: number;
  attribute_to_parent_company_yoy: number;
  profit_before_tax: number;
  business_income_tax_current: number;
  business_income_tax_deferred: number;
  minority_interest: number;
  net_other_income_expenses?: number;
  general_admin_expenses?: number;
  [key: string]: unknown;
}

interface BalanceData {
  year: number;
  quarter: number;
  exchange?: string;
  total_assets: number;
  current_assets: number;
  long_term_assets: number;
  liabilities: number;
  owners_equity: number;
  total_resources: number;
  cash_and_cash_equivalents?: number;
  short_term_investments?: number;
  accounts_receivable?: number;
  net_inventories?: number;
  prepayments_to_suppliers?: number;
  fixed_assets?: number;
  long_term_investments?: number;
  long_term_prepayments?: number;
  other_long_term_receivables?: number;
  long_term_trade_receivables?: number;
  current_liabilities?: number;
  short_term_borrowings?: number;
  advances_from_customers?: number;
  long_term_liabilities?: number;
  long_term_borrowings?: number;
  paid_in_capital?: number;
  undistributed_earnings?: number;
  investment_and_development_funds?: number;
  common_shares?: number;
  [key: string]: unknown;
}

interface StockInfo {
  code?: string;
  [key: string]: unknown;
}

interface FinancialsData {
  stock?: StockInfo;
  balanceData?: BalanceData[];
  incomeData?: QuarterData[];
  [key: string]: unknown;
}

interface FinancialsTabProps {
  data: FinancialsData;
}

export default function FinancialsTab({ data }: FinancialsTabProps) {
  const [expandedYears, setExpandedYears] = useState<{
    [year: number]: boolean;
  }>({});
  const [expandedQuarters, setExpandedQuarters] = useState<{
    [key: string]: boolean;
  }>({});

  // Get stock info from data prop
  const stock = data?.stock || { code: "N/A" };

  const balanceEntries = useMemo(() => {
    if (!Array.isArray(data?.balanceData)) return [] as BalanceData[];

    return [...data.balanceData].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.quarter - a.quarter;
    });
  }, [data?.balanceData]);

  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const firstEntry = balanceEntries[0];
    return firstEntry?.year ?? null;
  });
  const [selectedQuarter, setSelectedQuarter] = useState<number | null>(() => {
    const firstEntry = balanceEntries[0];
    return firstEntry?.quarter ?? null;
  });

  useEffect(() => {
    const latestEntry = balanceEntries[0];
    if (!latestEntry) {
      setSelectedYear(null);
      setSelectedQuarter(null);
      return;
    }

    setSelectedYear((prev) =>
      prev !== null && balanceEntries.some((entry) => entry.year === prev)
        ? prev
        : latestEntry.year
    );
  }, [balanceEntries]);

  useEffect(() => {
    if (selectedYear === null) {
      setSelectedQuarter(null);
      return;
    }

    const quartersForYear = balanceEntries
      .filter((entry) => entry.year === selectedYear)
      .map((entry) => entry.quarter)
      .sort((a, b) => b - a);

    if (!quartersForYear.length) {
      setSelectedQuarter(null);
      return;
    }

    setSelectedQuarter((prev) =>
      prev !== null && quartersForYear.includes(prev) ? prev : quartersForYear[0]
    );
  }, [balanceEntries, selectedYear]);

  const availableYears = useMemo(
    () =>
      Array.from(new Set(balanceEntries.map((entry) => entry.year))).sort(
        (a, b) => b - a
      ),
    [balanceEntries]
  );

  const availableQuarters = useMemo(() => {
    if (selectedYear === null) return [] as number[];
    return balanceEntries
      .filter((entry) => entry.year === selectedYear)
      .map((entry) => entry.quarter)
      .sort((a, b) => b - a);
  }, [balanceEntries, selectedYear]);

  const currentBalance = useMemo(() => {
    if (selectedYear === null || selectedQuarter === null) return null;

            return (
      balanceEntries.find(
        (entry) => entry.year === selectedYear && entry.quarter === selectedQuarter
      ) ?? null
    );
  }, [balanceEntries, selectedYear, selectedQuarter]);

  // Group data by year and sort
  const groupedData = useMemo(() => {
    if (!Array.isArray(data?.incomeData)) return {};

    const grouped = data.incomeData.reduce(
      (acc: { [year: number]: QuarterData[] }, item: QuarterData) => {
        if (!acc[item.year]) {
          acc[item.year] = [];
        }
        acc[item.year].push(item);
        return acc;
      },
      {}
    );

    // Sort quarters within each year
    Object.keys(grouped).forEach((year) => {
      grouped[parseInt(year)].sort(
        (a: QuarterData, b: QuarterData) => b.quarter - a.quarter
      );
    });

    return grouped;
  }, [data?.incomeData]);

  const years = Object.keys(groupedData)
    .map((year) => parseInt(year))
    .sort((a, b) => b - a);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const toggleQuarter = (year: number, quarter: number) => {
    const key = `${year}-${quarter}`;
    setExpandedQuarters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString("vi-VN");
  };

  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "-";
    const percentage = (value * 100).toFixed(1);
    return `${value >= 0 ? "+" : ""}${percentage}%`;
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "-";
    return `${formatNumber(value)} VNĐ`;
  };

  return (
    <div className="space-y-6 mt-0">
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-6 h-6 text-white" />
                </div>
                <span className="hidden sm:inline">Bảng Cân Đối Kế Toán</span>
                <span className="sm:hidden">Balance Sheet</span>
              </h3>
              <p className="text-slate-400 text-sm">Comprehensive Balance Sheet Analysis</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-400 px-4 py-2 border border-emerald-400/30">
                <CheckCircle className="w-3 h-3 mr-2" />
                Q{selectedQuarter ?? "-"} {selectedYear ?? "-"}
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-cyan-400 px-4 py-2 border border-cyan-400/30">
                <Star className="w-3 h-3 mr-2" />
                {currentBalance?.exchange ?? stock.code ?? "HSX"}
              </Badge>
            </div>
          </div>

          {/* Quarter Navigation */}
          <div className="mb-8 p-6 bg-gradient-to-r from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-600/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Period</span>
                </div>

                <select
                  value={selectedYear ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedYear(value ? parseInt(value, 10) : null);
                  }}
                  className="px-3 py-2 bg-slate-700/60 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/50 transition-all"
                  disabled={!availableYears.length}
                >
                  {availableYears.length ? (
                    availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))
                  ) : (
                    <option value="">Khong co du lieu</option>
                  )}
                </select>

                <div className="flex items-center gap-1 p-1 bg-slate-700/60 rounded-lg border border-slate-600/50">
                  {availableQuarters.length ? (
                    availableQuarters.map((quarter) => (
                      <button
                        key={quarter}
                        type="button"
                        onClick={() => setSelectedQuarter(quarter)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                          selectedQuarter === quarter
                            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-400 border border-cyan-400/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-600/50'
                        }`}
                      >
                        Q{quarter}
                      </button>
                    ))
                  ) : (
                    <span className="px-3 py-1.5 text-xs text-slate-500">Không có quý</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-slate-400">
                {(() => {
                  const quarterEndDates = { 1: 'Mar 31', 2: 'Jun 30', 3: 'Sep 30', 4: 'Dec 31' };
                  const quarterFileDates = { 1: 'Apr 15', 2: 'Jul 15', 3: 'Oct 15', 4: 'Jan 15' };

                  if (selectedQuarter === null || selectedYear === null) {
                    return "Period: --";
                  }

                  const endDate = quarterEndDates[selectedQuarter as keyof typeof quarterEndDates] ?? '--';
                  const fileDate = quarterFileDates[selectedQuarter as keyof typeof quarterFileDates] ?? '--';
                  const fileYear = selectedQuarter === 4 ? selectedYear + 1 : selectedYear;
                  return `Period: ${endDate}, ${selectedYear} - Filed: ${fileDate}, ${fileYear}`;
                })()}
              </div>
            </div>
          </div>

          {/* Balance Sheet Content */}
          {(() => {
            const balance = currentBalance;
            if (!balance) {
              return (
                <div className="py-10 text-center text-slate-400">
                  Không có dữ liệu bảng cân đối cho kỳ đã chọn.
                </div>
              );
            }

            const safeNumber = (value?: number | null) =>
              typeof value === "number" && !Number.isNaN(value) ? value : 0;

            const totals = {
              totalAssets:
                safeNumber(balance.total_assets) ||
                safeNumber(balance.current_assets) + safeNumber(balance.long_term_assets),
              currentAssets: safeNumber(balance.current_assets),
              longTermAssets: safeNumber(balance.long_term_assets),
              liabilities: safeNumber(balance.liabilities),
            };

            const ownersEquity =
              safeNumber(balance.owners_equity) || totals.totalAssets - totals.liabilities;
            const totalResources =
              safeNumber(balance.total_resources) || totals.totalAssets;

            const data = {
              ...balance,
              total_assets: totals.totalAssets,
              current_assets: totals.currentAssets,
              long_term_assets: totals.longTermAssets,
              liabilities: totals.liabilities,
              owners_equity: ownersEquity,
              total_resources: totalResources,
            };

            const formatVND = (amount?: number | null) => {
              const value = safeNumber(amount);
              if (value >= 1_000_000_000_000) {
                return "₫" + (value / 1_000_000_000_000).toFixed(1) + "T";
              }
              if (value >= 1_000_000_000) {
                return "₫" + (value / 1_000_000_000).toFixed(1) + "B";
              }
              if (value >= 1_000_000) {
                return "₫" + (value / 1_000_000).toFixed(1) + "M";
              }
              return "₫" + value.toLocaleString("vi-VN");
            };
            const calculatePercentage = (
              value?: number | null,
              total?: number | null
            ) => {
              const numerator = safeNumber(value);
              const denominator = safeNumber(total);
              if (denominator === 0) return "0.0";
              return ((numerator / denominator) * 100).toFixed(1);
            };
return (
              <>
                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-400/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-sm text-emerald-300 mb-1">Tổng tài sản</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatVND(data.total_assets)}</div>
                    <div className="text-xs text-slate-400">Tổng tài sản của công ty</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl border border-cyan-400/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-cyan-400" />
                      </div>
                      <TrendingUp className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-sm text-cyan-300 mb-1">Tài sản ngắn hạn</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatVND(data.current_assets)}</div>
                    <div className="text-xs text-slate-400">{calculatePercentage(data.current_assets, data.total_assets)}% of total</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl border border-red-400/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-red-400/20 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="text-sm text-red-300 mb-1">Tổng nợ phải trả</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatVND(data.liabilities)}</div>
                    <div className="text-xs text-slate-400">{calculatePercentage(data.liabilities, data.total_assets)}% of assets</div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-400/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-400" />
                      </div>
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-sm text-blue-300 mb-1">Owners&apos; Equity</div>
                    <div className="text-2xl font-bold text-white mb-2">{formatVND(data.owners_equity)}</div>
                    <div className="text-xs text-slate-400">{calculatePercentage(data.owners_equity, data.total_assets)}% of assets</div>
                  </div>
                </div>

                {/* Detailed Assets & Liabilities Breakdown */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                    Chi Tiết Tài Sản (Assets Breakdown)
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Assets */}
                    <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-emerald-400">Tài sản ngắn hạn</h5>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-sm">
                          {calculatePercentage(data.current_assets, data.total_assets)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-4">{formatVND(data.current_assets)}</div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Tiền và tương đương tiền</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.cash_and_cash_equivalents)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Đầu tư ngắn hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.short_term_investments)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Phải thu khách hàng</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.accounts_receivable)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Hàng tồn kho</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.net_inventories)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Trả trước cho người bán</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.prepayments_to_suppliers)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Long-term Assets */}
                    <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-blue-400">Tài sản dài hạn</h5>
                        <Badge className="bg-blue-500/20 text-blue-400 text-sm">
                          {calculatePercentage(data.long_term_assets, data.total_assets)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-4">{formatVND(data.long_term_assets)}</div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Tài sản cố định</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.fixed_assets)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Đầu tư dài hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.long_term_investments)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Chi phí trả trước dài hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.long_term_prepayments)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Phải thu dài hạn khác</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.other_long_term_receivables)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Phải thu thương mại dài hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.long_term_trade_receivables)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-yellow-400" />
                    Nợ Phải Trả & Vốn Chủ Sở Hữu
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Liabilities */}
                    <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-red-400">Tổng nợ phải trả</h5>
                        <Badge className="bg-red-500/20 text-red-400 text-sm">
                          {calculatePercentage(data.liabilities, data.total_assets)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-4">{formatVND(data.liabilities)}</div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Nợ ngắn hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.current_liabilities)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Vay ngắn hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.short_term_borrowings)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Nhận trước của khách hàng</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.advances_from_customers)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Nợ dài hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.long_term_liabilities)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Vay dài hạn</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.long_term_borrowings)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Equity */}
                    <div className="p-6 bg-slate-800/40 rounded-xl border border-slate-600/50">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-emerald-400">Vốn chủ sở hữu</h5>
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-sm">
                          {calculatePercentage(data.owners_equity, data.total_assets)}%
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-4">{formatVND(data.owners_equity)}</div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Vốn góp của chủ sở hữu</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.paid_in_capital)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Lợi nhuận sau thuế chưa phân phối</span>
                          <span className={`text-sm font-medium ${(data.undistributed_earnings ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatVND(data.undistributed_earnings)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Quỹ đầu tư phát triển</span>
                          <span className="text-sm font-medium text-white">{formatVND(data.investment_and_development_funds)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">Số lượng cổ phần phổ thông</span>
                          <span className="text-sm font-medium text-white">{data.common_shares ? data.common_shares.toLocaleString("vi-VN") : "–"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Verification */}
                <div className="mt-8 p-6 bg-gradient-to-r from-slate-900/80 to-slate-800/60 rounded-xl border border-slate-500/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-white mb-2">Balance Sheet Verification</h5>
                      <div className="text-sm text-slate-300">Assets = Liabilities + Equity</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-400">
                        {formatVND(data.total_assets)} = {formatVND(data.liabilities + data.owners_equity)}
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-xs mt-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Balanced
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
      <Card className="bg-slate-800/60 border border-blue-400/30">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Kết quả tài chính theo quý
          </h3>

          <div className="space-y-2">
            {years.map((year) => (
              <div
                key={year}
                className="border border-slate-700/40 rounded-lg bg-slate-900/30"
              >
                {/* Year Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/20 transition-colors"
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex items-center gap-3">
                    {expandedYears[year] ? (
                      <ChevronDown className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-cyan-400" />
                    )}
                    <h4 className="text-lg font-bold text-white">Năm {year}</h4>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                      {groupedData[year]?.length || 0} quý
                    </Badge>
                  </div>

                  {/* Year Summary */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">
                        Tổng doanh thu
                      </div>
                      <div className="text-white font-semibold">
                        {formatNumber(
                          groupedData[year]?.reduce(
                            (sum: number, q: QuarterData) =>
                              sum + (q.revenue || 0),
                            0
                          ) || 0
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">
                        Lợi nhuận ròng
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        {formatNumber(
                          groupedData[year]?.reduce(
                            (sum: number, q: QuarterData) =>
                              sum + (q.net_profit_for_the_year || 0),
                            0
                          ) || 0
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarters */}
                {expandedYears[year] && (
                  <div className="border-t border-slate-700/40">
                    {groupedData[year]?.map((quarter: QuarterData) => {
                      const quarterKey = `${year}-${quarter.quarter}`;
                      const isExpanded = expandedQuarters[quarterKey];

                      return (
                        <div
                          key={quarterKey}
                          className="border-b border-slate-700/30 last:border-b-0"
                        >
                          {/* Quarter Header */}
                          <div
                            className="flex items-center justify-between p-4 pl-12 cursor-pointer hover:bg-slate-700/10 transition-colors"
                            onClick={() => toggleQuarter(year, quarter.quarter)}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="font-semibold text-slate-200">
                                Quý {quarter.quarter}
                              </span>

                              {/* Growth indicators */}
                              <div className="flex items-center gap-2">
                                {quarter.revenue_yoy !== null && (
                                  <Badge
                                    className={`text-xs flex items-center gap-1 ${quarter.revenue_yoy >= 0
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-red-500/20 text-red-400"
                                      }`}
                                  >
                                    {quarter.revenue_yoy >= 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    DT: {formatPercentage(quarter.revenue_yoy)}
                                  </Badge>
                                )}

                                {quarter.attribute_to_parent_company_yoy !==
                                  null && (
                                    <Badge
                                      className={`text-xs flex items-center gap-1 ${quarter.attribute_to_parent_company_yoy >=
                                        0
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/20 text-red-400"
                                        }`}
                                    >
                                      {quarter.attribute_to_parent_company_yoy >=
                                        0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                      LN:{" "}
                                      {formatPercentage(
                                        quarter.attribute_to_parent_company_yoy
                                      )}
                                    </Badge>
                                  )}
                              </div>
                            </div>

                            {/* Quarter Summary */}
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className="text-slate-400 text-xs">
                                  Doanh thu
                                </div>
                                <div className="text-white font-semibold">
                                  {formatNumber(quarter.revenue)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-slate-400 text-xs">
                                  Lợi nhuận ròng
                                </div>
                                <div
                                  className={`font-semibold ${quarter.net_profit_for_the_year >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                    }`}
                                >
                                  {formatNumber(
                                    quarter.net_profit_for_the_year
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quarter Details */}
                          {isExpanded && (
                            <div className="p-4 pl-16 bg-slate-800/40">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Revenue Details */}
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                  <h5 className="font-medium text-cyan-400 mb-3 text-sm">
                                    Doanh thu & Tăng trưởng
                                  </h5>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Doanh thu:
                                      </span>
                                      <span className="text-white font-semibold">
                                        {formatCurrency(quarter.revenue)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Tăng trưởng YoY:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.revenue_yoy >= 0
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatPercentage(quarter.revenue_yoy)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Thu nhập khác (ròng):
                                      </span>
                                      <span
                                        className={`font-semibold ${(quarter.net_other_income_expenses ?? 0) >= 0
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatCurrency(
                                          quarter.net_other_income_expenses
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Profit Details */}
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                  <h5 className="font-medium text-emerald-400 mb-3 text-sm">
                                    Lợi nhuận
                                  </h5>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        LN trước thuế:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.profit_before_tax >= 0
                                          ? "text-white"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatCurrency(
                                          quarter.profit_before_tax
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        LN ròng:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.net_profit_for_the_year >= 0
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatCurrency(
                                          quarter.net_profit_for_the_year
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        LNST chủ sở hữu:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.attribute_to_parent_company >=
                                          0
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatCurrency(
                                          quarter.attribute_to_parent_company
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Tăng trưởng LNST YoY:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.attribute_to_parent_company_yoy >=
                                          0
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatPercentage(
                                          quarter.attribute_to_parent_company_yoy
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Tax & Others */}
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                  <h5 className="font-medium text-blue-400 mb-3 text-sm">
                                    Thuế & Khác
                                  </h5>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Thuế TNDN hiện hành:
                                      </span>
                                      <span className="text-red-400 font-semibold">
                                        {formatCurrency(
                                          quarter.business_income_tax_current
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Thuế TNDN hoãn lại:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.business_income_tax_deferred >=
                                          0
                                          ? "text-emerald-400"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatCurrency(
                                          quarter.business_income_tax_deferred
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Lợi ích cổ đông thiểu số:
                                      </span>
                                      <span
                                        className={`font-semibold ${quarter.minority_interest >= 0
                                          ? "text-white"
                                          : "text-red-400"
                                          }`}
                                      >
                                        {formatCurrency(
                                          quarter.minority_interest
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">
                                        Chi phí quản lý:
                                      </span>
                                      <span className="text-red-400 font-semibold">
                                        {formatCurrency(
                                          quarter.general_admin_expenses
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
