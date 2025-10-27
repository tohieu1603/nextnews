"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStockAnalysis } from "@/components/helpers/detailedAnalysisHelpers";
import TabsDetail from "./components/Tabs";
import Breadcrumb from "@/components/layouts/Breadcrumb";
import { getCompanyDetails, getSymbolData } from "@/services/api";
import { TogogoTradingBotCompact, type DecoratedBot } from "@/app/components/TogogoTradingBotCompact";
import { CompanyDetails } from "../types";
import { useSymbolStore } from "@/store/symbol.store";

interface Stock {
  symbol: string;
  name?: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  code?: string;
  sector?: string;
  marketCap?: string;
  volume?: string;
  pe?: string;
  pb?: string;
  roe?: string;
  dividendYield?: string;
  detailedInfo: {
    shareholderStructure: unknown;
    subsidiaries: unknown;
    esgInfo: {
      overallRating: string;
      environmentalScore: string | number;
      socialScore: string | number;
      governanceScore: string | number;
    };
    riskAssessment: {
      creditRisk: {
        level: string;
        nplRatio: string;
      };
      marketRisk: {
        level: string;
        var: string;
      };
    };
    [key: string]: unknown;
  };
  additionalMetrics: {
    week52Low: string;
    week52High: string;
  };
  [key: string]: unknown;
}

interface QuarterData {
  year: number;
  quarter: number;
  p_e?: number | string;
  roe_percent?: number | string;
  current_ratio?: number | string;
  eps_vnd?: number | string;
  [key: string]: unknown;
}

export default function DetailedAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [detailedInfo, setDetailedInfo] = useState<CompanyDetails | null>(null);

  const { setSymbolMap } = useSymbolStore();
  const [data, setData] = useState<CompanyDetails | null>(null);
  const [stock, setStock] = useState<Stock | null>(null);
  const [activeBotName, setActiveBotName] = useState<string>("");
  const [activeBotCategory, setActiveBotCategory] = useState<string>("");
  const isPositive = stock?.change?.trim().startsWith("+") ?? false;
  const [latestRatios, setLatestRatios] = useState<QuarterData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getSymbolData("");
        if (Array.isArray(list)) {
          setSymbolMap(list);
        }
      } catch (error) {
        console.error("Failed to fetch symbol list:", error);
      }
    };
    load();
  }, [setSymbolMap]);

  useEffect(() => {
    console.log("🔍 useEffect triggered - id:", id);

    async function fetchCompanyDetails() {
      if (!id) {
        console.log("⚠️ No id, skipping fetch");
        return;
      }

      console.log("📞 Calling getCompanyDetails with id:", id);
      try {
        const details = await getCompanyDetails(Number(id));
        console.log("📦 Received details:", details);
        setDetailedInfo(details);
        setData(details);

        // Set stock analysis based on symbol name
        console.log("Selected Data:", details?.symbolData);
        const symbolData = details?.symbolData as { name?: string; id?: number; exchange?: string } | undefined;
        console.log("Symbol name:", symbolData?.name);
        if (symbolData?.name) {
          const stockAnalysis = getStockAnalysis(symbolData.name);
          console.log("Stock Analysis:", stockAnalysis);

          const defaultDetailedInfo = {
            shareholderStructure: null,
            subsidiaries: null,
            esgInfo: {
              overallRating: 'N/A',
              environmentalScore: 0,
              socialScore: 0,
              governanceScore: 0,
            },
            riskAssessment: {
              creditRisk: {
                level: 'N/A',
                nplRatio: '0',
              },
              marketRisk: {
                level: 'N/A',
                var: '0',
              },
            },
          };

          const defaultAdditionalMetrics = {
            week52Low: '0',
            week52High: '0',
          };

          // Add symbol property to match Stock interface
          setStock({
            ...stockAnalysis,
            symbol: symbolData.name,
            detailedInfo: (details?.detailedInfo && Object.keys(details.detailedInfo).length > 0)
              ? { ...defaultDetailedInfo, ...details.detailedInfo }
              : defaultDetailedInfo,
            additionalMetrics: (details?.additionalMetrics && Object.keys(details.additionalMetrics).length > 0)
              ? { ...defaultAdditionalMetrics, ...details.additionalMetrics }
              : defaultAdditionalMetrics,
          });
        } else {
          console.log("⚠️ No symbol name found in details.symbolData");
        }

        if (details?.ratiosData) {
          console.log("Raw ratiosData:", details.ratiosData);
          const latest = getLatestQuarter(details.ratiosData);
          console.log("Latest quarter:", latest);
          setLatestRatios(latest);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        setDetailedInfo(null);
        setData(null);
      } finally {
      }
    }
    fetchCompanyDetails();
  }, [id]);

  function getLatestQuarter(data: unknown): QuarterData | null {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("⚠️ getLatestQuarter: data không hợp lệ", data);
      return null;
    }

    const typedData = data as QuarterData[];
    const maxYear = Math.max(...typedData.map((d) => d.year));
    const sameYear = typedData.filter((d) => d.year === maxYear);
    const latest = sameYear.reduce((prev, curr) =>
      curr.quarter > prev.quarter ? curr : prev
    );

    return latest;
  }

  console.log("Data for ID:", id, data);

  const rawSymbolName = data?.symbolData?.name;
  const rawCompanyName = data?.symbolData?.company?.company_name;
  const symbolCode = typeof rawSymbolName === "string" ? rawSymbolName.trim() : "";
  const companyName = typeof rawCompanyName === "string" ? rawCompanyName.trim() : "";
  const breadcrumbLabel = symbolCode || companyName
    ? [symbolCode, companyName].filter(Boolean).join(" - ")
    : id ?? "";
  const normalizedSymbolCode = symbolCode ? symbolCode.toUpperCase() : "";
  const tradingSymbolCode =
    normalizedSymbolCode ||
    (stock?.symbol ? stock.symbol.toUpperCase() : "") ||
    (stock?.code ? stock.code.toUpperCase() : "");

  const botSummaryLine = activeBotName
    ? `Bot hiện tại: ${activeBotName}${activeBotCategory ? ` (${activeBotCategory})` : ""}.`
    : "Chưa có bot nào được kích hoạt cho mã này.";
  const numericSymbolId = useMemo(() => {
    if (data?.symbolData && typeof data.symbolData.id === "number") {
      return data.symbolData.id;
    }
    if (data?.symbolData && typeof (data.symbolData as { symbol_id?: number }).symbol_id === "number") {
      return (data.symbolData as { symbol_id: number }).symbol_id;
    }
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [data, id]);

  return (
    <TooltipProvider>
      <div className="min-h-screen mt-24">
        <div className="pt-16 md:pt-32">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Breadcrumb currentLabel={breadcrumbLabel} />
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-cyan-400">
                PHÂN TÍCH CHUYÊN SÂU
              </h1>
              <p className="text-slate-400">
                Phân tích chi tiết cho cổ phiếu {data?.symbolData?.name}
              </p>
            </div>

            <Card className="mb-4 bg-slate-800/60 border border-blue-400/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{data?.symbolData?.name}</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">
                        {data?.symbolData?.company?.company_name}
                      </h1>
                      <p className="text-slate-400 text-base">
                        {data?.symbolData?.company?.sector}
                        {data?.symbolData?.company?.exchange}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-600/50">
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">P/E</div>
                    <div className="font-bold text-blue-400">{latestRatios?.p_e}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">ROE</div>
                    <div className="font-bold text-emerald-400">
                      {latestRatios?.roe_percent}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Thanh khoản</div>
                    <div className="font-bold text-white">
                      {latestRatios?.current_ratio}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Thu nhập trên cổ phiếu</div>
                    <div className="font-bold text-cyan-400">
                      {latestRatios?.eps_vnd}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(tradingSymbolCode || numericSymbolId !== null) && (
              <div className="mt-10 mb-14">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Gợi ý Trading Bot
                </h2>
                <p className="text-sm text-slate-400 mb-4 space-y-1">
                  <span>
                    Theo dõi khung thời gian giao dịch và lịch sử tín hiệu dành riêng cho mã {tradingSymbolCode || id}.
                  </span>
                  <span className="block text-amber-300 font-medium">
                    {botSummaryLine} 
                  </span>
                </p>
                <TogogoTradingBotCompact
                  initialSymbolCode={tradingSymbolCode || undefined}
                  initialSymbolId={numericSymbolId ?? undefined}
                  hideSymbolPicker
                  onBotSelected={(bot: DecoratedBot | null) => {
                    setActiveBotName(bot?.name ?? "");
                    setActiveBotCategory(bot?.botTypeDisplay ?? "");
                  }}
                />
              </div>
            )}
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-16 max-w-4xl rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-emerald-500/20 blur-2xl" />
              <TabsDetail
                stock={stock}
                data={detailedInfo || {}}
                isPositive={isPositive}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
