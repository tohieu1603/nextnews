"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStockAnalysis } from "@/components/helpers/detailedAnalysisHelpers";
import TabsDetail from "./components/Tabs";
import Breadcrumb from "@/components/layouts/Breadcrumb";
import { getCompanyDetails, getSymbolData } from "@/services/api";
import { CompanyDetails } from "../types";
import { useSymbolStore } from "@/store/symbol.store";

interface Stock {
  name: string;
  currentPrice: string;
  change: string;
  changePercent: string;
  data: any;
}

export default function DetailedAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState<boolean>(false);
  const [detailedInfo, setDetailedInfo] = useState<CompanyDetails | null>(null);

  const { symbolMap, setSymbolMap } = useSymbolStore();
  const [data, setData] = useState<CompanyDetails | null>(null);
  const [stock, setStock] = useState<any>(null);
  const isPositive = stock?.change?.trim().startsWith("+") ?? false;
  const [latestRatios, setLatestRatios] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [symbolList, setSymbolList] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      console.log("🔄 Loading symbol map for ID-based page - id:", id);

      if (!symbolMap || Object.keys(symbolMap).length === 0) {
        console.log("📋 Fetching symbol list...");
        const list = await getSymbolData("");
        console.log("📋 Symbol list received:", list);
        setSymbolMap(list);
        setSymbolList(list);
      } else {
        setSymbolList(Object.values(symbolMap));
      }
    };
    load();
  }, [id, symbolMap, setSymbolMap]);

  useEffect(() => {
    console.log("🔍 useEffect triggered - id:", id);

    async function fetchCompanyDetails() {
      if (!id) {
        console.log("⚠️ No id, skipping fetch");
        return;
      }

      console.log("📞 Calling getCompanyDetails with id:", id);
      try {
        setLoading(true);
        const details = await getCompanyDetails(Number(id));
        console.log("📦 Received details:", details);
        setDetailedInfo(details);
        setData(details);

        // Set stock analysis based on symbol name
        console.log("Selected Data:", details?.symbolData);
        console.log("Symbol name:", details?.symbolData?.name);
        if (details?.symbolData?.name) {
          const stockAnalysis = getStockAnalysis(details.symbolData.name);
          console.log("Stock Analysis:", stockAnalysis);
          setStock(stockAnalysis);
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
        setLoading(false);
      }
    }
    fetchCompanyDetails();
  }, [id]);

  const filteredSuggestions = symbolList
    .filter((symbol: any) =>
      symbol.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      symbol.company?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  const handleStockSelect = (stockId: number) => {
    setSearchQuery("");
    setShowSearchSuggestions(false);
    window.location.href = `/viewdetails/${stockId}`;
  };

  function getLatestQuarter(data: any) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("⚠️ getLatestQuarter: data không hợp lệ", data);
      return null;
    }

    const maxYear = Math.max(...data.map((d) => d.year));
    const sameYear = data.filter((d) => d.year === maxYear);
    const latest = sameYear.reduce((prev, curr) =>
      curr.quarter > prev.quarter ? curr : prev
    );

    return latest;
  }

  console.log("Data for ID:", id, data);

  return (
    <TooltipProvider>
      <div className="min-h-screen mt-24">
        <div className="pt-16 md:pt-32">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Breadcrumb />
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

            <div className="relative max-w-xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm cổ phiếu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="pl-10 bg-slate-800/60 border-blue-400/30 text-white placeholder-slate-400 focus:border-cyan-400 transition-colors"
                />
              </div>
              {showSearchSuggestions &&
                searchQuery &&
                filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-slate-800/95 border border-blue-400/30 rounded-lg shadow-xl z-10 mt-1 overflow-hidden">
                    {filteredSuggestions.map((stockItem: any) => {
                      return (
                        <button
                          key={stockItem.id}
                          onClick={() => handleStockSelect(stockItem.id)}
                          className="w-full p-3 text-left hover:bg-blue-500/10 border-b border-slate-600/50 last:border-b-0 transition-all duration-200"
                          type="button"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-cyan-400 text-sm">
                                {stockItem.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {stockItem.company?.company_name || 'N/A'}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
            <TabsDetail
              stock={stock}
              data={detailedInfo}
              isPositive={isPositive}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}